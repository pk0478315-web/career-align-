const { processOpportunity } = require('../services/opportunityPipeline');
const dbStore = require('../data/dbStore');

async function runTests() {
  console.log('🧪 Starting Pipeline Tests...\n');

  // 1. Valid opportunity
  console.log('--- 1. Valid Opportunity ---');
  const validOpp = {
    title: '  Software Engineering Intern   ',
    organization: 'Google LLC',
    category: 'Internship',
    sourceUrl: 'https://careers.google.com/internships',
    deadline: new Date(Date.now() + 100000000).toISOString()
  };
  const res1 = await processOpportunity(validOpp);
  console.log('Created:', res1.status === 'created');
  console.log('Normalized Title:', res1.opportunity.title);
  console.log('Normalized Org:', res1.opportunity.organization);
  console.log('Freshness:', res1.opportunity.freshnessStatus);
  console.log('URL validated:', res1.opportunity.sourceUrl);

  // 2. Duplicate opportunity
  console.log('\n--- 2. Duplicate Opportunity ---');
  const dupOpp = {
    title: 'Software Engineering Intern',
    organization: 'Google', // Will match 'google llc' after normalization!
    category: 'Internship',
    sourceUrl: 'https://careers.google.com/internships'
  };
  const res2 = await processOpportunity(dupOpp);
  console.log('Duplicate detected:', res2.status === 'duplicate');

  // 3. Expired opportunity
  console.log('\n--- 3. Expired Opportunity ---');
  const expOpp = {
    title: 'Past Event',
    organization: 'Apple Inc.',
    deadline: new Date(Date.now() - 100000000).toISOString()
  };
  const res3 = await processOpportunity(expOpp);
  console.log('Freshness (expired):', res3.opportunity.freshnessStatus === 'expired');

  // 4. Missing deadline & malformed URL
  console.log('\n--- 4. Missing Deadline & Invalid URL ---');
  const malOpp = {
    title: 'Mystery Job',
    organization: 'Startup',
    sourceUrl: 'not-a-valid-url',
    deadline: 'invalid-date'
  };
  const res4 = await processOpportunity(malOpp);
  console.log('Freshness (unknown):', res4.opportunity.freshnessStatus === 'unknown');
  console.log('URL stripped (null):', res4.opportunity.sourceUrl === null);

  // 5. Search & Filters
  console.log('\n--- 5. Advanced Search & Filters ---');
  const results = await dbStore.getOpportunities({
    organization: 'google',
    freshness: 'active'
  });
  console.log('Found filtered:', results.length > 0);

  console.log('\n✅ Pipeline tests complete.');
  process.exit(0);
}

runTests().catch(console.error);
