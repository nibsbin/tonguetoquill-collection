// primitives.typ: Reusable rendering primitives for CMU letterhead sections
//
// This module implements the visual rendering functions for all sections
// of a CMU letterhead letter following the official guidelines.

#import "config.typ": *
#import "utils.typ": *

// =============================================================================
// HEADER RENDERING
// =============================================================================
// Guidelines section 4: Header Composition
// - Wordmark (Top-Left)
// - Sender's Address Block (Immediately below wordmark)

#let render-header(
  wordmark,
  department: none,
  address: none,
  url: none,
) = {
  // CMU Wordmark
  // Guidelines 4.1: Width approx 2.25" to 2.5"
  if wordmark != none {
    box(width: 2.25in)[#wordmark]
  }

  // Vertical Offset
  // Guidelines 4.2: 0.15" to 0.2" whitespace
  v(0.15in)

  // Sender's Address Block
  // Guidelines 4.2: Flush Left
  block[
    // Department Name: Bold
    #if department != none {
      text(weight: "bold")[#department]
      linebreak()
    }

    // University Name: Regular
    Carnegie Mellon University
    linebreak()

    // Address Lines: Regular
    #if address != none {
      if type(address) == "string" {
        address
      } else if type(address) == "array" {
        address.join(linebreak())
      }
    }

    // Web Address: Regular
    // Guidelines 4.2: Additional paragraph break (6-12pt) before URL
    #if url != none {
      v(8pt)
      url
    }
  ]
}

// =============================================================================
// DATE LINE RENDERING
// =============================================================================
// Guidelines section 5.1:
// - 3-4 blank lines below the Sender's Address Block
// - Flush Left

#let render-date(date) = {
  blank-lines(3)
  align(left)[#display-date(date)]
}

// =============================================================================
// RECIPIENT BLOCK RENDERING
// =============================================================================
// Guidelines section 5.2:
// - 1 blank line below the Date Line
// - Flush Left

#let render-recipient(recipient) = {
  if recipient != none {
    blank-lines(1)
    align(left)[#ensure-string(recipient)]
  }
}

// =============================================================================
// SALUTATION RENDERING
// =============================================================================
// Guidelines section 5.3:
// - 2 blank lines below the Recipient Block
// - Flush Left

#let render-salutation(salutation) = {
  if salutation != none {
    blank-lines(2)
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
