/**
 * Jack — PH (English) add-on + treatment-order detector for painfreeph.com (2026-10-04, audit #27, #39, #63; v2 after
 * the adversarial verification round the same evening).
 *
 * Why: Yaki 2026-10-04 ("תיקונים חשובים") rejected copy that sells PEMF as an add-on — "לצד התרגילים והפיזיותרפיה
 * שאתם כבר עושים", "PEMF משמש כטיפול משלים — לצד התרגול ולא במקומו", "אבן היסוד היא פיזיותרפיה" — and a treatment section
 * that listed every option except PEMF ("0 מילים על פולסים"). The Hebrew detector (lib/treatment-section-check.js) reads
 * only painfree.org.il; the English twins kept the same sentences word for word. This reads the LOCAL painfree-ph
 * checkout (file reads only — no network, no server cost) and grades every surface a reader, Google or an AI engine sees:
 * <title>, every <meta> description/title (name=, property=, itemprop=), every string in JSON-LD (articleBody, reviewBody,
 * keywords, FAQ …), img alt / title / aria-label attributes, <noscript>, body sentences, headings, table cells, plus
 * articles-manifest.json title_en (the title source Step 8 copies) and the articles.html / index.html cards.
 *
 * The standard is Yaki's own text (Jack/references/yaki-texts/2026-10-04-achilles-1696.html): PEMF leads; physio is
 * what it ACCOMPANIES ("בליווי הפיזיותרפיה והתרגילים שאתם כבר רגילים לעשות" = "together with the physiotherapy and
 * exercises you already do"; "PEMF … working alongside your physiotherapy" in a PEMF-first sentence is his wording;
 * "the pulses don't come instead of physiotherapy; they are what lets you do it" is his FAQ answer).
 *
 * Flag kinds (one sentence can carry several):
 *   STRONG     — his rejected clause in any tense/possessive: "alongside … you already do / you've been doing / you have
 *                now", "alongside your existing/usual/current physiotherapy", "without stopping what you already do",
 *                "together with … you already do" when PEMF is not the subject before it (sentence opens with it, or it
 *                hangs after "awaits you"). "…you are already USED TO doing" is his own wording (רגילים לעשות) and passes.
 *                Also (tsc ALREADY parity) "the physiotherapy you already do" / "your existing/current/usual physio" and the
 *                third person ("patients already in physio", "the physiotherapy they already receive") anywhere in a PEMF
 *                sentence — unless the sentence carries his "together with" (בליווי).
 *   NEGATION   — "not / isn't a replacement|substitute|swap for", "does not replace", "not instead (of)", "doesn't come
 *                instead of", "not in its place", "take over from", "do away with", "make … unnecessary", "rather than
 *                replacing" … EXEMPT only when the OBJECT is diagnosis / medical evaluation / a doctor's consultation /
 *                urgent care / medication, antibiotics or cancer treatment (a safety line), or a business object (clinic,
 *                revenue, staff) — or when the sentence carries his enabler ("they are what lets you do it").
 *   LABEL      — adjunct/adjuvant/complementary (and "complimentary therapy"), add-on, supplementary/supporting/secondary
 *                role, "additional/extra … layer|tool|channel|option", secondary/auxiliary/ancillary TO physio, sidekick,
 *                helper, top-up to, back seat, second fiddle, accelerant/booster FOR physio, "physio first, PEMF second";
 *                a table role cell ("Second-line", "Supportive", "Optional") in a PEMF row/column.
 *   FOUNDATION — physio/exercise/surgery/… as the cornerstone/foundation/backbone/mainstay/gold standard, or "X is the
 *                first-line / primary / core / main / key treatment", "the core/heart/basis of every …", "standard of care",
 *                "treatment of choice", reversed "the main treatment … is a loading programme", "comes first", "does the
 *                heavy lifting", "is what heals", "it is the exercises that rebuild", "physio leads the treatment"; a
 *                "First-line" table cell in a physio row. Yaki's pivot ("…is based on graded exercise, BUT … your body
 *                needs a technological push") is exempt, except for the cornerstone family.
 *   PLAN       — PEMF as "one part / piece / component of", "part of a multidisciplinary plan", "fits into your rehab
 *                plan", "works best when combined with", "only when combined", "not a standalone treatment", "PEMF alone
 *                will not …", "you'll still need to do your exercises", "prepares the tissue for exercise", "assists
 *                physiotherapy", "supports your physiotherapy", "comes in only after X failed", "before or after physio".
 *   ADDITION   — "a useful addition (to)", "in addition to your exercises", "on top of your physio", "added to your rehab",
 *                "supplements physiotherapy", "an optional extra", "PEMF can also be considered", "another option is
 *                PEMF", "add PEMF to your routine", "a supplement to physiotherapy"; and (tsc ALONGSIDE/JOINS parity —
 *                Yaki: "לא לכתוב לצד התרגילים והפיזיותרפיה") "alongside / hand in hand with / in tandem with physiotherapy"
 *                and "integrates (well) with / into the rehab plan" even with PEMF as the subject — allowed only in his own
 *                PEMF-first form ("PEMF technology, working alongside your physiotherapy"), a trial arm, an operational /
 *                B2B line, or with another modality as the subject. The default wording is "together with".
 *                A measured trial arm is exempt only with a trial marker (n=, PMC, %, versus, sham, randomised …) and no
 *                positioning word (your, show(s) PEMF, describe PEMF, is an addition …).
 *   NO_PEMF / PEMF_LAST / PEMF_LATE — structure (port of treatment-section-check grade()): a treatment section (by heading
 *                or by body: ≥3 other options named) with no PEMF word; ≥2 other options named before PEMF (reading
 *                order); a comparison table with PEMF behind ≥2 other columns/rows; PEMF_LATE (new articles only): PEMF
 *                first appears after 30% of the section's items behind ≥1 other option.
 *   JSONLD_PARSE — a JSON-LD block that does not parse (fail closed: unreadable text is never a pass).
 *
 * "About PEMF": every painfreeph.com page is a PEMF page, so ADDITION/PLAN fire on an unnamed subject ("Our treatment is a
 * useful addition…", "The pulses…", "The Magnetobox…") — but not when ANOTHER modality is the subject of the clause
 * ("Shockwave is a useful addition to physiotherapy").
 *
 * Exemptions are exact and printed on every run (never silent — audit #60):
 *   - EN_QUOTE_ALLOW: a named clinician's exact sentences (one global list, the English mirror of tsc QUOTE_ALLOW). Exempt
 *     only when an attribution naming that clinician sits in the same or an adjacent unit, or on his own signed page
 *     (SIGNED_PAGES, which must carry his name). A "Dr." or "MD" alone exempts nothing.
 *   - EN_CITATION_ALLOW: exact titles of cited papers — the title is BLANKED inside the sentence and the rest is graded.
 *   - medical terms that are not about PEMF's role (adjuvant chemotherapy, the complement system, complementary
 *     mechanisms, CAM as a regulatory category).
 *
 * Usage:
 *   node lib/ph-addon-check.js                       → full scan: every *.html in $PH_REPO + manifest; exit 1 on any flag
 *   node lib/ph-addon-check.js --files a.html,b.html → those files + articles.html + index.html + the manifest (always)
 *   node lib/ph-addon-check.js --staged              → the INDEX (what will be committed): staged *.html + articles.html
 *                                                      + index.html + the staged manifest; new files graded as articles
 *   node lib/ph-addon-check.js --index               → the whole index (lib/ph-commit.js and the pre-commit hook use it)
 *   node lib/ph-addon-check.js --dir <path> --json out.json --quiet
 *   node lib/ph-addon-check.js fixtures              → regression cases only
 * Every scan runs the fixtures first: a weakened regex that lets Yaki's rejected sentences through fails the run.
 *
 * Enforcement (code paths, not prose — feedback "enforcement belongs in the code path"):
 *   - lib/ph-commit.js: the ONLY way Jack commits painfree-ph (Step 8.8 / 8.P2.5 / scheduled step 10). Grades the whole
 *     index, refuses on any flag, then commits and pushes; it also syncs the vendored copy below.
 *   - painfree-ph/.githooks/pre-commit (core.hooksPath=.githooks): runs `--staged`; a raw `git commit` is refused too.
 *   - painfree-ph/.github/ph-addon-check.js + .github/workflows/ph-addon-check.yml: CI on every push (cloud clones).
 *   - father-ledger L21 {"type":"ph_addon"}: scanDir(PH_REPO) — FAIL on any flag, read error, 0 files or a missing repo;
 *     file reads only, so it runs under --no-live and send-yaki's L21 block covers the English site too.
 *
 * Exports: gradeHtml(html, name, opts), addonSentencesEn(html, name), scanDir(dir, files, readFile, opts), scanIndex(dir,
 * opts), fixtures(), units(html), gradeSentence(s, ctx, opts), structureFlags(parsed, opts), PH_REPO.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const PH_REPO = process.env.PH_REPO || path.resolve(__dirname, '..', '..', '..', 'painfree-ph');
const JACK = process.env.JACK_HOME || path.resolve(__dirname, '..');

// ── lexicon: who is who ────────────────────────────────────────────────────────────────────────────────────────────
// Our treatment, under any of its names (TMS is "transcranial magnetic stimulation" — not ours).
const PEMF_SRC = String.raw`PEMFs?|PainFree|pulsed\s+electromagnetic|electromagnetic|(?<!transcranial\s)(?<!static\s)magnetic\s+(?:fields?|pulses?|therap\w*|stimulation|treatment)|magnetotherap\w*|Magnetobox|MG\s?-?WAVE|pulses|pulse\s+(?:therap\w*|treatment|technology|sessions?|method)|our\s+(?:treatment|therapy|technology|method|system|device|sessions?|protocol)|this\s+technology`;
const PEMF_WORD = new RegExp(String.raw`\b(?:${PEMF_SRC})\b`, 'i');
const PEMF_G = new RegExp(String.raw`\b(?:${PEMF_SRC})\b`, 'gi');
const PRONOUN = /\b(?:it|its|this|they|the\s+(?:treatment|therapy|technology|modality|device|protocol|sessions?|method|system|pulses))\b/i;
// The care PEMF competes with (the subject of a cornerstone sentence, the object of an add-on phrase).
const COMPETE_SRC = String.raw`physio\w*|physical\s+therap\w*|exercis\w*|training|(?<!salt\s)loading|load\s+management|strengthening|stretching|rehab\w*|conservative|psycholog\w*|psychotherap\w*|CBT(?:-I)?|counsel\w*|brac(?:e|es|ing)|orthotic\w*|insoles?|splint\w*|surgery|surgical|operation|medication\w*|drugs?|pharmac\w*|levodopa|NSAIDs?|steroid\w*|injection\w*|weight\s+loss|diet\w*|lifestyle|education|manual\s+therap\w*|mobili[sz]ation|stabili[sz]ation|eccentric|isometric|heel[\s-]drops?|massage|chiropract\w*|acupuncture|shockwave|ESWT|compression|MLD|lymphatic\s+drainage|CDT|decongestive|pelvic\s+floor\s+(?:muscle\s+)?training|active\s+(?:layer|work|component|part|element|approach|programme|program)`;
const COMPETE = new RegExp(String.raw`\b(?:${COMPETE_SRC})\b`, 'i');
const COMPETE_G = new RegExp(String.raw`\b(?:${COMPETE_SRC})\b`, 'gi');
// Any other named modality — decides "another treatment is the subject of this clause".
const OTHER_SRC = COMPETE_SRC + String.raw`|TENS|lasers?|LLLT|photobiomodulation|(?:therapeutic\s+)?ultrasound(?:\s+therapy)?|radiofrequency|PRP|platelet-rich|prolotherapy|cupping|dry\s+needling|cryotherapy|hydrotherapy|yoga|pilates|tai\s+chi|hyaluronic|viscosupplement\w*|botox|botulinum|nerve\s+blocks?|epidural\w*|spinal\s+cord\s+stimulat\w*|TMS|transcranial\s+magnetic|ketamine|cannabis|CBD|antibiotic\w*|DMARDs?|biologics?|chemotherapy|radiotherapy|acupressure|reflexology|kinesio\w*|taping|osteopath\w*|cortisone|opioids?|analgesics?|paracetamol|ibuprofen|gabapentin|pregabalin`;
const OTHER_G = new RegExp(String.raw`\b(?:${OTHER_SRC})\b`, 'gi');

// ── lexicon: the add-on voice ──────────────────────────────────────────────────────────────────────────────────────
// "you already (do)" in every tense — but NOT his own "you are already used to doing" (רגילים לעשות ≠ עושים).
const YOU_ALREADY = String.raw`(?:you(?:['’]re|\s+are|['’]ve\s+been|\s+have\s+been)?\s+(?:already|currently)\b(?!\s+(?:been\s+)?used\s+to)|you(?:['’]re|\s+are)\s+(?:doing|getting|receiving|following)\b|you(?:['’]ve|\s+have)\s+been\s+(?:doing|following|getting|receiving)\b|you\s+(?:have|do|get|follow)\s+now\b|what\s+you\s+(?:already\s+)?(?:do|are\s+doing)\b|already\s+(?:gave|given|prescribed|assigned)\s+you\b)`;
const PHYS_OBJ = String.raw`(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|strengthening|stretching|programme|program|routine|regimen|treatment|therapy|care|management|plan)`;
const STRONG = [
  new RegExp(String.raw`\b(?:alongside|along\s+with|in\s+addition\s+to|on\s+top\s+of|next\s+to|besides|beside|added\s+to|layered\s+(?:on|onto|over)|slots?\s+in\s+next\s+to|integrat\w+\s+(?:with|into)|(?:supports?|supporting|complements?|boosts?|enhances?)\s+(?:the\s+|your\s+)?(?:\w+\s+)?(?:physio\w*|exercis\w*|rehab\w*|treatment|therapy|programme|program))\b[^.;!?]{0,90}?${YOU_ALREADY}`, 'gi'),
  new RegExp(String.raw`\b(?:without|no\s+need\s+to|don['’]t\s+(?:have|need)\s+to|do\s+not\s+(?:have|need)\s+to|never\s+(?:have|need)\s+to|you\s+won['’]t\s+(?:have|need)\s+to)\s+(?:stop|stopping|give\s+up|giving\s+up|drop|dropping|quit|quitting|pause|pausing)\b[^.;!?]{0,60}?${YOU_ALREADY}`, 'gi'),
  // the possessive form of the same clause: "alongside your existing / usual / current physiotherapy"
  new RegExp(String.raw`\b(?:alongside|along\s+with|in\s+addition\s+to|on\s+top\s+of|next\s+to|beside|besides|added\s+to|slots?\s+in\s+next\s+to|layered\s+(?:on|onto|over)|integrat\w+\s+(?:\w+\s+)?(?:with|into|alongside))\s+(?:all\s+)?(?:the\s+|your\s+|their\s+|any\s+|his\s+|her\s+|an?\s+)?(?:existing|usual|current|ongoing|regular|normal|standard|present|prescribed|everyday|routine)\s+(?:[\w-]+\s+){0,2}?${PHYS_OBJ}\b`, 'gi'),
];
// "alongside physiotherapy / exercise" in our voice — Yaki: "לא לכתוב לצד התרגילים והפיזיותרפיה". Allowed only in his own
// PEMF-first form ("PEMF technology, working alongside your physiotherapy"), a trial arm, an operational/B2B line, or when
// another modality is the subject. "together with" is the default wording.
const ALONGSIDE = new RegExp(String.raw`\balongside\s+(?:the\s+|your\s+|their\s+|an?\s+|any\s+|all\s+)?(?:[\w-]+\s+){0,2}?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|(?<!salt\s)loading|strengthening|stretching|manual\s+therap\w*|conservative|hands-on|motor-control|functional\s+(?:rehab\w*|exercise|training|task))\b`, 'gi');
const JOINS = new RegExp(String.raw`\b(?:integrat(?:es|ed|ing|e)|fits?|slots?|blends?)\s+(?:easily\s+|well\s+|seamlessly\s+|smoothly\s+|naturally\s+|readily\s+)?(?:alongside|within|into|in|with)\s+(?:(?:the|your|their|an?|any|existing|current|standard)\s+)*(?:[\w-]+\s+){0,2}?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|programmes?|programs?|plans?|protocols?|pathways?|routines?|regimens?|treatment|therapy|care|management|these|them)\b`, 'gi');
const CLINIC_SUBJ = /\b(?:clinics?|practices?|centres?|centers?|business(?:es)?|compan(?:y|ies)|employers?|hospitals?|operators?|owners?)\b/i;
const OPERATIONAL = /\b(?:same\s+(?:hour|session|visit|room|appointment|day)|in\s+parallel|hands-free|schedul\w*|staff|therapist['’]s\s+time|tied\s+to|billed|billing|packages?|pricing|priced|workflow|outreach|room\s+time|throughput)\b/i;
const MED_WORDS = /\b(?:medical|medication\w*|drugs?|doctor|physician|pharmaco\w*|oncolog\w*|psychiatr\w*|neurologist|rheumatologist|cardiac|insulin)\b/i;
// Hebrew ALREADY parity: "the physiotherapy you already do" / "your existing physiotherapy" in a PEMF sentence is the
// rejected clause unless the sentence carries his "together with" (בליווי).
const PHYS_ALREADY = new RegExp(String.raw`\b(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|programme|program|routine|treatment|therapy|care)\s*,?\s+(?:that\s+|which\s+)?${YOU_ALREADY}|\b(?:your|their)\s+(?:existing|current|usual|ongoing|regular|present|everyday)\s+(?:[\w-]+\s+){0,2}?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|programme|program|routine|regimen|treatment|therapy|care)\b`, 'gi');
const SIDE_BY_SIDE = new RegExp(String.raw`\b(?:hand[\s-]in[\s-]hand\s+with|in\s+tandem\s+with|in\s+conjunction\s+with|side\s+by\s+side\s+with|in\s+parallel\s+(?:with|to))\s+(?:the\s+|your\s+|their\s+|an?\s+)?(?:[\w-]+\s+){0,2}?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|strengthening|stretching|manual\s+therap\w*|conservative)\b`, 'gi');
// "together with / with … you already do" — Yaki's own model ("…stimulates the body's natural healing — together with the
// physiotherapy and exercises you already do") is PEMF-first. Flagged only when PEMF is not the subject before it.
const TOGETHER = new RegExp(String.raw`\b(?:together\s+with|with)\b[^.;!?]{0,90}?${YOU_ALREADY}`, 'gi');
const AWAITS = /\b(?:awaits?|is\s+waiting\s+for|waits?\s+for|is\s+ready\s+for)\s+you\b/i;
const NEG_ADJ = String.raw`(?:partial|full|complete|direct|real|true|good|viable|adequate|effective|equivalent|reasonable|like-for-like)`;
const NEGATION = new RegExp([
  String.raw`\b(?:not|isn['’]t|aren['’]t|wasn['’]t|weren['’]t|never)\s+(?:as\s+)?(?:an?\s+)?(?:${NEG_ADJ}\s+){0,2}(?:replacement|substitute|stand-?in|swap)\b(?:\s+(?:for|to|of))?`,
  // "alternative" only as the noun of replacement ("not an alternative to surgery") — never "not an alternative health trend"
  String.raw`\b(?:not|isn['’]t|aren['’]t)\s+(?:as\s+)?(?:an?\s+)?alternatives?\s+(?:to|for)\b|\bnot\s+(?:an?\s+)?alternatives?(?=\s*(?:[.,;:)—–]|$))`,
  String.raw`\b(?:is|are|isn['’]t|aren['’]t)\s+no\s+(?:replacement|substitute|stand-?in|alternative)\b(?:\s+(?:for|to))?`,
  String.raw`\bno\s+(?:replacement|substitute)\s+for\b`,
  String.raw`\b(?:does\s+not|doesn['’]t|do\s+not|don['’]t|did\s+not|didn['’]t|cannot|can\s*not|can['’]t|will\s+not|won['’]t|should\s+not|shouldn['’]t|must\s+not|never|not\s+(?:meant|designed|intended|there|here|used|offered|positioned|presented|supposed)\s+to|(?:isn['’]t|aren['’]t|wasn['’]t|is\s+not|are\s+not)\s+(?:meant|designed|intended|there|here|used|offered|positioned|presented|supposed)\s+to)\s+(?:\w+\s+)?(?:replace|replaces|replacing|substitute\s+for|substitutes\s+for|stand\s+in\s+for|supplant|swap(?:\s+out)?|take\s+over\s+from|do\s+away\s+with)\b`,
  String.raw`\b(?:rather\s+than|instead\s+of|without|not)\s+replac(?:e|es|ing)\b`,
  String.raw`\bnot\s+(?:as\s+)?(?:a\s+)?(?:way|means)\s+to\s+replace\b`,
  String.raw`\b(?:not|never)\s+["“'‘]?instead\b(?:\s+of)?`,
  String.raw`\b(?:positions?|presents?|sells?|markets?|offers?|uses?)\s+(?:PEMF|it|the\s+(?:pulses|treatment|technology))\s+as\s+an?\s+(?:replacement|substitute|alternative)\s+(?:for|to)\b`,
  String.raw`\b(?:don['’]t|doesn['’]t|do\s+not|does\s+not|didn['’]t|won['’]t|will\s+not)\s+(?:\w+\s+){0,2}?instead\s+of\b`,
  String.raw`\binstead\s+of\s+(?:it|them)\b`,
  String.raw`\b(?:not|never)\s+in\s+(?:its|their|his|her)\s+place\b`,
  String.raw`\b(?:not|never)\s+(?:in\s+place\s+of|as\s+a\s+replacement)\b`,
  String.raw`\b(?:not|never)\s+in\s+lieu\s+of\b`,
  String.raw`\b(?:cannot|can\s*not|can['’]t|does\s+not|doesn['’]t|do\s+not|will\s+not|won['’]t|should\s+not|never|not)\s+(?:\w+\s+)?take\s+the\s+place\s+of\b`,
  String.raw`\b(?:not|never|won['’]t|doesn['’]t|isn['’]t|aren['’]t)\b[^.;:!?]{0,20}?\b(?:take\s+over\s+from|do\s+away\s+with|swap(?:\s+out)?\s+(?:the\s+|your\s+|their\s+)?\w|make\s+(?:\w+\s+){0,2}?(?:unnecessary|redundant|obsolete))`,
  String.raw`\brather\s+than\s+(?:as\s+)?(?:an?\s+)?(?:replacements?|substitutes?|alternatives?(?![\w-])(?!\s+(?:medicine|health|therap\w*|provider|practitioner)))\b`,
  String.raw`\bnot\s+to\s+(?:lead|replace|take\s+over)\b`,
  String.raw`\b(?:not|isn['’]t|aren['’]t|never)\s+(?:intended|meant|designed|positioned|presented|offered|used|to\s+be\s+used)\s+as\s+an?\s+(?:${NEG_ADJ}\s+)?(?:replacement|substitute|alternative|stand-?in)\b`,
  String.raw`\b(?:not|never)\s+(?:\w+\s+)?substituted\s+(?:for|with)\b`,
  String.raw`\bnot\s+(?:PEMF|the\s+pulses|it|the\s+(?:treatment|technology|field))\s+instead\s+of\b`,
  String.raw`\breplaces?\s+(?:none|nothing|neither)\s+of\s+(?:it|them)\b`,
].join('|'), 'gi');
// Yaki's register: "the pulses don't come instead of physiotherapy; they are what lets you do it and keep at it"
const ENABLER = /\b(?:what|which|that)\s+(?:lets|allows|enables|helps)\s+you\s+(?:to\s+)?(?:do|carry|keep|stick|complete|tolerate|get\s+through|perform|start)\b/i;
// PEMF as the ADDITION to someone else's programme. A trial arm (STUDY_ARM) is exempt from these forms only.
const ADDITION = new RegExp([
  String.raw`\b(?:an?\s+)?(?:(?!in\s)[\w-]+\s+)?(?<!\bin\s)addition\s+to\b`,
  String.raw`\bin\s+addition\s+to\s+(?:the\s+|your\s+|their\s+|a\s+|an\s+)?(?:\w+\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|strengthening|stretching|conservative|treatment|therapy|care|programme|program)`,
  String.raw`\bon\s+top\s+of\s+(?:the\s+|your\s+|their\s+|a\s+|an\s+)?(?:existing\s+|current\s+|usual\s+|regular\s+|ongoing\s+|standard\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|strengthening|stretching|conservative|treatment|therapy|care|programme|program|plan|what)\b|\b(?:sits?|goes|comes|layered|added|placed|stacked)\s+on\s+top\b`,
  String.raw`\badded\s+(?:on\s+)?to\s+(?:the\s+|your\s+|their\s+|a\s+|an\s+)?(?:existing\s+|current\s+|usual\s+|regular\s+|ongoing\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|programme|program|plan|regimen)`,
  String.raw`\bsupplement(?:s|ing|ed)?\s+(?:the\s+|your\s+|their\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|conservative|treatment|therapy|care)\b|\bsupplementary\s+to\b`,
  String.raw`\b(?:(?:optional|helpful|useful|nice|welcome|valuable|small)\s+extra|nice[\s-]to[\s-]have|bonus\s+(?:treatment|therapy|option))\b`,
  String.raw`\b(?:an?\s+)?(?:[\w-]+\s+)?supplement\s+(?:to|for)\s+(?:the\s+|your\s+|their\s+)?(?:\w+\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|treatment|therapy|care)`,
  String.raw`\b(?:an?\s+)(?:[\w-]+\s+)?addition\b(?!\s+(?:of|to))`,
  // "PEMF can also be considered", "another option is PEMF", "add PEMF to your routine" (Hebrew ALSO_PEMF / JOINS)
  String.raw`\b(?:PEMF|it|the\s+pulses)\s+(?:can|may|could|might)\s+also\s+be\s+(?:considered|tried|added|offered|included|used\s+(?:alongside|with|in\s+addition))\b`,
  String.raw`\b(?:you|patients|clinicians|doctors)\s+(?:can|may|could|might)\s+also\s+(?:consider|try|add|ask\s+about|get|receive|book)\b[^.;]{0,30}?\b(?:PEMF|pulses?|PainFree)`,
  String.raw`\b(?:another|an\s+additional|a\s+further|one\s+more|a\s+newer)\s+option\s+(?:is|being|to\s+consider\s+is)\b[^.;]{0,30}?\b(?:PEMF|pulses?|PainFree)`,
  String.raw`\b(?:PEMF|PainFree|the\s+pulses)\s+(?:is|are|offers?|provides?)\s+(?:also\s+)?(?:another|an\s+additional|one\s+more|a\s+further)\s+(?:\w+\s+)?(?:option|avenue|tool|route|choice)`,
  String.raw`\badd(?:s|ed|ing)?\s+(?:PEMF|pulses?|it|the\s+(?:pulses|treatment|technology|sessions))\s+(?:sessions?\s+)?(?:to|into|onto)\s+(?:the\s+|your\s+|their\s+|an?\s+)?(?:existing\s+|current\s+|usual\s+|ongoing\s+|regular\s+)?(?:physio\w*|exercis\w*|rehab\w*|routine|programme|program|plan|regimen|treatment|therapy|care)`,
  String.raw`\badd(?:s|ed|ing)?\s+(?:\w+\s+){0,3}?alongside\s+(?:it|them)\b`,
].join('|'), 'gi');
// A measured trial arm ("PEMF added to exercise in an RCT, n=40") — needs a trial marker AND no positioning word.
const TRIAL_MARK = /\bn\s*=\s*\d|\bN\s*=|\bPMC\d+|\bPMID\b|\bPubMed\s*:?\s*\d|\bp\s*[<=≤]\s*0?\.\d|\d+(?:\.\d+)?\s*%|\bversus\b|\bvs\.?\s|\bsham\b|\bcontrol\s+(?:group|arm)|\bplacebo\b|\brandomi[sz]ed\b|\bRCTs?\b|\btrials?\b|\bboth\s+groups\b|\b(?:treatment|control|study|PEMF|sham|intervention|active)\s+groups?\b|\b(?:\d+|two|three|four|five|six|seven|eight|nine|ten)\s+(?:of\s+the\s+\w+\s+)?(?:controlled\s+|randomi[sz]ed\s+)?(?:studies|trials|RCTs)\b|\b(?:was|were|been)\s+tested\b|\bparticipants\b|\binvestigators\b|\b(?:treatment|study)\s+arms?\b|\bcompared\s+(?:with|to)\b|\b(?:over|than)\s+(?:\w+\s+){0,3}alone\b|\bmeta-analys\w+|\bcohort\b|\bcase\s+series\b|\bdouble-blind\b|\b(?:the|this|that)\s+study\b|\bthe\s+authors\b|\bconcluded\b/i;
const POSITIONING = /\byour?\b|\bwe\b|\bour\b|\b(?:is|are)\s+(?:an?\s+)?(?:[\w-]+\s+)?addition\b|\bdescribes?\s+(?:PEMF|it|the\s+(?:field|pulses|treatment))\b|\bshows?\s+(?:that\s+)?(?:PEMF|it|the\s+(?:field|pulses))\b|\bsupports?\s+(?:PEMF|the\s+use|its\s+use|using|adding|it\s+as)\b|\bsuggests?\s+(?:that\s+)?(?:PEMF|it)\b|\brecommends?\b|\bshould\b|\bideal\b/i;
const studyArm = s => TRIAL_MARK.test(s) && !POSITIONING.test(s);
const STANDALONE = new RegExp([
  String.raw`\b(?:not|never|isn['’]t)\s+(?:\w+\s+){0,3}?(?:as\s+)?(?:a\s+|an\s+)?stand-?alone\s+(?:treatment|therapy|cure|option|modality|intervention|solution|approach|tool)\b`,
  // "alone" only when it is PEMF being used alone ("never used alone"), not a study limitation ("…the field alone")
  String.raw`\b(?:not|never|shouldn['’]t|should\s+not|cannot|can['’]t|isn['’]t|doesn['’]t|does\s+not|won['’]t)\b[^.;:!?]{0,40}?\b(?:(?:used|given|applied|offered|works?|effective|sufficient|enough)\s+(?:on\s+its\s+own|by\s+itself|alone|in\s+isolation)|on\s+its\s+own|by\s+itself|in\s+isolation|as\s+(?:a\s+)?monotherapy|as\s+the\s+only\s+(?:treatment|therapy)|as\s+(?:the\s+)?sole\s+(?:treatment|therapy))\b`,
  // reversed: "PEMF alone will not fix the tendon", "PEMF on its own is not enough", "PEMF by itself is not a cure"
  String.raw`\b(?:PEMF|it|the\s+(?:pulses|treatment|technology|therapy|device|method))\s+(?:alone|on\s+its\s+own|by\s+itself|in\s+isolation)\b[^.;!?]{0,40}?\b(?:not|never|isn['’]t|won['’]t|cannot|can['’]t|doesn['’]t|did\s+not|didn['’]t|is\s+(?:rarely|seldom|insufficient|unlikely))\b`,
  // "PEMF can't do the job without physiotherapy", "PEMF only helps if you also exercise"
  String.raw`\b(?:not|never|can['’]t|cannot|won['’]t|doesn['’]t|does\s+not)\b[^.;:!?]{0,30}?\bwithout\s+(?:the\s+|your\s+|an?\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading)`,
  String.raw`\bonly\s+(?:really\s+)?(?:helps?|works?|succeeds?)\s+(?:if|when)\b`,
].join('|'), 'gi');
const PLAN = new RegExp([
  String.raw`\b(?:one\s+|a\s+|just\s+)?part\s+of\s+(?:a|an|the|your)\s+(?:[\w-]+\s+){0,2}?(?:multidisciplinary|multi-disciplinary|multimodal|multi-modal|combined|comprehensive|integrated|integrative|broader|wider|overall|conservative)\s+(?:[\w-]+\s+)?(?:plan|programme|program|approach|strategy|regimen|management|care|package)\b`,
  String.raw`\b(?:integrat\w+|fits?|fitting|sits?|slots?|slotting|placed|positioned)\s+(?:in|into|within)\s+(?:a|an|the|your)\s+(?:[\w-]+\s+){0,2}?(?:multidisciplinary|multi-disciplinary|multimodal|multi-modal|combined|comprehensive|broader|wider|overall|conservative|standard)\s+(?:[\w-]+\s+)?(?:plan|programme|program|approach|strategy|regimen|management|care|toolbox|toolkit)\b`,
  String.raw`\bwithin\s+(?:a|an|the)\s+(?:[\w-]+\s+){0,2}?(?:multidisciplinary|multi-disciplinary|multimodal|combined|comprehensive|broader|wider|overall)\s+(?:[\w-]+\s+)?(?:plan|programme|program|approach|strategy|regimen|management)\b`,
  String.raw`\bonly\s+(?:when\s+|if\s+)?(?:it\s+is\s+|they\s+are\s+|be\s+|is\s+)?(?:used\s+|given\s+|offered\s+|applied\s+|works?\s+|effective\s+)?(?:combined|in\s+combination|paired|together|alongside|as\s+part\s+of)\b`,
  String.raw`\b(?:works?|is|are)\s+(?:best|most\s+effective|more\s+effective|at\s+its\s+best)\s+(?:when|if)\s+(?:it\s+is\s+|they\s+are\s+)?(?:used\s+)?(?:combined|paired|together|alongside|in\s+combination|as\s+part\s+of)\b`,
  String.raw`\b(?:fits?|slots?|sits?|belongs?)\s+(?:in(?:to)?|within)\s+(?:a|an|the|your)\s+(?:[\w-]+\s+)?(?:rehab\w*|physio\w*|treatment|exercise|recovery|therapy)\s+(?:plan|programme|program|routine|regimen|pathway)\b`,
  String.raw`\b(?:you['’]ll|you\s+will|you)\s+still\s+(?:need|have)\s+to\s+(?:do|keep\s+(?:up|doing)|continue|follow|stick\s+to)\b[^.;]{0,30}?\b(?:physio\w*|exercis\w*|rehab\w*|training|loading)`,
  String.raw`\b(?:comes?\s+in(?:to\s+(?:the\s+)?picture)?|is\s+(?:considered|added|introduced|tried|offered)|can\s+be\s+(?:considered|added|tried))\s+(?:only\s+)?(?:when|after|once)\b[^.;]{0,60}?\b(?:fail\w*|tried|exhausted|not\s+(?:worked|helped)|plateau\w*)`,
  String.raw`\b(?:prepar\w+|prim(?:es|ing)|readies|readying)\s+(?:the\s+|your\s+)?(?:\w+\s+)?(?:tissues?|tendons?|muscles?|joints?|body|nerves?|area|patients?)\s+for\s+(?:the\s+|your\s+)?(?:\w+\s+)?(?:physio\w*|exercis\w*|rehab\w*|loading|training|strengthening|manual)`,
  String.raw`\bassist(?:s|ing)?\s+(?:the\s+|your\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*)`,
  String.raw`\b(?:better|more)\s+than\s+either\s+(?:one\s+|treatment\s+)?alone\b`,
  String.raw`\b(?:will\s+not|won['’]t|doesn['’]t|does\s+not|cannot|can['’]t|do\s+not|don['’]t)\s+(?:\w+\s+)?(?:work|help|succeed|last)\s+(?:unless|without|if\s+you\s+(?:don['’]t|do\s+not|stop))\b`,
  String.raw`\byou\s+(?:must|have\s+to|need\s+to|should)\s+(?:still\s+|also\s+|keep\s+)?(?:do|doing|continue|follow|stick\s+to)\b[^.;]{0,30}?\b(?:physio\w*|exercis\w*|rehab\w*|training|loading)`,
  String.raw`\b(?:not|never)\s+(?:be\s+)?(?:your|the)\s+only\s+(?:treatment|therapy|option|intervention)\b`,
  String.raw`\brely\s+(?:solely\s+|only\s+|just\s+)?on\s+(?:PEMF|it|the\s+pulses|the\s+treatment)\s+(?:alone|only|by\s+itself)\b`,
  String.raw`\b(?:is|are)\s+there\s+to\s+(?:support|help|assist|boost)\s+(?:the\s+|your\s+)?(?:physio\w*|exercis\w*|rehab\w*)`,
  String.raw`\bsupports?\s+(?:the\s+|your\s+)(?:physio\w*|physical\s+therap\w*|exercise\s+(?:programme|program|plan|therapy)|rehab(?:ilitation)?\s+(?:programme|program|plan))`,
  String.raw`\b(?:fits?|slots?|scheduled|done|given|used)\s+(?:in\s+)?(?:right\s+)?(?:before\s+or\s+after|after\s+or\s+before)\s+(?:the\s+|your\s+|each\s+)?(?:\w+\s+)?(?:physio\w*|exercis\w*|rehab\w*|training)`,
].join('|'), 'gi');
// "one piece of the puzzle", "one component of" — only with PEMF named as the subject (the missing piece is Yaki's).
const PLAN_STRICT = /\b(?:one|just|only|a\s+small|a)\s+(?:part|piece|component|element|ingredient|strand|cog)\s+(?:of|in|among|within)\b|\b(?:one|just|only)\s+(?:more\s+)?(?:tool|option|weapon)\s+(?:of|in|among)\b|\b(?:a|one)\s+(?:tool|option)\s+among\b/gi;
// What PEMF may honestly say it does not replace: diagnosis, medical evaluation, a doctor's consultation, urgent care,
// a doctor's drug / infection / cancer treatment (a safety line) — and business objects (B2B copy).
const EVAL = String.raw`(?:evaluation|assessment|examination|exam|review|consultation|opinion|work-?up|check-?up|follow-?up|investigation|diagnosis|visit)s?`;
const WHO = String.raw`(?:medical|clinical|psychiatric|psychological|neurological|cardiac|specialist|physician|doctor|GP|orthop(?:a)?edic|surgical|structural|radiological|vascular)(?:['’]s|s['’])?`;
const SAFE_OBJ = new RegExp(String.raw`^(?:\W|\b(?:a|an|the|your|any|proper|prompt|timely|formal|full|thorough|appropriate|necessary|professional|in-person|regular|prescribed|ongoing)\b)*(?:` + [
  String.raw`diagnos\w*`,
  WHO + String.raw`(?:\s+(?:or|and|/)\s+` + WHO + String.raw`)?\s+` + EVAL,
  String.raw`medical\s+(?:attention|advice|care|treatment)`,
  String.raw`(?:evaluation|assessment|examination|work-?up|investigation|imaging|scans?)`,
  String.raw`(?:seeing|consulting|visiting)\s+(?:a|your)\s+(?:doctor|physician|specialist|GP)`,
  String.raw`(?:consultation|appointment|visit|check-?up|review|discussion|conversation)s?\s+with\s+(?:a|an|your|the)\s+(?:\w+\s+)?(?:doctor|physician|specialist|GP|surgeon|clinician|\w+ologist|\w+iatrist)`,
  String.raw`urgent\s+(?:care|medical|evaluation|assessment|attention|review|referral)`,
  String.raw`emergency\s+(?:care|treatment|department|evaluation|assessment|room|services|surgery)`,
  String.raw`(?:antibiotic|antimicrobial|antiparasitic|antiviral|antifungal)\w*|infection\s+treatment|(?:treatment|care)\s+(?:for|of)\s+(?:an?\s+)?(?:active\s+)?infection`,
  String.raw`(?:glucose|glycaemic|glycemic|blood\s+(?:sugar|pressure))\s+(?:control|management)|diabetes\s+(?:care|management|treatment)|disease-modifying\s+(?:therap\w*|treatment|drugs?)|(?:cancer|oncolog\w*)\s+(?:treatment|care|therapy)|chemotherapy|radiotherapy|insulin|anticoagul\w*|blood\s+thinners?|DMARD\w*|(?:\w+\s+)?medications?|drug\s+(?:treatment|therapy)`,
  String.raw`(?:\w+\s+){0,2}?(?:clinic|practice|centre|center|revenue|business|service\s+line|staff|team|therapists|workforce|equipment|facility|hospital)s?`,
].join('|') + String.raw`)\b`, 'i');
// …but never when the same object names the care PEMF competes with ("medical care such as physiotherapy").
const SAFE_SPOIL = /\b(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|loading|training|strengthening|stretching|manual\s+therap\w*|conservative)\b/i;
const B2B_OBJ = /^\W*(?:\w+\s+){0,4}?(?:clinic|practice|centre|center|revenue|business|service\s+line|menu|portfolio|offering|equipment|inventory|facility|hospital|spa|gym)s?\b/i;
const LABEL = new RegExp([
  String.raw`\badjunct\w*`,
  String.raw`\badjuvant\w*`,
  String.raw`\bcomplementar\w*`,
  String.raw`\bcomplement(?:s|ed|ing)?\b`,
  String.raw`\bcomplimentary\s+(?:treatment|therap\w*|modality|tool|option|approach|medicine|care|method)s?\b`,
  String.raw`\badd[\s-]?ons?\b`,
  String.raw`\bbolt[\s-]?on\b`,
  String.raw`\bsupplement(?:ary|al)\s+(?:\w+\s+)?(?:treatment|therapy|tool|option|role|modality|measure|support|intervention|approach|care|layer|method)s?\b`,
  String.raw`\b(?:secondary|supporting|supportive|support|ancillary|auxiliary|accessory|second-line|second\s+line|backup|back-up|optional)\s+(?:role|treatment|therapy|option|tool|modality|measure|intervention|layer|player|act|place|position|function|component|element)s?\b`,
  String.raw`\b(?:an?\s+)?(?:additional|extra|added|another|second|further|supporting|support|supportive|supplementary|secondary|optional|outer|top)\s+(?:\w+\s+)?(?:layer|tier)s?\b`,
  String.raw`\b(?:one\s+more|just\s+another|another|an\s+extra|an\s+additional)\s+(?:\w+\s+)?(?:tool|weapon|arrow)\s+(?:in|for|to)\b`,
  String.raw`\b(?:accelerant|primer|booster|catalyst|enhancer|amplifier)\s+(?:for|to|of)\s+(?:the\s+|your\s+|their\s+|an?\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|strengthening)`,
  String.raw`\b(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|loading|surgery|medication)\s+first\s*[,;:—–-]?\s*(?:and\s+)?(?:then\s+)?(?:PEMF|pulses|PainFree)\s+(?:second|after|later|next)\b`,
  String.raw`\b(?:PEMF|PainFree|the\s+pulses)\s+(?:comes?|goes)\s+(?:second|later|next|last|after(?=\s*[.;,]|\s+(?:that|it|them|physio\w*|exercis\w*|rehab\w*|surgery)))\b`,
].join('|'), 'gi');
// LABEL forms that need PEMF named as the subject (they have ordinary meanings elsewhere: "pain secondary to OA").
const LABEL_STRICT = new RegExp([
  String.raw`\b(?:secondary|auxiliary|ancillary|subordinate|supplemental|supplementary|accessory|adjunctive)\s+to\b(?=\s+(?:the\s+|your\s+|their\s+|an?\s+)?(?:\w+\s+)?(?:${COMPETE_SRC})\b)`,
  String.raw`\b(?:sidekick|helper(?!\s+T\b)|understudy|back[\s-]seat|second\s+fiddle|second\s+string|junior\s+partner|supporting\s+cast|top-?up\s+(?:to|for|on))\b`,
  String.raw`\b(?:second|third)[\s-](?:line|tier)\b|(?<!\b(?:not|never)\s+(?:as\s+)?(?:a\s+|the\s+)?)\blast[\s-]resort\b|\bfall-?back\s+(?:option|treatment)\b`,
  String.raw`\b(?:bridge|stepping[\s-]stone|gateway|warm-?up|prelude|precursor)\s+(?:to|for|into)\s+(?:the\s+|your\s+|their\s+)?(?:\w+\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|training|loading|strengthening)`,
  String.raw`\b(?:is|are)\s+(?:entirely\s+|purely\s+|just\s+|only\s+)?optional\b|\b(?:warm-?up|opening|supporting|side)\s+act\b|\bside-?show\b|\bcherry\s+on\s+(?:the\s+)?top\b|\b(?:is|are)\s+(?:the|a|just\s+a|only\s+a)\s+support\b(?!\s+(?:of|for|to|in|network|line|team|group))|\b(?:only|just|merely)\s+(?:treats?|eases?|masks?|helps?\s+with|addresses?|covers?)\s+(?:the\s+)?(?:pain|symptoms?)\b`,
  String.raw`\bin\s+(?:a\s+)?support(?:ing|ive)?(?:\s+role)?\b(?=\s*(?:[.,;:)]|$))`,
  String.raw`\b(?:an?\s+)?(?:extra|additional|added(?!\s+to\b)|supplementary|optional)\s*,?\s+(?:[\w-]+,?\s+){0,3}?(?:tool|weapon|channel|avenue|option|modality|resource|treatment|therapy)s?\b(?!\s+(?:sessions?|visits?|cycles?|courses?|rounds?|time|costs?))`,
].join('|'), 'gi');
// LABEL matches that are medical/scientific terms, not a statement of PEMF's role.
const LABEL_TERM = /^(?:adjuvant[\s-]+(?:(?:pain\s+)?medications?|analgesics?|drugs?|chemo\w*|radio\w*|endocrine|hormon\w*|immuno\w*|systemic|trastuzumab|setting|treatment\s+for\s+cancer|cancer|oncolog\w*|-?induced|arthritis)|complement\s+(?:system|cascade|activation|fixation|factor|proteins?|C\d)|complementary\s+(?:\w+\s+)?(?:mechanisms?|actions?|pathways?|effects?|targets?|ways|angles|strengths|modes\s+of\s+action|biological\s+effects?)|complementary\s*(?:and|\/|&)\s*alternative|complementary\s+medicine\s+(?:uptake|use|utili[sz]ation))/i;
const CAM_CTX = /(PITAHC|classif|regulat|utili[sz]ation|uptake|prevalence|survey|traditional and alternative)/i;
// Journal titles in a citation are names, not our voice ("Complementary Therapies in Medicine 2024").
const JOURNAL = /\b(?:Complementary Therapies in (?:Medicine|Clinical Practice)|(?:Journal of (?:Alternative and |Integrative and )?|Evidence-Based |BMC |Forschende )Complementary(?: and Alternative)?(?: Medicine)?(?: and Therapies)?|Complementary Medicine Research|J\.? ?Altern\.? Complement\.? Med\.?)/g;
const FOUND = /\b(?:cornerstone|bedrock|backbone|mainstay|foundation|foundational|pillar|linchpin|gold[\s-]standard)s?\b/gi;
const PEMF_FOUND = /\b(?:PEMF|PainFree|pulsed\s+electromagnetic|electromagnetic\s+(?:pulse|field)s?)\b[^.;:—–]{0,50}\b(?:is|as|remains|forms|becomes|serves\s+as)\s+(?:the\s+|a\s+)?(?:[\w-]+\s+){0,2}(?:cornerstone|foundation|backbone|bedrock|mainstay|pillar|linchpin)/i;
// "X is the first-line / primary / core / main treatment", "the core of every guideline", "standard of care" — the
// cornerstone sentence in other words (subject must be another option: checked by competeSubject()).
const FOUND_ADJ = String.raw`(?:first[\s-]line|first|first[\s-]choice|primary|central|core|main|key|principal|chief|essential|definitive|preferred|recommended|best(?:-supported|-studied|-evidenced|-proven)?|strongest|most\s+(?:evidence-based|supported|proven)|(?:first\s+and\s+)?most\s+important|most\s+effective|real|true|standard)`;
const TREAT_NOUN = String.raw`(?:treatments?|therap(?:y|ies)|interventions?|approach(?:es)?|modalit(?:y|ies)|options?|management|steps?|strateg(?:y|ies)|choices?|components?|elements?|parts?|work|ingredients?|recommendations?|solutions?|answers?|layers?|event|act|show)`;
const FOUND2 = new RegExp(String.raw`\b(?:is|are|was|were|remains?|remaining|stays?|staying|forms?|becomes?|constitutes?)\s+(?:still\s+|also\s+|usually\s+|generally\s+|always\s+|typically\s+|widely\s+(?:regarded|considered)\s+(?:as\s+)?)?(?:the\s+|a\s+|an\s+)?(?:${FOUND_ADJ}[\s,]+(?:(?:and|or)\s+)?(?:[\w-]+\s+){0,2}?${TREAT_NOUN}\b|(?:core|heart|basis|base|centre|center|centrepiece|centerpiece)\s+of\s+(?:\w+\s+){0,2}?(?:treatment|care|management|rehab\w*|therapy|recovery|programme|program|plan|guidelines?|protocols?|approach)|standard\s+of\s+care|treatment\s+of\s+choice|first[\s-]line\b)`, 'gi');
const FOUND_REV = new RegExp(String.raw`\b(?:the\s+)?(?:main|primary|core|first[\s-]line|key|central|principal|mainstay|cornerstone|foundation|recommended|best(?:-studied)?|most\s+effective|definitive|gold[\s-]standard|standard|preferred)\s+(?:[\w-]+\s+)?(?:treatment|therapy|intervention|approach|management|option|care)s?\b[^.;:]{0,60}?\b(?:is|are|remains?|consists?\s+of|involves?|includes?|relies\s+on|is\s+based\s+on)\s+(?:still\s+)?(?:a\s+|an\s+|the\s+)?(?:[\w-]+\s+){0,3}?(?:${COMPETE_SRC})\b`, 'gi');
// "exercise is essential / non-negotiable" — only as a contrast with PEMF in the same sentence (exercise is good health advice)
const ESSENTIAL = /\b(?:is|are|remains?|stays?)\s+(?:still\s+|absolutely\s+|always\s+|truly\s+)?(?:essential|non-negotiable|indispensable|irreplaceable|mandatory|a\s+must|vital|crucial|the\s+priority|what\s+matters(?:\s+most)?)\b/gi;
// "the physiotherapy they already receive", "patients already in physio" — the third-person form of his rejected clause
const THEY_ALREADY = new RegExp(String.raw`\b(?:patients|people|clients|those|anyone|someone|athletes|runners|women|men)\s+(?:who\s+are\s+)?(?:already|currently)\s+(?:in|doing|receiving|getting|on|attending|undergoing|following)\s+(?:a\s+|an\s+|their\s+|the\s+)?(?:\w+\s+)?(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*)\b|\b(?:physio\w*|physical\s+therap\w*|exercis\w*|rehab\w*|programme|program|treatment|therapy)\s+(?:that\s+|which\s+)?(?:they|patients|people|clients)\s+(?:already|currently)\s+(?:receive|do|get|follow|attend|have)\b`, 'gi');
// "the real work is done by your exercises", "the key to recovery is exercise"
const FOUND_REV3 = new RegExp(String.raw`\bthe\s+(?:real|actual|hard|main|heavy)\s+(?:work|lifting)\s+is\s+(?:done|carried)\s+by\s+(?:the\s+|your\s+)?(?:[\w-]+\s+)?(?:${COMPETE_SRC})\b|\bthe\s+key\s+to\s+(?:\w+\s+){0,3}?(?:is|are|remains?)\s+(?:still\s+)?(?:the\s+|a\s+|an\s+|your\s+)?(?:[\w-]+\s+){0,2}?(?:${COMPETE_SRC})\b`, 'gi');
// "The core of rehab is exercise" — the same sentence with the subject after the verb
const FOUND_REV2 = new RegExp(String.raw`\bthe\s+(?:core|heart|basis|base|centre|center|centrepiece|centerpiece|backbone|mainstay|cornerstone|foundation|bedrock|bulk|key|main\s+part)\s+of\s+(?:\w+\s+){0,3}?(?:is|are|remains?)\s+(?:still\s+)?(?:the\s+|a\s+|an\s+|your\s+)?(?:[\w-]+\s+){0,2}?(?:${COMPETE_SRC})\b`, 'gi');
const FOUND_VERB = new RegExp([
  String.raw`\b(?:comes?|goes|come)\s+first\b`,
  String.raw`\b(?:do|does|doing)\s+(?:the\s+|most\s+of\s+the\s+|all\s+the\s+)?(?:heavy\s+lifting|real\s+work|actual\s+work|hard\s+work)\b`,
  String.raw`\b(?:is|are)\s+what\s+(?:actually\s+|really\s+|truly\s+|ultimately\s+)?(?:heals?|rebuilds?|fixes|repairs?|restores?|cures?|resolves?|strengthens?|makes\s+the\s+(?:real\s+)?difference|drives?\s+(?:recovery|healing|improvement)|produces?\s+the\s+(?:real\s+|lasting\s+)?(?:change|result|improvement))\b`,
  String.raw`\bnothing\s+(?:can\s+|will\s+|ever\s+)?replaces?\b`,
  String.raw`\b(?:do|does|doing)\s+the\s+work\b|\btreats?\s+the\s+(?:root\s+|real\s+|underlying\s+)?cause\b`,
  String.raw`\b(?:remains?|stays?|is|are|sits?)\s+(?:firmly\s+)?(?:at|in)\s+the\s+(?:centre|center|heart|core)\s+of\s+(?:the\s+|your\s+)?(?:care|treatment|rehab\w*|recovery|management|programme|program|plan)\b`,
  String.raw`\b(?:is|are)\s+the\s+only\s+(?:component|element|part|ingredient|thing|piece)\s+(?:with|that)\b`,
  String.raw`\b(?:physio\w*|physical\s+therap\w*|exercise|rehab\w*|surgeon|surgery|medication|drug|pharmacolog\w*)-led\b`,
  String.raw`\b(?:long-term\s+|lasting\s+|real\s+)?(?:success|results?|recovery|outcomes?|improvement)\s+(?:depends?|relies?|rests?|hinges?)\s+(?:mainly\s+|mostly\s+|chiefly\s+|largely\s+)?on\b[^.;]{0,40}?\b(?:${COMPETE_SRC})\b`,
  String.raw`\b(?:places?|puts?|ranks?)\s+(?:the\s+)?(?:[\w-]+\s+){0,3}?(?:${COMPETE_SRC})\s+(?:care\s+|therapy\s+|programmes?\s+)?first\b`,
  String.raw`\b(?:leads?|drives?|steers?)\s+(?:the\s+)?(?:treatment|recovery|rehab\w*|healing|plan|programme|program|process|care)\b|\b(?:is|are)\s+in\s+(?:the\s+lead|charge)\b|\btakes?\s+the\s+lead\b`,
].join('|'), 'gi');
const CLEFT = new RegExp(String.raw`\bit\s+is\s+(?:the\s+|your\s+)?(?:${COMPETE_SRC})\b[^.;]{0,25}?\bthat\s+(?:actually\s+|really\s+|ultimately\s+)?(?:rebuilds?|heals?|fix(?:es)?|repairs?|restores?|cures?|does\s+the|drives?|makes\s+the)`, 'gi');
// Yaki's pivot: "the accepted treatment is based on graded exercise, BUT … your body needs a technological push"
const PIVOT_AFTER = /\b(?:but|however|yet)\b[^.]*?(?:PEMF|PainFree|pulses?|technolog\w*|push|missing\s+piece|needs?\b)/i;

// ── named clinicians ───────────────────────────────────────────────────────────────────────────────────────────────
const NAMED_CLINICIANS = /\bZeilig\b|\bGrotto\b|\bGinzburg\b|\bSavion\b|\bKarasso\b|\bGiora\s+Mor\b/;
// Their signed pages (the whole page is his text; his name is on it). A listed sentence is exempt there with no
// adjacent attribution — the page must still carry his name, or nothing is exempt.
const SIGNED_PAGES = {
  'letter-zeilig.html': /\bZeilig\b/,
  'article-pemf-professor-zeilig-review.html': /\bZeilig\b/,
  'article-pemf-zeilig-review-2026.html': /\bZeilig\b/,
  'article-pemf-resolution-of-inflammation.html': /\bGiora\s+Mor\b/,
};
// Exact sentences of a named clinician's signed text — one global list (English mirror of tsc QUOTE_ALLOW). Exempt only
// with an attribution naming him in the same/adjacent unit, or on his own signed page. Printed on every run.
const EN_QUOTE_ALLOW = [
  'It is most commonly offered as a complementary therapy alongside other treatments such as physiotherapy.',
  '1987: FDA approved PEMF for adjunct therapy for treating post-operative edema and pain',
  '2004: PEMF approved as an adjunct to cervical fusion surgery',
  "While large-scale neurological rehabilitation RCTs are still emerging, PEMF's established safety profile and multi-mechanism activity support its use as a complementary modality in neurological settings.",
  "miniaturization advances (including wearable PEMF devices) extend the technology's reach into home-based maintenance treatment, complementing clinical sessions",
  'Mental health adjunct: anxiety and sleep disorders',
  'The PEMF evidence base has expanded substantially since the early FDA clearances (1979 for non-union bone fracture; 1998 for adjunct cervical fusion; 2004 for surgical pain; 2006 for depression).',
  'Grade A indications should be offered PEMF as first-line adjunct alongside physiotherapy — not as a last resort after treatment failure.',
  'Grade B indications warrant PEMF as adjunct therapy after one failed conservative attempt; evidence does not support PEMF as sole therapy for these categories.',
  'The Grade A evidence establishes meaningful pain and function improvement as an adjunct — not as a replacement for active rehabilitation.',
  'clinics should position PEMF as a modality amplifier, not a standalone treatment.',
  'From my perspective as a practitioner, the meeting between new scientific research and this systemic view does not replace science',
];
// Exact titles of published papers cited in a reference list — BLANKED inside the sentence, the rest is graded. Printed.
const EN_CITATION_ALLOW = [
  'Clinical effectiveness of PEMF therapy as an adjunct treatment to eccentric exercise for Achilles tendinopathy',
  'PEMF as Adjunctive Treatment Following Surgical Repair of Full Thickness Rotator Cuff Tears', // UCSF trial (ClinicalTrials.gov)
  'Pulsed electromagnetic fields: an adjunct to interbody spinal fusion surgery in the high risk patient',
];

// ── text extraction ────────────────────────────────────────────────────────────────────────────────────────────────
const NAMED = { nbsp: ' ', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', quot: '"', apos: "'", amp: '&', lt: '<', gt: '>', hellip: '…', middot: '·', bull: '•', rarr: '→', larr: '←', times: '×', deg: '°', copy: '©', reg: '®', trade: '™', le: '≤', ge: '≥', plusmn: '±', minus: '−', shy: '', laquo: '«', raquo: '»', hyphen: '‐', dash: '‐', nbhy: '‑' };
function decode(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch (e) { return ' '; } })
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(Number(d)); } catch (e) { return ' '; } })
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in NAMED ? NAMED[n.toLowerCase()] : ' '));
}
/** Hyphen look-alikes → '-', an unspaced dash between letters ("add—on") → '-', invisible characters removed. */
const normText = s => String(s)
  .replace(/[­​-‍⁠﻿]/g, '')
  .replace(/[‐‑‒−﹣－]/g, '-')
  .replace(/(?<=[A-Za-z])[–—―](?=[A-Za-z])/g, '-')
  .replace(/ /g, ' ');
// A tag, with '>' allowed inside quoted attribute values.
const TAG_SRC = String.raw`<\/?[A-Za-z][^\s>\/]*(?:[^>"']|"[^"]*"|'[^']*')*>`;
const TAG_G = new RegExp(TAG_SRC, 'g');
const INLINE_G = new RegExp(String.raw`<\/?(?:span|em|strong|b|i|a|mark|sup|sub|small|u|abbr|code|q|cite|time|font|ins|del|s|var|dfn|kbd|samp|bdi|bdo|wbr)\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');
const clean = s => normText(decode(String(s).replace(INLINE_G, '').replace(TAG_G, ' '))).replace(/\s+/g, ' ').trim();
function attrsOf(tag) {
  const out = {};
  for (const m of String(tag).matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) out[m[1].toLowerCase()] = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
  return out;
}
const META_KEY = /^(?:description|keywords|og:(?:title|description)|twitter:(?:title|description)|headline|name|abstract|text|about|alternativeheadline|title|dc\.(?:title|description)|citation_title|summary)$/i;
const LD_SKIP = /^(?:@id|@context|@type|url|image|logo|sameAs|contentUrl|thumbnailUrl|embedUrl|uploadDate|datePublished|dateModified|dateCreated|email|telephone|faxNumber|inLanguage|encodingFormat|duration|isAccessibleForFree|identifier|license|priceCurrency|price|availability|width|height|postalCode|addressCountry|latitude|longitude|ratingValue|bestRating|worstRating|reviewCount|ratingCount|validFrom|startDate|endDate)$/i;

/** Parse a page into ordered units + head surfaces. Units: {t:'h', level, text} | {t:'u', text, li?, cell?, quote?}. */
function parse(html) {
  let src = String(html || '').replace(/<!--[\s\S]*?-->/g, ' ');
  const head = []; const ldErrors = [];
  const headPart = (src.match(/<head\b[\s\S]*?<\/head>/i) || [''])[0];
  const t = headPart.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || (!headPart && src.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i));
  if (t) head.push({ surface: 'title', text: clean(t[1]) });
  // every <meta> on the page (head or body), attribute-aware ('>' inside content="…" is fine)
  for (const m of src.matchAll(new RegExp(String.raw`<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi'))) {
    const a = attrsOf(m[0]); const key = (a.name || a.property || a.itemprop || '').toLowerCase();
    if (META_KEY.test(key) && a.content) head.push({ surface: 'meta:' + key, text: clean(a.content) });
  }
  // JSON-LD: any type attribute spelling (quoted, single-quoted or unquoted); every string value except ids/urls/dates
  src = src.replace(new RegExp(String.raw`(<script\b(?:[^>"']|"[^"]*"|'[^']*')*>)([\s\S]*?)<\/script\s*>`, 'gi'), (all, open, body) => {
    const a = attrsOf(open);
    if (!/application\/ld\+json/i.test(a.type || '')) return ' ';
    let data; try { data = JSON.parse(body); } catch (e) { ldErrors.push(String(e.message).slice(0, 120)); return ' '; }
    const walk = (v, key, type) => {
      if (Array.isArray(v)) return v.forEach(x => walk(x, key, type));
      if (v && typeof v === 'object') { const ty = v['@type'] || type; for (const [k, x] of Object.entries(v)) walk(x, k, ty); return; }
      if (typeof v !== 'string' || LD_SKIP.test(key || '')) return;
      const s = v.trim(); if (!s || /^(?:https?:|mailto:|tel:|\/|#|data:)/i.test(s) || /^\d{4}-\d{2}-\d{2}/.test(s)) return;
      head.push({ surface: `jsonld:${[].concat(type || 'Thing').join('/')}.${key}`, text: clean(s) });
    };
    walk(data, null, null);
    return ' ';
  });
  let b = src.replace(/<head\b[\s\S]*?<\/head>/i, ' ').replace(/<(style|svg|template|iframe|object)\b[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<\/?noscript\b[^>]*>/gi, ' ');
  // alt / title / aria-label attributes (an img alt is read by Google and every AI engine)
  const attrs = [];
  for (const m of b.matchAll(TAG_G)) {
    if (/^<\//.test(m[0])) continue;
    const a = attrsOf(m[0]);
    for (const k of ['alt', 'title', 'aria-label']) if (a[k] && /[A-Za-z]{3}/.test(a[k])) attrs.push({ surface: 'attr:' + k, text: clean(a[k]) });
  }
  // inline tags vanish without a space ("ad<span>junct</span>" is one word)
  b = b.replace(INLINE_G, '');
  const tables = [];
  b = b.replace(/<table\b[\s\S]*?<\/table\s*>/gi, tb => {
    const ti = tables.length; const rows = [];
    for (const rm of tb.matchAll(/<tr\b[\s\S]*?<\/tr\s*>/gi)) rows.push([...rm[0].matchAll(/<t([hd])\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/t\1\s*>/gi)].map(c => clean(c[2])));
    tables.push(rows);
    let s = '\u0004';
    const cap = tb.match(/<caption\b[^>]*>([\s\S]*?)<\/caption>/i); if (cap) s += clean(cap[1]) + '\u0004';
    rows.forEach((r, ri) => r.forEach((c, ci) => { s += `\u0001C${ti}|${ri}|${ci}\u0002${c.replace(/[\u0001-\u0007]/g, ' ')}\u0003\u0004`; }));
    return s;
  });
  b = b.replace(/<h([1-6])\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/h\1\s*>/gi, (m, l, inner) => `\u0004\u0001H${l}\u0002${clean(inner).replace(/[\u0001-\u0007]/g, ' ')}\u0003\u0004`);
  b = b.replace(/<summary\b[^>]*>([\s\S]*?)<\/summary\s*>/gi, (m, inner) => `\u0004\u0001H5\u0002${clean(inner).replace(/[\u0001-\u0007]/g, ' ')}\u0003\u0004`);
  b = b.replace(/<blockquote\b[^>]*>/gi, '\u0004\u0005').replace(/<\/blockquote\s*>/gi, '\u0004\u0007');
  b = b.replace(/<li\b[^>]*>/gi, '\u0004\u0006');
  b = b.replace(/<\/(?:p|li|div|dd|dt|ul|ol|section|article|figure|figcaption|header|footer|nav|aside|details|main|form|label|button|caption)\s*>|<br\s*\/?>|<hr\b[^>]*>|<(?:p|div|ul|ol|section|article|figure|figcaption|dd|dt|details|nav|aside|header|footer|main|form|button)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, '\u0004');
  b = b.replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ');
  b = decode(b.replace(TAG_G, ' '));
  const units = []; let buf = ''; let li = false; let quote = 0;
  const flush = () => { const x = normText(buf).replace(/\s+/g, ' ').trim(); if (x) units.push({ t: 'u', text: x, li, quote: quote > 0 }); buf = ''; li = false; };
  const re = /\u0004|\u0005|\u0006|\u0007|\u0001H(\d)\u0002([^\u0003]*)\u0003|\u0001C(\d+)\|(\d+)\|(\d+)\u0002([^\u0003]*)\u0003/g;
  let m, last = 0;
  while ((m = re.exec(b))) {
    buf += b.slice(last, m.index); last = re.lastIndex;
    const tok = m[0];
    if (tok === '\u0004') flush();
    else if (tok === '\u0005') { flush(); quote++; }
    else if (tok === '\u0007') { flush(); quote = Math.max(0, quote - 1); }
    else if (tok === '\u0006') { flush(); li = true; }
    else if (m[1]) { flush(); const x = normText(m[2]).replace(/\s+/g, ' ').trim(); if (x) units.push({ t: 'h', level: +m[1], text: x }); }
    else { flush(); const x = normText(m[6]).replace(/\s+/g, ' ').trim(); if (x) units.push({ t: 'u', text: x, cell: { ti: +m[3], ri: +m[4], ci: +m[5] } }); }
  }
  buf += b.slice(last); flush();
  return { head, attrs, units, tables, ldErrors };
}

const sentencesOf = text => String(text).split(/(?<=[.!?…])["”’)]?\s+(?=["“‘(]?[A-Z0-9₱])|(?<=\?)["”’)]?\s+(?=[a-z])|\s+[•·]\s+/).map(s => s.trim()).filter(Boolean);

// ── grading helpers ────────────────────────────────────────────────────────────────────────────────────────────────
const CLAUSE_BREAK = /[;:()]|\s[—–-]\s|,\s+(?:but|while|whereas|and\s+(?=PEMF|the\s+pulses|it\b))\b/g;
// A parenthetical is an aside, not a clause: "physiotherapy (graded mobilisation, strength work) remains the primary
// modality" — its subject is still physiotherapy. Parentheticals are blanked (same length, indices kept).
const blankParens = s => String(s).replace(/\([^()]*\)/g, m => ' '.repeat(m.length));
function clauseStart(s, idx) { const t = blankParens(s); let st = 0; CLAUSE_BREAK.lastIndex = 0; let m; while ((m = CLAUSE_BREAK.exec(t)) && m.index < idx) st = m.index + m[0].length; return st; }
/** Is this phrase about PEMF? strict = PEMF must be named (or a pronoun after a PEMF sentence); loose = the page default
 *  applies when nothing is named. Another modality as the subject of the clause → false either way. */
function aboutAt(s, idx, ctx, loose, matchText) {
  const cl = blankParens(s).slice(clauseStart(s, idx), idx);
  if (PEMF_WORD.test(cl) || (matchText && PEMF_WORD.test(matchText))) return true;
  OTHER_G.lastIndex = 0; if (OTHER_G.test(cl)) return false;
  // nothing named in this clause: the nearest named thing earlier in the sentence decides ("taping …, but it does not …")
  const left = s.slice(0, idx); let lastO = -1, lastP = -1, m;
  OTHER_G.lastIndex = 0; while ((m = OTHER_G.exec(left))) lastO = m.index;
  PEMF_G.lastIndex = 0; while ((m = PEMF_G.exec(left))) lastP = m.index;
  if (lastP >= 0 || lastO >= 0) return lastP > lastO;
  if (PEMF_WORD.test(s)) return true;
  if (PRONOUN.test(s) && PEMF_WORD.test(ctx || '')) return true;
  return !!loose;
}
// A named evaluation/referral is not a treatment ("surgical referral comes first" is a red-flag line).
const NOT_A_TREATMENT_AFTER = /^\s*(?:evaluation|referral|assessment|opinion|consultation|consult|review|clearance|team|work-?up|imaging|diagnosis)\b/i;
const PSYCH = /^(?:psycholog\w*|psychotherap\w*|CBT(?:-I)?|counsel\w*)$/i;
/** The nearest named thing left of idx in its clause is another option (physio, exercise, surgery …), not PEMF.
 *  Psychological care as the first-line for a mental-health condition is an honesty line (tsc: subj === 'psych'). */
function competeSubject(s, idx, ctx) {
  let cl = blankParens(s).slice(clauseStart(s, idx), idx);
  // a pronoun subject takes its antecedent from earlier in the same sentence ("PEMF changes this: it is …"), else the
  // previous sentence ("Manual therapy … This is the best-supported layer")
  if (!PEMF_WORD.test(cl) && !COMPETE.test(cl) && /^\s*(?:this|it|they|these|that)\b/i.test(cl)) {
    const before = s.slice(0, clauseStart(s, idx));
    cl = (PEMF_WORD.test(before) || COMPETE.test(before) ? before : String(ctx || '').split(/[;:]/).pop()) + ' ' + cl;
  }
  if (/\bcombin\w*\s+(?:it|them|PEMF|the\s+pulses)\b/i.test(cl)) return false;    // "combining PEMF with exercise is …"
  let lastC = null, lastP = -1, m;
  COMPETE_G.lastIndex = 0; while ((m = COMPETE_G.exec(cl))) if (!NOT_A_TREATMENT_AFTER.test(cl.slice(m.index + m[0].length)) && !/non-$/i.test(cl.slice(Math.max(0, m.index - 4), m.index)) && !/^-free/i.test(cl.slice(m.index + m[0].length))) lastC = m;
  PEMF_G.lastIndex = 0; while ((m = PEMF_G.exec(cl))) lastP = m.index;
  if (!lastC || lastC.index < lastP) return false;
  if (PSYCH.test(lastC[0]) || /\bsleep\s+hygiene\b/i.test(cl)) return false;
  return true;
}
const isQuestion = s => /\?\s*["”’)]?\s*$/.test(s);
// burden / pain-loop words: "the standard pathway involves repeat surgery … costly … morbidity" describes the problem
const BURDEN = /\b(?:costly|costs?|morbidity|risks?|side[\s-]effects?|fail\w*|falls?\s+short|plateau\w*|limited|insufficient|inadequate|disappoint\w*|frustrat\w*|only\s+mask\w*|temporar\w+|wears?\s+off|invasive)\b/i;

// ── grading ────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Flags for one sentence. ctx = the text before it (pronoun reference); o.row = a table row's text; o.loose = page
 *  default "this page is about PEMF" (every painfreeph.com page). */
function gradeSentence(s, ctx, o) {
  o = (o && typeof o === 'object') ? o : { row: o };
  const loose = o.loose !== false;
  const flags = []; let m;
  const q = isQuestion(s);
  if (!q) {
    for (const re of STRONG) { re.lastIndex = 0; while ((m = re.exec(s))) {
      if (re === STRONG[2]) {
        const after = s.slice(m.index + m[0].length, m.index + m[0].length + 25);
        if (/\b(?:medical|medication|drug|doctor|neurolog\w*|oncolog\w*|psychiatr\w*|cancer|insulin|pharmacolog\w*|hypoglyc\w*)\b/i.test(m[0] + after)) continue; // a doctor's drug care stays (safety)
        if (/^\s*(?:teams?|providers?|staff|services|clinics?|departments?|practices?)\b/i.test(after)) continue;                  // B2B: "existing care teams"
        if (/\b(?:clinic|practice|centre|center|business)s?\s+(?:adds?|integrates?|introduces?)\b/i.test(s.slice(0, m.index))) continue; // B2B: "a clinic adds a system alongside an existing treatment"
        if (studyArm(s)) continue;                                                                                             // a trial arm: "PEMF added to standard care (n=38)"
      }
      flags.push({ kind: 'STRONG', match: m[0] });
    } }
    TOGETHER.lastIndex = 0;
    while ((m = TOGETHER.exec(s))) {
      const left = s.slice(0, m.index);
      const opens = !/[A-Za-z]/.test(left);
      if (opens || AWAITS.test(left) || !PEMF_WORD.test(left) && !/\b(?:method|technology|treatment|pulses)\b/i.test(left)) flags.push({ kind: 'STRONG', match: m[0] });
    }
    PHYS_ALREADY.lastIndex = 0;
    while ((m = PHYS_ALREADY.exec(s))) {
      if (/\btogether\s+with\b|\baccompanied\s+by\b/i.test(s) && !AWAITS.test(s)) continue;           // his בליווי
      if (/\b(?:interfer\w*|interact\w*|conflict\w*|compatib\w*|stop\w*|paus\w*|chang\w*|tell|inform|discuss)\b/i.test(s.slice(Math.max(0, m.index - 40), m.index))) continue; // safety: "does not interfere with your current treatment"
      if (MED_WORDS.test(m[0] + s.slice(m.index + m[0].length, m.index + m[0].length + 25)) || studyArm(s) || CLINIC_SUBJ.test(s.slice(0, m.index)) || !aboutAt(s, m.index, ctx, loose, m[0])) continue;
      if (flags.some(f => f.kind === 'STRONG')) continue;
      flags.push({ kind: 'STRONG', match: m[0] });
    }
    SIDE_BY_SIDE.lastIndex = 0;
    while ((m = SIDE_BY_SIDE.exec(s))) {
      if (studyArm(s) || OPERATIONAL.test(s) || B2B_OBJ.test(s.slice(m.index + m[0].length)) || !aboutAt(s, m.index, ctx, loose)) continue;
      flags.push({ kind: 'ADDITION', match: m[0] });
    }
    ALONGSIDE.lastIndex = 0;
    while ((m = ALONGSIDE.exec(s))) {
      const left = s.slice(0, m.index);
      const yakiForm = (/\b(?:working|works|that\s+works|which\s+works|operating)\s+$/i.test(left) && /^alongside\s+your\s+/i.test(m[0]) && PEMF_WORD.test(left)) ||
        // his 1696 "בליווי … שאתם כבר רגילים לעשות" rendered with "alongside": "…you are already used to doing", PEMF-first
        (/^[^.;]{0,70}?\byou(?:['’]re|\s+are)\s+(?:already\s+)?used\s+to\b/i.test(s.slice(m.index)) && /\b(?:PEMF|PainFree|method|technology|pulses)\b/i.test(left));
      if (yakiForm || studyArm(s) || OPERATIONAL.test(s) || B2B_OBJ.test(s.slice(m.index + m[0].length)) || !aboutAt(s, m.index, ctx, loose)) continue;
      flags.push({ kind: 'ADDITION', match: m[0] });
    }
    JOINS.lastIndex = 0;
    while ((m = JOINS.exec(s))) {
      const after = s.slice(m.index + m[0].length, m.index + m[0].length + 40);
      if (studyArm(s) || OPERATIONAL.test(s) || MED_WORDS.test(m[0] + after) || B2B_OBJ.test(after) || CLINIC_SUBJ.test(s.slice(clauseStart(s, m.index), m.index)) || /\b(?:clinic|practice|centre|center|service|business|market)\w*\b/i.test(m[0]) || !aboutAt(s, m.index, ctx, loose, m[0])) continue;
      flags.push({ kind: 'PLAN', match: m[0] });
    }
    if (!ENABLER.test(s)) {
      NEGATION.lastIndex = 0;
      while ((m = NEGATION.exec(s))) {
        const after = s.slice(m.index + m[0].length).split(/[;:.!?]|\s[—–]\s|,\s+(?:but|and|or)\b|\s(?:but|and\s+(?:it|is|does|PEMF))\b/)[0];
        const pronounObj = /\b(?:it|them|its|their|his|her)\b(?:\s+place)?$/i.test(m[0]) || /^\s*(?:it|them)\b/i.test(after);
        const obj = pronounObj ? s.slice(Math.max(0, m.index - 140), m.index) : after;
        const lastClause = obj.split(/[;:.!?]/).pop();
        const safe = pronounObj ? new RegExp(SAFE_OBJ.source.replace(/^\^/, '\\b'), 'i').test(lastClause) && !COMPETE.test(lastClause)
          : SAFE_OBJ.test(after) && !SAFE_SPOIL.test(after.slice(0, 80));
        if (!safe) flags.push({ kind: 'NEGATION', match: m[0] + (pronounObj ? '' : after.slice(0, 40)) });
      }
    }
  }
  // LABEL (never exempted by a safety context; a heading question still plants the frame, so questions are graded)
  LABEL.lastIndex = 0;
  const journals = [...s.matchAll(JOURNAL)].map(j => [j.index, j.index + j[0].length]);
  while ((m = LABEL.exec(s))) {
    if (journals.some(([a, b]) => m.index >= a && m.index < b)) continue;
    if (s[m.index - 1] === '-' && /^support/i.test(m[0])) continue; // "Fusion-Support Options" — a compound noun
    if (/^(?:second[\s-]line|backup|back-up|optional)/i.test(m[0]) && !aboutAt(s, m.index, ctx, false)) continue; // drug ladders
    if (/^complement$/i.test(m[0]) && /\b(?:downstream|upstream|block\w*|inhibit\w*|activat\w*|levels?)\s+(?:of\s+)?(?:the\s+)?$/i.test(s.slice(Math.max(0, m.index - 30), m.index))) continue;
    if (/^complementar/i.test(m[0]) && /\b(?:mechanisms?|actions?|pathways?|effects?|modes of action)\s+(?:are|is|were|being|remain)?\s*(?:fully |highly |largely |genuinely |truly )?$/i.test(s.slice(Math.max(0, m.index - 50), m.index))) continue;
    if (/(?:layer|tier)s?$/i.test(m[0]) && /\b(?:revenue|income|profit|business|service|billing|pricing)\b/i.test(m[0] + s.slice(m.index + m[0].length, m.index + m[0].length + 30))) continue; // B2B: "a second revenue layer"
    const tail = s.slice(m.index, m.index + 70);
    if (LABEL_TERM.test(tail)) {
      if (/^complementary\s*(?:and|\/|&)\s*alternative|^complementary\s+medicine\s+(?:uptake|use|utili)/i.test(tail) && !CAM_CTX.test(s)) { /* CAM as our positioning → still a flag */ }
      else continue;
    }
    flags.push({ kind: 'LABEL', match: m[0] });
  }
  LABEL_STRICT.lastIndex = 0;
  while ((m = LABEL_STRICT.exec(s))) { if (/\b(?:revenue|income|profit|business|billing|marketing|referral)\b/i.test(m[0])) continue; if (aboutAt(s, m.index, ctx, false)) flags.push({ kind: 'LABEL', match: m[0] }); }
  if (!q) {
    // FOUNDATION — the cornerstone family (window rule) …
    FOUND.lastIndex = 0;
    while ((m = FOUND.exec(s))) {
      if (/^Foundation/.test(m[0]) && /[A-Z][\w&/.-]*\s+$/.test(s.slice(Math.max(0, m.index - 30), m.index))) continue; // "Arthritis Foundation"
      const win = s.slice(Math.max(0, m.index - 110), m.index + m[0].length + 60);
      if (!COMPETE.test(win) && !(o.row && !PEMF_FOUND.test(win) && COMPETE.test(o.row.replace(s, ' ')))) continue;
      if (PEMF_FOUND.test(win) && !COMPETE.test(s.slice(Math.max(0, m.index - 40), m.index))) continue; // PEMF is the foundation
      flags.push({ kind: 'FOUNDATION', match: m[0] });
    }
    // … and its synonyms, predicated of another option ("Physiotherapy is the first-line treatment")
    const pivot = i => PIVOT_AFTER.test(s.slice(i));
    FOUND2.lastIndex = 0;
    while ((m = FOUND2.exec(s))) if (competeSubject(s, m.index, ctx) && !pivot(m.index) && !BURDEN.test(s)) flags.push({ kind: 'FOUNDATION', match: m[0] });
    for (const RE of [FOUND_REV, FOUND_REV2, FOUND_REV3]) {
    RE.lastIndex = 0;
    while ((m = RE.exec(s))) {
      if (PEMF_WORD.test(m[0]) || pivot(m.index) || BURDEN.test(s)) continue;
      flags.push({ kind: 'FOUNDATION', match: m[0] });
    }
    }
    FOUND_VERB.lastIndex = 0;
    while ((m = FOUND_VERB.exec(s))) {
      if (/^(?:leads?|drives?)\s+to\b/i.test(m[0])) continue;
      if (/^(?:places?|puts?|ranks?)\b|-led$|\bon\b/i.test(m[0]) ? !pivot(m.index) : (competeSubject(s, m.index, ctx) && !pivot(m.index))) flags.push({ kind: 'FOUNDATION', match: m[0] });
    }
    CLEFT.lastIndex = 0; while ((m = CLEFT.exec(s))) flags.push({ kind: 'FOUNDATION', match: m[0] });
    ESSENTIAL.lastIndex = 0;
    while ((m = ESSENTIAL.exec(s))) if (PEMF_WORD.test(s) && competeSubject(s, m.index, ctx) && !pivot(m.index)) flags.push({ kind: 'FOUNDATION', match: m[0] });
    THEY_ALREADY.lastIndex = 0;
    while ((m = THEY_ALREADY.exec(s))) {
      if (/\btogether\s+with\b|\baccompanied\s+by\b/i.test(s) || studyArm(s) || MED_WORDS.test(s.slice(m.index, m.index + m[0].length + 25)) || !aboutAt(s, m.index, ctx, loose, m[0])) continue;
      flags.push({ kind: 'STRONG', match: m[0] });
    }
    // PLAN / ADDITION — PEMF (named, or by page default) is what is being placed inside someone else's plan
    for (const RE of [PLAN, STANDALONE]) {
      RE.lastIndex = 0;
      while ((m = RE.exec(s))) {
        if (!aboutAt(s, m.index, ctx, loose, m[0])) continue;
        if (RE === STANDALONE && studyArm(s)) continue;
        if (/either\s+(?:one\s+|treatment\s+)?alone$/i.test(m[0]) && !PEMF_WORD.test(s)) continue;
        flags.push({ kind: 'PLAN', match: m[0] });
      }
    }
    PLAN_STRICT.lastIndex = 0;
    while ((m = PLAN_STRICT.exec(s))) if (aboutAt(s, m.index, ctx, false) && PEMF_WORD.test(s.slice(clauseStart(s, m.index), m.index) + ' ' + (PRONOUN.test(s.slice(clauseStart(s, m.index), m.index)) ? ctx || '' : ''))) flags.push({ kind: 'PLAN', match: m[0] });
    ADDITION.lastIndex = 0;
    while ((m = ADDITION.exec(s))) {
      if (!aboutAt(s, m.index, ctx, loose, m[0])) continue;
      const rest = s.slice(m.index + m[0].length);
      if (/addition\s+to$/i.test(m[0]) && (B2B_OBJ.test(rest) || PEMF_WORD.test(rest.slice(0, 40)))) continue; // "addition to any clinic", "added to PEMF"
      if (/\b(?:physio\w*|treatment|therapy|care|programme|program|rehab\w*)$/i.test(m[0]) && B2B_OBJ.test(rest)) continue; // "adding PEMF to a physiotherapy clinic"
      if (/^(?:an?\s+)(?:[\w-]+\s+)?addition$/i.test(m[0]) && B2B_OBJ.test(rest.replace(/^\s*(?:for|in)\b/i, ''))) continue;
      if (!/^(?:optional|nice|bonus|sits?|goes|comes|layered|placed|stacked|PEMF|it|the|you|patients|another|an\s+additional|add)\b/i.test(m[0]) && studyArm(s)) continue; // a measured trial arm
      flags.push({ kind: 'ADDITION', match: m[0] });
    }
  }
  return flags;
}

// ── structure: NO_PEMF / PEMF_LAST / PEMF_LATE (port of treatment-section-check grade()) ─────────────────────────────
const KINDS = {
  physio: String.raw`physiotherap(?:y|ies)\b|\bphysio\b(?!therapist)|physical\s+therap(?:y|ies)\b`,
  exercise: String.raw`exercis\w*|stretch(?:es|ing)\b|strengthening|(?<!load\s)loading\s+(?:programme|program|exercises?)|eccentric|isometric|heel[\s-]drops?|resistance\s+training|pilates|yoga|tai\s+chi|hydrotherapy|aquatic\s+therapy|graded\s+activity|McKenzie|pelvic\s+floor\s+(?:muscle\s+)?training`,
  injection: String.raw`injections?\b|hyaluronic|viscosupplement\w*|\bPRP\b|platelet-rich|prolotherapy|botox|botulinum`,
  drugs: String.raw`medications?\b|\bdrugs?\b|NSAIDs?|ibuprofen|naproxen|paracetamol|acetaminophen|opioids?|analgesics?|painkillers?|pain\s+relievers?|gabapentin|pregabalin|duloxetine|amitriptyline|antidepressants?|anticonvulsants?|muscle\s+relaxants?|antibiotics?|DMARDs?|levodopa|triptans?|bisphosphonates?`,
  surgery: String.raw`surgery|surgical|\boperation\b|arthroscop\w*|arthroplasty|decompression|tenotomy|debridement`,
  steroid: String.raw`steroids?\b|corticosteroids?|cortisone`,
  shockwave: String.raw`shock\s?wave|ESWT`,
  acupuncture: String.raw`acupuncture|dry\s+needling`,
  manual: String.raw`chiropract\w*|spinal\s+manipulation|manipulation|osteopath\w*|mobili[sz]ation|manual\s+therap\w*`,
  massage: String.raw`massage|myofascial\s+release|lymphatic\s+drainage|\bMLD\b`,
  orthotics: String.raw`orthotics?|orthoses|insoles?|heel\s+lifts?|splints?|splinting|braces?\b|bracing|kinesio\w*|taping|compression\s+(?:garments?|stockings?|bandag\w*|sleeves?)|crutches|night\s+splints?`,
  laser: String.raw`laser|LLLT|photobiomodulation`,
  tens: String.raw`\bTENS\b|electrical\s+(?:nerve\s+)?stimulation|electrotherapy|interferential`,
  ultrasound: String.raw`therapeutic\s+ultrasound|ultrasound\s+therapy`,
  rest: String.raw`\bRICE\b|\bPRICE\b|\bPOLICE\b|ice\s+packs?|icing|cryotherapy|heat\s+therapy|activity\s+modification|load\s+management|relative\s+rest`,
  weight: String.raw`weight\s+loss|los(?:e|ing)\s+(?:some\s+)?weight|weight\s+management`,
  psych: String.raw`\bCBT(?:-I)?\b|cognitive\s+behaviou?ral|psychotherap\w*|counsel+ing|mindfulness|sleep\s+hygiene|pain\s+(?:neuroscience\s+)?education|patient\s+education`,
  rf: String.raw`radiofrequency|nerve\s+ablation|RF\s+ablation`,
  block: String.raw`nerve\s+blocks?|epidurals?\b|facet\s+(?:injections?|blocks?)`,
  neuromod: String.raw`spinal\s+cord\s+stimulat\w*|\bTMS\b|transcranial`,
  cupping: String.raw`cupping`,
  cannabis: String.raw`cannabis|\bCBD\b|medical\s+marijuana`,
};
const KIND_RE = Object.entries(KINDS).map(([k, s]) => [k, new RegExp(String.raw`\b(?:${s})`, 'gi')]);
// a modality named to be avoided / as a cause / as a setting is not "listed as an option"
const NEG_LEFT_EN = /(?:\b(?:without|no|avoid\w*|instead\s+of|rather\s+than|unlike|versus|vs\.?|compared\s+(?:with|to)|need\s+for|risks?\s+of|side[\s-]effects?\s+of|dependence\s+on|reliance\s+on|reduc\w*|fewer|less|stop\w*|delay\w*|postpone\w*|candidates?\s+for|after|following|before|prior\s+to|despite|failed|tried|unresponsive\s+to|resistant\s+to|refractory\s+to|not|never|nor|than)\s+(?:[\w-]+\s+){0,2}|\bpost-|\bnon-|\bpre-)$/i;
const NEG_RIGHT_EN = /^\S*\s+(?:clinics?|practices?|centres?|centers?|departments?|teams?|professionals?|practitioners?|associations?|societ\w+|journals?|guidelines?|sessions?\s+(?:at|in)\s+(?:a|the)\s+clinic|equipment|devices?\s+(?:sold|on\s+the\s+market))\b/i;
const LOOP_EN = /\b(?:tried|have\s+tried|already\s+(?:tried|done|had|completed|been\s+through|received)|(?:does|do|did)\s+not\s+respond|doesn['’]t\s+respond|didn['’]t\s+respond|not\s+responded|no\s+improvement|unresponsive|still\s+(?:wake|have|feel|live|suffer)|didn['’]t\s+(?:help|work)|did\s+not\s+(?:help|work)|doesn['’]t\s+(?:help|work)|does\s+not\s+(?:help|work)|don['’]t\s+(?:help|work)|still\s+(?:hurts?|in\s+pain|have\s+pain)|temporar\w+|wears?\s+off|keeps?\s+coming\s+back|stuck|despite|even\s+after|fail\w*|falls?\s+short|plateau\w*|not\s+enough|only\s+mask\w*|masks?\s+the|side[\s-]effects?|dependence|addict\w*|disappoint\w*|frustrat\w*)\b/i;
const CAUSE_EN = /\b(?:caused\s+by|causes?\b|risk\s+factors?|due\s+to|results?\s+(?:of|from)|resulting\s+from|triggered\s+by|complications?|overuse|history\s+of|previous|diagnos\w+|misdiagnos\w*)\b/i;
const SAFETY_SENT_EN = /\b(?:infect\w*|fever|urgent\w*|emergency|immediately|red[\s-]flags?|seek\s+(?:medical|urgent|immediate)|call\s+(?:your\s+doctor|911|999|an\s+ambulance)|contraindicat\w*|pacemaker|pregnan\w*)\b/i;
const PIVOT_EN = /(?:^|[\s,;—–-])(?:but|however|yet)\b/i;
const PAIRED = /\b(?:combin\w*|together\s+with|plus|alongside|with\s+PEMF|and\s+PEMF|PEMF\s+(?:and|with|plus|\+))\b|\+/i;
const CUE_EN = /\b(?:treat\w*|help\w*|reliev\w*|relief|rehab\w*|options?|solutions?|recommend\w*|effective|manag\w*|approach\w*|therap\w*|care\b|works?\b|recover\w*|settle\w*|improv\w*|heal\w*|ease\w*|tr(?:y|ied)\b|use\b)/i;
const TREAT_STRONG_H = /\btreatment\s+options?\b|\bwhat\s+(?:can|should)\s+(?:I|you|we|patients)\s+do\b|\byour\s+options\b|\bgetting\s+(?:better|back|rid)\b|\bhow\s+to\s+recover\b|\boptions?\s+for\b|\bhow\s+(?:is|are|do|does|can|should)\b[^?]{0,40}\b(?:treat(?:ed)?|manag(?:e|ed)|reliev(?:e|ed)|fix(?:ed)?|heal(?:ed)?|eas(?:e|ed)|cur(?:e|ed))\b|\bwhat\s+(?:helps|works|can\s+(?:help|be\s+done)|are\s+the\s+(?:treatment|options))\b|\btreating\s+\w+|\bmanaging\s+\w+|\bmanagement\s+(?:of|for|options?)\b|\b(?:conservative|standard|conventional|first-line|non-surgical|non-invasive|evidence-based)\s+(?:treatments?|care|management|options?|therap\w+)\b|\btreatments?\s+(?:for|that\s+work)\b|\bhow\s+to\s+(?:treat|fix|heal|relieve|ease|manage|get\s+rid)\b|\bways\s+to\s+(?:treat|relieve|manage|ease)\b/i;
const TREAT_WEAK_H = /\btreat\w*|\bmanag\w*|\boptions?\b|\btherap\w*|\bremed\w*|\brelief\b|\bsolutions?\b|\brehab\w*|\brecovery\b|\bconservative\b|\bguidelines?\b|\bapproach\w*|\bintegrat\w*|\bcompar\w*|\bvs\.?\b|\bversus\b|\bkey\s+takeaways?\b|\bsummary\b|\bbottom\s+line\b|\bwhat\s+to\s+do\b/i;
const WHY_FAIL_H = /\bwhy\b[^?]*\b(?:fail\w*|falls?\s+short|resists?|plateau\w*|doesn['’]t|don['’]t|isn['’]t|aren['’]t|not\s+enough|struggle\w*|stop\s+working|wears?\s+off|limits?|challenging|difficult|hard\s+to|persists?|chronic|matters?)\b|\b(?:limitations?|gaps?|the\s+problem\s+with|shortcomings|falls?\s+short|doesn['’]t\s+solve|plateau\w*|fail\w*|challenges?|under-?served|under-?treated|insufficient|inadequate|unmet|burden|epidemic|problem|scope|prevalence|landscape|toll|cost\s+of)\b/i;
const SAFETY_H_EN = /\bcontraindicat\w*|\bsafety\b|\bside\s+effects?\b|\brisks?\b|\bred\s+flags?\b|\bwarning\s+signs?\b|\bwhen\s+to\s+(?:see|seek|call|consult|go|get)\b|\bwho\s+should\s+not\b|\bnot\s+suitable\b|\bprecautions?\b|\breferences\b|\bsources\b|\bbibliograph\w*|\bfurther\s+reading\b|\brelated\s+(?:articles?|reading|conditions?)\b|\bcitations?\b|\bdisclaimer\b|\burgent\b|\bemergency\b|\bregulatory\b|\bFDA\b/i;
const B2B_H_EN = /\bfor\s+(?:clinics?|clinic\s+owners?|practitioners|physiotherap\w+\s+(?:clinics?|practices?)|investors?|partners?|distributors?|your\s+(?:clinic|practice))\b|\bclinic\s+owners?\b|\bbusiness\b|\binvest\w*\b|\brevenue\b|\bROI\b|\bmarket\b|\bpricing\b|\bcosts?\b|\bpurchase\b|\blease\b|\bequipment\b|\bclinical\s+application\b|\bwhat\s+this\s+means\s+for\s+(?:your\s+)?(?:clinic|practice|practitioners)\b|\bphilippines?\b|\bfilipino\b/i;
const RESEARCH_H = /\bresearch\b|\bevidence\b|\bstud(?:y|ies)\b|\btrials?\b|\bmeta-analys\w+|\bdata\b|\bresults?\b|\bfindings\b|\bmechanism\w*\b|\bhow\s+(?:does\s+)?(?:PEMF|it)\s+works?\b|\bscience\b|\bbiolog\w*\b|\bwhat\s+(?:is|are)\b|\bpatient\s+profile\b|\bwho\b|\bcase\b|\bhistory\b|\bsymptoms?\b|\bcauses?\b|\bdiagnos\w*\b|\bunderstanding\b|\bsigns\b|\bstages?\b|\bphysiology\b|\banatomy\b/i;
const OUR_TREATMENT_H = /\bPEMF\b|\bPainFree\b|\bour\s+(?:treatment|protocol|clinic|approach)|\bprotocol\b|\bsessions?\b|\bwhat\s+to\s+expect\b|\bpulses?\b|\belectromagnetic\b/i;
const OTHER_OPTIONS_H = /\b(?:other|alternative|additional|conventional|traditional|standard|existing)\s+(?:treatments?|options?|therap(?:y|ies)|approaches)\b|\bwhat\s+about\b|\bother\s+ways\b/i;
const HOME_H = /\bat\s+home\b|\bhome\s+(?:care|exercises?|remedies|programme|program)\b|\bself[\s-]care\b|\bpreventi\w*\b|\bprevent\b|\bdaily\s+life\b|\blifestyle\b|\btips\b/i;
const FAQ_H_EN = /\bFAQs?\b|frequently\s+asked|common\s+questions|questions\s+(?:and|&)\s+answers|\bQ\s*&\s*A\b/i;

function hitsOf(s, withPemf) {
  const out = [];
  for (const [k, re] of KIND_RE) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(s))) {
      const left = s.slice(Math.max(0, m.index - 40), m.index);
      if (NEG_LEFT_EN.test(left) || NEG_RIGHT_EN.test(s.slice(m.index))) continue;
      out.push({ i: m.index, end: m.index + m[0].length, k });
    }
  }
  if (withPemf) { PEMF_G.lastIndex = 0; let m; while ((m = PEMF_G.exec(s))) out.push({ i: m.index, end: m.index + m[0].length, k: 'PEMF' }); }
  return out.sort((a, b) => a.i - b.i);
}
/** parts: [{text, head}] in reading order; returns option kinds, the kinds named before PEMF, and PEMF's item position. */
function blockStats(parts) {
  let firstPemfItem = -1; const kinds = new Set(); const beforeKinds = new Set(); let words = 0; let items = 0;
  for (const p of parts) if (!p.head) words += p.text.split(/\s+/).filter(Boolean).length;
  parts.forEach((p, pi) => {
    if (!p.head) items++;
    const question = p.head && isQuestion(p.text);
    for (const s of sentencesOf(p.text)) {
      const hits = hitsOf(s, true);
      const paired = PEMF_WORD.test(s) && PAIRED.test(s);
      const skip = question || isQuestion(s) || paired || LOOP_EN.test(s) || CAUSE_EN.test(s) || SAFETY_SENT_EN.test(s);
      const piv = s.search(PIVOT_EN);
      const pemfAfterPivot = piv >= 0 && (hits.some(x => x.k === 'PEMF' && x.i > piv) || /\b(?:push|missing\s+piece|technolog\w*)\b/i.test(s.slice(piv)));
      for (const x of hits) {
        if (x.k === 'PEMF') { if (firstPemfItem < 0) firstPemfItem = p.head ? 0 : items; continue; }
        if (skip) continue;
        if (pemfAfterPivot && x.i < piv) continue;
        kinds.add(x.k);
        if (firstPemfItem < 0) beforeKinds.add(x.k);
      }
    }
  });
  return { words, items, kinds, beforeKinds, firstPemfItem, frac: firstPemfItem < 0 ? null : (firstPemfItem <= 1 ? 0 : (firstPemfItem - 1) / Math.max(1, items)), cue: CUE_EN.test(parts.map(p => p.text).join(' ')) };
}
function judgeBlock(head, parts, opts, isIntro, pemfLed) {
  const h = head || '';
  if (pemfLed && OTHER_OPTIONS_H.test(h)) return null;
  if (!isIntro && (SAFETY_H_EN.test(h) || B2B_H_EN.test(h) || WHY_FAIL_H.test(h) || HOME_H.test(h))) return null;
  const strongH = !isIntro && TREAT_STRONG_H.test(h), weakH = !isIntro && TREAT_WEAK_H.test(h);
  if (!isIntro && !strongH && RESEARCH_H.test(h)) return null;
  // a heading ABOUT another modality ("What is shockwave therapy?") — unless it asks for the options
  if (!isIntro && !PEMF_WORD.test(h) && hitsOf(h, false).length && !strongH && !/\bvs\.?\b|\bversus\b|\bor\b|\bcompar/i.test(h)) return null;
  const st = blockStats((isIntro ? [] : [{ text: h, head: true }]).concat(parts));
  const classified = (strongH && (st.words >= 30 || st.kinds.size >= 2)) || (weakH && st.kinds.size >= 2) || (st.kinds.size >= 3 && st.cue);
  if (!classified) return null;
  if (OUR_TREATMENT_H.test(h) && !strongH && st.firstPemfItem >= 0) return null;
  if (st.firstPemfItem < 0) return { kind: 'NO_PEMF', head: h, sentence: `options named: ${[...st.kinds].join(', ')} — no PEMF word in the section`, match: [...st.kinds].join(',') };
  if (st.beforeKinds.size >= 2) return { kind: 'PEMF_LAST', head: h, sentence: `named before PEMF: ${[...st.beforeKinds].join(', ')}`, match: [...st.beforeKinds].join(',') };
  if (opts.article && st.frac > 0.3 && st.beforeKinds.size >= 1) return { kind: 'PEMF_LATE', head: h, sentence: `PEMF first appears at item ${st.firstPemfItem} of ${st.items}, behind ${[...st.beforeKinds].join(', ')}`, match: [...st.beforeKinds].join(',') };
  return null;
}
function sectionsOf(units) {
  let sec = { head: '(intro)', intro: true, items: [], subs: [] }; const secs = [sec]; let sub = null;
  units.forEach((u, idx) => {
    if (u.t === 'h' && u.level <= 2) { sec = { head: u.text, items: [], subs: [] }; secs.push(sec); sub = null; return; }
    if (u.t === 'h') { sub = { head: u.text, items: [], at: sec.items.length }; sec.subs.push(sub); sec.items.push(idx); return; }
    sec.items.push(idx); if (sub) sub.items.push(idx);
  });
  return secs;
}
/** Treatment-order flags for a parsed page: [{kind, head, sentence, match}] */
function structureFlags(P0, opts) {
  opts = opts || {};
  const flags = []; const U = P0.units;
  const part = i => ({ text: U[i].text, head: U[i].t === 'h' });
  let pemfLed = false;
  for (const sec of sectionsOf(U)) {
    const faq = FAQ_H_EN.test(sec.head);
    let secFlag = null;
    if (!faq) { secFlag = judgeBlock(sec.head, sec.items.map(part), opts, !!sec.intro, pemfLed); if (secFlag) flags.push(secFlag); }
    const parentOut = !sec.intro && (SAFETY_H_EN.test(sec.head) || B2B_H_EN.test(sec.head) || WHY_FAIL_H.test(sec.head) || HOME_H.test(sec.head));
    for (const sub of sec.subs) {
      if (parentOut && !TREAT_STRONG_H.test(sub.head)) continue;
      const pemfBefore = PEMF_WORD.test([sec.head].concat(sec.items.slice(0, sub.at).map(i => U[i].text)).join(' '));
      const pemfSection = PEMF_WORD.test(sec.head);
      if (!(faq || (!pemfSection && ((TREAT_STRONG_H.test(sub.head) && !OTHER_OPTIONS_H.test(sub.head)) || !pemfBefore)))) continue;
      const f = judgeBlock(sub.head, sub.items.map(part), opts, false, pemfLed || pemfBefore);
      if (f && !(secFlag && secFlag.kind === f.kind)) { f.head = sec.head + ' › ' + sub.head; flags.push(f); }
    }
    if (PEMF_WORD.test([sec.head].concat(sec.items.map(i => U[i].text)).join(' '))) pemfLed = true;
  }
  // comparison tables: PEMF must not stand behind ≥2 other modality columns (or rows)
  P0.tables.forEach((rows, ti) => {
    const axes = [['columns', (rows[0] || []).slice(0)], ['rows', rows.slice(1).map(r => r[0] || '')]];
    for (const [axis, cells] of axes) {
      const kinds = cells.map(c => (PEMF_WORD.test(c) ? 'PEMF' : (hitsOf(c, false).length ? 'OTHER' : null)));
      const pi = kinds.indexOf('PEMF');
      if (pi > 0 && kinds.slice(0, pi).filter(k => k === 'OTHER').length >= 2) {
        flags.push({ kind: 'PEMF_LAST', head: `(table ${ti + 1}, ${axis})`, sentence: cells.filter(Boolean).join(' | ').slice(0, 220), match: axis });
        break;
      }
    }
  });
  return flags;
}

// ── page grading ───────────────────────────────────────────────────────────────────────────────────────────────────
const ROLE_CELL = /^(?:(?:second[\s-]line|supportive|secondary|optional|adjunct\w*|add-?on|complementary|supplementary|ancillary|auxiliary|supporting|support\s+only)(?:\s*(?:[—–(,;:.-]|$)|\s+(?:role|treatment|therapy|option|tool|modality|only|use|after|to)\b)|after\s+(?:physio\w*|exercise|rehab\w*|first-line|conservative)\b)/i;
const FIRST_CELL = /^(?:first[\s-]line|gold[\s-]standard|foundation|cornerstone|mainstay|first\s+choice|treatment\s+of\s+choice|standard\s+of\s+care)\b|^(?:primary|core|main|key|central)\s+(?:treatment|therapy|modality|intervention|component|approach|option|element|role)\b/i;
const qKey = s => String(s).replace(/[“”"‘’']/g, '').replace(/\s+/g, ' ').trim();
const QUOTE_KEYS = EN_QUOTE_ALLOW.map(qKey);
const quoteListed = s => { const k = qKey(s); return QUOTE_KEYS.some(q => k.includes(q) || (k.length >= 25 && q.includes(k))); };

/** Flags for one HTML document (any fragment works). opts.article → PEMF_LATE too (new pages). */
function gradeHtml(html, name, opts) {
  opts = opts || {};
  const base = path.basename(name || '');
  const P0 = parse(html);
  const flags = []; const exempt = [];
  for (const e of P0.ldErrors) flags.push({ surface: 'jsonld', kind: 'JSONLD_PARSE', match: e, sentence: '(unparseable JSON-LD — fix it; unreadable text is never a pass)' });
  const pageText = P0.units.map(u => u.text).join(' ') + ' ' + P0.head.map(h => h.text).join(' ');
  const signed = SIGNED_PAGES[base] && SIGNED_PAGES[base].test(pageText);
  const U = P0.units;
  const attributed = idx => [idx - 1, idx, idx + 1].some(j => U[j] && NAMED_CLINICIANS.test(U[j].text));
  const one = (s, ctx, surface, o, idx) => {
    // a cited paper's title is its name, not our voice: blank it and grade the rest of the sentence
    let g = s; const cited = EN_CITATION_ALLOW.filter(t => g.includes(t));
    for (const t of cited) g = g.split(t).join(' «cited title» ');
    const f = gradeSentence(g, ctx, o);
    if (cited.length) exempt.push({ surface, why: 'EN_CITATION_ALLOW (cited title blanked, rest graded)', sentence: s.slice(0, 160) });
    if (!f.length) return;
    if (quoteListed(s) && (signed || (idx != null && attributed(idx)))) { exempt.push({ surface, why: `EN_QUOTE_ALLOW (named clinician, ${signed ? 'his signed page' : 'attributed in an adjacent unit'})`, sentence: s.slice(0, 160) }); return; }
    for (const x of f) flags.push({ surface, kind: x.kind, match: String(x.match).trim(), sentence: s.slice(0, 300) });
  };
  for (const h of P0.head) for (const s of sentencesOf(h.text)) one(s, '', h.surface, { loose: true });
  for (const a of P0.attrs) for (const s of sentencesOf(a.text)) one(s, '', a.surface, { loose: true });
  let prev = '';
  const tableHdr = c => { const rows = P0.tables[c.ti] || []; return { col: (rows[0] || [])[c.ci] || '', row: (rows[c.ri] || []).join(' | '), rowHead: (rows[c.ri] || [])[0] || '' }; };
  U.forEach((u, idx) => {
    const surface = u.t === 'h' ? 'heading' : (u.cell ? 'body:table' : (u.quote ? 'body:blockquote' : 'body'));
    if (u.cell) {
      const th = tableHdr(u.cell);
      const subj = PEMF_WORD.test(th.col) || PEMF_WORD.test(th.rowHead) ? 'PEMF' : (COMPETE.test(th.col) || COMPETE.test(th.rowHead) ? 'OTHER' : null);
      if (u.text.length <= 90 && u.cell.ri > 0 && u.cell.ci > 0) {
        if (ROLE_CELL.test(u.text) && subj === 'PEMF') flags.push({ surface, kind: 'LABEL', match: u.text.slice(0, 40), sentence: `${th.rowHead} / ${th.col}: ${u.text}`.slice(0, 300) });
        if (FIRST_CELL.test(u.text) && subj === 'OTHER') flags.push({ surface, kind: 'FOUNDATION', match: u.text.slice(0, 40), sentence: `${th.rowHead} / ${th.col}: ${u.text}`.slice(0, 300) });
      }
      let p = th.row + ' ' + th.col;
      for (const s of sentencesOf(u.text)) { one(s, p, surface, { row: th.row, loose: true }, idx); p = th.row + ' ' + s; }
      return;
    }
    for (const s of sentencesOf(u.text)) { one(s, prev, surface, { loose: true }, idx); prev = s; }
  });
  for (const f of structureFlags(P0, { article: !!opts.article })) flags.push({ surface: 'section', kind: f.kind, match: f.match, sentence: `[${f.head}] ${f.sentence}`.slice(0, 300) });
  return { flags, exempt };
}

/** Sentences that carry the add-on voice — for write paths that must refuse a plan adding one. */
function addonSentencesEn(html, name) {
  const seen = new Set(); const out = [];
  for (const f of gradeHtml(html, name).flags) if (!seen.has(f.sentence)) { seen.add(f.sentence); out.push(f.sentence.slice(0, 220)); }
  return out;
}
const units = html => { const P0 = parse(html); return P0.head.concat(P0.attrs, P0.units.map(u => ({ surface: u.t === 'h' ? 'heading' : 'body', text: u.text }))); };

function manifestUnitsFrom(text, label) {
  let m; try { m = JSON.parse(text); } catch (e) { return { error: e.message }; }
  const out = [];
  for (const t of m.translated || []) for (const k of ['title_en', 'title', 'excerpt', 'description', 'tag']) if (typeof t[k] === 'string') out.push({ surface: `manifest:${t.ph_file || t.file || '?'}.${k}`, text: t[k] });
  return out;
}
function gradeManifestText(text) {
  const mu = manifestUnitsFrom(text);
  if (mu.error) return { error: mu.error };
  const flags = [];
  for (const u of mu) for (const s of sentencesOf(normText(u.text))) for (const x of gradeSentence(s, '', { loose: true })) flags.push({ surface: u.surface, kind: x.kind, match: String(x.match).trim(), sentence: s.slice(0, 300) });
  return { flags };
}
const ALWAYS = ['articles.html', 'index.html'];
/** Grade files in dir (all *.html when files is null) + the manifest. A partial list always adds articles.html, index.html
 *  and the manifest (the cards and title_en are where a new title lands). opts.newFiles: Set of names graded as articles. */
function scanDir(dir, files, readFile, opts) {
  opts = opts || {};
  const read0 = readFile || (f => fs.readFileSync(path.isAbsolute(f) ? f : path.join(dir, f), 'utf8'));
  let all = files ? files.slice() : fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.html'));
  if (files) for (const a of ALWAYS) if (!all.some(f => path.basename(f) === a) && (opts.exists ? opts.exists(a) : fs.existsSync(path.join(dir, a)))) all.push(a);
  const report = []; const exempt = []; let read = 0; const errors = [];
  for (const f of all) {
    let html; try { html = read0(f); } catch (e) { errors.push(`${f}: ${e.message}`); continue; }
    read++;
    const g = gradeHtml(html, f, { article: !!(opts.newFiles && opts.newFiles.has(path.basename(f))) });
    if (g.flags.length) report.push({ file: path.basename(f), flags: g.flags });
    for (const x of g.exempt) exempt.push({ file: path.basename(f), ...x });
  }
  let mtext = null;
  try { mtext = opts.manifestText !== undefined ? opts.manifestText : (fs.existsSync(path.join(dir, 'articles-manifest.json')) ? fs.readFileSync(path.join(dir, 'articles-manifest.json'), 'utf8') : null); } catch (e) { errors.push('articles-manifest.json: ' + e.message); }
  if (mtext != null) {
    const g = gradeManifestText(mtext);
    if (g.error) errors.push('articles-manifest.json: ' + g.error);
    else if (g.flags.length) report.push({ file: 'articles-manifest.json', flags: g.flags });
  }
  return { read, total: all.length, report, exempt, errors };
}
/** Grade what the index holds (what a commit will contain): every tracked *.html (or only `files`) + the staged manifest.
 *  Files added in the index (status A) are graded as new articles (PEMF_LATE applies). */
function scanIndex(dir, opts) {
  opts = opts || {};
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const tracked = git('ls-files', '-z', '--cached').split('\0').filter(Boolean);
  const added = new Set(git('diff', '--cached', '--name-only', '-z', '--diff-filter=A').split('\0').filter(Boolean).map(f => path.basename(f)));
  let files = tracked.filter(f => /\.html?$/i.test(f) && !f.includes('/'));
  if (opts.files) { const want = new Set(opts.files); files = files.filter(f => want.has(f)); }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-addon-'));
  try {
    const exportList = files.concat(tracked.includes('articles-manifest.json') ? ['articles-manifest.json'] : []).concat(ALWAYS.filter(a => tracked.includes(a) && !files.includes(a)));
    for (let i = 0; i < exportList.length; i += 200) execFileSync('git', ['-C', dir, 'checkout-index', '-f', '--prefix=' + tmp.replace(/\\/g, '/') + '/', '--', ...exportList.slice(i, i + 200)], { encoding: 'utf8' });
    const mpath = path.join(tmp, 'articles-manifest.json');
    return Object.assign(scanDir(tmp, opts.files ? files : files.concat(ALWAYS.filter(a => tracked.includes(a) && !files.includes(a))), null, { newFiles: added, manifestText: fs.existsSync(mpath) ? fs.readFileSync(mpath, 'utf8') : null, exists: a => tracked.includes(a) }), { added: [...added] });
  } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* temp cleanup is best effort */ } }
}

// ── fixtures ───────────────────────────────────────────────────────────────────────────────────────────────────────
/** Regression cases. Yaki's rejected copy (translated) and every red-team variant the auditors found must FLAG; his own
 *  model wording, safety lines, contraindication lists and an attributed clinician quote must PASS. */
const MUST_FLAG = [
  ['his quoted box clause (no PEMF word in it)', '<p>At more than 70 PainFree clinics an advanced, non-invasive method awaits you — no needles, injections or drugs — alongside the exercises and physiotherapy you are already doing.</p>'],
  ['the same clause with a comma in the window', '<p>The pulses work alongside the physiotherapy, which you already do, to calm the tendon.</p>'],
  ['box clause: "alongside your existing physiotherapy and exercise programme"', '<p>At more than 70 PainFree clinics an advanced, non-invasive method awaits you, alongside your existing physiotherapy and exercise programme.</p>'],
  ['box clause: "alongside your usual physiotherapy"', '<p>At more than 70 PainFree clinics a non-invasive method awaits you — alongside your usual physiotherapy and exercises.</p>'],
  ['box clause opening with "Together with … you are already doing"', '<p>Together with the exercises and physiotherapy you are already doing, an advanced non-invasive method awaits you at more than 70 PainFree clinics.</p>'],
  ['box clause: "awaits you — together with the physiotherapy you already do"', '<p>At more than 70 PainFree clinics a non-invasive method awaits you — together with the physiotherapy you already do.</p>'],
  ['"slots in next to your ongoing physiotherapy"', '<p>PEMF slots in next to your ongoing physiotherapy.</p>'],
  ['tense: "you\'ve been doing"', '<p>PEMF works alongside the exercises and physiotherapy you\'ve been doing.</p>'],
  ['"alongside your existing physiotherapy routine"', '<p>PEMF works alongside your existing physiotherapy routine.</p>'],
  ['"alongside your current rehab programme"', '<p>PEMF sessions run alongside your current rehab programme.</p>'],
  ['"the physio you have now"', '<p>The pulses work alongside the physio you have now.</p>'],
  ['"add PEMF sessions alongside it"', '<p>Keep up your usual physiotherapy and add PEMF sessions alongside it.</p>'],
  ['live ankle-sprain twin: "an additional … treatment channel … alongside existing physiotherapy"', '<p>PEMF offers an additional, non-invasive treatment channel that integrates easily alongside existing physiotherapy.</p>'],
  ['the superseded FAQ template, live on the Achilles twin', '<h3>Does PEMF replace physiotherapy?</h3><p>No. Physiotherapy and rehabilitation exercise are the central, evidence-based foundation; PEMF is a complementary treatment used alongside them, not instead of them.</p>'],
  ['live gluteal twin: "an adjunct — alongside the exercise, not instead of it"', '<p>Physiotherapy and rehabilitation exercise are the central, evidence-based cornerstone; PEMF serves as an adjunct — alongside the exercise, not instead of it — to reduce pain and support tendon healing.</p>'],
  ['live tarsal twin: "added alongside it, not in its place"', '<p>Conservative care (orthotics, physiotherapy and nerve gliding) remains the evidence-based cornerstone; PEMF is added alongside it, not in its place.</p>'],
  ['live runners twin: "reasonable as an adjunct for pain, not a substitute for loading"', '<p>The honest summary: reasonable as an adjunct for pain, not a substitute for loading.</p>'],
  ['live ac-joint twin: "positioned as an adjunct … not a standalone treatment"', '<p>PEMF is positioned as an adjunct to physiotherapy and graded return-to-sport protocols — not a standalone treatment.</p>'],
  ['"the cornerstone is physiotherapy"', '<p>The cornerstone is physiotherapy.</p>'],
  ['exercise as the foundation (no PEMF word)', '<p>Exercise remains the foundation of tendon rehabilitation.</p>'],
  ['"an adjunct — not a replacement — for physiotherapy"', '<p>PEMF is an adjunct — not a replacement — for physiotherapy.</p>'],
  ['pronoun after a PEMF sentence', '<p>PEMF calms the irritated tendon. It serves as an adjunct to your rehab.</p>'],
  ['label word excused by nothing — not even a safety clause', '<p>PEMF is a complementary treatment — it is not a substitute for diagnosis.</p>'],
  ['a doctor in the sentence does not exempt a physio object', '<p>PEMF is not a replacement for physiotherapy, as your doctor will tell you.</p>'],
  ['"does not replace physiotherapy"', '<p>PEMF does not replace physiotherapy and exercise.</p>'],
  ['contraction: "isn\'t a replacement for physiotherapy"', '<p>PEMF isn\'t a replacement for physiotherapy.</p>'],
  ['contraction: "isn\'t a substitute for your exercise programme"', '<p>PEMF isn\'t a substitute for your exercise programme.</p>'],
  ['bare "never instead."', '<p>PEMF works with your physiotherapy, never instead.</p>'],
  ['"not here to take over from your physiotherapist"', '<p>PEMF is not here to take over from your physiotherapist.</p>'],
  ['"won\'t do away with the need for your exercises"', '<p>PEMF won\'t do away with the need for your exercises.</p>'],
  ['"will not swap out your physiotherapy"', '<p>PEMF will not swap out your physiotherapy.</p>'],
  ['"doesn\'t come instead of physiotherapy" without his enabler', '<p>No — PEMF doesn\'t come instead of physiotherapy.</p>'],
  ['"alongside physiotherapy and not in its place"', '<p>Integrating PEMF into sprain care is built to match the healing phase, alongside physiotherapy and not in its place.</p>'],
  ['"in addition to, not in place of"', '<p>PEMF should be used in addition to, not in place of, your physiotherapy.</p>'],
  ['"an additional layer in the conservative toolbox"', '<p>Here PEMF comes in as an additional layer in the conservative toolbox.</p>'],
  ['"only when combined with"', '<p>PEMF works only when combined with an exercise programme.</p>'],
  ['"works best when combined with physiotherapy"', '<p>PEMF works best when combined with physiotherapy.</p>'],
  ['"one part of a multidisciplinary plan"', '<p>PEMF is one part of a multidisciplinary plan.</p>'],
  ['"one component of a comprehensive rehabilitation plan"', '<p>PEMF is one component of a comprehensive rehabilitation plan.</p>'],
  ['"just one piece of the puzzle; exercise is the bigger piece"', '<p>PEMF is just one piece of the puzzle; exercise is the bigger piece.</p>'],
  ['"without stopping what you already do"', '<p>You can start PEMF without stopping what you are already doing.</p>'],
  ['add-on / bolt-on spellings', '<p>Think of PEMF as an Add-On to rehab.</p>'],
  ['no-break hyphen U+2011: "add‑on", "stand‑alone"', '<p>PEMF is not a stand‑alone treatment. PEMF is an add‑on to rehab.</p>'],
  ['a word split by an inline tag: "ad<span>junct</span>"', '<p>PEMF is an ad<span class="hl">junct</span> to physiotherapy.</p>'],
  ['ADJUNCTIVE in capitals', '<p>PEMF IS ADJUNCTIVE THERAPY FOR KNEE PAIN.</p>'],
  ['"rather than replacing"', '<p>PEMF supports the rehabilitation programme rather than replacing it.</p>'],
  ['PEMF as a "second-line treatment"', '<p>PEMF is a second-line treatment after physiotherapy.</p>'],
  ['a "supporting role"', '<p>PEMF plays a supporting role next to the exercises.</p>'],
  ['"secondary to loading"', '<p>In tendinopathy, PEMF is secondary to loading.</p>'],
  ['"auxiliary to physiotherapy"', '<p>PEMF is auxiliary to physiotherapy.</p>'],
  ['"ancillary to physiotherapy"', '<p>PEMF is ancillary to physiotherapy.</p>'],
  ['"supplemental to physiotherapy"', '<p>PEMF is supplemental to physiotherapy.</p>'],
  ['"the perfect sidekick to your physio"', '<p>PEMF is the perfect sidekick to your physio.</p>'],
  ['"takes a back seat"', '<p>PEMF takes a back seat to your exercise programme.</p>'],
  ['"plays second fiddle"', '<p>PEMF plays second fiddle to physiotherapy.</p>'],
  ['"an extra tool your physiotherapist can use"', '<p>PEMF is an extra tool your physiotherapist can use.</p>'],
  ['"a top-up to your physio sessions"', '<p>PEMF is a top-up to your physio sessions.</p>'],
  ['"a helper alongside your rehab"', '<p>Use PEMF as a helper alongside your rehab.</p>'],
  ['misspelling: "a complimentary therapy"', '<p>PEMF is a complimentary therapy for back pain.</p>'],
  ['"Physiotherapy first, PEMF second" (heading)', '<h2>Physiotherapy First, PEMF Second</h2>'],
  ['"you\'ll still need to do your rehab exercises"', '<p>PEMF helps with the pain, but you\'ll still need to do your rehab exercises.</p>'],
  ['"PEMF alone will not fix the tendon"', '<p>PEMF alone will not fix the tendon; physiotherapy does the real work.</p>'],
  ['"PEMF on its own is not enough"', '<p>PEMF on its own is not enough; you need the exercises.</p>'],
  ['"PEMF by itself is not a cure"', '<p>PEMF by itself is not a cure for knee arthritis.</p>'],
  ['"does not heal the tendon on its own — the exercise does that"', '<p>PEMF does not heal the tendon on its own — the exercise does that.</p>'],
  ['an unattributed reuse of a clinician sentence (allowed only with his name next to it)', '<p>It is most commonly offered as a complementary therapy alongside other treatments such as physiotherapy.</p>'],
  ['a fake "Dr." blockquote', '<blockquote>“PEMF is a complementary treatment, not a replacement for physiotherapy.” — Dr. Nobody</blockquote>'],
  ['a callout blockquote that only mentions an MD', '<blockquote>Key takeaway: PEMF is an adjunct to physiotherapy, never a replacement. Sessions are supervised by an MD.</blockquote>'],
  ['a callout blockquote citing "Dr. Smith\'s trial"', '<blockquote>Key takeaway: PEMF works as an adjunct to physiotherapy, as Dr. Smith\'s 2021 trial showed.</blockquote>'],
  ['an unattributed blockquote', '<blockquote>PEMF is a complementary treatment, not a replacement for exercise.</blockquote>'],
  ['the <title>', '<html><head><title>PEMF for Insomnia &amp; Sleep Disorders: A Complementary Clinical Approach</title></head><body></body></html>'],
  ['a title: "Why Exercise Still Comes First"', '<html><head><title>PEMF and Physio: Why Exercise Still Comes First</title></head><body></body></html>'],
  ['the meta description', '<html><head><meta name="description" content="How PEMF fits as a complementary, drug-free layer alongside CBT-I."/></head><body></body></html>'],
  ['meta: "supports the physiotherapy you\'re doing"', '<html><head><meta name="description" content="How PEMF supports the physiotherapy you\'re doing for Achilles tendinopathy."></head><body></body></html>'],
  ['meta description with ">" inside content', '<html><head><meta name="description" content="Pain 7->3: PEMF as an adjunct to physiotherapy"></head><body></body></html>'],
  ['meta itemprop description', '<div itemscope itemtype="https://schema.org/MedicalWebPage"><meta itemprop="description" content="PEMF as an adjunct to physiotherapy"></div>'],
  ['og:description (content before property)', '<html><head><meta content="PEMF as an adjunct to physiotherapy for knee pain." property="og:description"/></head><body></body></html>'],
  ['JSON-LD FAQ answer', '<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Does PEMF replace physiotherapy?","acceptedAnswer":{"@type":"Answer","text":"No. PEMF is used alongside physiotherapy, not in its place."}}]}</script></head><body></body></html>'],
  ['JSON-LD articleBody', '<script type="application/ld+json">{"@type":"Article","headline":"PEMF for knees","articleBody":"PEMF is an adjunct to physiotherapy, not a replacement for it."}</script>'],
  ['JSON-LD reviewBody', '<script type="application/ld+json">{"@type":"Review","reviewBody":"PEMF was a complementary treatment alongside my physio."}</script>'],
  ['JSON-LD keywords', '<script type="application/ld+json">{"@type":"Article","keywords":"PEMF, adjunct therapy, knee pain"}</script>'],
  ['unquoted ld+json type (minifier output)', '<script type=application/ld+json>{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Does PEMF replace physio?","acceptedAnswer":{"@type":"Answer","text":"No. PEMF is an adjunct to physiotherapy, not a replacement."}}]}</script>'],
  ['unparseable JSON-LD fails closed', '<html><head><script type="application/ld+json">{"@type":"FAQPage", broken</script></head><body></body></html>'],
  ['img alt text', '<img src="x.jpg" alt="PEMF as an adjunct to physiotherapy for knee pain">'],
  ['noscript content', '<noscript><p>PEMF is an adjunct to physiotherapy.</p></noscript>'],
  ['details/summary FAQ answer', '<details><summary>Does PEMF replace physio?</summary><p>No, it\'s an adjunct to physiotherapy.</p></details>'],
  ['a table cell "PEMF (adjunct)"', '<table><tr><th>Treatment</th><th>Role</th></tr><tr><td>PEMF (adjunct)</td><td>Pain relief</td></tr></table>'],
  ['a table cell "Yes (adjunct)" under a PEMF column', '<table><tr><th>Condition</th><th>PEMF evidence</th></tr><tr><td>Insomnia</td><td>Yes (adjunct)</td></tr></table>'],
  ['physio as foundation in a table cell', '<table><tr><th>Option</th><th>Role</th></tr><tr><td>Physiotherapy and core stabilization</td><td>The foundation; PEMF reduces pain</td></tr></table>'],
  ['table role cell: PEMF "Second-line, after physiotherapy"', '<table><tr><th>Treatment</th><th>Place in care</th></tr><tr><td>PEMF</td><td>Second-line, after physiotherapy</td></tr></table>'],
  ['table role cells: physio "First-line"', '<table><tr><th>Treatment</th><th>Place in care</th></tr><tr><td>Physiotherapy</td><td>First-line</td></tr><tr><td>PEMF</td><td>Pain relief during loading</td></tr></table>'],
  ['"evidence-based complementary modalities" is not a journal title', '<p>PEMF is the technology at the centre, combined with evidence-based complementary modalities.</p>'],
  ['"synergistic, not alternative"', '<p>The two interventions are synergistic, not alternative.</p>'],
  ['exercise as the "gold standard"', '<p>Supervised exercise therapy remains the gold-standard PAD intervention; PEMF may enhance its effects.</p>'],
  ['"a useful addition to physiotherapy"', '<p>PEMF is a useful addition to physiotherapy.</p>'],
  ['"on top of your physiotherapy programme"', '<p>PEMF works on top of your physiotherapy programme.</p>'],
  ['"supplements physiotherapy"', '<p>PEMF supplements physiotherapy.</p>'],
  ['"never be used on its own"', '<p>PEMF should never be used on its own.</p>'],
  ['"not a standalone treatment"', '<p>PEMF is not a standalone treatment.</p>'],
  ['"not a partial substitute" (adjective inside the phrase)', '<p>For patients with no CDT therapist nearby, PEMF is not a partial substitute for manual drainage.</p>'],
  ['"a welcome addition"', '<p>PEMF is a welcome addition.</p>'],
  ['"a helpful extra"', '<p>Your physio remains essential; PEMF is a helpful extra.</p>'],
  ['"can\'t do the job without physiotherapy"', '<p>PEMF can\'t do the job without physiotherapy.</p>'],
  ['"only helps if you also do the exercises"', '<p>PEMF only helps if you also do the exercises.</p>'],
  ['"the first and most important step"', '<p>Physical therapy is the first and most important step; PEMF comes after.</p>'],
  ['"a supporting function"', '<p>PEMF serves a supporting function in rehabilitation.</p>'],
  ['"never in lieu of it"', '<p>PEMF is used in conjunction with physiotherapy, never in lieu of it.</p>'],
  ['"cannot take the place of exercise"', '<p>PEMF cannot take the place of exercise.</p>'],
  ['"exercise is still the main treatment"', '<p>Exercise is still the main treatment; PEMF just helps.</p>'],
  ['"rather than as an alternative to it"', '<p>PEMF is used alongside physiotherapy rather than as an alternative to it.</p>'],
  ['a "medical care" object that names physiotherapy', '<p>PEMF does not replace medical care such as physiotherapy.</p>'],
  ['FOUNDATION synonym: "first-line evidence-based intervention" (live overactive-bladder twin)', '<p>Pelvic floor physiotherapy remains the first-line evidence-based intervention, and PEMF works together with it to prepare the tissue for exercise-based rehabilitation.</p>'],
  ['FOUNDATION synonym: "the first-line treatment"', '<p>Physiotherapy is the first-line treatment; PEMF can be considered when progress stalls.</p>'],
  ['FOUNDATION synonym: "the primary treatment"', '<p>Physiotherapy is the primary treatment and PEMF supports it.</p>'],
  ['FOUNDATION synonym: "the standard of care"', '<p>Physiotherapy is the standard of care; PEMF is optional.</p>'],
  ['FOUNDATION synonym: "the basis of every programme"', '<p>Exercise is the basis of every Achilles programme; PEMF helps with pain.</p>'],
  ['FOUNDATION synonym: "the core of every clinical guideline" (live knee-OA twin)', '<p>Exercise and load management are the core of every clinical guideline for knee OA; PEMF does not appear as a recommended treatment.</p>'],
  ['FOUNDATION synonym: "the treatment of choice"', '<p>Physiotherapy remains the treatment of choice; PEMF can help.</p>'],
  ['FOUNDATION synonym: "still the core of treatment"', '<p>Physical therapy is still the core of treatment; PEMF helps with pain relief.</p>'],
  ['FOUNDATION synonym: "the primary active rehabilitation modality" (live whiplash twin)', '<p>Physiotherapy remains the primary active rehabilitation modality.</p>'],
  ['reversed: "The core of rehab is exercise"', '<p>The core of rehab is exercise; PEMF eases the pain along the way.</p>'],
  ['reversed: "The main treatment … is a progressive loading programme"', '<p>The main treatment for Achilles tendinopathy is a progressive loading programme; PEMF helps calm the pain.</p>'],
  ['"Exercise always comes first"', '<p>Exercise always comes first; PEMF helps you tolerate it.</p>'],
  ['"Physiotherapy does the heavy lifting"', '<p>Physiotherapy does the heavy lifting; PEMF eases the pain along the way.</p>'],
  ['"Your exercise programme is what heals the tendon"', '<p>Your exercise programme is what heals the tendon; PEMF just makes it more comfortable.</p>'],
  ['cleft: "It is the exercises that rebuild the tendon"', '<p>It is the exercises that rebuild the tendon; PEMF simply reduces pain so you can do them.</p>'],
  ['physio leads: "Physiotherapy leads the treatment"', '<p>Physiotherapy leads the treatment; used together with it, PEMF reduces pain.</p>'],
  ['"PEMF is there to support your physiotherapy, not to lead it"', '<p>PEMF is there to support your physiotherapy, not to lead it.</p>'],
  ['"Where PEMF Fits in Your Rehab Plan" (heading)', '<h2>Where PEMF Fits in Your Rehab Plan</h2>'],
  ['"PEMF assists physiotherapy"', '<p>PEMF assists physiotherapy by calming the tendon.</p>'],
  ['"accelerant for physiotherapy"', '<p>PEMF acts as a biological accelerant for physiotherapy.</p>'],
  ['"can also be considered" (PEMF as the also-option)', '<p>PEMF can also be considered for pain.</p>'],
  ['"another option is PEMF"', '<p>Another option is PEMF, which some patients find helpful.</p>'],
  ['about by page default: "The pulses are a useful addition"', '<p>The pulses are a useful addition to your physiotherapy.</p>'],
  ['about by page default: "Our pulse therapy is one part of a multidisciplinary plan"', '<p>Our pulse therapy is one part of a multidisciplinary plan.</p>'],
  ['about by page default: FAQ answer "Our treatment is a useful addition"', '<h3>Do I have to stop my physio?</h3><p>No. Our treatment is a useful addition to your physiotherapy programme.</p>'],
  ['about by page default: "The treatment works on top of your physiotherapy"', '<h3>Can I keep doing my exercises?</h3><p>Yes. The treatment works on top of your physiotherapy programme.</p>'],
  ['about by page default: "Our technology works only when combined with exercise"', '<p>Our technology works only when combined with exercise.</p>'],
  ['about by page default: "Magnetic therapy should never be used on its own"', '<p>Magnetic therapy should never be used on its own.</p>'],
  ['about by page default: "The Magnetobox is a useful addition"', '<p>The Magnetobox is a useful addition to your rehab programme.</p>'],
  ['STUDY abuse: "Studies show PEMF is a useful addition"', '<p>Studies show PEMF is a useful addition to physiotherapy.</p>'],
  ['STUDY abuse: "guidelines and reviews describe PEMF as an addition"', '<p>Clinical guidelines and reviews describe PEMF as an addition to standard rehab.</p>'],
  ['STUDY abuse: "For most patient groups, PEMF is added to the existing physiotherapy plan"', '<p>For most patient groups, PEMF is added to the existing physiotherapy plan.</p>'],
  ['add-on voice in the same sentence as a cited title', '<p>As the trial "Clinical effectiveness of PEMF therapy as an adjunct treatment to eccentric exercise for Achilles tendinopathy" shows, PEMF is a complementary treatment used alongside physiotherapy, not instead of it.</p>'],
  ['NO_PEMF: a treatment section listing every option except PEMF', '<h2>Treatment Options for Achilles Tendinopathy</h2><p>Most people recover with conservative care.</p><ul><li>Eccentric loading — the best-studied exercise approach.</li><li>Shockwave therapy (ESWT) — for stubborn cases.</li><li>Orthotics and heel lifts.</li><li>Surgery — when 6 months of care fail.</li></ul>'],
  ['NO_PEMF: a prose treatment section with 0 words about pulses', '<h2>Treatment options for Achilles tendinopathy</h2><p>The accepted treatments are eccentric loading, shockwave therapy, injections and, in resistant cases, surgery. Most patients improve within 12 weeks of a structured loading programme supervised by a physiotherapist, and orthotics can help.</p>'],
  ['PEMF_LAST: PEMF after physio, weight loss, medication and bracing', '<h2>How Is Knee Osteoarthritis Treated?</h2><ol><li>Physiotherapy and strengthening</li><li>Weight loss</li><li>Pain medication and injections</li><li>Bracing</li><li>PEMF can be part of the plan for pain.</li></ol>'],
  ['PEMF_LAST: a comparison table with PEMF in the last column', '<table><tr><th>Feature</th><th>Physiotherapy</th><th>Shockwave</th><th>Injections</th><th>PEMF</th></tr><tr><td>Needles</td><td>No</td><td>No</td><td>Yes</td><td>No</td></tr></table>'],
  ["research voice: \"PEMF was added to standard care, not substituted for it\"", "<p>In the quality trials, PEMF was added to standard care, not substituted for it.</p>"],
  ["\"PEMF prepares tissue for physiotherapy\" (מכין את הרקמה ל…)", "<p>No — PEMF prepares tissue for physiotherapy.</p>"],
  ["\"the training is what produces the change\"", "<p>The protocol is built on a single principle: PEMF prepares the patient for training, and the training is what produces the change.</p>"],
  ["\"PEMF is most appropriate as a component of multidisciplinary management\"", "<p>PEMF is most appropriate as a component of multidisciplinary long COVID management.</p>"],
  ["a guidelines section that names physio and surgery before PEMF", "<h2>What Do the Clinical Guidelines Recommend?</h2><p>Guidelines recommend physiotherapy and graded exercise first, with surgery for refractory cases. PEMF is not yet in the guidelines.</p>"],
  ["live cervicogenic twin: \"the best-supported layer and nothing replaces it\"", "<ul><li>Manual therapy and cervical physiotherapy — mobilisation of C1–C3. This is the best-supported layer and nothing replaces it.</li></ul>"],
  ["live cervicogenic twin: \"not PEMF instead of physiotherapy … the active layer remaining the core\"", "<p>The combination is the point: not PEMF instead of physiotherapy, but both, with the active layer remaining the core of the programme.</p>"],
  ["live spinal-fusion twin: \"Stimulation replaces none of it\"", "<p>Active rehabilitation continues in full — walking, breathing exercises, graded strengthening. Stimulation replaces none of it.</p>"],
  ["live runners twin: \"guidance places graded conservative care first\"", "<p>Direct answer: mainstream guidance places graded conservative care first, with eccentric loading carrying the strongest evidence base.</p>"],
  ["JOINS: \"PEMF integrates well with physiotherapy, manual therapy …\" (משתלב היטב לצד)", "<p>PEMF integrates well with physiotherapy, manual therapy, orthotics and load management.</p>"],
  ["JOINS: \"It integrates easily alongside an existing physiotherapy programme\" (pronoun after PEMF)", "<p>PEMF runs together with the programme. It integrates easily alongside an existing physiotherapy programme.</p>"],
  ["ALONGSIDE: \"It should be used alongside functional task training\"", "<p>PEMF calms spasticity. It should be used alongside functional task training, orthotics and medication.</p>"],
  ["ALONGSIDE: \"can be delivered alongside manual therapy or functional exercise\"", "<p>Unlike drug therapy, PEMF involves no systemic side effects, and it can be delivered alongside manual therapy or functional exercise.</p>"],
  ["ALONGSIDE in a clinic-network line: \"integrate PainFree PEMF systems alongside physiotherapy\"", "<p>More than 70 clinics in Israel integrate PainFree PEMF systems alongside physiotherapy, osteopathy, and pain care.</p>"],
  ["\"physiotherapy-led rehabilitation\"", "<p>Clinical positioning: PEMF runs together with physiotherapy-led post-stroke rehabilitation.</p>"],
  ["\"long-term success depends on consistency with exercise\"", "<p>It is important to set a realistic expectation with the patient: PEMF supports the process, but long-term success depends on consistency with exercise and load management.</p>"],
  ["heading: \"Where PEMF Fits in CRS Management\"", "<h2>Clinical Positioning: Where PEMF Fits in CRS Management</h2>"],
  ["quoted: 'The clinical message is never \"instead of\" — it is \"together with.\"'", "<p>PEMF integrates with these. The clinical message is never \"instead of\" &mdash; it is \"together with.\"</p>"],
  ["\"This is the only component with evidence for long-term change\" (exercise as the only real thing)", "<ol><li><strong>Active exercise immediately afterwards.</strong> This is the only component with evidence for long-term change.</li></ol>"],
  ["\"A clinic that positions PEMF as a replacement for graded exercise …\"", "<p>A clinic that positions PEMF as a replacement for graded exercise is selling something the evidence does not support.</p>"],
  ["JOINS: \"PEMF integrates naturally with hand therapy\"", "<p>For the occupational wrist OA population, PEMF integrates naturally with hand therapy and ergonomic intervention:</p>"],
  ["\"PEMF is a bridge to the training that works\" (מכין את הרקמה ל…)", "<p>The defensible clinical role: <strong>PEMF is a bridge to the training that works</strong>, for the frail older patient.</p>"],
  ["NO_PEMF: \"What can I do about knee pain?\" list with no PEMF", "<h2>What can I do about knee pain?</h2><ul><li>Lose weight</li><li>Strengthen your quads with exercise</li><li>Use a brace</li><li>Try physiotherapy</li></ul>"],
  ["NO_PEMF by body: \"Most people recover with physiotherapy, a brace and painkillers\"", "<h2>Getting Better</h2><p>Most people recover with physiotherapy, a brace and painkillers over six weeks; surgery is rare.</p>"],
  ["PEMF_LAST: \"Stretching, orthotics and night splints … PEMF may help too\"", "<h2>Managing Plantar Fasciitis</h2><p>Stretching, orthotics and night splints are the usual start. Shockwave helps resistant cases. PEMF may help too.</p>"],
  ["self red-team: \"PEMF works hand in hand with the physiotherapy you already do\"", "<p>PEMF works hand in hand with the physiotherapy you already do.</p>"],
  ["self red-team: \"PEMF enhances the effects of your existing exercise programme\"", "<p>PEMF enhances the effects of your existing exercise programme.</p>"],
  ["self red-team: \"PEMF is not intended as a replacement for physiotherapy\"", "<p>PEMF is not intended as a replacement for physiotherapy.</p>"],
  ["self red-team: \"First-line care is physiotherapy; PEMF is second-line\"", "<p>First-line care is physiotherapy; PEMF is second-line.</p>"],
  ["self red-team: \"The key to recovery is exercise\"", "<p>The key to recovery is exercise; PEMF helps you get there.</p>"],
  ["self red-team: \"Physiotherapists remain at the centre of care, with PEMF in support\"", "<p>Physiotherapists remain at the centre of care, with PEMF in support.</p>"],
  ["self red-team: \"Do not rely on PEMF alone\"", "<p>Do not rely on PEMF alone.</p>"],
  ["self red-team: \"PEMF is best used as a supplement to physiotherapy\"", "<p>PEMF is best used as a supplement to physiotherapy.</p>"],
  ["live whiplash twin: \"physiotherapy (graded mobilization, …) remains the primary active rehabilitation modality\"", "<h3>Does PEMF replace physiotherapy?</h3><p>No — physiotherapy (graded cervical mobilization, proprioceptive re-training, strength exercise) remains the primary active rehabilitation modality.</p>"],
  ["\"… allowing earlier eccentric loading, not replacing it\"", "<p>PEMF accelerates the anti-inflammatory phase — allowing earlier and more comfortable eccentric loading, not replacing it.</p>"],
  ["live tendinitis twin: \"Eccentric loading (the Alfredson protocol) remains the standard treatment\"", "<p>No. Eccentric loading (the Alfredson protocol) remains the standard treatment for mid-portion Achilles tendinopathy.</p>"],
  ["live menstrual twin: \"NSAIDs (ibuprofen, mefenamic acid) are the first-line standard\"", "<p>Current treatment remains heavily pharmacological: NSAIDs (ibuprofen, mefenamic acid) are the first-line standard.</p>"],
  ["research voice: \"has been studied as a component of multidisciplinary programs\"", "<p>PEMF therapy has been studied as a component of multidisciplinary pain-management programs.</p>"],
  ["round C: \"PEMF is optional; exercise is essential\"", "<p>PEMF is optional; exercise is essential.</p>"],
  ["round C: \"PEMF will not work unless you also exercise\"", "<p>You must still do your exercises — PEMF will not work unless you also exercise.</p>"],
  ["round C: \"the exercises do the work; PEMF supports them\"", "<p>The exercises do the work; PEMF supports them.</p>"],
  ["round C: \"Rehab is the main event and PEMF the warm-up act\"", "<p>Rehab is the main event and PEMF the warm-up act.</p>"],
  ["round C: \"PEMF is an additional treatment for patients already in physio\"", "<p>PEMF is an additional treatment for patients already in physio.</p>"],
  ["round C: \"use PEMF in combination with the physiotherapy they already receive\"", "<p>Most patients use PEMF in combination with the physiotherapy they already receive.</p>"],
  ["round C: \"Physiotherapy is the treatment; PEMF is the support\"", "<p>Physiotherapy is the treatment; PEMF is the support.</p>"],
  ["round C: \"Physiotherapy treats the cause; PEMF only treats the pain\"", "<p>Physiotherapy treats the cause; PEMF only treats the pain.</p>"],
  ["round C: \"PEMF goes hand-in-hand with your physio\"", "<p>PEMF goes hand-in-hand with your physio.</p>"],
];
const MUST_PASS = [
  ['Yaki 1696 model (EN): "together with the physiotherapy and exercises you already do"', '<p>The PainFree method brings you the electromagnetic pulse revolution: a targeted technology that works deep in the tissue and stimulates the body\'s natural healing mechanism — together with the physiotherapy and exercises you already do.</p>'],
  ['Yaki 1696 model (EN): "alongside … you are already used to doing" (רגילים לעשות)', '<p>The PainFree method stimulates the body\'s natural healing — alongside the physiotherapy and exercises you are already used to doing.</p>'],
  ['Yaki 1696 model (EN): "working alongside your physiotherapy" in a PEMF-first sentence', '<p>At the PainFree clinic network (more than 70 clinics in Israel) we offer pulsed electromagnetic field (PEMF) technology, working alongside your physiotherapy to get you back to full movement.</p>'],
  ['Yaki 1696 model (EN): "PEMF technology, working alongside your physiotherapy"', '<p>PEMF technology, working alongside your physiotherapy, gets you back to full movement.</p>'],
  ['Yaki 1696 model (EN): "the missing piece of your puzzle"', '<p>If you are already doing exercises and physiotherapy but feel progress is too slow, PainFree\'s technology is the missing piece of your puzzle.</p>'],
  ['Yaki 1696 model (EN): standard care described, PEMF as the push', '<p>The accepted treatment for the tendon is based on graded exercise, but to carry it out and give the tissue a real chance to recover, your body needs a powerful technological push.</p>'],
  ['Yaki 1696 model (EN): PEMF INSTEAD of injections', '<p>Instead of risking the tendon with steroid injections, our technology reduces pain and sensitivity without needles.</p>'],
  ['Yaki 1696 model (EN): "the key to physiotherapy\'s success"', '<p>The key to your physiotherapy\'s success: when the electromagnetic pulses calm the area and reduce the load, you can do your graded exercise programme easily.</p>'],
  ['Yaki FAQ answer (EN): "they are what lets you do it and keep at it"', '<p>No — the pulses don\'t come instead of physiotherapy; they are what lets you do it and keep at it.</p>'],
  ['PEMF leads, physio continues with it', '<p>PEMF leads the treatment; the physiotherapy and exercises you already do continue together with it.</p>'],
  ['safety: not a substitute for medical evaluation', '<p>PEMF is not a substitute for medical evaluation when you have a fever.</p>'],
  ['safety: does not replace a diagnosis', '<p>It does not replace a diagnosis — see a doctor urgently if you have numbness in the groin.</p>'],
  ['safety: not a substitute for medical or psychiatric assessment', '<p>Thyroid disease can mimic anxiety and requires diagnosis — PEMF is not a substitute for medical or psychiatric assessment.</p>'],
  ['safety: does not replace structural assessment', '<p>It does not replace structural assessment or neurological monitoring in Grade III WAD.</p>'],
  ['safety: does not replace emergency care', '<p>PEMF does not replace emergency care.</p>'],
  ['safety: not in place of a doctor\'s assessment', '<p>Use it together with a doctor\'s assessment, never in place of a doctor\'s assessment.</p>'],
  ['safety: a disclaimer whose object is a consultation with your physician', '<p>The information here does not replace a consultation with your physician.</p>'],
  ['safety: infection — "does not replace antibiotics"', '<p>PEMF does not replace antibiotics for an infected joint.</p>'],
  ['safety: "isn\'t a substitute for professional medical advice"', '<p>This article isn\'t a substitute for professional medical advice.</p>'],
  ['contraindication list', '<h2>Contraindications</h2><ul><li>Pacemaker or other implanted electronic device</li><li>Pregnancy</li><li>Active cancer at the treatment site</li></ul>'],
  ['medication safety, said directly', '<p>Keep taking the medication your doctor prescribed; never stop or change it because you started PEMF.</p>'],
  ['medication safety: alongside your existing medication', '<p>PEMF can be used alongside your existing neuropathy medication — never stop a prescribed drug without your doctor.</p>'],
  ['attributed clinician quote in a blockquote', '<blockquote>“It is most commonly offered as a complementary therapy alongside other treatments such as physiotherapy.” — Prof. Gabriel Zeilig, MD</blockquote>'],
  ['attributed Zeilig quote on another page (attribution in the adjacent unit)', '<p><strong>From Prof. Gabriel Zeilig\'s signed review:</strong></p><p><em>“The Grade A evidence establishes meaningful pain and function improvement as an adjunct — not as a replacement for active rehabilitation.”</em></p>'],
  ['"the mechanisms are complementary rather than redundant"', '<p>The mechanisms are complementary rather than redundant: PEMF acts locally on tissue biochemistry.</p>'],
  ['a cited paper title in a reference list (title blanked)', '<li>Clinical effectiveness of PEMF therapy as an adjunct treatment to eccentric exercise for Achilles tendinopathy: study protocol — Trials, 2023 (PubMed 37308969)</li>'],
  ['immunology: the complement system', '<p>While PEMF does not directly block complement activation, its effects downstream of complement (IL-6, TNF-α) reduce tissue damage.</p>'],
  ['complementary MECHANISMS (not a role)', '<p>Manual therapy and pulsed electromagnetic fields address pain through complementary mechanisms.</p>'],
  ['"not an alternative health trend" (adjective, not replacement)', '<p>PEMF therapy is not a consumer wellness device, not a magnet bracelet, and not an alternative health trend.</p>'],
  ['a drug ladder: "second-line options (gabapentin)"', '<p>Patients have exhausted second-line options (alpha-2-delta ligands: gabapentin, pregabalin).</p>'],
  ['a compound heading: "Other Fusion-Support Options"', '<h2>Other Fusion-Support Options</h2>'],
  ['a trial arm, described ("PEMF added to exercise" in an RCT)', '<p>In a randomised trial (n=40), PEMF added to an exercise programme reduced pain more than sham.</p>'],
  ['a trial result: "did not improve outcomes over exercise alone"', '<p>The investigators concluded that PEMF added to eccentric exercise did not improve outcomes over exercise alone.</p>'],
  ['a study limitation ("…the magnetic field alone")', '<p>The study had no sham arm, so the improvements cannot be attributed to the magnetic field alone.</p>'],
  ['PEMF first, physio builds on top of it', '<p>PEMF provides the anti-inflammatory substrate; physiotherapy builds on top of that substrate.</p>'],
  ['"on top of clothing"', '<p>The PEMF applicator is positioned over the treatment area — on top of clothing if necessary.</p>'],
  ['"rather than an alternative-medicine provider"', '<p>The protocol positions a PEMF clinic as a credible specialist partner rather than an alternative-medicine provider.</p>'],
  ['B2B: adding PEMF to a clinic', '<h3>Interested in adding PEMF to your clinic?</h3>'],
  ['B2B: "a valuable addition to any physiotherapy clinic"', '<p>PEMF is a valuable addition to any physiotherapy clinic.</p>'],
  ['B2B: "adds a second revenue layer to your clinic"', '<p>A PEMF system adds a second revenue layer to your clinic.</p>'],
  ['B2B: "does not replace your therapists; it frees their time"', '<p>The PainFree system does not replace your therapists; it frees their time.</p>'],
  ['pharmacology term: adjuvant medications (co-analgesics)', '<p>Adjuvant medications (anticonvulsants, antidepressants) help only 30–50% of chronic pain patients.</p>'],
  ['oncology term: adjuvant chemotherapy', '<p>Patients on adjuvant chemotherapy are not treated during active cycles.</p>'],
  ['protocol phase title with "Foundation"', '<h3>Phase 1 — Anti-Inflammatory Foundation (Sessions 1–6)</h3>'],
  ['organisation name: Arthritis Foundation', '<p>Exercise is recommended in the 2019 ACR/Arthritis Foundation guideline.</p>'],
  ['PEMF as the foundation', '<p>The most advanced clinics use all three in combination, with PEMF as the foundation treatment.</p>'],
  ['PEMF is the first-line treatment', '<p>At PainFree, PEMF is the first-line treatment for tendon pain; your physiotherapy continues together with it.</p>'],
  ['journal title in a citation', '<li>Cupping for pain: a systematic review. <em>Complementary Therapies in Medicine</em> 2024; Evidence-Based Complementary and Alternative Medicine 2019.</li>'],
  ['regulatory category (CAM classification)', '<p>PEMF is classified under PITAHC rules as a complementary and alternative medicine procedure.</p>'],
  ['medical causation: "pain secondary to osteoarthritis"', '<p>PEMF reduced knee pain secondary to osteoarthritis in the trial.</p>'],
  ['"core stabilization exercises" (not a foundation claim)', '<p>Core stabilization exercises are part of every back programme we see.</p>'],
  ['"top-up sessions" (maintenance, not a label)', '<p>Most patients book PEMF top-up sessions every few months.</p>'],
  ['"exercise leads to improvement" (causal, not a lead role)', '<p>Regular exercise leads to improvement in insulin sensitivity.</p>'],
  ['PEMF-led treatment section', '<h2>Treatment Options for Achilles Tendinopathy</h2><p>At PainFree clinics PEMF leads the treatment: the pulses calm the tendon so you can load it. The physiotherapy and eccentric loading you already do continue together with it; shockwave and injections are other options your doctor may discuss.</p>'],
  ['a "why standard treatment fails" section is context, not an options list', '<h2>Why Conventional Treatments Fall Short</h2><p>Rest, NSAIDs, injections and surgery each have limits: NSAIDs mask pain, injections weaken the tendon and surgery carries risk.</p>'],
  ['a comparison table with PEMF first', '<table><tr><th>Feature</th><th>PEMF</th><th>Physiotherapy</th><th>Shockwave</th></tr><tr><td>Needles</td><td>No</td><td>No</td><td>No</td></tr></table>'],
  ["red flag: \"surgical referral comes first\"", "<li>Severe CTS with complete thenar wasting — surgical referral comes first.</li>"],
  ["red flag: \"surgical evaluation comes first\"", "<p>For severe CTS with advanced nerve damage, surgical evaluation comes first.</p>"],
  ["trial arm: \"PEMF added to standard hypoglycemic therapy (n=38)\"", "<p>PEMF added to standard hypoglycemic therapy (n=38) produced a significant HbA1c reduction versus medication-only controls.</p>"],
  ["trial arm: \"Both groups … added to their existing pharmacological treatment\"", "<p>Both groups completed a course of magnetotherapy added to their existing pharmacological treatment.</p>"],
  ["trial arm: \"the electromagnetic field was added on top\"", "<p>The base treatment was delivered in full to both groups and the electromagnetic field was added on top.</p>"],
  ["\"in addition to\" as plain English", "<p>Cervical spondylosis presents with prominent axial pain in addition to neurological symptoms.</p>"],
  ["B2B title: \"Adding PEMF to Your Physiotherapy Clinic\"", "<html><head><title>Adding PEMF to Your Physiotherapy Clinic: 2026 Implementation Guide</title></head><body></body></html>"],
  ["B2B: \"an additional revenue channel\"", "<p>PEMF is an additional revenue channel that leans on patient volume a clinic already has.</p>"],
  ["B2B heading: \"Integration with Existing Diabetes Care Teams\"", "<h3>Integration with Existing Diabetes Care Teams</h3>"],
  ["PEMF named first in the pair: \"Combining it with active exercise is the recommended approach\"", "<p>PEMF reduces pain. Combining it with active exercise is the recommended approach, since reducing pain enables better persistence with rehabilitation.</p>"],
  ["mental-health honesty: CBT-I remains first-line (tsc psych exemption)", "<p>For chronic insomnia, CBT-I and sleep hygiene remain first-line, and PEMF works together with them.</p>"],
  ["table timing cell: PEMF \"After surgery (10–15 sessions)\"", "<table><tr><th>Grade</th><th>PEMF Sessions</th></tr><tr><td>Grade III (complete tear)</td><td>After surgery (10–15 sessions)</td></tr></table>"],
  ["table cell: \"Secondary SS + RA cohort\" (a diagnosis, not a role)", "<table><tr><th>Study</th><th>Relevance</th></tr><tr><td>RA PEMF RCTs</td><td>Secondary SS + RA cohort</td></tr></table>"],
  ["another modality is the subject: \"taping … but it does not carry the weight … on its own\"", "<p>PEMF calms the knee. The clinical takeaway: taping has a place as a cheap, immediate support, but it does not carry the weight of treatment on its own.</p>"],
  ["safety: \"never as a substitute for disease-modifying therapy\"", "<p>Not justified for MS neuropathic pain, and never as a substitute for disease-modifying therapy.</p>"],
  ["a question heading for clinicians (question, then a subtitle)", "<h1>Does Adding PEMF to a Treatment You Already Give Improve the Result? five controlled studies, two answers</h1>"],
  ["a failed-options loop is context: \"does not respond to physiotherapy, steroid injection, or shockwave\"", "<h3>My patient has been treated for tennis elbow for months with no improvement. Could it be elbow OA?</h3><p>Yes. If a patient has persistent lateral elbow pain that does not respond to physiotherapy, steroid injection, or shockwave therapy, elbow OA should be considered.</p>"],
  ["research voice with a non-positioning \"supports\": a Cochrane conclusion", "<p>The wider context supports that caution: a Cochrane review covering 19 trials and 1,249 participants concluded that it could not be determined whether adding PEMF to exercise is effective.</p>"],
  ["ALONGSIDE in a trial description", "<p>Every trial above delivered PEMF alongside a conservative programme.</p>"],
  ["ALONGSIDE, operational: \"runs alongside hands-on work in the same hour\"", "<p>A session runs about 30 minutes and does not require continuous close supervision, so it runs alongside hands-on work in the same hour.</p>"],
  ["ALONGSIDE, B2B pricing: \"integrated into packages alongside manual therapy\"", "<p>In a Philippine physiotherapy clinic, PEMF is typically priced at ₱1,500–₱2,500 per session and integrated into packages alongside manual therapy or shockwave.</p>"],
  ["B2B: \"whenever a clinic adds a system alongside an existing treatment\"", "<p>Three points recur whenever a clinic adds a system alongside an existing treatment:</p>"],
  ["B2B: \"A clinic integrated into an occupational health program\"", "<p>A clinic integrated into an occupational health program for a construction company can generate predictable patient volume.</p>"],
  ["POTS: \"salt loading\" is not exercise loading", "<p>For EDS-POTS patients, PEMF is used together with salt loading, compression garments and ivabradine.</p>"],
  ["his no-proof register, PEMF-first and no negation: \"PEMF and MLD do different jobs, and they work together\"", "<h3>Is PEMF an alternative to MLD?</h3><p>No — PEMF and MLD do different jobs, and they work together. PEMF addresses the inflammatory dimension; MLD, which has the strongest evidence base for established lymphedema, addresses the mechanical rerouting of lymph flow.</p>"],
  ["his FAQ register: \"they are what lets you start it earlier and keep at it\"", "<h3>Does PEMF replace physiotherapy post-surgery?</h3><p>No — the pulses don't come instead of physiotherapy; they are what lets you start it earlier and keep at it.</p>"],
  ["safety: \"Surgery is the only option for a complete rupture\" (no foundation word)", "<p>For a complete rupture with retraction, surgery is the only option; refer before any PEMF session.</p>"],
  ["PEMF-positive: \"not a last resort after medications have failed\"", "<p>PEMF should be considered as a first-line non-invasive intervention from the sub-acute phase onward, not a last resort after medications have failed.</p>"],
  ["PEMF subject: \"it is the first non-pharmacological device-based intervention with RCT support\"", "<p>PEMF changes this: it is the first non-pharmacological device-based intervention with RCT support for dysmenorrhea.</p>"],
  ["safety: \"PEMF does not interfere with your current treatment\"", "<p>PEMF does not interfere with your current treatment; tell your doctor you started it.</p>"],
  ["a parenthetical modality does not take the subject from PEMF: \"PEMF (with your exercises continuing) is the first-line treatment at our clinics\"", "<p>PEMF (with your exercises continuing together with it) is the first-line treatment at our clinics.</p>"],
  ["Yaki register: \"the accepted conservative programme, but compliance is poor\" (his \"הטיפול המקובל … אך\")", "<p>Eccentric heel drops are the accepted conservative programme, but compliance is poor — patients with high pain levels cannot tolerate loading in the early phase.</p>"],
  ["patient-selection line: \"Not currently undergoing graded exercise therapy programs\"", "<ul><li>Not currently undergoing graded exercise therapy programs (conflicting with pacing principle)</li></ul>"],
  ["general health: \"Exercise is essential for bone health\" (no PEMF contrast)", "<p>Weight-bearing exercise is essential for bone health.</p>"],
];
function fixtures(log = console.log) {
  let failed = 0;
  for (const [name, html] of MUST_FLAG) { const f = gradeHtml(html, 'fixture.html', { article: true }).flags; const ok = f.length > 0; if (!ok) failed++; log(`${ok ? '✓' : '✗'} FLAG  ${name}${ok ? '  [' + [...new Set(f.map(x => x.kind))].join(',') + ']' : ' — NOT flagged'}`); }
  for (const [name, html] of MUST_PASS) { const f = gradeHtml(html, 'fixture.html', { article: true }).flags; const ok = f.length === 0; if (!ok) failed++; log(`${ok ? '✓' : '✗'} PASS  ${name}${ok ? '' : ' — flagged: ' + f.map(x => `${x.kind}:${x.match}`).join(' | ')}`); }
  // Yaki's own texts are the standard (Hebrew — the English lexicon must never fire on them)
  const ydir = path.join(JACK, 'Jack/references/yaki-texts');
  if (fs.existsSync(ydir)) for (const f of fs.readdirSync(ydir).filter(x => x.endsWith('.html'))) {
    const g = gradeHtml(fs.readFileSync(path.join(ydir, f), 'utf8').replace(/<!--[\s\S]*?-->/g, ''), f).flags; const ok = g.length === 0; if (!ok) failed++;
    log(`${ok ? '✓' : '✗'} PASS  yaki-texts/${f}${ok ? '' : ' — flagged: ' + g.map(x => x.sentence).join(' | ').slice(0, 200)}`);
  }
  return failed;
}
const FIXTURE_COUNT = () => MUST_FLAG.length + MUST_PASS.length;

// ── CLI ────────────────────────────────────────────────────────────────────────────────────────────────────────────
function printReport(r) {
  const kinds = ['STRONG', 'NEGATION', 'LABEL', 'FOUNDATION', 'PLAN', 'ADDITION', 'NO_PEMF', 'PEMF_LAST', 'PEMF_LATE', 'JSONLD_PARSE'];
  const n = k => r.report.reduce((s, x) => s + x.flags.filter(f => f.kind === k).length, 0);
  for (const x of r.report) {
    console.log(`\n${x.file} — ${x.flags.length} flag(s)`);
    for (const f of x.flags) console.log(`  [${f.kind}] (${f.surface}) «${f.match}» :: ${f.sentence}`);
  }
  if (r.exempt.length) { console.log(`\nexempt (printed, never silent): ${r.exempt.length}`); for (const e of r.exempt) console.log(`  ${e.file} (${e.surface}) — ${e.why}: ${e.sentence}`); }
  for (const e of r.errors) console.log('READ ERROR ' + e);
  const sentences = r.report.reduce((s, x) => s + new Set(x.flags.map(f => f.surface + f.sentence)).size, 0);
  console.log(`\nph-addon-check: ${r.read}/${r.total} files read${r.added && r.added.length ? ` (${r.added.length} new, graded as articles)` : ''}; ${r.report.length} flagged, ${sentences} sentences — ${kinds.map(k => `${k} ${n(k)}`).join(', ')}; exempt ${r.exempt.length}`);
}
function main(argv) {
  const a = argv;
  const opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const quiet = a.includes('--quiet');
  const fx = fixtures(quiet ? () => {} : console.log);
  console.log(fx ? `ph-addon fixtures: ${fx} FAILED` : `ph-addon fixtures: all ${FIXTURE_COUNT()} hold`);
  if (a[0] === 'fixtures') return fx ? 1 : 0;
  const dir = opt('--dir') || PH_REPO;
  if (!fs.existsSync(dir)) { console.error(`ph-addon-check: PH repo not found at ${dir} — set PH_REPO or --dir. Nothing read is not a pass.`); return 1; }
  let r;
  if (a.includes('--staged') || a.includes('--index')) {
    let files = null;
    if (a.includes('--staged')) {
      const out = execFileSync('git', ['-C', dir, 'diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], { encoding: 'utf8' });
      files = out.split('\0').filter(f => /\.html?$/i.test(f) && !f.includes('/'));
    }
    r = scanIndex(dir, { files });
  } else {
    const files = opt('--files') ? opt('--files').split(',').map(s => s.trim()).filter(Boolean) : null;
    r = scanDir(dir, files);
  }
  printReport(r);
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(r, null, 1));
  return fx || r.report.length || r.errors.length || r.read === 0 ? 1 : 0;
}
if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { PH_REPO, EN_QUOTE_ALLOW, EN_CITATION_ALLOW, SIGNED_PAGES, units, parse, gradeSentence, gradeHtml, addonSentencesEn, structureFlags, scanDir, scanIndex, gradeManifestText, fixtures, main, normText };
