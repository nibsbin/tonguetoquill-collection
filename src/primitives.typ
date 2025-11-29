// primitives.typ: Reusable rendering primitives for CMU letterhead sections
//
// This module implements the visual rendering functions for all sections
// of a CMU letterhead letter following the official guidelines.

#import "config.typ": *
#import "utils.typ": *

// =============================================================================
// HEADER COLUMN RENDERING (LEFT MARGIN)
// =============================================================================
// Guidelines section 3.2 - Header (Left Column):
// - CMU Wordmark (Top Left)
// - Department Name
// - Physical Address
// - Web URL (e.g., cmu.edu)

#let render-header-column(
  wordmark,
  department: none,
  address: none,
  url: none,
) = {
  // Position header content in the left margin, at absolute position from page top
  place(
    top + left,
    dx: -MARGINS.left + 0.5in,
    dy: 0pt,
    float: true,
    block(width: HEADER_COLUMN_WIDTH)[
      // CMU Wordmark
      #if wordmark != none {
        box(width: 1.75in)[#wordmark]
        v(0.75em)
      }

      // Department name - Iron Gray per guidelines
      #if department != none {
        text(size: 9pt, fill: CMU_IRON_GRAY, weight: "bold")[#department]
        v(0.5em)
      }

      // Physical address - Iron Gray
      #if address != none {
        text(size: 8pt, fill: CMU_IRON_GRAY)[#ensure-string(address)]
        v(0.5em)
      }

      // Web URL - Iron Gray
      #if url != none {
        text(size: 8pt, fill: CMU_IRON_GRAY)[#url]
      }
    ]
  )
}

// =============================================================================
// DATE LINE RENDERING
// =============================================================================
// Guidelines section 3.2:
// - Aligns with the body text margin (2.25" from left)
// - Format: Month Day, Year (e.g., November 29, 2025)

#let render-date(date) = {
  align(left)[#display-date(date)]
}

// =============================================================================
// RECIPIENT BLOCK RENDERING
// =============================================================================
// Guidelines section 3.2:
// - Place 2-4 lines below the date
// - Includes Name, Title, Company/Institution, and Mailing Address

#let render-recipient(recipient) = {
  if recipient != none {
    blank-lines(2)
    align(left)[#ensure-string(recipient)]
  }
}

// =============================================================================
// SALUTATION RENDERING
// =============================================================================
// Guidelines section 3.2:
// - Formal: Dear Dr. [Last Name], or Dear Professor [Last Name],
// - Business: Dear Mr./Ms. [Last Name],

#let render-salutation(salutation) = {
  if salutation != none {
    blank-line()
    align(left)[#salutation]
  }
}

// =============================================================================
// CLOSING RENDERING
// =============================================================================
// Guidelines section 3.2:
// - Sincerely, (Standard) or Regards, (Internal/Familiar)
// - Followed by 4 blank lines for signature
// - Sender's Printed Name and Title

#let render-closing(
  closing: "Sincerely,",
  signature-lines: 4,
  sender-name: none,
  sender-title: none,
) = {
  blank-line()
  align(left)[#closing]

  // Space for signature
  blank-lines(signature-lines, weak: false)

  // Sender name and title
  if sender-name != none {
    align(left)[#sender-name]
  }
  if sender-title != none {
    align(left)[#sender-title]
  }
}
