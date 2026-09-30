const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
  /**
   * Safe URL extraction and draft generation
   */
  async extractOpportunityFromUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('Valid URL string is required');
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (StudentOpportunityAI/1.0; +https://student-opps.internal)'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract metadata
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const docTitle = $('title').text().trim();
      const title = ogTitle || docTitle || parsedUrl.hostname;

      const ogDesc = $('meta[property="og:description"]').attr('content');
      const metaDesc = $('meta[name="description"]').attr('content');
      const bodySnippet = $('p').first().text().trim().substring(0, 300);
      const description = ogDesc || metaDesc || bodySnippet || 'Details available at source link.';

      const ogSiteName = $('meta[property="og:site_name"]').attr('content');
      const organization = ogSiteName || parsedUrl.hostname.replace('www.', '').split('.')[0].toUpperCase();

      // Guess category from content keywords
      const fullText = (title + ' ' + description).toLowerCase();
      let category = 'other';
      if (/scholarship|grant|tuition|bursary/i.test(fullText)) {
        category = 'scholarship';
      } else if (/intern|co-op|summer analyst/i.test(fullText)) {
        category = 'internship';
      } else if (/hackathon|hack\b/i.test(fullText)) {
        category = 'hackathon';
      } else if (/fellowship/i.test(fullText)) {
        category = 'fellowship';
      } else if (/research|laboratory|lab\b|phd/i.test(fullText)) {
        category = 'research';
      } else if (/competition|contest|challenge/i.test(fullText)) {
        category = 'competition';
      }

      const isRemote = /remote|virtual|online|global/i.test(fullText);

      return {
        success: true,
        extracted: {
          title: title.substring(0, 150),
          organization,
          category,
          description: description.substring(0, 600),
          sourceUrl: url,
          applicationUrl: url,
          deadline: null, // Left null so user explicitly enters or confirms
          location: isRemote ? 'Remote' : 'Location to verify',
          isRemote,
          requirements: ['Review prerequisites on host website'],
          skillsRequired: [],
          fundingCompensation: 'To be verified',
          sourceType: 'captured',
          extractionStatus: 'review_needed'
        },
        notice: 'Extracted web draft. Please review and fill in missing deadline and requirement details before saving.'
      };
    } catch (err) {
      // Graceful fallback per Blueprint requirement 5 & Page 6
      return {
        success: false,
        extracted: {
          title: parsedUrl.hostname,
          organization: parsedUrl.hostname.replace('www.', ''),
          category: 'other',
          description: 'Automated extraction unavailable or restricted by host website. Please enter details manually.',
          sourceUrl: url,
          applicationUrl: url,
          deadline: null,
          location: 'To be verified',
          isRemote: false,
          requirements: [],
          skillsRequired: [],
          fundingCompensation: 'Not specified',
          sourceType: 'manual',
          extractionStatus: 'review_needed'
        },
        notice: 'Could not automatically parse the webpage (anti-bot protection or network timeout). Created a manual entry template from the URL.'
      };
    }
  }
}

module.exports = new ScraperService();
