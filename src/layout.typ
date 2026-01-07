// layout.typ

// --- Configurations ---
#let config = (
  font: "eb garamond",
  base_size: 12pt,
  leading: 0.5em, // Global spacing value (vertical rhythm)
  section_spacing: 5pt,
  entry_spacing: 5pt,
  margin: 0.5in,
)

// --- Utility Functions ---
#let vgap(amount) = v(amount)

// --- Resume Show Rule (Global Setup) ---
#let resume(content) = {
  set page(
    paper: "us-letter",
    margin: config.margin,
  )

  set text(
    font: config.font,
    size: config.base_size,
  )

  set par(
    leading: config.leading,
    justify: false,
    spacing: config.leading, // Space between paragraphs
  )

  // Enforce global block spacing for vertical rhythm
  set block(above: config.leading, below: config.leading)
  set list(spacing: config.leading)

  // Hyperlinks should be standard black text
  show link: set text(fill: black)

  content
}
