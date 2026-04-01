// form.typ (generated — do not edit)
#import "lib.typ": render-form

#let form(
  debug: false,
  award: "",  // text
  category: "",  // text
  award_period: "",  // text
  rankname_of_nominee: "",  // text
  majcom_fldcom_foa_or_dru: "",  // text
  dafscduty_title: "",  // text
  nominees_telephone: "",  // text
  unitoffice_symbol: "",  // text
  unit_commander: "",  // text
  accomplishments: "",  // text
  rankname_of_nominee_2: "",  // text
  accomplishments_continued: "",  // text
) = render-form(
  schema: json("FIELDS.json"),
  backgrounds: ("page1.png", "page2.png",),
  values: (
    "award": award,
    "category": category,
    "award_period": award_period,
    "rankname_of_nominee": rankname_of_nominee,
    "majcom_fldcom_foa_or_dru": majcom_fldcom_foa_or_dru,
    "dafscduty_title": dafscduty_title,
    "nominees_telephone": nominees_telephone,
    "unitoffice_symbol": unitoffice_symbol,
    "unit_commander": unit_commander,
    "accomplishments": accomplishments,
    "rankname_of_nominee_2": rankname_of_nominee_2,
    "accomplishments_continued": accomplishments_continued,
  ),
  debug: debug,
)
