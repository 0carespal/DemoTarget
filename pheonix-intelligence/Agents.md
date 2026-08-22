# Project Overview

Conference Intelligence Engine

A self-healing conference talk tracker built for the Into the Scrape-Verse
hackathon (WeMakeDevs x Bright Data).

The system collects talks from public conference schedules using a Bright
Data Scraper Studio collector, validates extracted data for completeness,
automatically repairs the extractor when a site's layout changes (via
Bright Data self-healing), and answers simple filtered questions across
the collected talks.

**This file defines the actual scope for this hackathon submission.
Do not add features beyond what is listed here — the deadline is
tomorrow. The self-healing demo is the star of this project; everything
else exists only to support that story.**

---

# Goal

Answer questions such as:

"What are people talking about in AI Infrastructure this year?"

via a hardcoded filter + one AI summary call — not a full search or
trend-analysis system.

---

# Core Features (in this exact priority order)

1. Conference schedule extraction (mock site first, then real sources)
2. Validation of extracted records (completeness scoring)
3. Self-healing scraper workflow (break -> heal -> recover)
4. Recorded proof-of-repair demo
5. Compliance check per real source (robots.txt + ToS)
6. Lightweight filter + one AI summary call
7. README

Nothing beyond this list is in scope. If a step above isn't done,
do not start a later one.

---

# Explicitly Out of Scope

Do not build any of the following, even if it seems easy to add:

- A frontend, dashboard, or any UI framework (React, Vite, etc.)
- Authentication, user accounts, or sessions
- Payments or billing
- A "trend engine," embeddings, retrieval, or reranking
- A natural-language query planner (use a hardcoded filter function
  instead)
- Any database (flat JSON files in data_reports/ are sufficient)
- Scheduled/cron jobs or background workers
- Deployment to Vercel/Render/any hosting service, unless a public
  URL is strictly required for Bright Data to reach a mock site

If asked to build any of the above, stop and confirm with the user
first — it is very likely scope creep, not a real requirement.

---

# Data Schema

```json
{
  "talk_title": "str",
  "speaker_name": "str",
  "conference_name": "str",
  "topic": "str"
}
```

A record is only "complete" if all four fields are present and
non-empty (treat null, empty string, and "N/A" as missing).

---

# Folder Responsibilities

```
backend/
  filter.py       - hardcoded filtering by topic/keywords, no NL parsing
  healer.py        - heal-trigger + retry ceiling (MAX_HEAL_ATTEMPTS = 2)

collectors/
  compliance.md               - robots.txt / ToS findings per source
  target_urls.txt             - real conference schedule URLs
  collector_id_production.txt - saved ID, real conference collector
  collector_id_demo.txt       - saved ID, mock-site collector (separate,
                                 never mixed with production)

validators/
  validator.py    - row-level completeness scoring, Healthy/Warning/Broken

frontend/
  mock-site/       - the ONLY thing in this folder; a static HTML page
                      with a layout toggle (?version=A / ?version=B) used
                      to reliably demo breakage + healing. Not a product UI.

data_reports/
  talks.json               - production dataset
  talks_broken.json         - demo collector output after layout swap
  talks_healed.json         - demo collector output after healing
```

---

# Validation Rules

Required fields: `talk_title`, `speaker_name`, `conference_name`, `topic`

Completeness = complete rows / total rows

- `>= 90%` -> HEALTHY, continue
- `60-89%` -> WARNING, log only, continue (do not trigger heal)
- `< 60%` -> BROKEN, trigger healing

## Retry ceiling

```
Run -> Validate -> Broken? -> Heal #1 -> Run -> Validate
    -> Still broken? -> Heal #2 -> Run -> Validate
    -> Still broken? -> status: "degraded", stop (do not loop further)
```

Applies to both the production collector and the demo collector —
`healer.py` must be collector-agnostic (`heal_collector(collector_id,
validation_result)`), not written separately for each.

---

# Compliance Rules

Before scraping any real (non-mock) source:

1. Check that source's `robots.txt` for disallowed paths.
2. Skim its Terms of Service for scraping/automated-access restrictions.
3. Record findings in `collectors/compliance.md` using this structure
   per source:

```
## <Conference Name>

Schedule URL:
robots.txt findings:
Relevant restrictions:
Decision: Allowed / Not Allowed / Needs Review
```

If a source comes back "Not Allowed" or "Needs Review," do not scrape
it — drop it from `target_urls.txt`, even if it would make a better
demo example. Only scrape sources marked "Allowed."

---

# Coding Standards

- Python 3.12
- No hardcoded secrets or API keys (use environment variables)
- Type hints required on function signatures
- Functions under ~50 lines where practical
- Use `logging`, not bare `print`, for anything beyond quick manual
  testing scripts
- Keep dependencies minimal — standard library first, add a package
  only when genuinely needed

---

# Tool Usage (for AI coding assistants working on this repo)

- **Antigravity CLI (`agy`)** - planning, generating new code, writing
  extraction/validation prompts, debugging errors
- **Aider** - small, targeted edits to files that already exist (bug
  fixes, adding a function, adjusting logic) — not for scaffolding
  new modules
- **opencode** - larger refactors or cleanup, used only near
  submission time (README polish, removing dead code)
- **Bright Data CLI (`bdata`)** - the only tool that spends hackathon
  credits; used exclusively for `scraper create`, `scraper run`,
  `scraper heal`, `scraper approve`. Reuse existing collector IDs;
  do not create new collectors to "test" something that can be tested
  another way.

---

# Definition of Done (for this hackathon)

The submission is complete when all of the following exist — nothing
more is required:

- [ ] `data_reports/talks.json` — real data from at least one
      compliance-approved conference source
- [ ] `validators/validator.py` runs and correctly classifies both
      healthy and broken datasets
- [ ] `proof_of_repair.mp4` — recorded video showing working -> broken
      -> heal command -> recovered, using the demo collector
- [ ] `collectors/compliance.md` — filled in for every real source used
- [ ] `backend/filter.py` — filters talks by topic/keywords, runnable
      from the command line
- [ ] One example AI-generated summary from filtered results (can be
      shown live in the demo video, does not need to be automated
      into a pipeline)
- [ ] `README.md` — architecture, Bright Data usage explanation
      (required by hackathon Rule 9), AI-tool disclosure (Rule 10),
      known limitations

If all of the above are checked, stop building and submit. Do not use
remaining time to add anything from the "Explicitly Out of Scope"
list above.