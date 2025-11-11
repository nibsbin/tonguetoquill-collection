#import "@preview/tonguetoquill-usaf-memo:0.2.0": official-memorandum, indorsement

// Generate the official memorandum with validated and processed input
#show:official-memorandum.with(
  // Letterhead configuration
  letterhead-title: {{ letterhead_title | String(default="letterhead-title") }},
  letterhead-caption: {{ letterhead_caption | Lines(default=["letterhead-caption"]) }},
  letterhead-seal: image("assets/dow_seal.png"),

  // Frontmatter
  date: {{ date | Date }},
  
  // Receiver information
  memo-for: {{ memo_for | Lines(default=["memo_for"]) }},

  // Sender information
  memo-from: {{ memo_from | Lines(default=["memo_from"]) }},
  
  // Subject line
  subject: {{ subject | String(default="subject") }},

  // Optional references
  {% if references is defined %}
  references: {{ references | Lines }},
  {% endif %}

  {% if cc is defined %}
  cc: {{ cc | Lines }},
  {% endif %}

  // Optional distribution
  {% if distribution is defined %}
  distribution: {{ distribution | Lines }},
  {% endif %}

  // Optional attachments
  {% if attachments is defined %}
  attachments: {{ attachments | Lines }},
  {% endif %}

  // Optional footer tag line
  {% if tag_line is defined %}
  footer-tag-line: {{ tag_line | String }},
  {% endif %}

  // Optional classification level
  {% if classification is defined %}
  classification-level: {{ classification | String }},
  {% endif %}

  // Signature block
  signature-block: {{ signature_block | Lines(default=["signature_block"]) }},

  // Indorsements
  {% if indorsements is defined %}
  indorsements: (
    {% for ind in indorsements %}
    indorsement(
      office-symbol: {{ ind.office_symbol | String }},
      memo-for: {{ ind.memo_for | String }},
      signature-block: {{ ind.signature_block | Lines }},
      {% if ind.attachments is defined %}
      attachments: {{ ind.attachments | Lines }},
      {% endif %}
      {% if ind.cc is defined %}
      cc: {{ ind.cc | Lines }},
      {% endif %}
      separate-page: {{ ind.new_page | default(false) }},
      {% if ind.date is defined %}
      indorsement-date: {{ ind.date | Date }},
      {% endif %}
    )[ #{{ ind.body | Content }} ],
    {% endfor %}
  ),
  {% endif %}


  // List recipients in vertical list
  memo-for-cols: 1,
)

#{{ body | Content }}
