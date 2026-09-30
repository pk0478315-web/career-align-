/**
 * Content Script for DOM extraction & Application Autofill Floating Panel
 */

console.log('[CareerAlign] Content script loaded on page:', window.location.href);

// Listen for extraction or autofill triggers from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_PAGE_METADATA') {
    try {
      const metadata = extractPageMetadata();
      sendResponse({ success: true, metadata });
    } catch (err) {
      sendResponse({ 
        success: true, 
        metadata: {
          url: window.location.href,
          title: document.title || 'Webpage Opportunity',
          organization: window.location.hostname.replace('www.', '').toUpperCase(),
          description: 'Captured from tab.'
        }
      });
    }
    return true;
  } else if (request.action === 'TRIGGER_AUTOFILL') {
    const result = performAutofill(request.profile);
    sendResponse({ success: true, result });
    return true;
  }
});

// Helper: Extract current page metadata
function extractPageMetadata() {
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
  const docTitle = document.title;
  const title = ogTitle || docTitle || location.hostname;

  const ogDesc = document.querySelector('meta[property="og:description"]')?.content;
  const metaDesc = document.querySelector('meta[name="description"]')?.content;
  const pText = document.querySelector('p')?.innerText?.substring(0, 300) || '';
  const description = ogDesc || metaDesc || pText || 'Details available at source link.';

  const ogSite = document.querySelector('meta[property="og:site_name"]')?.content;
  const domainOrg = window.location.hostname.replace('www.', '').split('.')[0].toUpperCase();

  return {
    url: window.location.href,
    title: (title || 'Opportunity').trim().substring(0, 150),
    organization: (ogSite || domainOrg || 'WEB CAPTURE').trim(),
    description: (description || '').trim().substring(0, 500)
  };
}

// Perform Form Autofill by mapping saved student profile values to inputs
function performAutofill(profile) {
  if (!profile) return { filledCount: 0, message: 'No profile data available' };

  const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
  let filledCount = 0;

  const profileMap = [
    { keys: ['name', 'full_name', 'fullname', 'displayname', 'applicant_name', 'first_name'], val: profile.displayName },
    { keys: ['email', 'user_email', 'college_email'], val: profile.email },
    { keys: ['university', 'college', 'school', 'institution'], val: profile.university },
    { keys: ['major', 'degree', 'field_of_study', 'department'], val: profile.major },
    { keys: ['graduation', 'grad_year', 'year'], val: profile.graduationYear },
    { keys: ['skills', 'technologies', 'skillset'], val: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills },
    { keys: ['interests', 'goals', 'summary'], val: profile.careerGoals || (Array.isArray(profile.interests) ? profile.interests.join(', ') : '') }
  ];

  inputs.forEach(input => {
    const idAttr = (input.id || '').toLowerCase();
    const nameAttr = (input.name || '').toLowerCase();
    const placeholderAttr = (input.placeholder || '').toLowerCase();
    const labelText = getAssociatedLabelText(input).toLowerCase();

    const targetText = `${idAttr} ${nameAttr} ${placeholderAttr} ${labelText}`;

    for (const rule of profileMap) {
      if (rule.val && rule.keys.some(k => targetText.includes(k))) {
        if (!input.value) {
          input.value = rule.val;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          filledCount++;
          highlightField(input);
        }
        break;
      }
    }
  });

  return { filledCount, message: `Successfully autofilled ${filledCount} compatible fields.` };
}

function getAssociatedLabelText(input) {
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.innerText;
  }
  const parentLabel = input.closest('label');
  return parentLabel ? parentLabel.innerText : '';
}

function highlightField(input) {
  const origBorder = input.style.border;
  input.style.border = '2px solid #10b981';
  input.style.backgroundColor = '#ecfdf5';
  setTimeout(() => {
    input.style.border = origBorder;
    input.style.backgroundColor = '';
  }, 2500);
}

// Inject Floating Quick Action Bar
injectFloatingBar();

function injectFloatingBar() {
  if (document.getElementById('opp-ai-floating-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'opp-ai-floating-bar';
  bar.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    background: #0f172a;
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #334155;
  `;

  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;font-weight:700;">
      <span style="color:#38bdf8;">✨ CareerAlign</span>
    </div>
    <button id="opp-ai-autofill-btn" style="background:#0284c7;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;">
      ⚡ Autofill Application
    </button>
    <button id="opp-ai-close-btn" style="background:transparent;color:#94a3b8;border:none;cursor:pointer;font-size:14px;padding:0 4px;">✕</button>
  `;

  document.body.appendChild(bar);

  document.getElementById('opp-ai-close-btn').onclick = () => bar.remove();
  document.getElementById('opp-ai-autofill-btn').onclick = () => {
    const profile = {
      displayName: 'Alex Chen',
      email: 'alex@university.edu',
      university: 'State University',
      major: 'Computer Science',
      graduationYear: 2026,
      skills: ['Python', 'React', 'Node.js', 'Git']
    };
    const result = performAutofill(profile);
    alert(result.message);
  };
}
