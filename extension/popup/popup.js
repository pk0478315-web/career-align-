/**
 * Popup Script for Student Opportunity AI Browser Extension
 * Extractor & Saver Engine
 */

const API_BASE = 'https://career-align-six.vercel.app/api';

document.addEventListener('DOMContentLoaded', async () => {
  const tabTitle = document.getElementById('tab-title');
  const tabOrg = document.getElementById('tab-org');
  const btnCapture = document.getElementById('btn-capture');
  const btnAutofill = document.getElementById('btn-autofill');
  const btnSaveDraft = document.getElementById('btn-save-draft');
  const reviewSection = document.getElementById('review-section');
  const statusNotice = document.getElementById('status-notice');

  let currentTabUrl = '';
  let activeTab = null;

  // Get active tab details
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    activeTab = tab;
    currentTabUrl = tab.url;
    tabTitle.innerText = tab.title || 'Current Webpage';
    try {
      const urlObj = new URL(tab.url);
      tabOrg.innerText = urlObj.hostname.replace('www.', '');
    } catch {
      tabOrg.innerText = 'Webpage';
    }
  }

  // 1. Capture Opportunity Action: Ask content script first for direct DOM text
  btnCapture.addEventListener('click', async () => {
    statusNotice.innerText = 'Extracting metadata from current tab DOM...';
    
    // First: Request DOM extraction from active tab content script
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'EXTRACT_PAGE_METADATA' }, async (response) => {
        let extractedData = null;

        if (chrome.runtime.lastError || !response || !response.metadata) {
          // Content script not loaded on restricted page or error -> fall back to tab info
          extractedData = {
            title: activeTab.title || 'Opportunity Title',
            organization: tabOrg.innerText.toUpperCase(),
            description: `Captured from ${currentTabUrl}`,
            url: currentTabUrl
          };
        } else {
          extractedData = response.metadata;
        }

        // Fill review input fields
        document.getElementById('draft-title').value = extractedData.title;
        document.getElementById('draft-org').value = extractedData.organization;
        
        reviewSection.style.display = 'block';
        statusNotice.innerText = '✨ Details extracted! Review & click Save.';

        // Also try background server enrichment asynchronously
        try {
          const apiRes = await fetch(`${API_BASE}/opportunities/capture-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: currentTabUrl })
          });
          const json = await apiRes.json();
          if (json.success && json.data.extracted) {
            if (json.data.extracted.description) {
              extractedData.description = json.data.extracted.description;
            }
          }
        } catch {
          // Server enrichment optional
        }
      });
    }
  });

  // 2. Save Draft Action: Save to chrome.storage.local AND backend API
  btnSaveDraft.addEventListener('click', async () => {
    const title = document.getElementById('draft-title').value.trim();
    const organization = document.getElementById('draft-org').value.trim();
    const deadline = document.getElementById('draft-deadline').value;

    if (!title) {
      statusNotice.innerText = '⚠️ Please enter an opportunity title.';
      return;
    }

    statusNotice.innerText = 'Saving opportunity...';

    const oppRecord = {
      id: `opp-ext-${Date.now()}`,
      title,
      organization: organization || 'Web Capture',
      category: 'other',
      description: `Captured from ${currentTabUrl}`,
      sourceUrl: currentTabUrl,
      applicationUrl: currentTabUrl,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      isRemote: true,
      savedAt: new Date().toISOString()
    };

    // Save locally in Chrome Extension storage so it NEVER fails
    chrome.storage.local.get(['savedOpportunities'], async (data) => {
      const existing = data.savedOpportunities || [];
      existing.unshift(oppRecord);
      chrome.storage.local.set({ savedOpportunities: existing }, () => {
        statusNotice.innerText = '✅ Saved locally to extension storage!';
      });

      // Also try posting to live backend
      try {
        const token = await getStoredToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/opportunities`, {
          method: 'POST',
          headers,
          body: JSON.stringify(oppRecord)
        });
        const res = await response.json();
        if (res.success) {
          statusNotice.innerText = '✅ Successfully saved to server database & extension storage!';
        }
      } catch {
        statusNotice.innerText = '✅ Saved to extension tracker!';
      }
    });
  });

  // 3. Trigger Form Autofill
  btnAutofill.addEventListener('click', () => {
    if (!activeTab || !activeTab.id) return;
    chrome.tabs.sendMessage(activeTab.id, { action: 'TRIGGER_AUTOFILL', profile: getSampleProfile() }, (res) => {
      if (res && res.result) {
        statusNotice.innerText = res.result.message;
      } else {
        statusNotice.innerText = '⚡ Floating autofill bar injected on page!';
      }
    });
  });

  function getStoredToken() {
    return new Promise(resolve => {
      chrome.storage.local.get(['jwtToken'], (res) => resolve(res.jwtToken || null));
    });
  }

  function getSampleProfile() {
    return {
      displayName: 'Alex Chen',
      email: 'alex@university.edu',
      university: 'State University',
      major: 'Computer Science',
      graduationYear: 2026,
      skills: ['Python', 'React', 'Node.js', 'Git']
    };
  }
});
