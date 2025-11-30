// backmatter.typ: Backmatter rendering for CMU letter closing
//
// This module implements the closing section of a CMU letter per guidelines:
// - Signature block styling

#import "config.typ": *
#import "utils.typ": *

#let backmatter(
  signature_block: none) = {
    for value in range(0,4) {
          linebreak()
    }
  block(breakable: false, ensure-string(signature_block))
}
