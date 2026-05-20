# What this tool does NOT do

Read this before generating any letter that will leave your computer.

---

## 1. Not a substitute for clinical judgment

The tool applies rules to your checkbox inputs. It does not see the child, the family, or the school setting. Every line of every output is a *suggestion* you must review before sending.

In particular:
- **Auto-suggested therapy referrals** can be wrong for the patient (e.g., the tool suggests psychiatry referral when you've already decided medication isn't appropriate). Use Section 7 to exclude any auto-suggestion before copying.
- **Auto-populated functional needs** (e.g., expressive language need being checked when you pick "single words") are starting points, not facts. Uncheck what doesn't apply.
- **Severity level** (SC and RRB) is purely your clinical judgment. The tool does not score it. If both feel uncertain, that uncertainty needs to be reflected in your note prose, not hidden behind a Level 2 radio button.
- **Comorbid conditions** are present only if you check the box. The tool does not infer comorbidities. If a child meets criteria for ADHD and you haven't checked ADHD, the note will not mention ADHD.

The note and letters are clinical documentation aids. They are *not* a diagnosis, *not* legal counsel, *not* a substitute for the multidisciplinary IEP team's eligibility decision.

---

## 2. Legal language in the IEP letter is not final

The IEP letter is a physician recommendation. It is *not* a legal document. The school district's evaluation and IEP team determine eligibility, services, and accommodations — not the physician.

**Known unresolved items in the current IEP letter template** (as of this writing):

- The **60-calendar-day timeline** is the federal default under IDEA, but Florida and many states have their own evaluation timeline rules. The current letter does not always hedge this correctly. Before sending, verify the timeline language matches current Florida (or applicable state) practice.
- The phrase **"specifically under the Autism eligibility category"** is acceptable as a *recommendation*, but the IEP team determines eligibility based on the school's evaluation. Some districts read this phrasing as overreach. Consider softening to "for consideration of Autism eligibility, among other categories supported by the evaluation."
- The Functional Behavior Assessment (FBA) recommendation currently says **"should be conducted by a qualified behavior analyst (BCBA)"** — this is a clinical preference, not a federal IDEA requirement. Districts vary in how they staff FBAs.
- The Behavior Intervention Plan (BIP) recommendation includes **"reviewed at minimum quarterly"** — this is best-practice language, not an IDEA legal requirement. Review with your local district if they read this as a stricter standard than they apply.
- Some accommodation lists may read as **entitlements** rather than recommendations. Districts are not required to provide every accommodation a physician recommends; the team determines what's needed for FAPE.

Before sending an IEP letter:
- Review the letter for any phrasing that could be read as overstating what IDEA or Florida rules require
- Confirm any state-specific language (timelines, eligibility rules) reflects current Florida ESE practice
- Verify dates, names, and `{placeholder}` fields are filled in

If a school district pushes back on letter language, that feedback is valuable — please pass it to the clinical lead so the template can be improved.

---

## 3. No data is stored, by design

- The tool runs entirely in your browser. Nothing is sent to a server.
- Closing the tab loses every input and output. There is no auto-save.
- This protects PHI — no risk of leakage, no HIPAA exposure from the tool itself.
- It also means you must copy your output before closing the tab.

If you accidentally close the tab mid-visit, your inputs are gone. Use **Copy Plain Text** or **Copy Rich Text** early and often.

---

## 4. Trauma disclosure to schools is opt-in for a reason

When you check "Trauma / adverse childhood experiences" in Section 5, the diagnosis is documented in the A&P note (which lives in the medical chart). It does **not** automatically flow into the IEP letter.

To include trauma context in the IEP letter, you must explicitly check the sub-checkbox **"Include in IEP letter"** that appears underneath the trauma row. Before doing so, confirm:
- The family has consented to share trauma context with the school district
- The clinical benefit (IEP team understanding behavior triggers) outweighs the privacy cost (cumulative educational record visibility)
- A reminder banner will appear above the letter preview when this is on

When included, the letter uses **functional language** ("additional psychosocial history with ongoing impact on emotional regulation and stress response"), not the ICD-10 code (F43.10) or the word "trauma." This is intentional — to give the IEP team enough information to act, without putting a diagnostic label in a record that follows the student through graduation.

If you are unsure whether to include it, leave it off. The medical chart still has the full clinical detail.

---

## 5. Specific things the tool will NOT do

- It will not generate output until you select a diagnosis status
- It will not generate an ABA letter unless the diagnosis status is "Confirmed"
- It will not show the IEP letter tab for toddlers (toddlers use Early Steps, not K-12 IDEA)
- It will not show the IEP letter tab if no school documentation status is set
- It will not run on a browser with JavaScript disabled

---

## Reporting issues

If the output is wrong, unclear, or unsafe to send — say so. This is a draft tool actively being improved. Quiet acceptance of bad output makes the tool worse for the next clinician.

Specifically valuable feedback:
- Letters that a school district has criticized or rejected
- Note language a colleague has flagged as inaccurate
- Auto-suggestions that consistently apply when they shouldn't
- Anything that looks like a typo, broken formatting, or wrong pronoun

Contact: *[insert clinical lead contact]*
