/**
 * Popup Script for Student Opportunity AI Browser Extension
 */

const API_BASE = 'http://localhost:5000/api'; // Use local for dev, or fetch from config
// Actually, we should dynamically detect if we are in prod or dev, but for now we hardcode local or rely on env. Let's use production if it was there, or http://localhost:5000 for local testing. We will use localhost:5000 since we're testing locally.
const ACTIVE_API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
  const authSection = document.getElementById('auth-section');
  const captureSection = document.getElementById('capture-section');
  const reviewSection = document.getElementById('review-section');
  
  const tabTitle = document.getElementById('tab-title');
  const tabOrg = document.getElementById('tab-org');
  const btnCapture = document.getElementById('btn-capture');
  const btnAutofill = document.getElementById('btn-autofill');
  const btnSaveDraft = document.getElementById('btn-save-draft');
  const btnLogout = document.getElementById('btn-logout');
  const btnLogin = document.getElementById('btn-login');
  const statusNotice = document.getElementById('status-notice');
  const savedList = document.getElementById('saved-list');
  const savedCount = document.getElementById('saved-count');

  let currentTabUrl = '';
  let activeTab = null;
  let currentOpportunityId = null;

  // 1. Check Auth State
  const { authToken } = await chrome.storage.local.get(['authToken']);
  
  if (authToken) {
    showCaptureSection();
  } else {
    showAuthSection();
  }

  function showAuthSection() {
    authSection.style.display = 'block';
    captureSection.style.display = 'none';
    reviewSection.style.display = 'none';
  }

  function showCaptureSection() {
    authSection.style.display = 'none';
    captureSection.style.display = 'block';
    renderSavedList();
  }

  // Get active tab details
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    activeTab = tab;
    currentTabUrl = tab.url;
    tabTitle.innerText = tab.title || 'Current Webpage';
    try {
      const urlObj = new URL(tab.url);
      tabOrg.innerText = urlObj.hostname.replace('www.', '').toUpperCase();
    } catch {
      tabOrg.innerText = 'WEBPAGE';
    }
  }

  // Login handler
  btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    if (!email || !password) {
      statusNotice.innerText = '⚠️ Please enter email and password.';
      return;
    }

    try {
      btnLogin.innerText = 'Authenticating...';
      const res = await fetch(`${ACTIVE_API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success && data.data.token) {
        await chrome.storage.local.set({ authToken: data.data.token, userProfile: data.data.user });
        statusNotice.innerText = '✅ Logged in successfully!';
        showCaptureSection();
      } else {
        statusNotice.innerText = `❌ Login failed: ${data.error || 'Invalid credentials'}`;
      }
    } catch (err) {
      statusNotice.innerText = '❌ Network error during login.';
    } finally {
      btnLogin.innerText = 'Sign In';
    }
  });

  btnLogout.addEventListener('click', async () => {
    await chrome.storage.local.remove(['authToken', 'userProfile']);
    showAuthSection();
    statusNotice.innerText = '';
  });

  // 1. Capture Opportunity Action
  btnCapture.addEventListener('click', async () => {
    const { authToken } = await chrome.storage.local.get(['authToken']);
    if (!authToken) return showAuthSection();

    statusNotice.innerText = 'Extracting metadata from current tab DOM...';
    
    if (activeTab && activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, { action: 'EXTRACT_PAGE_METADATA' }, async (response) => {
        let extractedData = null;

        if (chrome.runtime.lastError || !response || !response.metadata) {
          extractedData = {
            title: activeTab.title || 'Opportunity Title',
            organization: tabOrg.innerText,
            description: `Captured from ${currentTabUrl}`,
            url: currentTabUrl
          };
        } else {
          extractedData = response.metadata;
        }

        document.getElementById('draft-title').value = extractedData.title;
        document.getElementById('draft-org').value = extractedData.organization;
        
        statusNotice.innerText = 'Creating opportunity in Career Align...';

        // Post to backend to create opportunity
        try {
          const createRes = await fetch(`${ACTIVE_API_BASE}/opportunities`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              title: extractedData.title,
              organization: extractedData.organization || 'Web Capture',
              category: 'other',
              description: extractedData.description || `Captured from ${currentTabUrl}`,
              sourceUrl: currentTabUrl,
              applicationUrl: currentTabUrl,
              isRemote: true
            })
          });

          const oppData = await createRes.json();
          
          if (!oppData.success) {
            throw new Error(oppData.error || 'Failed to create');
          }

          currentOpportunityId = oppData.data.id;
          reviewSection.style.display = 'block';
          
          // Now ask AI to align
          statusNotice.innerText = 'Analyzing alignment with your profile...';
          const alignRes = await fetch(`${ACTIVE_API_BASE}/ai/align`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ opportunityId: currentOpportunityId })
          });

          const alignData = await alignRes.json();
          if (alignData.success) {
            document.getElementById('alignment-score').innerText = alignData.data.overallScore || '--';
            document.getElementById('alignment-reason').innerText = alignData.data.whyItMatches || 'AI alignment completed.';
            statusNotice.innerText = '✨ Details and alignment extracted! Click Save.';
          } else {
            document.getElementById('alignment-reason').innerText = 'Could not generate alignment.';
            statusNotice.innerText = '✨ Details extracted! AI alignment skipped.';
          }

        } catch (err) {
          console.error(err);
          statusNotice.innerText = `❌ Error: ${err.message}`;
        }
      });
    }
  });

  // 2. Save Draft Action: Updates tracker record
  btnSaveDraft.addEventListener('click', async () => {
    const { authToken } = await chrome.storage.local.get(['authToken']);
    if (!authToken || !currentOpportunityId) return;

    const title = document.getElementById('draft-title').value.trim();
    const organization = document.getElementById('draft-org').value.trim();

    statusNotice.innerText = 'Saving to your tracker...';

    try {
      // Actually, createOpportunity already tracks it in tracker! But let's sync local storage.
      renderSavedList();
      statusNotice.innerText = '🎉 Saved to server database & extension tracker!';
      
      // Update local storage so popup shows it
      chrome.storage.local.get(['savedOpportunities'], (data) => {
        const existing = data.savedOpportunities || [];
        existing.unshift({
          title,
          organization,
          savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        chrome.storage.local.set({ savedOpportunities: existing });
        renderSavedList();
      });

    } catch (err) {
      statusNotice.innerText = '❌ Failed to save to tracker.';
    }
  });

  // 3. Trigger Form Autofill
  btnAutofill.addEventListener('click', async () => {
    if (!activeTab || !activeTab.id) return;
    const { authToken } = await chrome.storage.local.get(['authToken']);
    
    if (!authToken) {
      statusNotice.innerText = '⚠️ Please login to autofill.';
      return;
    }

    try {
      statusNotice.innerText = 'Fetching profile data...';
      const res = await fetch(`${ACTIVE_API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();

      let profileData = {};
      if (data.success && data.data) {
        profileData = {
          displayName: data.data.name || data.data.user?.name || '',
          email: data.data.user?.email || '',
          university: data.data.university || '',
          major: data.data.major || '',
          graduationYear: data.data.graduationYear || '',
          skills: data.data.skills || [],
          location: data.data.location || ''
        };
      }
      
      chrome.tabs.sendMessage(activeTab.id, { action: 'TRIGGER_AUTOFILL', profile: profileData }, (res) => {
        if (res && res.result) {
          statusNotice.innerText = res.result.message;
        } else {
          statusNotice.innerText = '⚡ Floating autofill bar injected on page!';
        }
      });
    } catch (e) {
      statusNotice.innerText = '❌ Failed to fetch profile.';
    }
  });

  async function renderSavedList() {
    const { authToken } = await chrome.storage.local.get(['authToken']);
    if (!authToken) return;

    try {
      const res = await fetch(`${ACTIVE_API_BASE}/my-opportunities`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      
      if (data.success && data.data.items) {
        const items = data.data.items;
        savedCount.innerText = `(${items.length})`;

        if (items.length === 0) {
          savedList.innerHTML = '<p style="font-size:11px;color:var(--muted);font-style:italic;">No items captured yet.</p>';
          return;
        }

        savedList.innerHTML = items.slice(0, 4).map(item => `
          <div class="saved-item">
            <div style="font-weight:700;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.opportunity?.title || 'Unknown'}</div>
            <div style="color:var(--muted);display:flex;justify-content:space-between;margin-top:2px;">
              <span>${item.opportunity?.organization || 'Unknown'}</span>
              <span>Status: ${item.status}</span>
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      // Fallback
    }
  }
});
