# Skills Locker – Antigravity Handover

**Date:** 20 January 2026 (AEST)  
**Project:** Skills Locker (Fit College)  
**Status:** Student-facing UI complete → Admin backend next

---

## 1. Project Overview

**Skills Locker** is a cloud-based Learning Management System (LMS) for Fit College, delivering short, practical fitness education products across three tiers:

| Tier | Duration | Accreditation |
|------|----------|---------------|
| **Training Bytes** | 1 hour | Not accredited |
| **Microcreds** | 1–2 days | Accredited by default |
| **Short Courses** | 1–3 weeks | Not accredited (default) |

**Current focus:** Student/user-facing experience is complete. Next step is the **admin backend** for course creation, editing, publishing, and cohort management.

**Design reference:** [Inclusive AF website](https://inclusiveaf.com) - used for visual/UX inspiration.

---

## 2. Current State ✅

### Student-Facing Side
- ✅ UI implemented and working
- ✅ Full course taxonomy populated (15 domains, 110 items)
- ✅ Core content structure complete

### Course Taxonomy (Final Loaded Content)

**Total:** 15 domains, 110 course items
- 42 Training Bytes
- 56 Microcreds  
- 12 Short Courses

<details>
<summary><strong>Domain Breakdown</strong></summary>

1. **S&C** - 4 Bytes, 6 Microcreds, 1 Short
2. **Nutrition** - 1 Byte, 3 Microcreds, 2 Shorts
3. **Fitness Business** - 3 Bytes, 5 Microcreds, 1 Short
4. **Online Coaching** - 1 Byte, 4 Microcreds, 1 Short
5. **AI in Fitness** - 3 Bytes, 2 Microcreds, 0 Shorts
6. **Mental Health & Fitness** - 4 Bytes, 4 Microcreds, 1 Short
7. **Mindset Coaching** - 4 Bytes, 5 Microcreds, 0 Shorts
8. **Typical Health Conditions** - 2 Bytes, 5 Microcreds, 0 Shorts
9. **Women Specific Training** - 2 Bytes, 3 Microcreds, 1 Short
10. **Disability Support** - 2 Bytes, 0 Microcreds, 0 Shorts
11. **Functional Fitness** - 6 Bytes, 5 Microcreds, 3 Shorts
12. **Advanced Hypertrophy** - 3 Bytes, 4 Microcreds, 0 Shorts
13. **Power Training** - 2 Bytes, 5 Microcreds, 1 Short
14. **Sport Coaching** - 0 Bytes, 0 Microcreds, 0 Shorts *(placeholder, intentionally empty)*
15. **Outdoor Group Training** - 5 Bytes, 5 Microcreds, 1 Short

</details>

---

## 3. Content Model (Data Structure)

Current implementation uses a simple JSON content model (can be persisted to DB later).

### A) Domains

```typescript
interface Domain {
  id: string;                    // stable, unique
  name: string;                  // e.g., "S&C", "Nutrition"
  partners: string[];            // placeholder contributors
}
```

### B) Course Items

```typescript
interface CourseItem {
  id: string;                    // stable, unique
  domainId: string;              // foreign key → domains.id
  tier: "BYTE" | "MICROCRED" | "SHORT";
  title: string;
  durationLabel: string;         // "1 hr", "1–2 days", "1–3 weeks"
  accredited: boolean;           // BYTE: false, MICROCRED: true, SHORT: false
  outcomes: string[];            // BYTE/MICROCRED: 3, SHORT: 4
  prerequisites: string[];       // array of course item IDs
  placeholderContributor?: string; // randomly assigned from domain partners
}
```

### Default Business Rules (as implemented)

**Duration by tier:**
- `BYTE`: `"1 hr"`
- `MICROCRED`: `"1–2 days"`
- `SHORT`: `"1–3 weeks"`

**Accreditation by tier:**
- `BYTE`: `false`
- `MICROCRED`: `true` (default)
- `SHORT`: `false`

**Outcomes count:**
- `BYTE` / `MICROCRED`: 3 outcomes each
- `SHORT`: 4 outcomes each

**Default prerequisite rules (applied during generation):**
- Each `BYTE` requires previous `BYTE` (if exists)
- Each `MICROCRED` requires previous `MICROCRED` (if exists)
- Each `SHORT` requires first 2 microcreds (or last 2 bytes if no microcreds)

> ⚠️ **Note:** Partner/contributor names are **placeholders** and NOT aligned to specific course items.

---

## 4. Data Population Workflow (Important!)

### Problem Encountered
Initial attempts using pipe/semicolon "table rows" caused **partial parsing** - domains and items were silently dropped.

### Solution Implemented ✅
Switched to **"domain blocks"** format (one domain per block, explicit lists) processed in **small batches**.

**Enforcement rules:**
- ✅ "Do not drop anything" rule
- ✅ Explicit tier mapping (`BYTE` / `MICROCRED` / `SHORT`)
- ✅ **Coverage report** after each batch:
  - `expectedBytes` vs `builtBytes`
  - `expectedMicrocreds` vs `builtMicrocreds`
  - `expectedShorts` vs `builtShorts`
  - `missingTitles[]`

> 🔁 **For future edits:** Continue using domain blocks + coverage validation for bulk imports.

---

## 5. Next Priority: Admin Backend 🎯

### High-Level Goal
Build an administrator/contributor backend to:

- ✏️ Edit existing courses
- ➕ Add new courses
- 🏗️ Build courses in a structured way (course builder)
- 👥 Support contributor workflows (templates, review, publish)
- 🤖 Optionally provide AI-assisted authoring tools

---

## 6. Recommended Admin Backend Scope

### 🟢 MVP Admin (Build Next)

#### 1. Admin Console + Navigation
- `/admin` - Dashboard
- `/admin/courses` - List/search/filter (Domain, Tier, Status)
- `/admin/courses/new` - Create new course
- `/admin/courses/:id` - Edit course metadata
- `/admin/courses/:id/builder` - Course builder UI

#### 2. Course Lifecycle Controls
- **Status workflow:** `DRAFT` → `IN_REVIEW` → `PUBLISHED`
- **Publish checklist** gating status changes
- **Version fields:** `versionNumber`, `lastPublishedAt`, `changelog`

#### 3. Course Builder (Template-Driven)
**Structure:**
```
Course
└── Modules[]
    └── Lessons[]
        └── Blocks[]
```

**Block types:**
- `VIDEO`, `TEXT`, `FILE`, `CHECKLIST`, `REFLECTION`, `LINK`, `QUIZ`, `ASSIGNMENT`

**Completion rules** per lesson/module (basic criteria)

#### 4. Assessments (Foundational)
- Question bank (tagged, reusable)
- Quiz builder (MCQ / True-False / Short Answer)
- Auto-grading for objective items

#### 5. Users and Roles
**Roles:** `ADMIN`, `EDITOR` (contributor), `REVIEWER`, `ASSESSOR`, `LEARNER`

Permission enforcement in UI and data layer.

#### 6. Cohorts/Intakes
- Create cohorts
- Assign courses
- Enrol learners (bulk)
- Cohort progress overview

---

### 🟡 Phase 2 (Premium LMS Value)

- 📚 **Asset Library** - Central media/resources reused across courses
- 📋 **Rubrics** + assessor marking workflow + feedback templates
- 🎓 **Certificates** and accreditation rules (complete + pass requirements)
- 📊 **Analytics** - Completion funnels, drop-off points, question difficulty stats

---

### 🔵 Phase 3 (Google AI "Superpower" Authoring)

AI-assisted authoring actions **inside Course Builder:**

- 📝 Generate course outline from a brief
- ✍️ Draft lesson content from outcomes + lesson goal
- ❓ Generate quiz from lesson
- 📄 Summarize module
- 🎨 Improve clarity and inclusivity

**Hard requirements:**
- ✅ AI outputs must be **strict JSON** matching project schema
- ✅ Always stage AI output as **preview diff**, require explicit **"Apply"** by admin

---

## 7. Contributor Course Builder Template (Requested Feature)

The admin backend should include a **contributor-friendly template** that:

- ✅ Collects course metadata (tier, duration, accredited, domain, partner)
- ✅ Requires outcomes (3–6)
- ✅ Provides module and lesson scaffolding
- ✅ Includes trainer/admin-only notes
- ✅ Includes a publish checklist before review/publish

---

## 8. Technical Notes & Constraints

- 🛠️ Built within **Google AI Studio** so far
- 💾 Current implementation likely uses **local/in-memory store** or `localStorage` for domains/items
- 🔄 Persistence can be swapped to a real backend later
- 🎨 **Maintain existing design system** and student-facing UI (do not redesign student flows while adding admin)

---

## 9. Known "Gotchas" Learned During Build ⚠️

| Issue | Solution |
|-------|----------|
| Bulk importing via "row-style" tables causes dropped domains/items | Use **domain block format** + **coverage report** |
| Contributor/partner names alignment unclear | Treat as **placeholders**, not binding to specific items |
| Parsing limits and formatting ambiguity | Process in **small batches** (4 domains max) |

---

## 10. Immediate Next Tasks (Recommended Order)

1. ✅ Create `/admin` shell + route protection stubs (role-aware nav)
2. ✅ Implement Courses list with filters (Domain, Tier, Status)
3. ✅ Implement Course create/edit for metadata + outcomes + prerequisites
4. ✅ Implement Course Builder (modules/lessons/blocks CRUD with reorder)
5. ✅ Implement Question Bank + Quiz builder (minimum viable)
6. ✅ Add workflow gates: publish checklist + status transitions + versioning
7. ✅ Add Cohorts/Intakes basic management
8. ✅ Wire AI authoring stubs with strict JSON + preview diff + Apply

---

## 11. End State Definition (MVP Complete When...)

Fit College should be able to:

1. ✅ Create a new course
2. ✅ Build content via a structured builder
3. ✅ Attach assessments
4. ✅ Run a review workflow
5. ✅ Publish
6. ✅ Assign to a cohort
7. ✅ Track progress

---

## 12. Optional: Spreadsheet/Table Component Notes

> **Note:** Only applies if this project includes a spreadsheet/table editor (from earlier backlog items):

- Tab key navigation should move horizontally across key cells (reps/tempo/rest)
- Superset ordering/validation logic bug (compound before isolation with exception rules)
- Superset unpairing should restore prior standalone validation state
- PDF export margins/padding causing cutoff should be set to zero/near-zero
- Validation list should auto-clear resolved issues in real time

---

## 13. Where is the Code?

**Current location:** Student-facing UI code is in **Google AI Studio** (not yet in this GitHub repo).

**Next step:** Export from AI Studio and commit to this repo, or rebuild here following the existing design/structure.
