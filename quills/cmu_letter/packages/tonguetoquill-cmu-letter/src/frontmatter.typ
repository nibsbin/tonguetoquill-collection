// frontmatter.typ: Frontmatter show rule for CMU letterhead
//
// This module implements the frontmatter (heading section) of a CMU letter
// per the official letterhead guidelines. It handles:
// - Page setup with proper margins
// - Header rendering (logo, department, address, URL)
// - Date, recipient, and salutation placement

#import "config.typ": *
#import "primitives.typ": *
#import "utils.typ": *

#let frontmatter(
  // Header content
  wordmark: none,
  department: none,
  address: none,
  url: none,

  // Letter metadata
  date: none,
  recipient: none,

  // Typography options
  body_font: DEFAULT_BODY_FONTS,
  font_size: DEFAULT_FONT_SIZE,

  it
) = {
  let actual_date = if date == none { datetime.today() } else { date }

  configure(body_font, font-size: font_size, {
    set page(
      paper: "us-letter",
      // Standard 1" margins for vertical flow layout
      margin: MARGINS,
    )

    // Render the header (in normal document flow)
    render-header(
      wordmark,
      department: department,
      address: address,
      url: url,
    )

    blank-lines(2)

    // Date and recipient in same paragraph to avoid extra spacing
    [#display-date(actual_date)]
    render-recipient(recipient)

    // Store metadata for downstream sections
    metadata((
      date: actual_date,
      body_font: body_font,
      font_size: font_size,
    ))

    it
  })
}
