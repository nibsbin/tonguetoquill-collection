// backmatter.typ: Backmatter rendering for CMU letter closing
//
// This module implements the closing section of a CMU letter per guidelines:
// - Closing phrase (Sincerely, Regards, etc.)
// - Space for signature (4 blank lines)
// - Sender's printed name and title

#import "config.typ": *
#import "primitives.typ": *
#import "utils.typ": *

#let backmatter(
  closing: "Sincerely,",
  signature_lines: 4,
  sender_name: none,
  sender_title: none,
) = {
  render-closing(
    closing: closing,
    signature-lines: signature_lines,
    sender-name: sender_name,
    sender-title: sender_title,
  )
}
