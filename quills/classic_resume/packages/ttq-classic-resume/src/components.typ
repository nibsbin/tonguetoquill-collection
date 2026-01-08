// components.typ
#import "layout.typ": config, vgap

// --- Utility Functions ---

// Horizontal Rule
#let hrule = {
  line(length: 100%, stroke: 0.75pt)
  v(-2pt)
}

// --- Component Exports ---

// Resume Header
#let resume_header(name: "", contacts: ()) = {
  set align(left)

  // Name
  block(text(size: 18pt, weight: "bold", name))

  set text(size: config.base_size, weight: "regular")

  vgap(config.entry_spacing)

  // Contacts
  // Separator: ' ❖ '
  for i in range(0, contacts.len()) {
    let contact = contacts.at(i)
    if i > 0 {
      [~~#text("❖", size: 8pt)~~#contact]
    } else {
      [#contact]
    }
  }

  //block(contact_text)
}


// Section Header
#let section_header(title, extra: none) = {
  vgap(config.section_spacing)
  set align(left)

  // Title
  block({
    text(weight: "bold", upper(title))
    if extra != none {
      text(weight: "bold", " " + extra)
    }
  })

  hrule
}

// Timeline Entry
#let timeline_entry(
  headingLeft: "",
  headingRight: "",
  subheadingLeft: none,
  subheadingRight: none,
  body: none,
) = {
  vgap(config.entry_spacing)
  block(breakable: false, {
    // Header Grid (combined for alignment and spacing)
    let cells = (
      align(left, text(weight: "bold", headingLeft)),
      align(right, text(weight: "bold", headingRight)),
    )

    if subheadingLeft != none or subheadingRight != none {
      cells.push(align(left, text(style: "italic", subheadingLeft)))
      cells.push(align(right, text(style: "italic", subheadingRight)))
    }

    grid(
      columns: (1fr, auto),
      row-gutter: config.leading, // Use global vertical rhythm
      ..cells
    )

    // Body content (Optional)
    if body != none {
      // Style native Typst lists to match previous bullet styling
      show list: set list(
        marker: box(fill: black, width: 3.5pt, height: 3.5pt, radius: 0pt, baseline: .5em),
        body-indent: 0.8em,
        indent: 0em,
      )

      body
    }
  })
}

// Category Grid (Skills, categorized information)
#let category_grid(items: (), columns: 2) = {
  vgap(config.entry_spacing)
  // items is array of (key: "...", value: "...") dictionary

  let cell(item) = {
    block({
      text(weight: "bold", item.key)
      linebreak()
      item.value
    })
  }

  grid(
    columns: (1fr,) * columns,
    row-gutter: config.leading + config.entry_spacing,
    column-gutter: 1em,
    ..items.map(cell)
  )
}

// Item Grid (Certifications, lists, etc.)
#let item_grid(items: (), columns: 2) = {
  vgap(config.entry_spacing)
  grid(
    columns: (1fr,) * columns,
    row-gutter: config.leading,
    column-gutter: 1em,
    ..items // items are just content/strings
  )
}

// Project Entry (PROJECTS section)
#let project_entry(
  name: "",
  url: none,
  body: none,
) = {
  vgap(config.entry_spacing)
  block(breakable: false, {
    // Header Grid
    grid(
      columns: (1fr, auto),
      row-gutter: config.leading,
      align(left, text(weight: "bold", name)),
      align(right, {
        if url != none {
          // Only hyperlink if it looks like a URL
          if url.starts-with("http") {
            text(size: 8pt, font: "Courier New", emph(link(url)[#url]))
          } else {
            text(size: 8pt, font: "Courier New", url)
          }
        }
      }),
    )

    // Body content (Optional)
    if body != none {
      // Style native Typst lists to match previous bullet styling
      show list: set list(
        marker: box(fill: black, width: 3.5pt, height: 3.5pt, radius: 0pt, baseline: .5em),
        body-indent: 0.8em,
        indent: 0em,
      )

      body
    }
  })
}
