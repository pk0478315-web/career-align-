const alignmentEngine = require('../services/alignmentEngine');

async function runTests() {
  console.log('🧪 Starting Alignment Engine Tests...\n');

  const baseStudent = {
    educationLevel: 'Undergraduate',
    major: 'Computer Science',
    graduationYear: 2026,
    skills: ['Python', 'JavaScript', 'React'],
    interests: ['AI', 'Web Development'],
    careerGoals: 'Software Engineer',
    preferredLocation: 'New York',
    remotePreference: 'flexible'
  };

  const baseOpp = {
    title: 'Frontend Developer Intern',
    organization: 'Tech Corp',
    category: 'Internship',
    skillsRequired: ['JavaScript', 'React', 'HTML', 'CSS'],
    requirements: ['Currently enrolled in a Bachelor degree program'],
    educationRequirements: ['Undergraduate'],
    description: 'Build user interfaces with modern web technologies.',
    location: 'New York',
    isRemote: false
  };

  try {
    // 1. Strong Match
    console.log('--- 1. Strong Match ---');
    const res1 = await alignmentEngine.generateAlignment(baseStudent, baseOpp);
    console.log(`Overall Score: ${res1.overallScore}`);
    console.log(`Skill Score: ${res1.skillAlignment.score}`);
    console.log(`Location Score: ${res1.locationAlignment.score}`);

    // 2. Weak Match
    console.log('\n--- 2. Weak Match ---');
    const weakStudent = { ...baseStudent, skills: ['Accounting'], major: 'Finance', educationLevel: 'High School', preferredLocation: 'London', remotePreference: 'onsite' };
    const res2 = await alignmentEngine.generateAlignment(weakStudent, baseOpp);
    console.log(`Overall Score: ${res2.overallScore}`);
    console.log(`Skill Score: ${res2.skillAlignment.score}`);
    console.log(`Education Score: ${res2.educationAlignment.score}`);

    // 3. Missing Profile Data & Opportunity Data
    console.log('\n--- 3. Missing Data ---');
    const emptyStudent = {};
    const emptyOpp = { title: 'Unknown Role' };
    const res3 = await alignmentEngine.generateAlignment(emptyStudent, emptyOpp);
    console.log(`Overall Score: ${res3.overallScore}`);
    console.log(`Missing Reqs fallback:`, res3.missingRequirements?.length >= 0);

    // 4. AI Unavailable / Malformed (simulated by invalid env var for testing fallback logic if needed, but we'll just check if it throws an error and is caught by the try/catch in the engine)
    console.log('\n--- 4. Safe Fallback ---');
    const fallbackRes = await alignmentEngine.generateAlignment({ ...baseStudent, skills: null }, { ...baseOpp, skillsRequired: null });
    console.log('Safe fallback generated:', typeof fallbackRes.overallScore === 'number');

    console.log('\n✅ Alignment Engine tests complete.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal Error:', err);
    process.exit(1);
  }
}

runTests();
