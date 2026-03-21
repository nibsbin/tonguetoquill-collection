// Formalizer Engine – rendering engine
// Renders pixel-perfect PDF form replicas from a PyMuPDF-extracted schema.

/// Global configuration for text rendering.
/// Adjust these to change the overall form text appearance.
#let FORM_MAX_TEXT_SIZE = 14pt
#let FORM_MIN_TEXT_SIZE = 6pt
#let FORM_MIN_CHARS_PER_LINE = 7

/// Should this field shrink text to a single line rather than word-wrap?
/// True for short/narrow fields with brief content (grades, ranks, dates).
#let should-shrink-to-fit(display, width, height) = {
  let aspect = width / height
  let char-count = display.len()
  char-count <= 10 or height < 20pt or aspect > 4.0
}

/// Render a text-like field with shrink-to-fit and word-wrap fallback.
#let render-text-field(display, width, height, x-inset, y-inset) = {
  set par(leading: 0.25em)
  context {
    let avail-w = width - 2 * x-inset
    let avail-h = height - 2 * y-inset
    let shrink = should-shrink-to-fit(display, width, height)

    let final-size = FORM_MIN_TEXT_SIZE
    let current = FORM_MAX_TEXT_SIZE
    let step = 0.5pt

    while current >= FORM_MIN_TEXT_SIZE {
      let m = if shrink {
        // Measure as a single line (no width constraint → no wrapping)
        measure(text(size: current, display))
      } else {
        // Measure with wrapping within the available width
        measure(block(width: avail-w, text(size: current, display)))
      }
      let char-m = measure(text(size: current, "0" * FORM_MIN_CHARS_PER_LINE))

      if m.width <= avail-w and m.height <= avail-h and char-m.width <= avail-w {
        final-size = current
        break
      }
      current = current - step
    }

    // Fallback: if shrink-to-fit hit min size and still overflows,
    // re-try with word-wrap enabled as a last resort.
    if shrink and current < FORM_MIN_TEXT_SIZE {
      current = FORM_MAX_TEXT_SIZE
      while current >= FORM_MIN_TEXT_SIZE {
        let m = measure(block(width: avail-w, text(size: current, display)))
        let char-m = measure(text(size: current, "0" * FORM_MIN_CHARS_PER_LINE))
        if m.height <= avail-h and char-m.width <= avail-w {
          final-size = current
          break
        }
        current = current - step
      }
    }

    // Default to vertically centered. Only top-align for tall "text areas".
    let vert-align = if height >= 40pt { top } else { horizon }

    box(
      width: width,
      height: height,
      clip: true,
      inset: (x: x-inset, y: y-inset),
      align(left + vert-align, text(size: final-size, display)),
    )
  }
}

/// Render a single field's content overlay.
///
/// - field-type (str): normalised lowercase type
/// - value: user-supplied value for this field (or none)
/// - width (length): field width
/// - height (length): field height
/// - field (dictionary): raw field entry from the schema
#let render-field(field-type, value, width, height, field) = {
  if field-type == "text" {
    if value != none and str(value) != "" {
      render-text-field(str(value), width, height, 1.5pt, 1pt)
    }
  } else if field-type == "checkbox" {
    if value == true {
      box(
        width: width,
        height: height,
        align(center + horizon, text(size: height * 0.8, "✓")),
      )
    }
  } else if field-type == "radio" {
    // value is true when this specific button is the selected one
    // (resolved at group level before calling this helper)
    if value == true {
      let dot-r = calc.min(width, height) * 0.3
      box(
        width: width,
        height: height,
        align(center + horizon, circle(radius: dot-r, fill: black)),
      )
    }
  } else if field-type == "combobox" or field-type == "listbox" {
    let display = if value != none { str(value) } else { "" }
    // Resolve export value → display label when options are present
    if field.at("options", default: none) != none and value != none {
      for opt in field.options {
        if str(opt.at(0)) == str(value) {
          display = str(opt.at(1))
        }
      }
    }
    if display != "" {
      render-text-field(display, width, height, 2pt, 1pt)
    }
  }
}

/// Determine whether a single radio button should appear selected.
///
/// Strategy:
///  1. If the field carries an `export_value` key, match against it.
///  2. Otherwise fall back to matching the 0-based index within the group
///     (stringified) against the supplied value.
#let radio-button-selected(field, group-value, index-in-group) = {
  if group-value == none { return false }
  let ev = field.at("export_value", default: none)
  if ev != none {
    return str(ev) == str(group-value)
  }
  // Fallback: match against the stringified index
  str(index-in-group) == str(group-value)
}

/// Draw a debug overlay rectangle with a label for a field.
///
/// - field-type (str): normalised lowercase type
/// - name (str): field name
/// - width (length): field width
/// - height (length): field height
#let debug-overlay(field-type, name, width, height) = {
  let color = if field-type == "text" {
    rgb(0, 0, 255, 40%)
  } else if field-type == "checkbox" {
    rgb(0, 128, 0, 40%)
  } else if field-type == "radio" {
    rgb(255, 165, 0, 40%)
  } else if field-type == "combobox" {
    rgb(128, 0, 128, 40%)
  } else if field-type == "listbox" {
    rgb(0, 128, 128, 40%)
  } else {
    rgb(128, 128, 128, 40%)
  }

  let stroke-color = if field-type == "text" {
    rgb(0, 0, 255)
  } else if field-type == "checkbox" {
    rgb(0, 128, 0)
  } else if field-type == "radio" {
    rgb(255, 165, 0)
  } else if field-type == "combobox" {
    rgb(128, 0, 128)
  } else if field-type == "listbox" {
    rgb(0, 128, 128)
  } else {
    rgb(128, 128, 128)
  }

  // Insert zero-width spaces after _ and - so the label can wrap
  let breakable-name = name.replace("_", "_\u{200B}").replace("-", "-\u{200B}")
  let label = breakable-name + " [" + field-type + "]"

  box(width: width, height: height, {
    // Semi-transparent colored background
    rect(width: 100%, height: 100%, fill: color, stroke: 0.5pt + stroke-color)
    // Label in top-left — uses block so text wraps within field width
    place(
      top + left,
      dx: 1pt,
      dy: 1pt,
      block(
        width: calc.max(width - 2pt, 10pt),
        fill: white,
        inset: (x: 2pt, y: 1pt),
        radius: 2pt,
        stroke: 0.3pt + stroke-color,
        breakable: false,
        text(size: 5pt, fill: stroke-color, weight: "bold", label),
      ),
    )
  })
}

/// Main entry point.
///
/// - schema (dictionary): result of `json("FIELDS.json")`
/// - backgrounds (array): list of image paths / bytes, one per page
/// - values (dictionary): field name → value; omit to render blank
/// - debug (bool): when true, draw colored overlays on each field
#let render-form(schema: none, backgrounds: (), values: (:), debug: false) = {
  assert(schema != none, message: "render-form: `schema` is required")
  assert(backgrounds.len() > 0, message: "render-form: `backgrounds` is required")
  let pages = schema.pages
  let fields = schema.fields

  // Track how many radio buttons we have seen per group so far
  let radio-counters = (:)

  for (i, page-info) in pages.enumerate() {
    let page-num = i + 1
    let page-fields = fields.filter(f => f.page == page-num)

    let bg = backgrounds.at(i)
    let pw = page-info.width * 1pt
    let ph = page-info.height * 1pt

    page(
      width: pw,
      height: ph,
      margin: 0pt,
    )[
      // Background image (the original PDF page rasterised as PNG)
      #place(top + left, image(bg, width: pw, height: ph, fit: "stretch"))

      // Field overlays
      #for field in page-fields.filter(f => ("text", "checkbox", "radio", "combobox", "listbox").contains(lower(
        f.type,
      ))) {
        let x = field.bbox.at(0) * 1pt
        let y = field.bbox.at(1) * 1pt
        let w = (field.bbox.at(2) - field.bbox.at(0)) * 1pt
        let h = (field.bbox.at(3) - field.bbox.at(1)) * 1pt

        let field-type = lower(field.type)
        let val = values.at(field.name, default: none)

        // --- Radio: resolve group-level value to per-button boolean ---
        if field-type == "radio" {
          let group-name = field.name
          let idx = radio-counters.at(group-name, default: 0)
          radio-counters.insert(group-name, idx + 1)
          val = radio-button-selected(field, val, idx)
        }

        place(
          top + left,
          dx: x,
          dy: y,
          render-field(field-type, val, w, h, field),
        )

        if debug {
          place(
            top + left,
            dx: x,
            dy: y,
            debug-overlay(field-type, field.name, w, h),
          )
        }

        // Zero-width fence to break PDF viewer text-selection grouping
        place(top + left, dx: x, dy: y, text(size: 0.001pt, "\u{FEFF}"))
      }
    ]
  }
}
