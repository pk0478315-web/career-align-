/**
 * Seed opportunities matching Student Opportunity AI categories
 */

const seedOpportunities = [
  {
    id: "opp-001",
    title: "Google Summer of Code 2026",
    organization: "Google Open Source",
    category: "fellowship",
    description: "A global, online mentoring program focused on introducing new contributors to open source software development. Contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.",
    sourceUrl: "https://summerofcode.withgoogle.com",
    applicationUrl: "https://summerofcode.withgoogle.com/apply",
    deadline: "2026-04-15T23:59:59Z",
    location: "Global / Remote",
    isRemote: true,
    requirements: [
      "Must be at least 18 years old at registration",
      "Enrolled student or beginner contributor to open source",
      "Eligible to work in home country"
    ],
    skillsRequired: ["Git", "Python", "JavaScript", "C++", "Open Source"],
    fundingCompensation: "$3,000 - $6,000 stipend depending on project size and country",
    sourceType: "curated",
    freshnessDate: "2026-03-25T10:00:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-002",
    title: "Microsoft Imagine Cup 2026",
    organization: "Microsoft",
    category: "competition",
    description: "Empowering student innovators to bring technology solutions to life using Microsoft Azure and AI technologies. Teams compete globally for mentorship, Azure credits, and grand cash prizes.",
    sourceUrl: "https://imaginecup.microsoft.com",
    applicationUrl: "https://imaginecup.microsoft.com/register",
    deadline: "2026-05-10T23:59:59Z",
    location: "Global / Virtual Semi-Finals",
    isRemote: true,
    requirements: [
      "Must be 16 years of age or older",
      "Enrolled student at accredited university or college",
      "Teams of up to 4 students"
    ],
    skillsRequired: ["Cloud Computing", "AI/ML", "React", "Node.js", "Pitching"],
    fundingCompensation: "$100,000 Grand Prize + Mentorship with Satya Nadella",
    sourceType: "curated",
    freshnessDate: "2026-03-28T14:30:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-003",
    title: "Jane Street Software Engineering Internship (Summer 2026)",
    organization: "Jane Street Capital",
    category: "internship",
    description: "Work on mission-critical distributed systems, high-frequency trading infrastructure, and internal developer tooling in OCaml and modern systems programming.",
    sourceUrl: "https://www.janestreet.com/join-jane-street/programs-and-internships",
    applicationUrl: "https://www.janestreet.com/apply",
    deadline: "2026-06-01T23:59:59Z",
    location: "New York, NY / London",
    isRemote: false,
    requirements: [
      "Pursuing degree in Computer Science, Mathematics, Physics, or related discipline",
      "Graduating between December 2026 and Summer 2027",
      "Strong algorithms and data structures foundations"
    ],
    skillsRequired: ["Data Structures", "Algorithms", "Systems Programming", "Functional Programming"],
    fundingCompensation: "$65 - $85/hour + Housing Stipend + Flights",
    sourceType: "curated",
    freshnessDate: "2026-03-20T09:00:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-004",
    title: "Generation Google Scholarship (APAC / EMEA / NA)",
    organization: "Google",
    category: "scholarship",
    description: "Designed to help aspiring computer science students excel in technology and become active leaders in the field. Selected students will receive an academic scholarship and invitation to Google Scholar Retreat.",
    sourceUrl: "https://buildyourfuture.withgoogle.com/scholarships/generation-google-scholarship",
    applicationUrl: "https://buildyourfuture.withgoogle.com/apply",
    deadline: "2026-05-30T23:59:59Z",
    location: "Global / Regional",
    isRemote: true,
    requirements: [
      "Currently enrolled as full-time undergraduate student in CS, Computer Engineering, or related technical field",
      "Exemplify leadership and demonstrate passion for improving diversity in STEM",
      "Submit official academic transcripts and resume"
    ],
    skillsRequired: ["Computer Science", "Leadership", "Community Engagement"],
    fundingCompensation: "$5,000 - $10,000 USD tuition grant",
    sourceType: "curated",
    freshnessDate: "2026-03-29T11:00:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-005",
    title: "CERN Summer Student Research Programme",
    organization: "CERN (European Organization for Nuclear Research)",
    category: "research",
    description: "Join CERN physicists and engineers in Geneva for hands-on experimental particle physics research, high-performance computing, beam optics, and advanced instrumentation.",
    sourceUrl: "https://careers.cern/summer",
    applicationUrl: "https://careers.cern/apply-summer",
    deadline: "2026-04-30T12:00:00Z",
    location: "Geneva, Switzerland",
    isRemote: false,
    requirements: [
      "Completed at least 3 years of full-time studies at university level in Physics, Computing, or Engineering",
      "Have not worked at CERN for more than 3 months previously",
      "Good knowledge of English or French"
    ],
    skillsRequired: ["Physics", "C++", "Python", "Data Analysis", "Scientific Computing"],
    fundingCompensation: "90 CHF / day living allowance + travel refund + health insurance",
    sourceType: "curated",
    freshnessDate: "2026-03-15T08:00:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-006",
    title: "HackMIT 2026",
    organization: "Massachusetts Institute of Technology (MIT)",
    category: "hackathon",
    description: "One of the world's premier student-run hackathons bringing together over 1,000 hackers from across the globe to build groundbreaking hardware, software, and AI applications over 36 hours.",
    sourceUrl: "https://hackmit.org",
    applicationUrl: "https://hackmit.org/apply",
    deadline: "2026-07-15T23:59:59Z",
    location: "Cambridge, MA / Hybrid",
    isRemote: true,
    requirements: [
      "Enrolled undergraduate or graduate student",
      "Valid student ID required upon check-in",
      "Both beginners and experienced developers welcome"
    ],
    skillsRequired: ["Web Development", "AI/ML", "APIs", "Design", "Collaboration"],
    fundingCompensation: "$30,000 in prizes + Travel reimbursement grants",
    sourceType: "curated",
    freshnessDate: "2026-03-27T16:00:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-007",
    title: "Kaggle Community AI Research Grant",
    organization: "Kaggle & Alphabet",
    category: "research",
    description: "Grants provided to independent student researchers and university labs working on open-source machine learning datasets, safety benchmarks, and novel evaluation architectures.",
    sourceUrl: "https://www.kaggle.com/grants",
    applicationUrl: "https://www.kaggle.com/grants/apply",
    deadline: "2026-08-01T23:59:59Z",
    location: "Remote",
    isRemote: true,
    requirements: [
      "Active Kaggle or GitHub account with public reproducible notebooks",
      "Clear proposal outlining dataset release or open-weights model contribution"
    ],
    skillsRequired: ["PyTorch", "Transformers", "Data Science", "Python"],
    fundingCompensation: "$10,000 - $25,000 research award + Google Cloud TPU credits",
    sourceType: "curated",
    freshnessDate: "2026-03-24T12:00:00Z",
    extractionStatus: "verified"
  },
  {
    id: "opp-008",
    title: "Palantir Women in Tech Scholarship",
    organization: "Palantir Technologies",
    category: "scholarship",
    description: "Supporting women in STEM through academic scholarships, virtual technology mentorship workshops, and fast-track consideration for engineering internship opportunities.",
    sourceUrl: "https://www.palantir.com/careers/students/scholarship",
    applicationUrl: "https://www.palantir.com/careers/apply",
    deadline: "2026-06-15T23:59:59Z",
    location: "North America & Europe",
    isRemote: true,
    requirements: [
      "Identify as a woman",
      "Undergraduate student actively pursuing computer science or software engineering",
      "Submit technical essay and resume"
    ],
    skillsRequired: ["Java", "Python", "Data Structures", "Technical Writing"],
    fundingCompensation: "$7,000 scholarship + Virtual developmental retreat",
    sourceType: "curated",
    freshnessDate: "2026-03-26T15:20:00Z",
    extractionStatus: "verified"
  }
];

module.exports = seedOpportunities;
