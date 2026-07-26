# Sample Questionnaire Update Design

## Objective

Rewrite the two answers in `C:\Users\황인규\Downloads\sample.md` so they accurately describe the founders' work, the current NeuPo demo, its deployed technology, the role of AI coding tools, and the planned product architecture.

## Editorial approach

Use a fact-and-evidence-first style. Lead with what the founders built and what the demo does today. Separate current capabilities from future plans. Prefer concrete implementation facts and verified catalog counts over generic feature lists or promotional language.

## Founder-work answer

- John led implementation of the current website.
- Both John and Yousuf independently created early prototypes.
- John developed the selected/current version.
- John performed the policy research, official-document review, status assessment, data modeling, SQL work, testing, and code review.
- Yousuf advised on the initial design and color direction.
- No non-founder wrote any code.
- John used Claude Code and ChatGPT as development tools under his direction for code generation, data modeling, testing, and review.

The answer must not retain the conflicting John/Yousuf/Insung attribution from the existing draft.

## Technology answer

Describe the current demo as:

- React 19 and TypeScript;
- Vite for client and server builds;
- Express server-side rendering and API routes;
- Supabase for the relational policy database and signup storage;
- Render for deployment;
- a source-traced catalog organized into five Policy Areas with eight policies, 38 official documents, 41 policy-document links, and 24 dated assessments;
- three independent legal, implementation, and litigation status axes;
- a founder-researched workbook pipeline that generates validated application data and reproducible SQL.

State clearly that Claude Code and ChatGPT were used during development, but the current product does not run an AI model, RAG pipeline, automated policy collection, or live government API integration.

Describe future plans separately: official-source API ingestion, automated policy monitoring, an AI model, and retrieval-augmented generation. Preserve source traceability, explicit uncertainty or analyst-inference labeling, and human review as requirements for that future system.

## Removal and tone rules

- Remove obsolete Base44 and Vercel claims.
- Do not claim user login; the current product has a signup/waitlist flow.
- Remove the unsupported standalone feature wishlist from the existing answer.
- Do not describe planned AI or automation as already implemented.
- Keep both answers direct, concrete, and suitable for a startup application.
- Avoid inflated claims such as fully automated, real-time, comprehensive, or AI-powered unless explicitly framed as a future plan.

## Deliverable

Create an updated Markdown copy in the writable project workspace while preserving the original Downloads file unless the user explicitly requests overwriting it.
