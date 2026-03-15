#import "@local/quillmark-helper:0.1.0": data
#import "@local/typst-af4141:0.1.0": form

// AF4141 supports 16 rows on page 1 and 21 rows on page 2
#let max-experience-rows = 37

// Column order within each 7-field row group
#let col-keys = (
  "date",
  "action",
  "written_grade",
  "written_grade_date",
  "positional_grade",
  "positional_grade_date",
  "auth_or_remarks",
)

// Build the values dictionary for the form
#let vals = (:)

// --- Admin fields (page 1 header) ---
#if "name" in data { vals.insert("commonforms_text_p1_1", data.name) }
#if "unit" in data { vals.insert("commonforms_text_p1_2", data.unit) }
#if "grade" in data { vals.insert("commonforms_text_p1_3", data.grade) }
#if "commanders_auth" in data { vals.insert("commonforms_text_p1_116", data.commanders_auth) }

// --- Experience table rows from cards ---
#{
  let row = 0
  for card in data.CARDS {
    if card.CARD == "experience" {
      // Silently ignore cards that exceed the form capacity
      if row < max-experience-rows {
        for (col, key) in col-keys.enumerate() {
          let value = card.at(key, default: "")
          if value != "" {
            let field-name = if row < 16 {
              // Page 1: fields start at index 4, stride 7
              "commonforms_text_p1_" + str(4 + row * 7 + col)
            } else {
              // Page 2: fields start at index 1, stride 7
              "commonforms_text_p2_" + str(1 + (row - 16) * 7 + col)
            }
            vals.insert(field-name, value)
          }
        }
      }
      row = row + 1
    }
  }
}

// Render the form with assembled values
#form(..vals)
