# TeamUp — Project Milestones

> A step-by-step roadmap to take TeamUp from a static UI prototype to a fully functional hackathon team-finding platform.

---

## Milestone 1 ✅ — Static UI Prototype

**Status:** Completed

| Deliverable | Details |
|---|---|
| Home page | Hero section, "How It Works" steps, featured team previews |
| Login / Sign-Up page | Glassmorphic split-panel design with email, password & social login UI (design only — no auth logic) |
| Dashboard page | Team card grid, search & category filters, bookmark toggle, "Create Team" modal, team detail modal |
| Styling | Tailwind CSS v4 glassmorphism theme, animated gradient background, floating orb effects |
| Tech stack | React 19, Vite, Tailwind CSS, Lucide Icons |

---

## Milestone 2 — Authentication & Route Protection

**Status:** Not started

| Deliverable | Details |
|---|---|
| Auth provider setup | Integrate Firebase Auth (or Supabase Auth) for email/password + OAuth (GitHub, Google) |
| Login / Sign-Up logic | Wire the existing LoginPage form to real auth — handle sign-in, sign-up, validation errors, loading states |
| Auth context | Create a React `AuthContext` that exposes the current user, login, logout, and loading state |
| Protected routes | Gate the Dashboard behind authentication — unauthenticated users are redirected to the Login page |
| Navbar auth state | Show user avatar + "Sign Out" button when logged in; show "Sign In" CTA when logged out |
| Persistent sessions | Keep users signed in across page refreshes using auth tokens / cookies |

---

## Milestone 3 — Backend & Database

**Status:** Not started

| Deliverable | Details |
|---|---|
| Database setup | Configure Firestore (or Supabase Postgres) with collections/tables: `users`, `teams`, `join_requests` |
| Team CRUD API | Create, read, update, and delete teams — replace the hardcoded `INITIAL_TEAMS` mock data |
| User profiles | Store user display name, skills, bio, avatar, and linked hackathon history |
| Join requests | Allow users to request to join a team; team leaders can accept or reject |
| Real-time sync | Live updates when a new team is created or a member joins (Firestore `onSnapshot` or Supabase Realtime) |

---

## Milestone 4 — Team Matching & Discovery

**Status:** Not started

| Deliverable | Details |
|---|---|
| Skill-based matching | Compute a real match score between a user's skill profile and the team's open roles |
| Advanced filters | Filter by hackathon name, team size, open role type, and sort by match score |
| Search improvements | Full-text search across team descriptions, tech stacks, and hackathon names |
| Recommendations | "Suggested for You" section on the dashboard based on user's skills and interests |

---

## Milestone 5 — Team Collaboration Features

**Status:** Not started

| Deliverable | Details |
|---|---|
| Team chat / messaging | In-app real-time messaging for team members (e.g., via Firestore or a chat SDK) |
| Role assignment | Team leader can assign roles (Frontend, Backend, Designer, PM) to each member |
| Task board | Simple kanban / checklist for hackathon sprint tasks |
| File / link sharing | Share project links, Figma files, repos, and documents within the team room |

---

## Milestone 6 — Notifications & User Experience

**Status:** Not started

| Deliverable | Details |
|---|---|
| In-app notifications | Notify users of join requests, team invites, and deadline reminders |
| Email notifications | Send transactional emails for account verification, join acceptance, and event reminders |
| Toast / snackbar feedback | Success and error toasts for form submissions, bookmark actions, and team joins |
| Loading skeletons | Add skeleton shimmer states for cards, modals, and page transitions |
| Error boundaries | Graceful error handling with fallback UI for network failures |

---

## Milestone 7 — Profile & Settings

**Status:** Not started

| Deliverable | Details |
|---|---|
| User profile page | View and edit display name, avatar, bio, skills, and social links |
| Public profiles | Shareable user profile URL showing hackathon history and team contributions |
| Account settings | Change password, manage connected OAuth providers, delete account |
| Dark / light theme toggle | Optional theme preference (current design defaults to dark) |

---

## Milestone 8 — Deployment & DevOps

**Status:** Not started

| Deliverable | Details |
|---|---|
| CI/CD pipeline | GitHub Actions workflow — lint, test, build, deploy on merge to `main` |
| Hosting | Deploy frontend to Vercel / Netlify / Firebase Hosting with preview URLs on PRs |
| Environment config | Separate `.env` files for development, staging, and production |
| Performance audit | Lighthouse CI checks — target 90+ on Performance, Accessibility, Best Practices, SEO |
| Analytics | Integrate basic analytics (Google Analytics / PostHog) for usage tracking |

---

## Milestone 9 — Testing & Quality Assurance

**Status:** Not started

| Deliverable | Details |
|---|---|
| Unit tests | Vitest + React Testing Library for component-level tests |
| Integration tests | Test auth flows, team CRUD, and filter logic end-to-end |
| E2E tests | Playwright / Cypress for critical user journeys (sign up → create team → join team) |
| Accessibility audit | axe-core automated checks + manual keyboard / screen-reader testing |
| Responsive QA | Test across mobile (375px), tablet (768px), and desktop (1440px) breakpoints |

---

## Milestone 10 — Launch & Iteration

**Status:** Not started

| Deliverable | Details |
|---|---|
| Beta launch | Invite a small group of hackathon organizers and participants for feedback |
| Feedback collection | In-app feedback widget + survey form |
| Bug triage & hotfixes | Prioritize and fix issues reported during beta |
| Public launch | Open registration, social media announcement, and Product Hunt listing |
| Post-launch metrics | Track sign-ups, team creation rate, match acceptance rate, and retention |

---

> **How to use this file:** Check off milestones as they are completed. Each milestone can be broken into individual GitHub Issues or tasks for sprint planning.
