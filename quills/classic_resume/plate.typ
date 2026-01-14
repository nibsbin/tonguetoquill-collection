#import "@local/quillmark-helper:0.1.0": data, eval-markup, parse-date
#import "@preview/ttq-classic-resume:0.1.0": *

#show: resume

#resume_header(
  name: data.name,
  contacts: data.contacts,
)

#for card in data.CARDS {
  if "title" in card and card.title != "" {
    section_header(card.title)
  }

  if card.CARD == "experience_section" {
    timeline_entry(
      headingLeft: card.headingLeft,
      headingRight: card.headingRight,
      subheadingLeft: card.subheadingLeft,
      subheadingRight: card.subheadingRight,
      body: eval-markup(card.BODY),
    )
  } else if card.CARD == "skills_section" {
    table(
      columns: 2,
      items: card.cells.map(item => (
        category: item.category,
        text: item.skills,
      ))
    )
  } else if card.CARD == "projects_section" {
    project_entry(
      name: card.name,
      url: card.url,
      body: eval-markup(card.BODY),
    )
  } else if card.CARD == "certifications_section" {
    table(
      columns: 2,
      items: card.cells
    )
  }
}
