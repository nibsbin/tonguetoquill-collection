#import "@preview/ttq-classic-resume:0.1.0": *

#show: resume

#resume_header(
  name: {{ name | String }},
  contacts: {{ contacts | Lines }},
)

{% for card in CARDS %}
  {% if card.CARD == "section" %}
    #section_header({{ card.title | String }})
  {% elif card.CARD == "entry" %}
    #timeline_entry(
      headingLeft: {{ card.headingLeft | String }},
      headingRight: {{ card.headingRight | String }},
      subheadingLeft: {{ card.subheadingLeft | String }},
      subheadingRight: {{ card.subheadingRight | String }},
      body: {{ card.BODY | Content }},
    )
  {% elif card.CARD == "skills" %}
    #table(
      columns: 2,
      items: (
        (category: {{ card.key1 | String }}, text: {{ card.val1 | String }}),
        (category: {{ card.key2 | String }}, text: {{ card.val2 | String }}),
        (category: {{ card.key3 | String }}, text: {{ card.val3 | String }}),
        (category: {{ card.key4 | String }}, text: {{ card.val4 | String }}),
      )
    )
  {% elif card.CARD == "project" %}
    #project_entry(
      name: {{ card.name | String }},
      url: {{ card.url | String }},
      body: {{ card.BODY | Content }},
    )
  {% elif card.CARD == "certifications" %}
    #table(
      columns: 2,
      items: {{ card.items | Lines }}
    )
  {% endif %}
{% endfor %}
