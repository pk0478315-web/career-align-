/**
 * Content Script for DOM extraction & Application Autofill Floating Panel
 */

console.log('[Student Opportunity AI] Content script active.');

// 1. Listen for extraction or autofill triggers from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_PAGE_METADATA') {
    const metadata = extractPageMetadata();
    sendResponse({ success: true, metadata });
  } else if (request.action === 'TRIGGER_AUTOFILL') {
    const result = performAutofill(request.profile);
    sendResponse({ success: true, result });
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
  const description = ogDesc || metaDesc || pText;

  const ogSite = document.querySelector('meta[property="og:site_name"]')?.content;

  return {
    url: window.location.href,
    title: title.trim(),
    organization: ogSite || window.location.hostname.replace('www.', '').split('.')[0].toUpperCase(),
    description: description.trim()
  };
}

// 2. Perform Form Autofill by mapping saved student profile values to inputs
function performAutofill(profile) {
  if (!profile) return { filledCount: 0, message: 'No profile data available' };

  const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
  let filledCount = 0;

  const profileMap = [
    { keys: ['name', 'full_name', 'fullname', 'displayname', 'applicant_name'], val: profile.displayName },
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
        if (!input.value) { // Don't overwrite existing text unless empty
          input.value = rule.val;
          // Trigger change events so React/Vue form libraries pick up the change
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

// 3. Inject Floating Quick Action Bar on Opportunity & Application Pages
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
      <span style="color:#818cf8;">✨ Student Opps AI</span>
    </div>
    <button id="opp-ai-autofill-btn" style="background:#4f46e5;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px;">
      ⚡ Autofill Application
    </button>
    <button id="opp-ai-close-btn" style="background:transparent;color:#94a3b8;border:none;cursor:pointer;font-size:14px;padding:0 4px;">✕</button>
  `;

  document.body.appendChild(bar);

  document.getElementById('opp-ai-close-btn').onclick = () => bar.remove();
  document.getElementById('opp-ai-autofill-btn').onclick = () => {
    chrome.storage.local.get(['studentProfile'], (res) => {
      const profile = res.studentProfile || {
        displayName: 'Alex Chen',
        email: 'alex@university.edu',
        university: 'State University',
        major: 'Computer Science',
        graduationYear: 2026,
        skills: ['Python', 'React', 'Node.js', 'Git']
      };
      const result = performAutofill(profile);
      alert(result.message);
    });
  };
}
