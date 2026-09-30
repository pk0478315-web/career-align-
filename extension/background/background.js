/**
 * Background Service Worker for Student Opportunity AI Extension
 */

const DEFAULT_API_BASE = 'https://career-align-six.vercel.app/api';

// Listen for background messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'API_CALL') {
    handleApiCall(request)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }
});

async function handleApiCall({ endpoint, method = 'GET', body, token }) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${DEFAULT_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const resJson = await response.json();
  if (!response.ok) {
    throw new Error(resJson.error?.message || 'API call failed');
  }
  return resJson;
}
