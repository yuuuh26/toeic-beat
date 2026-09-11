# TOEIC BEAT verification — 2026-09-11

## Automated checks

`node --test tests/core.test.js`: 7/7 passing.

- 500 unique words, 100 per level; 1,000 distinct bilingual example sentences.
- Timing boundaries at all four difficulties, including taps at/after the deadline.
- 5,000 generated questions: four distinct translations, one correct answer, same part of speech, configured synonym exclusions.
- Level/new/weak selection, no repeated words in a session, smaller weak pools.
- Correct/incorrect counts, streak resets, response time, slow correct answers treated as weak, nonzero mastered-word weight.
- Score, accuracy, best combo and empty-session handling.
- Five different procedural compositions with valid tempo/pattern data.

`python3 tools/build_words.py --check`: generated data matches source.

## Public Chrome UI checks

The deployed app was tested through its public Pages URL and the 390×844 iframe harness in `tests/mobile.html`.

- Home loads all 500 words, speed/length/target/track controls.
- Game starts, falling word and 2×2 choices fit the phone frame; choices are 80px tall.
- Pause freezes the question through subsequent inspections. Resume and a correct answer produce GREAT +80 and COMBO 1.
- Interrupted session result accurately shows two answered questions: 1 GREAT, 1 MISS, 80 points, 50% accuracy.
- Review opens word, IPA, two examples with translations, collocations and statistics.
- Reload retains the interrupted session and word statistics.
- Settings displays record counts/size, persistence state and completed offline cache preparation.
- Track changed to Night Drive; preview toggle entered playing state.
- Weak-only play selects the one weak word; timeout ends the session normally with MISS and a 4.00-second mean.
- No application-origin errors were observed. Browser-extension metadata errors were unrelated to the app.
- A phone-width heading wrap was found and corrected; answer feedback moved below the judgment line to avoid overlap with very fast responses.

- Updated service-worker installation to bypass stale HTTP asset caches, and disabled caching for worker update checks.

## Limits

This is a desktop Chrome test at a phone-sized viewport, not a physical Android test. Speaker quality, speech-synthesis start delay, BGM/voice balance and Bluetooth delay require listening on the intended device. The cache is prepared, but a disconnected-network end-to-end run was not performed. Storage persistence was requested and remained ungranted in this browser; normal IndexedDB persistence across reload was verified. Vocabulary checks cover structure and selected wording corrections, not independent editorial review of every IPA/translation.
