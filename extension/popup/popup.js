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
    
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'EXTRACT_PAGE_METADATA' }, async (response) => {
        let extractedData = null;

        if (chrome.runtime.lastError || !response || !response.metadata) {
          extractedData = {
            title: activeTab.title || 'Opportunity Title',
            organization: tabOrg.innerText.toUpperCase(),
            description: `Captured from ${currentTabUrl}`,
            url: currentTabUrl
          };
        } else {
          extractedData = response.metadata;
        }

        document.getElementById('draft-title').value = extractedData.title;
        document.getElementById('draft-org').value = extractedData.organization;
        
        reviewSection.style.display = 'block';
        statusNotice.innerText = '✨ Details extracted! Review & click Save.';
      });
    }
  });

  // 2. Save Draft Action: Save to local storage AND post to server database
  btnSaveDraft.addEventListener('click', async () => {
    const title = document.getElementById('draft-title').value.trim();
    const organization = document.getElementById('draft-org').value.trim();
    const deadline = document.getElementById('draft-deadline').value;

    if (!title) {
      statusNotice.innerText = '⚠️ Please enter an opportunity title.';
      return;
    }

    statusNotice.innerText = 'Saving to database & extension storage...';

    const oppRecord = {
      title,
      organization: organization || 'Web Capture',
      category: 'other',
      description: `Captured from ${currentTabUrl}`,
      sourceUrl: currentTabUrl,
      applicationUrl: currentTabUrl,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      isRemote: true
    };

    // Save locally in Chrome Extension storage
    chrome.storage.local.get(['savedOpportunities'], async (data) => {
      const existing = data.savedOpportunities || [];
      existing.unshift({ ...oppRecord, savedAt: new Date().toISOString() });
      chrome.storage.local.set({ savedOpportunities: existing });

      // Post to live backend API database
      try {
        const response = await fetch(`${API_BASE}/opportunities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(oppRecord)
        });
        const res = await response.json();
        if (res.success) {
          statusNotice.innerText = '🎉 Saved to live server database & extension tracker!';
        } else {
          statusNotice.innerText = '✅ Saved to extension local tracker!';
        }
      } catch (err) {
        statusNotice.innerText = '✅ Saved to extension local tracker!';
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
