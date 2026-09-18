# Music Vault — Sprint 1 Artifact

**Student:** Bassma Ennarah  
**Sprint:** Sprint 1 — Project Foundation & User Profiles  
**Dates:** September 3 – September 17, 2026

## Sprint Objective

My Sprint 1 responsibility was to establish the React frontend foundation for Music Vault and contribute to the initial user/profile data functionality needed by later authentication and personalization features.

---

## 1. React Application Structure

I established and organized the React frontend structure using Vite.

The frontend was organized into reusable directories for:

- components
- pages
- services
- hooks
- context
- utilities
- assets

This structure provides a consistent organization that other team members can use when adding Music Vault features.

### Result

The React application starts successfully and provides a reusable frontend foundation for future sprints.

---

## 2. Frontend Routing

I configured React Router to provide navigation between the initial Music Vault pages.

Current routes include:

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/recommendations`

These routes currently provide the application structure that later features will build upon.

### Result

All configured routes were manually tested and loaded successfully.

---

## 3. Shared Frontend Layout

I created a shared application layout and navigation structure.

The layout allows common UI components, such as the navigation bar, to remain consistent while React Router renders the selected page.

Conceptually:

App
→ Layout
→ Navbar
→ Current Page

### Result

The shared layout renders successfully across the configured application routes.

---

## 4. Frontend-to-Backend API Structure

I established a reusable frontend service layer for communication with the Express backend.

The service structure includes:

- `api.js`
- `authService.js`
- `spotifyService.js`
- `recommendationService.js`
- `healthService.js`

The frontend API URL is configured using a Vite environment variable rather than being hardcoded throughout the application.

Team-standard configuration:

`VITE_API_URL=http://localhost:5000/api`

### Local Development Note

Port 5000 on my Mac was occupied by Apple's AirTunes service. This caused requests to localhost:5000 to return an AirTunes 403 response instead of reaching Express.

For local integration testing, I ran Express on port 5001 and configured my ignored local `.env` file to use:

`VITE_API_URL=http://localhost:5001/api`

The team's `.env.example` remains configured for the standard backend port 5000.

---

## 5. Frontend-to-Backend Integration Test

I tested the frontend against the implemented Express health endpoint:

`GET /api/health`

The Express backend returned HTTP 200 with a health response indicating that the Music Vault API was running.

I then tested the same endpoint through the React frontend service layer.

Test flow:

React
→ healthService.js
→ api.js
→ Express
→ GET /api/health
→ HTTP 200 / JSON response

### Result

The React frontend successfully communicated with the Express backend.

---

## 6. User/Profile Data Contract

I documented the initial Music Vault user/profile data contract.

Initial fields:

### userId

Internal Music Vault identifier.

### email

Email associated with the native Music Vault profile.

### spotifyId

Optional identifier associated with a linked Spotify account.

The contract is documented in:

`docs/user-profile-data-contract.md`

The schema is provisional and can be expanded as authentication and Spotify integration requirements become more complete.

---

## 7. Temporary User/Profile Model

The production MySQL persistence layer was not yet available when I reached the profile-model portion of my Sprint 1 work.

To avoid blocking my assigned work, I implemented a temporary in-memory profile model.

The model supports:

- creating profiles
- generating internal user IDs
- retrieving profiles by user ID
- retrieving profiles by email
- storing an optional Spotify ID

### Important Limitation

This model is intentionally temporary.

Profiles are stored only in memory and therefore do not persist when the Node process stops.

The model is intended to be replaced or adapted once the team's MySQL + mysql2 persistence layer is available.

---

## 8. Profile Validation

I added validation for the temporary profile model.

Validation includes:

- required email
- valid email format
- duplicate email handling
- optional Spotify ID
- Spotify ID type validation
- invalid/missing profile lookup handling

This provides a defined validation boundary that can later be reused or adapted when production persistence is introduced.

---

## 9. Sprint 1 Testing

I tested the frontend and profile functionality developed during Sprint 1.

### Frontend Tests

- Application startup — Pass
- Home route — Pass
- Login route — Pass
- Register route — Pass
- Dashboard route — Pass
- Recommendations route — Pass
- Shared navigation/layout — Pass

### Integration Test

- Express health endpoint — Pass
- React-to-Express health request — Pass

### Profile Tests

- Valid profile creation — Pass
- Retrieve profile by user ID — Pass
- Retrieve profile by email — Pass
- Missing email validation — Pass
- Invalid email validation — Pass
- Duplicate email validation — Pass
- Invalid Spotify ID validation — Pass

Detailed testing evidence is stored in:

`docs/sprint1-test-results.md`

---

## 10. Team Dependencies

### Adam — Express Backend

My frontend API integration depended on the Express backend foundation.

Once the health endpoint was available, I used it to verify communication between React and Express.

### Cynthia — Database

The production user/profile persistence layer was not available when I implemented the profile portion of Sprint 1.

I coordinated the initial profile fields with Cynthia's draft database design.

The team plans to use MySQL with the mysql2 Node.js library.

### Jesse — Spotify

Spotify connectivity is related to future profile linking, but native profile functionality did not require Spotify integration to complete my Sprint 1 work.

---

## 11. Fallback Used

The main Sprint 1 fallback involved profile persistence.

Because the production MySQL layer was not yet available, I followed the fallback strategy in my implementation plan and created an in-memory profile model.

This allowed me to implement and test:

- profile creation
- profile retrieval
- internal user identifiers
- validation
- duplicate handling

without waiting for the production database.

The temporary model will need to be integrated with MySQL when the database layer becomes available.

---

## 12. GitHub Evidence

My Sprint 1 GitHub activity includes work related to:

- React application structure
- frontend routing
- shared frontend layout
- frontend API service structure
- frontend/backend integration
- user/profile data contract
- temporary profile model
- profile validation
- Sprint 1 testing

Development was performed on my `bassma-sprint1` branch and reviewed/merged through the team's pull-request workflow where applicable.

---

## 13. Demo Evidence

For Sprint 1, I can demonstrate:

1. Starting the React application.
2. Navigating between Music Vault routes.
3. Showing the shared frontend layout.
4. Explaining the frontend service/API structure.
5. Explaining the React → Express integration flow.
6. Demonstrating successful profile creation.
7. Retrieving a profile by ID or email.
8. Demonstrating validation failures.
9. Explaining why the current profile model is temporary.
10. Explaining how the model will transition to MySQL persistence.

---

## 14. Technical Decisions

### Reusable Frontend Structure

The frontend was organized around reusable components, pages, and services so later features can be added without restructuring the application.

### Centralized API Requests

Backend communication was placed in a service layer instead of embedding API requests directly inside React components.

### Internal User Identifier

The profile contract keeps `userId` separate from email so Music Vault has its own internal identifier.

### Temporary Persistence

An in-memory model was deliberately used as a fallback rather than creating a competing MySQL configuration while the team's database foundation was still under development.

---

## 15. Remaining Integration Work

The temporary profile model still needs to be replaced or adapted for production MySQL persistence.

Future work will also connect the profile system with:

- authentication endpoints
- Spotify account linking
- persistent database storage
- later user preference functionality