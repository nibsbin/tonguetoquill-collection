#import "@local/quillmark-helper:0.1.0": data, eval-markup, parse-date

#set text(font: "Figtree")

// Advanced: Use show filter to color text
#show regex("(?i)taro"): it => text(fill: purple)[#it]

// Filters like `String` render to code mode automatically,
#underline(data.at("title", default: ""))

// When using filters in markup mode,
// add `#` before the template expression to enter code mode.
*Author: #data.at("author", default: "")*

*Favorite Ice Cream: #data.at("ice_cream", default: "")*__


#eval-markup(data.at("BODY", default: ""))

// Present each sub-document programatically
#for card in data.at("CARDS", default: ()) {
  if card.CARD == "quotes" [
    *#card.at("author", default: "")*: _#eval-markup(card.at("BODY", default: ""))_
  ]
}


// Include an image with a dynamic asset
#if "picture" in data {
  image(data.picture)
}
