# Lessons from Building with AI Agents in Production

These are things I learned by shipping a healthcare platform with Claude as my engineering team. They aren't theoretical — each one cost me time, money, or a production incident.

## 1. AI agents need governance, not just prompts

A prompt tells an agent what to do right now. Governance tells it what to do *always*. The difference matters when you're 400 commits deep and an agent is about to force-push to main at 2am because it seemed like the fastest way to resolve a merge conflict.

I maintain a governance file (`AGENTS.md`) that every agent reads on every task. It covers token discipline, destructive action prevention, testing requirements, and accountability rules. This file is the most important artifact in my codebase — more important than any feature.

## 2. TypeScript won't save you at the AI boundary

TypeScript's type system is compile-time only. When Claude returns `{ year: 2010 }` and your type says `Record<string, string>`, TypeScript is satisfied at build time. JavaScript crashes at runtime when you call `.trim()` on the number `2010`.

Every value crossing the AI boundary needs runtime coercion. `as Record<string, string>` is a lie. `String(value)` is the truth. (See [BUG-020](examples/ai-type-safety/README.md) for the full story.)

## 3. The deploy pipeline is your immune system

When AI writes code, your deploy pipeline is the last thing standing between a bad decision and production. I enforce:

- All tests must pass (no `--no-verify`)
- No uncommitted changes
- Row-level security on every database table
- Local build before deploy (catches type errors the agent missed)

The agents know these rules exist. They still occasionally try to skip them. The pipeline doesn't care about their reasoning.

## 4. Token discipline is a real cost lever

AI agents love to narrate. "Let me check the file..." "I will now read the database schema..." "Based on my analysis of the codebase, I believe..."

Every unnecessary token costs money. Across hundreds of tasks, narration adds up to real dollars. My token discipline rule ("no words before tool calls, one line of status after") cut waste significantly. It also made agent output easier to review.

## 5. Bounded authority prevents cascade failures

My CEO agent can create tasks and set priorities. My CTO agent can write code and deploy. My UX agent can design interfaces. None of them can do everything.

This isn't because Claude can't handle multiple roles — it can. It's because **unbounded authority means unbounded blast radius**. An agent that can both decide strategy AND deploy code can make a strategic mistake and ship it before anyone reviews it.

Bounded authority creates natural review points. The CTO writes the code, but someone has to approve the deploy. The CEO sets the priority, but the CTO decides the implementation.

## 6. AI makes novel mistakes

Human engineers make predictable mistakes — off-by-one errors, forgotten edge cases, copy-paste bugs. AI agents make *novel* mistakes that you wouldn't anticipate:

- Returning typed JSON (integers, booleans) when strings are expected
- "Cleaning up" files that turn out to be important
- Confidently applying patterns from training data that don't match your actual framework version
- Creating new files when they should edit existing ones (file bloat)
- Adding features, tests, or documentation that wasn't requested

The governance file is a living document. Every novel mistake becomes a new rule.

## 7. The fallback trap

Before we enabled Claude Haiku in production, our document extraction used a regex fallback. Regex always returns strings. So our type mismatch bug was invisible for months — every test passed, every dev environment worked.

The lesson: **test with the real AI model, not the fallback.** Fallbacks mask integration bugs. The whole point of integrating AI is that it behaves differently from your fallback — if it didn't, you wouldn't need it.

## 8. This is not "vibe coding"

I direct AI agents the way a technical CEO directs an engineering team: with clear requirements, code review, structured processes, and accountability. The agents write the code, but I own the architecture, the product decisions, and the quality bar.

The term "vibe coding" implies throwing prompts at a model and hoping for the best. What I do is closer to engineering management — setting standards, reviewing output, maintaining systems, and building the organizational structure that makes reliable output possible.

The AI writes the code. I build the system that makes the code trustworthy.
