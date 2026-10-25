# Agile Sprint Lab

A 120-minute workshop console for the IAF conference session. Paper cards, physical dot voting, posters and gallery walking remain the participant experience. International helpers with connectivity assist with photo uploads.

## Use the website

1. Open `/` and sign in with the site owner's ChatGPT account.
2. Create a workshop, enter your name, and choose the number of teams.
3. Open `/project` using **Open projection** and move that window to your projector. The host script remains on the console.
4. Select activities manually. Start, pause, reset, or extend timers. The original 120-minute end time continues to advance while activity timers are paused.
5. Share the workshop's QR code with upload helpers. `/upload?code=...` accepts the session code, team, short English title, and photo. A helper may submit for different teams.
6. Teams finish one challenge, capture one poster, check acceptance criteria and done, then choose the next challenge if time remains. Uploading does not control that sequence.
7. Open **Poster gallery** to filter, enlarge, correct or remove posters. **Import local photo** stores images on this device and shares them with its projection window. **Export photos & details** downloads a self-contained HTML gallery that can be opened and printed offline.
8. Close uploads when the event ends.

## Connectivity and access

The host console requires the site owner's account. `HOST_EMAIL` is configured server-side through Sites environment settings. Upload helpers use the workshop code and do not need personal accounts once the site's audience permits anonymous access. The Sites hosting audience is separate from these application permissions; a private site blocks helpers before they reach the upload form.

Visit the host and projection online before the workshop to install the offline asset cache. The script and host state are stored in IndexedDB on the host's own browser. Local projection changes use BroadcastChannel; another device requires connectivity to the shared session. Cloud photos need connectivity, while locally imported photos remain on the host device. The interface distinguishes local imports from shared uploads. An uploaded poster count is not a team's completed challenge count.

Test the host connection and helper phones at the venue. Local participants do not need website access. Physical gallery walking and paper feedback remain available if uploads fail.

## Development

The project uses the supplied Sites Vinext starter, D1 for sessions and poster metadata, and R2 for photos. Keep `.openai/hosting.json` and the Sites build integration. Production owner authorization uses the Sites authentication headers; local development uses the starter's loopback sign-in simulation.

Install dependencies using the Sites installer. On this Windows environment, the npm command shim failed, so the installer was invoked through npm's absolute JavaScript entrypoint. The equivalent local framework commands are `node scripts/run-framework.mjs dev` and `node scripts/run-framework.mjs build`.

Run `node node_modules/typescript/bin/tsc --noEmit` for type checks. Run `node scripts/offline-assets.mjs` after each production build to generate the offline asset manifest and copy it into the output. The source includes the generated manifest.

The 13 scripts in `lib/scripts.json` were extracted from the approved rehearsal file. If that source file is available in the parent directory, `node scripts/generate-workshop.mjs` regenerates the scripts.

Generate schema migrations with Drizzle and apply local migrations following the Sites starter README. Never initialize migration-owned tables during a request.

## Verification

`scripts/test-api.mjs` runs against the local development server and creates rehearsal data only in the local database. It checks host authorization, private scripts, timer validation, cross-team uploads, multiple posters per team, upload idempotency, image retrieval, corrections, upload closure, cross-origin rejection and removal. Browser checks cover session creation, activity switching, script isolation, projection and an actual file upload, including a phone-sized success screen.

The rehearsal data and screenshots live only in ignored local runtime folders or the local database. They are not seeded into the hosted workshop.
