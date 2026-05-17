# Agent Governance: How I Direct AI Engineers

When AI agents write your production code, you need governance — not just prompts. This document describes the patterns I use to run a multi-agent engineering team on a healthcare platform.

## The Problem

A single Claude conversation can write good code. But a **company** needs more than good code. It needs:

- Consistency across hundreds of commits
- Safety guarantees in a regulated industry
- Accountability when something breaks
- Coordination between agents with different roles

I solved this with structured governance files that every agent reads on every task.

## Token Discipline

AI agents waste tokens narrating what they're about to do. In a production setting where you're paying per token and running hundreds of tasks, this matters.

```markdown
## Token Discipline (ALL AGENTS — mandatory)

**Do not narrate before acting.** Execute tool calls immediately.
No "Let me check...", no "I will now...", no reasoning summaries before tool use.

**After** completing an action, one line of status is acceptable. Before: zero words.

**Do not re-state the task** at the start of a turn. The task is already in context.
```

This single rule cut token usage by roughly 20-30% across agent runs.

## Destructive Action Prevention

AI agents can run shell commands. Without guardrails, they will occasionally:

- Force-push to main
- Delete files to "clean up"
- Skip test hooks to get a commit through
- Run `git reset --hard` to resolve conflicts

My governance rules explicitly ban these patterns:

```markdown
- NEVER run destructive git commands (push --force, reset --hard, clean -f)
  unless the user explicitly requests these actions
- NEVER skip hooks (--no-verify) or bypass signing
- Before committing or deploying, agents MUST run:
  npm test          # unit tests (vitest)
  npm run build     # Next.js build (catches type errors + broken imports)
  Both commands must exit 0.
```

## Trust Hierarchies

Not all agents have the same authority. My CEO agent can approve strategy changes and create new tasks. My CTO agent writes and deploys code but can't change business strategy. My UX agent designs interfaces but can't modify API routes.

This mirrors how a real engineering org works — not because AI needs org charts, but because **bounded authority prevents cascade failures**. An agent that can do everything will eventually do the wrong thing.

## Bug Management

Every agent must read the bug tracker at the start of every work session and log new bugs immediately when discovered — even if they plan to fix them in the same session.

```markdown
## Test-Driven Development (TDD)

When fixing a bug or adding logic:

1. Write a failing test first that reproduces the bug
2. Run the test — confirm it fails for the expected reason
3. Write the minimal code to make the test pass
4. Run the full suite — confirm no regressions
5. Then commit. The commit message MUST reference the bug ID.
```

This isn't theoretical — it's enforced. Agents that skip TDD produce bugs that compound. Agents that follow it produce code I can trust.

## Why This Works

The key insight: **AI agents are not autonomous.** They're highly capable workers that need structure, just like human engineers do. The structure isn't there to limit them — it's there to make their output reliable enough to ship to production in a regulated industry.

The governance file is the single most important artifact in my codebase. Not because it contains clever code, but because it turns a powerful but unpredictable tool into a consistent engineering team.
