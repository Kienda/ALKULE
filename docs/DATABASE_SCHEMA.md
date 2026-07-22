# Alkule database schema

PostgreSQL, managed with Prisma. Source of truth: `prisma/schema.prisma`.
Migrations live in `prisma/migrations/`. This document describes the schema as of
Phase 1.

## Conventions
- Primary keys are UUID strings (`@default(uuid())`).
- Timestamps are stored as `timestamptz` and generated in UTC.
- Foreign keys use explicit `onDelete` behavior (cascade for owned rows, set-null
  for audit actor references so history survives account deletion).
- Enums are native Postgres enum types.

## Enums
| Enum | Values |
| --- | --- |
| `RoleName` | `owner`, `admin`, `instructor`, `moderator`, `learner` |
| `AdminPermissionName` | `manage_users`, `manage_instructors`, `manage_courses`, `manage_content`, `manage_orders`, `manage_refunds`, `manage_certificates`, `manage_community`, `manage_notifications`, `view_audit_logs` |
| `UserStatus` | `active`, `suspended`, `deactivated` |

## Tables

### User
Core account. One row per person.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| email | text | unique |
| passwordHash | text | scrypt `salt:hash` |
| name | text | |
| status | UserStatus | default `active`; indexed |
| preferredLocale | text | default `en` |
| timezone | text? | |
| emailVerifiedAt | timestamptz? | |
| sessionVersion | int | default 0; incremented to revoke all sessions on role/status change |
| createdAt / updatedAt | timestamptz | |

Relations: `roles` (UserRole[]), `adminPermissions` (AdminPermission[]),
`progress` (TypingProgress?), `auditLogsAsActor` (AuditLog[]).

### UserRole
Assigns a role to a user. A user may hold multiple roles.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| userId | uuid | FK → User, cascade delete |
| role | RoleName | indexed |
| createdAt | timestamptz | |

Constraint: unique `(userId, role)`.

### AdminPermission
Granular capabilities granted to an admin. Owners bypass these (full access).
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| userId | uuid | FK → User, cascade delete |
| permission | AdminPermissionName | |
| grantedBy | uuid? | actor who granted it |
| grantedAt | timestamptz | |

Constraint: unique `(userId, permission)`.

### AuditLog
Append-only record of privileged actions. Never updated or deleted by app code.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| actorId | uuid? | FK → User, set-null on actor deletion |
| action | text | e.g. `owner.bootstrap`, `admin.granted`, `user.status_changed`; indexed |
| targetType | text? | e.g. `user` |
| targetId | text? | |
| metadata | jsonb? | action-specific context; never contains secrets |
| createdAt | timestamptz | indexed |

Indexes: `action`, `(targetType, targetId)`, `createdAt`.

### TypingProgress
One row per learner; the free typing lab's saved progress.
| Column | Type | Notes |
| --- | --- | --- |
| userId | uuid | PK, FK → User, cascade delete |
| score / attempts / correct / streak | int | default 0 |
| updatedAt | timestamptz | |

### NewsletterSubscriber
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| email | text | unique |
| createdAt | timestamptz | |

## Planned tables (later phases)
Instructor applications & profiles, courses/modules/lessons (+ translations),
media, enrollments & progress, quizzes & attempts, assignments & submissions,
live cohorts & attendance, products & prices, orders & payment transactions,
subscription plans, refunds, entitlements, revenue ledger & payouts,
certificates, editorial/library content, community reports, notifications.
