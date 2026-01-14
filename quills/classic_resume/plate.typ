#import "@local/quillmark-helper:0.1.0": data, eval-markup, parse-date
#import "@preview/ttq-classic-resume:0.1.0": *

#show: resume

#resume_header(
  name: data.at("name", default: ""),
  contacts: data.at("contacts", default: ()),
)

#for card in data.at("CARDS", default: ()) {
  if "title" in card and card.title != "" {
    section_header(card.title)
  }

  if card.CARD == "experience_section" {
    timeline_entry(
      headingLeft: card.at("headingLeft", default: ""),
      headingRight: card.at("headingRight", default: ""),
      subheadingLeft: card.at("subheadingLeft", default: ""),
      subheadingRight: card.at("subheadingRight", default: ""),
      body: eval-markup(card.at("BODY", default: "")),
    )
  } else if card.CARD == "skills_section" {
    table(
      columns: 2,
      items: card
        .at("cells", default: ())
        .map(item => (
          category: item.at("category", default: ""),
          text: item.at("skills", default: ""),
        ))
    )
  } else if card.CARD == "projects_section" {
    project_entry(
      name: card.at("name", default: ""),
      url: card.at("url", default: ""),
      body: eval-markup(card.at("BODY", default: "")),
    )
  } else if card.CARD == "certifications_section" {
    table(
      columns: 2,
      items: card.at("cells", default: ())
    )
  }
}
