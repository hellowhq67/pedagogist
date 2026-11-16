# Reliable AI Scoring Credits

## Goal
Match the supplied mobile flow and make one AI score cost exactly one credit. A balance of 10 should become 9 immediately after the user confirms scoring, with the same value shown in the dashboard and practice screen.

## User flow
1. The learner finishes a response or recording and sees **Get AI Score** instead of an automatic AI score.
2. Selecting it opens a confirmation dialog showing the current balance and **Use 1 credit to get score**.
3. Canceling spends nothing. Confirming starts scoring and atomically uses one credit; the updated balance appears across the app.
4. On success, show the score and refresh the dashboard/history. If scoring fails, restore the credit and show the error. A zero balance blocks scoring and points to the existing upgrade option.

## Changes
- Reconcile credit reads and updates so the dashboard badge, practice counter, and confirmation dialog all use `subscriptions.credits_remaining` and the same refresh/realtime behavior.
- Remove the current post-score client-side deduction and any separate daily-counter deduction from AI-scoring requests, preventing delayed, duplicated, or mismatched charges.
- Add a shared confirmation step to speaking and writing flows, and any other practice flow that currently requests an AI score. Keep objective answer-checking that does not request AI outside this AI-credit prompt.
- Enforce the one-credit charge in the authenticated scoring request using the existing atomic credit operation; do not rely on the browser alone. Validate the request before charging and restore the credit if AI scoring fails.
- Match the supplied screenshots’ sequence: submitted response, **Get AI Score**, balance confirmation, then score/results.

## Verification
- Confirm 10 becomes 9 exactly once after one confirmed AI score and both dashboard/practice displays agree.
- Confirm canceling, incomplete responses, retries before scoring, and failed scoring do not leave a credit deducted.
- Confirm zero credits prevent the AI request and show the existing upgrade path.
- Exercise speaking and writing scoring end-to-end and check the console/runtime logs.

## Technical notes
Reuse the existing authenticated credit-decrement mechanism and subscription balance; avoid a second client-side deduction. Keep non-AI objective scoring behavior unchanged. No schema change is planned unless the existing secure credit operation cannot support failure refunds safely.
