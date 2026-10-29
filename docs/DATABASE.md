# Database Presentation

## Overview

MongoDB is the system of record and Mongoose enforces document structure,
references, indexes, and lifecycle rules. The design separates applications,
accounts, tasks, and assignments so history remains traceable.

## Collections

| Collection | Purpose | Important relations |
|---|---|---|
| `users` | Active/invited/suspended identities, roles, departments | departments -> Department |
| `membershipapplications` | Original applicant data and decision | preferredDepartment, reviewedBy |
| `invitetokens` | Hashed one-time activation tokens | user, application |
| `departments` | Club teams and department heads | heads -> User |
| `tasks` | Global or department work definitions | department, createdBy |
| `taskassignments` | Claim, leave, submission, and review history | task, member, reviewedBy |
| `notifications` | Recipient-owned activity feed | recipient, relatedId |
| `events` | Workshops, events, announcements | createdBy |
| `sitecontents` | Public leader and achievement records | kind-based polymorphic fields |
| `registrationsettings` | Single global manual registration override | updatedBy |
| `auditlogs` | Sensitive change history | actor, targetId |

## Key modeling decisions

### Applications are not users

An applicant stays in `MembershipApplication`. Acceptance creates an invited
`User` and one-time `InviteToken`. This prevents rejected or incomplete
applications from becoming accounts.

### Tasks are not assignments

`Task` defines work and capacity. `TaskAssignment` records one member's lifecycle
for that task. The unique `(task, member)` index prevents duplicate claims while
preserving history after a member leaves.

### Leaderboard history is authoritative

Approved assignments are aggregated for ranking. Cached user points support fast
profile display but do not define leaderboard truth.

### Content is managed centrally

The official site reads leaders and achievements from `SiteContent`; it does not
keep an editable hardcoded copy.

## Important indexes

| Index | Reason |
|---|---|
| User email unique | Login identity and duplicate prevention |
| Department slug/name unique | Stable public identity |
| Pending application email partial unique | One pending request per email |
| Invite token hash unique + expiry TTL | One-time secure activation and cleanup |
| Task status/deadline | Available task queue |
| Task department/status/deadline | Department task views |
| Assignment task/member unique | Atomic claim identity |
| Assignment member/status/updatedAt | Member dashboard |
| Notification recipient/readAt/createdAt | Unread feed |
| Event status/startsAt | Published calendar |
| SiteContent kind/sortOrder/createdAt | Stable public order |
| Audit actor/createdAt and target/createdAt | Security review |

## Invariants

- Production MongoDB must support transactions.
- Global tasks cannot reference a department.
- Department tasks require an active department.
- Accepted applications require a department.
- Invite activation is one-time and expiry-bound.
- The final active Lead cannot be removed or suspended.
- Department-head roles follow actual department head assignments.
- Task assigned count changes in the same transaction as assignment state.
- Approved work awards points only once.

See [database-schema.drawio](database-schema.drawio) for the editable relationship
diagram and `backend/src/models` for the executable schemas.
