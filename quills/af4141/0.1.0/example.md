---
QUILL: af4141@0.1
# EDIT: Full name in Last, First, Middle Initial format
name: "LAST, FIRST M."
# EDIT: Unit of assignment (e.g., "1 ACCS/DOT", "726 ACS/MOC")
unit: "UNIT/SYMBOL"
# EDIT: Current grade or CCC level (e.g., "SSgt", "GS-12", "3")
grade: "GRADE"
# EDIT: Commander's authentication entry — often a commander's name/signature block or "Verified by unit commander"
commanders_auth: ""
---

<!-- ═══════════════════════════════════════════════════════════════
     RECORD OF EXPERIENCE CARDS
     Each card below becomes one row in the experience table.
     Page 1 holds up to 16 rows; Page 2 holds up to 21 rows (37 max).

     Required reportable actions include:
       • Initial/subsequent duty assignment
       • Written and/or positional upgrade evaluations
       • Certification events (Mission Ready, Senior Director, etc.)
       • Downgrade or decertification
       • PCS/PCA departure
       • Temporary duty of significant duration
       • Any other commander-directed entry

     Leave blank any columns that do not apply to a given entry.
═══════════════════════════════════════════════════════════════ -->

<!-- Example 1: Initial assignment to a unit -->
---
CARD: experience
date: 2025-01-15
action: "Assigned to 1 ACCS/DOT as Weapons Director"
written_grade: ""
written_grade_date: 2025-01-15
positional_grade: ""
positional_grade_date: 2025-01-15
auth_or_remarks: "Initial assignment"
---

<!-- Example 2: Written upgrade evaluation -->
---
CARD: experience
date: 2025-03-15
action: "Completed written upgrade evaluation for 3-Level"
written_grade: "3"
written_grade_date: 2025-03-15
positional_grade: ""
positional_grade_date: 2025-03-15
auth_or_remarks: "Per AFMAN 13-1CRCV1"
---

<!-- Example 3: Positional (live-environment) upgrade / certification -->
---
CARD: experience
date: 2025-06-20
action: "Certified Mission Ready — positional upgrade"
written_grade: ""
written_grade_date: 2025-06-20
positional_grade: "4"
positional_grade_date: 2025-06-20
auth_or_remarks: "SSgt Jones, T.R."
---

<!-- Example 4: Combined written + positional upgrade (both columns filled) -->
---
CARD: experience
date: 2025-08-01
action: "Upgrade evaluation — written and positional"
written_grade: "4"
written_grade_date: 2025-08-01
positional_grade: "4"
positional_grade_date: 2025-08-01
auth_or_remarks: "Verified by unit commander"
---

<!-- Example 5: PCS departure — no grade columns needed -->
---
CARD: experience
date: 2025-09-01
action: "PCS to 726 ACS/MOC, Tinker AFB OK"
written_grade: ""
written_grade_date: 2025-09-01
positional_grade: ""
positional_grade_date: 2025-09-01
auth_or_remarks: "Outprocessed 1 ACCS/DOT"
---
