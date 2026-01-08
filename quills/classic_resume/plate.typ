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
      body: {{ card.BODY | Content }},
    )
  {% elif card.CARD == "skills" %}
    #key_value_grid(items: (
      (key: {{ card.key1 | String }}, value: {{ card.val1 | String }}),
      (key: {{ card.key2 | String }}, value: {{ card.val2 | String }}),
      (key: {{ card.key3 | String }}, value: {{ card.val3 | String }}),
      (key: {{ card.key4 | String }}, value: {{ card.val4 | String }}),
    ))
  {% elif card.CARD == "project" %}
    #project_entry(
      name: {{ card.name | String }},
      url: {{ card.url | String }},
      body: {{ card.BODY | Content }},
    )
  {% elif card.CARD == "certifications" %}
    #simple_grid(items: {{ card.items | Lines }})
  {% endif %}
{% endfor %}
