# Dialed by H — Content Pipeline Orchestrator

## Brand
**Dialed by H** — luxury watch concierge & grey market sourcing service.
Range: Entry luxury ($2K-$5K) through ultra-high-end. Platforms: TikTok, Instagram Reels, Substack.

## Content Pipeline Agents

| Agent | File | Model | Purpose |
|-------|------|-------|---------|
| content-researcher | `.claude/agents/content-researcher.md` | sonnet | Scrapes platforms for trending watch topics, viral formats, hooks |
| pipeline-analyst | `.claude/agents/pipeline-analyst.md` | sonnet | Analyzes content performance data from `data/` directory |
| pipeline-ideator | `.claude/agents/pipeline-ideator.md` | sonnet | Crosses trends with performance data to generate ranked concepts |
| pipeline-scripter | `.claude/agents/pipeline-scripter.md` | opus | Writes full production-ready scripts from selected concepts |

## Pipeline Commands

### "run my content team" — Full Pipeline
Execute the full content pipeline in order:

1. **Phase 1 (PARALLEL):** Run `content-researcher` and `pipeline-analyst` simultaneously
   - content-researcher outputs → `briefs/whats-trending.md`
   - pipeline-analyst outputs → `briefs/whats-working.md`
2. **Phase 2 (SEQUENTIAL):** After BOTH Phase 1 agents complete, run `pipeline-ideator`
   - Reads both briefs, outputs → `briefs/video-concepts.md`
3. **PAUSE:** Display the ranked concepts to the user. Ask which concepts to script.
4. **Phase 3 (AFTER USER SELECTION):** Run `pipeline-scripter` on the selected concepts
   - Outputs video scripts → `scripts/`
   - Outputs newsletters → `newsletters/`

### "scrape today" — Daily Scrape & Populate Dashboard
Scrape all tracked accounts via Apify, score posts, detect winners, and populate the dashboard:

1. **Start the server** if not running: `cd dashboard && npm run server`
2. **Scrape ALL active accounts** via `POST /api/scrape/all` — hits Apify Instagram Scraper for all 16+ accounts + hashtags
3. **Auto-scores** all new posts (virality 0-100, winner detection with 5 criteria)
4. **Auto-classifies** posts by content pillar and hook type
5. **Auto-discovers** new accounts from hashtag scrapes (high views + low followers)
6. **Report results** to user: new posts found, winners detected, accounts discovered
7. **Remix winners** — auto-remix top winners using viral hooks framework + humanization via `POST /api/remix/batch`

Requirements: `APIFY_API_TOKEN` must be set in Settings > API Keys or `.env` file. Server must be running.

### Shortcuts

| Command | Action |
|---------|--------|
| `run research only` | Phase 1 only — run content-researcher and pipeline-analyst in parallel |
| `run ideation` | Phase 2 only — run pipeline-ideator (assumes briefs exist) |
| `script these: [numbers]` | Phase 3 — run pipeline-scripter on specified concept numbers |
| `run newsletter only` | Run pipeline-scripter for newsletter concepts only |
| `scrape today` | Scrape all accounts via Apify → score → detect winners → remix top posts |
| `remix winners` | Remix the top winning posts using viral hooks + humanization |

## Directory Structure

```
briefs/              # Agent output briefs
  whats-trending.md  # From content-researcher
  whats-working.md   # From pipeline-analyst
  video-concepts.md  # From pipeline-ideator
scripts/             # Video scripts from pipeline-scripter
newsletters/         # Newsletter drafts from pipeline-scripter
data/                # Analytics data (TikTok, IG, Substack exports)
.claude/agents/      # Agent definitions
```

## Agent Execution Notes

- Always run content-researcher and pipeline-analyst in PARALLEL during Phase 1 to save time
- Pipeline-ideator MUST wait for both briefs to exist before running
- Pipeline-scripter should be told which specific concept numbers to script
- All agents share project memory for cross-session learning
- If `data/` is empty, pipeline-analyst will fall back to competitive analysis
