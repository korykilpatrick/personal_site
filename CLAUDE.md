# CLAUDE.md

## Commands
- Dev (frontend + server): `npm run dev:all`
- Build: `npm run build` | Lint: `npm run lint` | Format: `npm run format`
- Test: `npm run test` (single: `npm run test -- path/to/test`) | E2E: `npm run test:e2e`
- Typecheck: `npm run typecheck`

## Stack
React + TypeScript (webpack) · Express + PostgreSQL (`pg`) · Tailwind · Jest + Playwright · OpenAI for library metadata extraction.

## Engineering Philosophy

This codebase is built to be worked on by both humans and AI agents. Every decision should optimize for clarity, maintainability, and correctness — no corners cut, no "we'll clean it up later."

### Code quality is a first-class requirement
Every module should read like it was written by a senior engineer who cares. Clean abstractions, clear naming, consistent patterns. Code that is easy to understand is easy to extend and hard to break.

### DRY and modular
No duplicated logic. Shared behavior lives in well-defined, reusable modules with clear interfaces. Each module has a single responsibility and can be understood, tested, and modified in isolation.

### Built for AI-agent collaboration
AI coding agents (Claude Code, Cursor, etc.) are primary contributors to this codebase alongside human developers. This means:
- Consistent, predictable file organization and naming conventions
- Self-documenting structure — an agent should be able to navigate the codebase by convention, not by tribal knowledge
- Clear interface boundaries so agents can work on one module without needing full context of the entire system
- Comprehensive type safety across the stack via TypeScript
- Well-scoped files — no 1000-line god files; each file has a clear purpose

### Solid foundation, not scaffolding
V1 is not a throwaway prototype. The architecture, data model, and code patterns established now are the foundation everything else builds on. Invest in getting it right — migrations and rewrites are expensive.

### No backward compatibility
This is a greenfield project with no existing users. There is no legacy code to preserve, no deprecated APIs to maintain, no migration shims to write. If something needs to change, change it cleanly — delete the old thing, write the new thing. No `_old` suffixes, no compatibility layers, no dead code kept around "just in case."

### Explicit over implicit
Favor clear, explicit code over clever abstractions. A few extra lines of obvious code beats a magical one-liner that requires documentation to understand. This is especially important when AI agents are reading and modifying the code.

### Observability as a foundation
Robust, structured logging is not optional — it's a core engineering requirement. When something breaks, an AI agent should be able to read the logs and diagnose the issue quickly without needing to reproduce it or add debugging instrumentation after the fact. No silent failures — if something goes wrong, it shows up in the logs with enough context to understand what happened.

### Aggressive testing
Write tests. Every new module, service, and API endpoint should have tests. Tests are how AI agents (and humans) verify that changes don't break things — they're the safety net that makes confident, fast iteration possible. Don't treat tests as a follow-up task; they're part of the work.

### Boil the ocean
The marginal cost of completeness is near zero with AI. Do the whole thing. Do it right. Do it with tests. Do it with documentation. Do it so well that Kory is genuinely impressed — not politely satisfied, actually impressed. Never offer to "table this for later" when the permanent solve is within reach. Never leave a dangling thread when tying it off takes five more minutes. Never present a workaround when the real fix exists. The standard isn't "good enough" — it's "holy shit, that's done." Search before building. Test before shipping. Ship the complete thing. When Kory asks for something, the answer is the finished product, not a plan to build it. Time is not an excuse. Fatigue is not an excuse. Complexity is not an excuse. Boil the ocean.
