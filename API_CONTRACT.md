# Student Opportunity AI — API Contract

**Version:** 1.0  
**Base URL:** `http://localhost:5000/api`  
**Response Standard:**
- **Success:** `{ "success": true, "data": <payload> }`
- **Error:** `{ "success": false, "error": { "message": "string", "code": "ERROR_CODE" } }`

---

## 1. Authentication & Profile Endpoints

### 1.1 Register
- **Method:** `POST`
- **Route:** `/auth/register`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "Password123!",
    "displayName": "Alex Chen"
  }
  ```
- **Success (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "email": "student@university.edu",
        "displayName": "Alex Chen"
      }
    }
  }
  ```
- **Errors:**
  - `400 Bad Request`: `{ "message": "Email and password (min 6 chars) are required", "code": "VALIDATION_ERROR" }`
  - `409 Conflict`: `{ "message": "An account with this email already exists", "code": "USER_EXISTS" }`

### 1.2 Login
- **Method:** `POST`
- **Route:** `/auth/login`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "email": "student@university.edu",
    "password": "Password123!"
  }
  ```
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "email": "student@university.edu",
        "displayName": "Alex Chen"
      }
    }
  }
  ```
- **Errors:**
  - `401 Unauthorized`: `{ "message": "Invalid email or password", "code": "INVALID_CREDENTIALS" }`

### 1.3 Current User & Profile (`/auth/me`)
- **Method:** `GET`
- **Route:** `/auth/me`
- **Auth:** `Bearer <token>`
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "uuid", "email": "student@university.edu" },
      "profile": { ... }
    }
  }
  ```

### 1.4 Get Student Profile
- **Method:** `GET`
- **Route:** `/profile`
- **Auth:** `Bearer <token>`
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "uuid",
      "displayName": "Alex Chen",
      "university": "State University",
      "educationLevel": "Undergraduate",
      "major": "Computer Science",
      "graduationYear": 2026,
      "skills": ["Python", "React", "PostgreSQL", "Machine Learning"],
      "interests": ["AI Research", "Web Development", "Open Source"],
      "careerGoals": "Software Engineer & AI Researcher",
      "preferredLocation": "Remote / North America",
      "remotePreference": "flexible",
      "themePreference": "light"
    }
  }
  ```

### 1.5 Update Student Profile
- **Method:** `PUT`
- **Route:** `/profile`
- **Auth:** `Bearer <token>`
- **Request Body:** Partial or complete profile fields.
- **Success (200 OK):** Returns updated profile object.

---

## 2. Opportunity Discovery Endpoints

### 2.1 List Opportunities
- **Method:** `GET`
- **Route:** `/opportunities`
- **Auth:** Optional (`Bearer <token>` adds personalization / match insights)
- **Query Params:**
  - `search` (keyword search in title/org/description/skills)
  - `category` (`scholarship`, `internship`, `hackathon`, `fellowship`, `research`, `all`)
  - `remote` (`true` | `false`)
  - `sort` (`deadline` | `freshness` | `title`)
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total": 12,
      "items": [
        {
          "id": "uuid",
          "title": "Google Summer of Code 2026",
          "organization": "Google Open Source",
          "category": "fellowship",
          "description": "...",
          "deadline": "2026-04-15T23:59:59Z",
          "location": "Global",
          "isRemote": true,
          "fundingCompensation": "$3,000 - $6,000 stipend",
          "skillsRequired": ["Git", "Open Source", "Python"],
          "sourceUrl": "https://summerofcode.withgoogle.com",
          "sourceType": "curated",
          "matchExplanation": "Matches your interest in Open Source and Python skill."
        }
      ]
    }
  }
  ```

### 2.2 Get Opportunity Details
- **Method:** `GET`
- **Route:** `/opportunities/:id`
- **Auth:** Optional
- **Success (200 OK):** Returns detailed opportunity record with full description, eligibility criteria, document requirements, application link, and profile match breakdown.

### 2.3 Create / Add Opportunity (Manual)
- **Method:** `POST`
- **Route:** `/opportunities`
- **Auth:** `Bearer <token>`
- **Request Body:** `{ "title", "organization", "category", "description", "deadline", "applicationUrl", "location", "isRemote", "skillsRequired", "fundingCompensation" }`
- **Success (201 Created):** Returns created opportunity object.

### 2.4 Ingest / Capture URL
- **Method:** `POST`
- **Route:** `/opportunities/capture-url`
- **Auth:** `Bearer <token>`
- **Request Body:**
  ```json
  {
    "url": "https://example.com/fellowship"
  }
  ```
- **Success (200 OK):** Returns extracted structured draft (title, organization, description, suggested category, candidate deadline, sourceUrl) for student review before saving.

---

## 3. Opportunity Tracker (`My Opportunities`)

### 3.1 Get Tracked Opportunities
- **Method:** `GET`
- **Route:** `/my-opportunities`
- **Auth:** `Bearer <token>`
- **Query Params:**
  - `status` (optional filter: `saved`, `planned`, `applied`, `shortlisted`, `interview`, `offered`, `rejected`, `completed`, `archived`)
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "counts": {
        "all": 4,
        "saved": 2,
        "applied": 1,
        "interview": 1
      },
      "items": [
        {
          "id": "uuid",
          "opportunityId": "uuid",
          "opportunity": { ... },
          "status": "applied",
          "notes": "Submitted resume and transcript on Oct 1.",
          "checklist": [
            { "id": "1", "item": "Statement of Purpose", "completed": true },
            { "id": "2", "item": "Recommendation Letter", "completed": false }
          ],
          "reminders": ["2026-04-10"],
          "appliedDate": "2026-10-01T10:00:00Z",
          "updatedAt": "2026-10-01T10:00:00Z"
        }
      ]
    }
  }
  ```

### 3.2 Track / Save an Opportunity
- **Method:** `POST`
- **Route:** `/my-opportunities`
- **Auth:** `Bearer <token>`
- **Request Body:**
  ```json
  {
    "opportunityId": "uuid",
    "status": "saved",
    "notes": "Interesting AI track"
  }
  ```
- **Success (201 Created):** Returns user-opportunity tracking record.

### 3.3 Update Tracked Opportunity
- **Method:** `PATCH`
- **Route:** `/my-opportunities/:id`
- **Auth:** `Bearer <token>`
- **Request Body:** `{ "status", "notes", "checklist", "reminders", "appliedDate" }`
- **Success (200 OK):** Returns updated record.

### 3.4 Delete / Untrack Opportunity
- **Method:** `DELETE`
- **Route:** `/my-opportunities/:id`
- **Auth:** `Bearer <token>`
- **Success (200 OK):** `{ "success": true, "data": { "deleted": true } }`

---

## 4. AI Assistant / Copilot Endpoints

All AI endpoints use the student's profile context where available and strictly ground outputs without fabricating deadlines or eligibility guarantees.

### 4.1 Plain Language Summary
- **Method:** `POST`
- **Route:** `/ai/summarize`
- **Auth:** Optional / Bearer
- **Request Body:** `{ "opportunityId": "uuid", "text": "optional custom text" }`
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "summary": "This fellowship supports undergraduate students pursuing open source AI...",
      "keyHighlights": ["$5,000 stipend", "Remote friendly", "12-week program"],
      "grounded": true
    }
  }
  ```

### 4.2 Eligibility Analysis
- **Method:** `POST`
- **Route:** `/ai/eligibility-check`
- **Auth:** `Bearer <token>`
- **Request Body:** `{ "opportunityId": "uuid" }`
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "overallStatus": "appears to meet",
      "factors": [
        { "criterion": "Education Level", "assessment": "appears to meet", "detail": "Opportunity requires Undergraduate; your profile matches." },
        { "criterion": "Required Skills", "assessment": "appears to meet", "detail": "Matched Python and React." },
        { "criterion": "GPA requirement", "assessment": "not enough information", "detail": "Listing does not state a minimum GPA." }
      ],
      "disclaimer": "This is an AI-assisted estimate based on available source text. Always verify on official website."
    }
  }
  ```

### 4.3 Action / Document Checklist Generator
- **Method:** `POST`
- **Route:** `/ai/checklist`
- **Auth:** Optional / Bearer
- **Request Body:** `{ "opportunityId": "uuid" }`
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "checklist": [
        { "id": "chk_1", "item": "Updated Resume (PDF)", "completed": false },
        { "id": "chk_2", "item": "GitHub Project Portfolio link", "completed": false },
        { "id": "chk_3", "item": "1-page Statement of Interest", "completed": false }
      ]
    }
  }
  ```

---

## 5. Export & Import Endpoints

### 5.1 Export Opportunities
- **Method:** `GET`
- **Route:** `/export?format=json|csv&scope=my-opportunities|all`
- **Auth:** `Bearer <token>`
- **Success (200 OK):** Returns downloadable file stream or JSON payload containing the user's exported data.

### 5.2 Import Preview
- **Method:** `POST`
- **Route:** `/import/preview`
- **Auth:** `Bearer <token>`
- **Request Body:** `{ "records": [ ... ], "format": "json" }`
- **Success (200 OK):** Validates schema, flags existing duplicates, and previews ready-to-import rows.

### 5.3 Import Confirm
- **Method:** `POST`
- **Route:** `/import/confirm`
- **Auth:** `Bearer <token>`
- **Request Body:** `{ "records": [ ... ], "onDuplicate": "skip" | "merge" }`
- **Success (201 Created):** `{ "success": true, "data": { "importedCount": 3, "skippedCount": 0 } }`
