// form.typ (generated — do not edit)
#import "lib.typ": render-form

#let form(
  debug: false,

) = render-form(
  schema: json("FIELDS.json"),
  backgrounds: ("page1.png",),
  values: (
,
  ),
  debug: debug,
)
