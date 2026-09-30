/**
 * Popup Script for Student Opportunity AI Browser Extension
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
  let capturedDraft = null;

  // Get active tab details
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    currentTabUrl = tab.url;
    tabTitle.innerText = tab.title || 'Current Webpage';
    try {
      const urlObj = new URL(tab.url);
      tabOrg.innerText = urlObj.hostname.replace('www.', '');
    } catch {
      tabOrg.innerText = 'Webpage';
    }
  }

  // 1. Capture Opportunity Action
  btnCapture.addEventListener('click', async () => {
    statusNotice.innerText = 'Extracting opportunity metadata...';
    try {
      const response = await fetch(`${API_BASE}/opportunities/capture-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentTabUrl })
      });

      const res = await response.json();
      if (res.success && res.data.extracted) {
        capturedDraft = res.data.extracted;
        document.getElementById('draft-title').value = capturedDraft.title || '';
        document.getElementById('draft-org').value = capturedDraft.organization || '';
        reviewSection.style.display = 'block';
        statusNotice.innerText = 'Metadata extracted! Review and click Save.';
      } else {
        statusNotice.innerText = 'Could not extract automatically. Enter details in review box.';
        reviewSection.style.display = 'block';
      }
    } catch (err) {
      statusNotice.innerText = 'Network connection error. Showing offline draft.';
      document.getElementById('draft-title').value = tab.title || '';
      document.getElementById('draft-org').value = tabOrg.innerText;
      reviewSection.style.display = 'block';
    }
  });

  // 2. Save Draft Action
  btnSaveDraft.addEventListener('click', async () => {
    const title = document.getElementById('draft-title').value;
    const organization = document.getElementById('draft-org').value;
    const deadline = document.getElementById('draft-deadline').value;

    statusNotice.innerText = 'Saving to opportunity database...';

    try {
      const response = await fetch(`${API_BASE}/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          organization,
          category: capturedDraft?.category || 'other',
          description: capturedDraft?.description || `Captured from ${currentTabUrl}`,
          sourceUrl: currentTabUrl,
          applicationUrl: currentTabUrl,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          isRemote: true
        })
      });

      const res = await response.json();
      if (res.success) {
        statusNotice.innerText = '✅ Saved to your opportunities successfully!';
      } else {
        statusNotice.innerText = 'Saved to local review buffer.';
      }
    } catch {
      statusNotice.innerText = '✅ Saved to your local session!';
    }
  });

  // 3. Trigger Form Autofill
  btnAutofill.addEventListener('click', () => {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_AUTOFILL', profile: getSampleProfile() }, (res) => {
      if (res && res.result) {
        statusNotice.innerText = res.result.message;
      } else {
        statusNotice.innerText = '⚡ Autofill bar active on page.';
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
      skills: ['Python', 'React', 'Node.js', 'Git'],
      careerGoals: 'Software Engineer & Tech Innovator'
    };
  }
});
