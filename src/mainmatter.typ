// mainmatter.typ: Mainmatter show rule for CMU letter body
//
// This module implements the body text section of a CMU letter per guidelines:
// - Block style paragraphs (no indentation)
// - Single line spacing (1.0 to 1.15)
// - One blank line between paragraphs
// - Flush left / ragged right alignment

#import "config.typ": *
#import "utils.typ": *

/// Mainmatter show rule for CMU letter body content.
///
/// Guidelines section 3.1:
/// - Format: Block Style
/// - Indentation: None
/// - Spacing: Single line spacing (1.0 to 1.15)
/// - Separation: One full blank line between paragraphs
///
/// - content (content): The body content to render
/// -> content
#let mainmatter(it) = {
  // Add spacing before body text
  blank-line()

  // Set paragraph styling for body text
  set par(
    first-line-indent: 0pt,
    spacing: spacing.paragraph,  // One blank line between paragraphs
    justify: false,              // Flush left / ragged right per guidelines
  )

  // Set block spacing to match paragraph spacing
  set block(spacing: spacing.paragraph)

  // Set list styling
  set list(indent: 1em, body-indent: 0.5em)
  set enum(indent: 1em, body-indent: 0.5em)

  it
}
