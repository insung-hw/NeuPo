# Sample Questionnaire Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the obsolete answers in `C:\Users\황인규\Downloads\sample.md` with concise, evidence-based descriptions of founder work, the current NeuPo demo, its actual stack, and its future AI roadmap.

**Architecture:** Draft the complete replacement in the writable website workspace, validate every factual claim against the approved design and current repository, preserve a backup of the original Downloads file, then copy the validated Markdown over the requested file. The output keeps current capabilities and future plans in separate paragraphs.

**Tech Stack:** Markdown, PowerShell read-only validation, repository evidence from React/TypeScript/Express/Supabase configuration.

## Global Constraints

- John led implementation of the current website and all policy research, official-document review, status assessment, data modeling, SQL, testing, and code review.
- John and Yousuf independently created early prototypes; John developed the current version.
- Yousuf advised on initial design and color direction.
- No non-founder wrote code.
- Claude Code and ChatGPT were development tools used for code generation, data modeling, testing, and review.
- The current product is a demo and does not run an AI model, RAG pipeline, automated policy collection, or live government API integration.
- Future plans include official-source API ingestion, automated monitoring, AI models, and RAG with source traceability and human review.
- Current deployment is Render and the database is Supabase; remove Base44 and Vercel claims.
- Do not claim user login; the current product has a signup/waitlist flow.

---

### Task 1: Rewrite and Validate the Questionnaire

**Files:**
- Read: `C:\Users\황인규\Downloads\sample.md`
- Create temporarily: `C:\Users\황인규\Documents\Claude\YC\website\sample.updated.md`
- Back up: `C:\Users\황인규\Downloads\sample.before-update.md`
- Modify by validated replacement: `C:\Users\황인규\Downloads\sample.md`

**Interfaces:**
- Consumes: the two existing application questions and the approved facts in `docs/superpowers/specs/2026-07-26-sample-questionnaire-update-design.md`.
- Produces: a two-question Markdown document with no obsolete stack claims or unsupported current-product capabilities.

- [ ] **Step 1: Create the complete replacement draft**

Create `sample.updated.md` with this content:

```markdown
### Who writes code, or does other technical work on your product? Was any of it done by a non-founder? Please explain.

John built the current NeuPo demo. John and Yousuf first created separate prototypes to test different product flows, and John then developed the current version end to end. John researched the policies and official government documents, designed the policy data model and Supabase schema, implemented the frontend, server-side rendering, and APIs, built the data-import and migration workflow, and wrote and reviewed the tests. Yousuf advised on the initial design and color direction.

No non-founder has written any code. John used Claude Code and ChatGPT as development tools for code generation, data modeling, testing, and review, while directing their use and making the product and implementation decisions.

### What tech stack are you using, or planning to use, to build this product? Include AI models and AI coding tools you use.

The current NeuPo demo uses React 19 and TypeScript, Vite for client and server builds, Express for server-side rendering and API routes, Supabase for the relational policy database and signup storage, and Render for deployment. John maintains a research workbook based on official government sources; Python and Node.js scripts validate it and generate the bundled application dataset and reproducible Supabase SQL. The server reads the policy catalog from Supabase and can fall back to the same validated bundled dataset if the database is unavailable.

The demo currently covers five U.S. federal renewable-energy Policy Areas, eight policies, 38 official documents, 41 policy-document relationships, and 24 dated assessments. It tracks legal, implementation, and litigation status independently and lets users inspect the supporting official sources. The signup flow is a waitlist rather than a user-login system.

Claude Code and ChatGPT were used during development for code generation, data modeling, tests, and review. The product itself does not yet run an AI model or RAG pipeline and does not yet automate policy collection or connect to live government APIs. Our planned system will ingest official-source APIs, monitor policy changes, and use an AI model with retrieval-augmented generation to help retrieve, compare, and summarize evidence. We plan to keep official citations, explicit inference and confidence labels, and human review before publishing an assessment.
```

- [ ] **Step 2: Validate current and future claims**

Run:

```powershell
Select-String -Path sample.updated.md -Pattern 'React 19|TypeScript|Vite|Express|Supabase|Render|five U.S. federal renewable-energy Policy Areas|eight policies|38 official documents|41 policy-document relationships|24 dated assessments|does not yet run an AI model or RAG'
```

Expected: every approved implementation fact and current-versus-future boundary appears.

Run:

```powershell
Select-String -Path sample.updated.md -Pattern 'Base44|Vercel|Insung|user login|currently uses RAG|live government APIs are connected'
```

Expected: no matches.

- [ ] **Step 3: Back up and replace the requested file**

After confirming both absolute paths, copy the original to `C:\Users\황인규\Downloads\sample.before-update.md`, then copy the validated `sample.updated.md` to `C:\Users\황인규\Downloads\sample.md`. Do not modify any other Downloads file.

- [ ] **Step 4: Verify the delivered file byte-for-byte**

Run:

```powershell
$draftHash = (Get-FileHash -Algorithm SHA256 'C:\Users\황인규\Documents\Claude\YC\website\sample.updated.md').Hash
$deliveredHash = (Get-FileHash -Algorithm SHA256 'C:\Users\황인규\Downloads\sample.md').Hash
if ($draftHash -ne $deliveredHash) { throw 'Delivered questionnaire differs from the validated draft' }
Get-Content -Raw 'C:\Users\황인규\Downloads\sample.md'
```

Expected: hashes match and the file contains exactly two questions with the approved answers.

- [ ] **Step 5: Remove the temporary workspace draft**

Delete only `C:\Users\황인규\Documents\Claude\YC\website\sample.updated.md` after delivery verification. Preserve `sample.before-update.md` as the recoverable original.
