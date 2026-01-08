#import "@preview/ttq-classic-resume:0.1.0": *

#show: resume

#header_block(
  name: {{ name | String }},
  contacts: {{ contacts | Lines }},
)

{% for card in CARDS %}
  {% if card.CARD == "section" %}
    #section_header({{ card.title | String }})
  {% elif card.CARD == "entry" %}
    #entry_block(
      headingLeft: {{ card.headingLeft | String }},
      headingRight: {{ card.headingRight | String }},
      subheadingLeft: {{ card.subheadingLeft | String }},
      subheadingRight: {{ card.subheadingRight | String }},
      bullets: {{ card.BODY | Lines }},
    )
  {% elif card.CARD == "skill_category" %}
    #key_value_grid(items: ((key: {{ card.name | String }}, value: {{ card.details | String }}),))
  {% elif card.CARD == "project" %}
    #project_entry(
      name: {{ card.name | String }},
      url: {{ card.url | String }},
      bullets: {{ card.BODY | Lines }},
    )
  {% elif card.CARD == "certification" %}
    #simple_grid(items: ({{ card.name | String }},))
  {% endif %}
{% endfor %}
