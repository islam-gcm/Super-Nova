# Complete SuperNova Workflow

## Roles

| Role | Main access |
|---|---|
| Visitor | Official site, public content, registration status, application form |
| Member | Dashboard, visible tasks, claims, submissions, notifications, leaderboard |
| Department head | Member access plus department task creation and scoped reviews |
| HR | Applications, members, departments, content, events, all task administration |
| Lead | Same platform-wide administration as HR |

`department_head` is maintained through department head assignments. Lead and HR
cannot add or remove it directly from the member editor.

## 1. Initial club setup

1. Deploy MongoDB, API, Virtual Club, and official site.
2. Run `npm run seed:admin` in `backend` to create the first active Lead.
3. Log in and create the club departments.
4. Assign active members as department heads where needed.
5. Add leaders and achievements under Website Content.
6. Add and publish upcoming events or workshops.
7. Open registration from the Lead/HR dashboard.

Departments must exist before an application can be accepted or a department
task can be created.

## 2. Visitor and application flow

1. A visitor opens the official landing website.
2. **Join Us** redirects to the public `/join` route in the Virtual Club.
3. The page requests `GET /registration/status` and `GET /departments`.
4. If registration is closed, the form is replaced with the next opening date.
5. If open, the visitor submits `POST /applications`.
6. The API validates the input, rejects duplicate pending applications and
   existing member emails, then stores a pending `MembershipApplication`.
7. Lead and HR see the application under `/workspace/applications`.

Application submission is rate-limited in production to five requests per IP
per hour.

## 3. Application decision and account activation

### Accepted

1. Lead or HR chooses **Accept**, selects a department, and may add a note.
2. A MongoDB transaction updates the application, creates an invited `User`,
   creates a hashed one-time `InviteToken`, writes an audit entry, and creates
   the relevant notifications.
3. Brevo sends the applicant an activation link containing the raw one-time token.
4. The applicant opens `/activate?token=...` and chooses a password.
5. A transaction marks the token used and changes the user from `invited` to
   `active`.
6. The API creates an HTTP-only authentication cookie and the user enters the
   workspace.

Invite tokens expire according to `INVITE_EXPIRES_HOURS`, defaulting to 72 hours.
Only the token hash is stored in MongoDB.

### Rejected

1. Lead or HR chooses **Reject** and may add a decision note.
2. The application becomes rejected and an audit entry is stored.
3. Brevo sends the decision email.
4. No user account or invite token is created.

An application decision remains saved even if email delivery fails. The API
returns `emailDelivered: false` so the administrator can follow up.

## 4. Authentication and session flow

1. The client posts email and password to `POST /auth/login`.
2. The API checks the password hash and requires an active account.
3. A signed JWT is stored in the browser as an HTTP-only cookie.
4. The client confirms the session with `GET /auth/me`.
5. Every protected request reloads the user from MongoDB, so suspension and role
   changes take effect immediately.
6. `POST /auth/logout` clears the cookie.

The API also accepts `Authorization: Bearer <token>` for future native clients.
Browser clients should use cookies with `credentials: "include"`.

## 5. Task lifecycle

### Publishing

1. Lead and HR may create global or department tasks.
2. A department head may create only department tasks for a department they head.
3. Each task has a deadline, capacity, points, description, and optional notes.
4. Global tasks are visible to every active member. Department tasks are visible
   only to members assigned to that department and privileged administrators.

### Claiming and leaving

1. A member claims an available task with `POST /tasks/{id}/claims`.
2. A transaction creates or reactivates the unique member/task assignment and
   increments `Task.assignedCount`.
3. At capacity, the task becomes `filled` and cannot be claimed again.
4. Before submission, a member may leave with
   `DELETE /tasks/{id}/claims/me`.
5. Leaving decrements capacity and reopens the task when a place becomes free.

The unique `(task, member)` index prevents duplicate assignments. Transactions
prevent two simultaneous claims from exceeding capacity.

### Submission and review

1. The assignee submits a note and optional HTTP(S) evidence URL.
2. The assignment becomes `submitted` and department reviewers are notified.
3. Lead, HR, or the owning department head approves or rejects it.
4. Approval makes the assignment immutable, completes the task when appropriate,
   and awards the task points once.
5. Rejection returns the assignment to the member with the review note.

## 6. Leaderboard and notifications

- The leaderboard is calculated from approved `TaskAssignment` history.
- `User.points` and `completedTasksCount` are convenient cached values, not the
  source of truth.
- Notifications are owned by one recipient and can only be read by that user.
- Task, submission, review, and administrative workflows create notifications
  with links back to the relevant workspace view.

## 7. Official website content

- Published events come from `GET /events`.
- Active departments come from `GET /departments`.
- Leaders and achievements come from `GET /content/{kind}`.
- Lead and HR manage those records in the Virtual Club.
- The official frontend never keeps a second editable copy of this content.
- The only registration form is `/join` in the Virtual Club.

## 8. Daily administration

1. Review pending applications and email-delivery status.
2. Check submitted task assignments.
3. Publish or archive events.
4. Maintain departments, department heads, member roles, and suspensions.
5. Update public leaders and achievements.
6. Review audit logs after sensitive changes.
7. Monitor API health, MongoDB availability, Brevo delivery, error rate, and
   storage growth.

## 9. Important recovery rules

- Never activate an invited user manually; activation must consume the invite.
- Never remove or suspend the final active Lead.
- Remove a user from department head assignments before removing that department
  from the user.
- Do not run task/account workflows on standalone MongoDB.
- If email delivery fails, fix Brevo and follow up manually; do not reverse the saved decision.
- Restore MongoDB from backup before replaying administrative writes after data loss.
