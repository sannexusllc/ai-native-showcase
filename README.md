# Building a Healthcare Startup with Claude as My Engineering Team

I'm building [SANNEXUS](https://sannexus.com), a healthcare credentialing and physician staffing platform. What makes it unusual: **Claude is my entire engineering team.**

I don't have human engineers. I have AI agents — a CTO, CMO, and UX designer — orchestrated through a multi-agent system that manages tasks, writes code, reviews PRs, and deploys to production. I'm the founder directing the operation, like a technical CEO running an engineering org, except every engineer is Claude.

## What we've shipped

From first commit to production in 48 days:

- **549 commits** across the codebase
- **347 source files** (Next.js, TypeScript, Tailwind)
- **406 unit tests** (Vitest)
- Production CI/CD with prebuilt deploys to Vercel
- Supabase database with row-level security on every table
- AI-powered credential document extraction (Claude Haiku)
- Physician shift matching and scheduling
- Hospital bylaw analysis engine
- Stripe billing integration

The repo is private (healthcare IP), but this repository shares the **patterns and lessons** from building an AI-native company.

## What's in this repo

### 1. [Agent Governance](governance/AGENT_GOVERNANCE.md)

How I structure instructions for AI agents that write production code. Covers trust hierarchies, token discipline, destructive action prevention, and accountability boundaries.

### 2. [AI Type Safety at the Boundary](examples/ai-type-safety/)

A real production bug (BUG-020) where Claude Haiku returned an integer instead of a string, crashing the React UI. Includes the utility function, the test suite, and the incident write-up. This is the kind of problem you only discover when you trust AI with real production work.

### 3. [Deploy Pipeline Design](governance/DEPLOY_PIPELINE.md)

How I enforce code quality when AI agents are doing the engineering: mandatory test gates, row-level security checks, prebuilt artifact uploads, and multi-domain aliasing.

### 4. [Lessons Learned](LESSONS.md)

What I've learned about directing AI agents in production — what works, what breaks, and what surprised me.

## Why I'm sharing this

Most conversations about AI in software engineering are about using AI as a **coding assistant** — autocomplete, chat, code review. I'm doing something different: treating AI as **the engineering team itself**, with structured roles, accountability, and governance.

This isn't a weekend experiment. It's a real company, in a regulated industry (healthcare), with real consequences when things go wrong. The patterns in this repo come from that pressure.

## About me

I'm Cleiton Goncalves. My background is in healthcare operations — I worked at AdventHealth, one of the largest health systems in the U.S. I left to build SANNEXUS because I saw how physician credentialing bottlenecks delay patient care, and I believed AI agents could replace the traditional startup model of raising money to hire engineers first.

- [LinkedIn](https://linkedin.com/in/cleiton11)
- [SANNEXUS](https://sannexus.com)
