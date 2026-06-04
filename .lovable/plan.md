# Pre-Phase 2: Dashboard, Credits, Storage & Discussion Board

Before moving to Phase 2 (Policy + Settings), tackle this batch of dashboard/practice fixes.

## 1. Dashboard Overview — Real Progress

Currently `Practice Summary` and `Target Score` show zeros because nothing reads from the DB. Will wire them to live data:

- **Today Practiced**: count of `submissions` (or `scores`) where `created_at::date = today`.
- **Total Practiced**: total submissions for the user.
- **Practice Days**: `count(distinct date)` of submission dates.
- **Target Score band**: average score per skill (Listening / Reading / Speaking / Writing) from `scores` table over last 30 days.
- **Exam in**: read from `exam_goals.target_date`, show countdown.

Refresh on mount + after any test completes (invalidate via `UserDataContext`).

## 2. Credits System in Header

- Free user starts with **5 scoring credits**.
- 1 credit = 1 AI score check (after finishing a single practice item *and* tapping "Check score with AI").
- Header pill next to avatar: `⚡ 5 credits` (matches screenshot style).
- Tap → opens dropdown: balance, "Upgrade for more", link to pricing.
- Server-side: extend `subscriptions.credits_remaining` usage; new RPC `consume_scoring_credit()` returns `{ ok, remaining }` and is called from every scoring edge function BEFORE doing the AI call. If `ok=false` → toast "Out of credits — upgrade to continue".
- Realtime subscription on `subscriptions` row so header updates instantly.

## 3. Quick Practice Card Navigation

On Dashboard, the **PTE Practice / Speaking / Listening / Reading / Writing / Mock Tests / Templates** cards currently do nothing. Wire each to the first question of that section:

- Speaking → `/practice/speaking/0`
- Listening → `/practice/listening/0`
- Reading → `/practice/reading/0`
- Writing → `/practice/writing/0`
- Mock Tests → `/mock-tests`
- Templates → `/templates` (placeholder page if missing)

## 4. Save Recorded Voice to Storage

New private bucket `practice-recordings` (RLS: user can read/write only their own `user_id/...` path).

After `useAudioRecorder` stops:
1. Upload blob to `practice-recordings/{user_id}/{question_id}/{timestamp}.webm`.
2. Insert row in new table `speaking_recordings`:
   - `user_id`, `question_id`, `question_type`, `question_title`, `audio_path`, `duration_seconds`, `score` (jsonb), `transcript`.
3. Return signed URL for playback.

## 5. Practice Test Page — Discussion / Board / Me Tabs

Add the bottom panel from the screenshot to **every** practice test page (Speaking, Reading, Writing, Listening):

```
Discussion | Board | Me
```

- **Discussion**: community comments on this question (new `question_discussions` table — `user_id`, `question_id`, `body`, `created_at`). Each post can have an attached recording (for speaking). Score badge shown.
- **Board**: leaderboard for this question — top scores across all users (read-only view).
- **Me**: current user's previous attempts on this question — list of audio players with date + score, replayable.

Cards show: avatar, name, date, audio `<audio controls>`, `Score Info XX/90` badge, share icon.

## 6. Marks Display

Show scaled `XX/90` PTE-style mark on each recording card and inside the score modal (currently shows raw 0–100). Conversion uses `get_max_score_for_question_type` already in DB → scaled to 90.

---

## Technical breakdown

**New tables (one migration):**
- `speaking_recordings` (user_id, question_id, question_type, question_title, audio_path, duration_seconds, transcript, score jsonb, scaled_score int, created_at) — RLS: owner full; SELECT also allowed to authenticated for Board/Discussion via secure view `public_recordings` that exposes only name + audio_path + scaled_score.
- `question_discussions` (user_id, question_id, body, recording_id nullable, created_at) — RLS: anyone authenticated reads, owner writes/deletes.

**New storage bucket:** `practice-recordings` (private) + RLS policies on `storage.objects` scoping `{user_id}/...`.

**New RPC:**
```sql
consume_scoring_credit() returns (ok bool, remaining int)
```
decrements `subscriptions.credits_remaining` atomically; returns `(false, 0)` if zero.

**Edge function updates:** `score-speaking`, `score-writing`, `score-pte-agentic`, `score-mocktest-ai` all call `consume_scoring_credit` first.

**Frontend additions:**
- `src/hooks/useCredits.ts` — realtime subscription + consume helper.
- `src/components/dashboard/CreditsBadge.tsx` — header pill.
- `src/components/practice/DiscussionPanel.tsx` — 3-tab panel (Discussion/Board/Me) reused in all 4 test components.
- `src/lib/uploadRecording.ts` — uploads blob, inserts row, returns id+url.
- Update `Dashboard.tsx` to fetch real stats from `submissions`/`scores`/`exam_goals`.
- Wire card `onClick` navigation.
- Mount `<DiscussionPanel questionId=… questionType=…/>` at the bottom of `SpeakingTest`, `ReadingTest`, `WritingTest`, `ListeningTest`.

**Score scaling helper:** `src/lib/pteScale.ts` → `toPteScale(raw, type)` returns 0–90.

---

Reply **go** to execute, or tell me what to drop/add.
