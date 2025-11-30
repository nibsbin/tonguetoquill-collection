// backmatter.typ: Backmatter rendering for CMU letter closing
//
// This module implements the closing section of a CMU letter per guidelines:
// - Signature block styling

#import "config.typ": *
#import "utils.typ": *

#let backmatter(
  signature_block: none) = {
    blank-lines(3)
    //Not sure why there is extra spacing here; setting block spacing to 0em fixes it
    block(spacing: 0em, breakable: false, ensure-string(signature_block))
}
