# Voiceover reliability regression checks

Run from the workspace root:

```sh
node scripts/build-plugin-amd.mjs _release_staging/productexplainer-voiceover-fix
find _release_staging/productexplainer-voiceover-fix/amd/build -type f -name '*.js' ! -name '*.min.js' -delete
node --test _release_staging/productexplainer-voiceover-fix/tests/voiceover.test.mjs
```

The Node suite executes the AMD modules with a DOM, controlled Audio elements,
XHR responses and timers. It invokes the standalone PHP harness to compare every
slide schema and its resolved narration with the PHP/export implementation and
exercise MIME/signature rejection. PHP must be available; no Moodle connection,
external service, credits or database are used.
The build tool also emits unminified companions; remove them before testing and
shipping. The regression suite re-minifies each source in memory to check that
the minified deliverables are current and rejects unminified companions.

## Teacher contract

- Existing AI `voiceoverText` is not a manual override. Only a deliberate editor
  input sets `narrationMode: override` and `narrationOverride`. “Use slide text”
  returns to automatic narration.
- `generatedNarrationText` records exactly the script sent for successful TTS.
  Voice and language are also recorded. Generation skips successfully generated,
  unchanged recordings in the same voice/language on subsequent retries.
- A legacy recording with no source text is grandfathered. Its first edit-session
  baseline detects later changes without claiming to know what that old recording
  actually said. A deliberate Generate request can replace a legacy recording.
- Publication blocks missing, failed or stale requested narration. “Omit narration”
  explicitly permits a text-only slide, preserves the old file/link and suppresses
  playback. Clearing Omit re-enables the checks.
- Generation and publishing lock authoring, warn on unload and prohibit overlap.
  Failed or uncertain requests are never automatically retried. Manual retry warns
  that a request whose outcome was unknown may have completed and charged credits.
- Service audio is signature/MIME-validated before writing. New recordings use
  immutable unique filenames, so failed storage, failed publication or a lost
  response cannot replace a live recording. Old recordings are intentionally retained.

## Learner contract

Narrated presentations require an accessible Start presentation gesture. It calls
playback directly. Presentations without playable requested recordings have no
unnecessary start gate. Navigation starts narration, never toggles it.

Playback rejections, media failures and stalled loading are visible with manual
retry. A failed slide recording permits continuing with written slide content;
must-watch video and quiz requirements remain independent. Quiz narration offers
explicit Retry / Continue without narration instead of a silent skip. A playback
retry reuses the same bytes; a service retry requires a warning confirmation. No
browser-voice replacement is used. Speculative paid quiz TTS is disabled to avoid
unnecessary requests and uncertain-outcome retries.

## Integration verification still required

The owning agent must verify the rebuilt plugin in Moodle with real browser media:
keyboard-accessible Start, autoplay-restricted browsers, selected voice/language,
must-watch video plus narration on the last slide, quiz wrong-answer retry/continue,
generation interruption, export downloads, and real MP3/Ogg/WAV service responses.
These tests do not replace an installed Moodle/browser check.
