# SEO Consolidation Playbook — head term "טיפול בפולסים אלקטרומגנטיים"

**Status:** Approved by Roy 2026-06-13. Ready to deploy on **painfree.org.il** (Hebrew, self-hosted WordPress / cPanel).
**Target site:** painfree.org.il — **NOT** this repo. This repo (`painfree-ph` → painfreeph.com) is the English mirror; the fix below lands on the Hebrew WordPress install.
**Owner of execution:** Roy (or Jack, with cPanel/WP deploy access per `Jack/references/deployment.md`). Claude is locked out of the live site (HTTP 403) and has no WP/cPanel credentials in the remote environment, so it cannot apply these changes directly.

---

## Problem (confirmed)

Three published Hebrew posts all compete for the exact query **"טיפול בפולסים אלקטרומגנטיים"** (keyword cannibalization). Per Eli's `weekly-performance.json` (2026-W24) the query is stuck at avg position **~12.4** with **117 weekly impressions** — split ranking signals are keeping it off page 1.

| Post | Slug | Current role | New role |
|------|------|--------------|----------|
| **4334** | `pemf-pulsed-electromagnetic-treatment-efficacy-safety-clinic-guide` | efficacy & safety / clinic operators | **CANONICAL head-term target** ✅ |
| 4308 | `pemf-pulsed-electromagnetic-therapy-clinical-guide-hebrew` | broad pillar / clinical guide | Differentiate → mechanism & "what is PEMF" long-tail |
| 4345 | `pemf-pulsed-electromagnetic-treatment-physiotherapy-clinic-onboarding` | physio clinic onboarding | Differentiate → B2B "PEMF in a physiotherapy clinic" long-tail |

## Decision (Roy, 2026-06-13)

1. **4334** is the single page that should rank for "טיפול בפולסים אלקטרומגנטיים".
2. **Differentiate + link up** for 4308 and 4345 — they have genuinely distinct intent, so **no `rel=canonical` and no 301**. Keep them indexed as standalone long-tail pages; just stop them competing for the head term and point them up to 4334.

> Why not canonical/301? A `rel=canonical` or 301 would de-index/merge 4308 and 4345. Both carry distinct value (broad clinical guide; B2B physio onboarding), so we preserve them and only remove the head-term overlap.

---

## Changes to make

> ⚠️ The exact *current* Hebrew titles/H1s could not be read (site 403s automated fetches). Confirm the live strings in WP before editing. The values below are the recommended target strings.

### 1) Post 4334 — make it own the head term

- **SEO title (Yoast/RankMath):**
  `טיפול בפולסים אלקטרומגנטיים: יעילות, בטיחות ופרוטוקול קליני | PainFree`
- **H1 (in editor):**
  `טיפול בפולסים אלקטרומגנטיים – יעילות ובטיחות: המדריך הקליני המלא`
- **Meta description:**
  `כל מה שצריך לדעת על טיפול בפולסים אלקטרומגנטיים (PEMF): נתוני יעילות ממחקרים, פרופיל בטיחות ופרוטוקול קליני מעשי לקליניקות. מדריך מבוסס-ראיות.`
- Lead the **first paragraph and the first H2** with the exact phrase "טיפול בפולסים אלקטרומגנטיים" so the head-term match is unambiguous.
- Add **outbound (down) links** to the two now-differentiated pages, using descriptive, NON-head anchors so they don't re-introduce competition:
  - → 4308, anchor e.g. `מנגנון הפעולה של PEMF` / `איך PEMF משפיע על הרקמה`
  - → 4345, anchor e.g. `הטמעת PEMF במרפאת פיזיותרפיה`

### 2) Post 4308 — differentiate to mechanism / "what is PEMF"

- **Remove the exact phrase** "טיפול בפולסים אלקטרומגנטיים" from the title, H1, slug-derived heading, and meta. Use `PEMF` / `שדות אלקטרומגנטיים פועמים` variants instead.
- **SEO title:**
  `PEMF – מדריך קליני מקיף: מנגנון הפעולה, התוויות ומחקרים | PainFree`
- **H1:**
  `PEMF – המדריך הקליני המקיף: מנגנון פעולה, התוויות ובסיס המחקר`
- **Meta description:**
  `מהו PEMF וכיצד הוא פועל? מדריך קליני מקיף למנגנון הפעולה, ההתוויות המרכזיות ובסיס הראיות המדעי של שדות אלקטרומגנטיים פועמים.`
- **Add an in-body (up) link to 4334** using the exact head-term anchor:
  `טיפול בפולסים אלקטרומגנטיים` → links to 4334. This concentrates the head-term signal on the canonical page.

### 3) Post 4345 — differentiate to B2B physio onboarding

- **Remove the exact phrase** "טיפול בפולסים אלקטרומגנטיים" from title, H1, meta. Center it on the clinic-onboarding intent.
- **SEO title:**
  `הטמעת PEMF במרפאת פיזיותרפיה: מדריך יישום לקליניקה 2026 | PainFree`
- **H1:**
  `הוספת PEMF למרפאת הפיזיותרפיה שלך: מדריך הטמעה מעשי`
- **Meta description:**
  `מדריך מעשי לפיזיותרפיסטים: כיצד להטמיע מכשיר PEMF במרפאה, פרוטוקולי טיפול, מודל הכנסה והנחיות תפעול לקליניקה ב-2026.`
- **Add an in-body (up) link to 4334** with the exact head-term anchor `טיפול בפולסים אלקטרומגנטיים` → 4334.

---

## Internal-link summary (hub-and-spoke)

```
        4334  (hub — owns "טיפול בפולסים אלקטרומגנטיים")
        ▲   ▲
 head-anchor │   │ head-anchor          (4308 & 4345 link UP with the exact head phrase)
        │   │
      4308   4345
        ▲   ▲
        └───┴── 4334 links DOWN with descriptive non-head anchors (mechanism / physio onboarding)
```

## Deployment steps (WordPress)

1. Edit each post's **SEO title + meta description** in the SEO plugin (Yoast / RankMath) and the **H1 / first paragraph** in the block editor per above.
2. Add the three internal links (two "up" to 4334, two "down" from 4334).
3. **Do NOT** add `rel=canonical` between these posts and **do NOT** create redirects.
4. Clear any page cache (cPanel / caching plugin / Cloudflare) so the new titles are served.
5. In **Google Search Console → URL Inspection**, request (re)indexing for all three URLs.

## Verification (set a reminder for ~2026-W27)

- Re-check GSC for "טיפול בפולסים אלקטרומגנטיים": expect impressions/clicks to concentrate on **4334** and avg position to move toward page 1 (target < 10, ideally < 5).
- Confirm 4308 and 4345 are still indexed (not dropped) and are picking up their new long-tail queries.
- If after 2–3 weeks 4334 has *not* improved and 4308/4345 still surface for the head term, escalate to `rel=canonical` (4308/4345 → 4334) as a stronger consolidation step.

---

_Diagnosis source: Jack/references/feedback-log.md (2026-06-13) + Eli weekly-performance.json (2026-W24). Jack correctly declined to publish a 4th article on this phrase to avoid worsening cannibalization._
