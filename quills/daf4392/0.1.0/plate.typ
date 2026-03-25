#import "@local/quillmark-helper:0.1.0": data

#set page(width: 8.5in, height: 11in, margin: 0in)
#set text(font: "Arimo", size: 10pt)

// Background
#place(image("assets/page1.png", width: 100%, height: 100%))

#let tf(dx, dy, content) = place(dx: dx, dy: dy, content)
#let check(dx, dy, is_checked) = if is_checked { place(dx: dx, dy: dy, text(weight: "bold", size: 12pt)[✓]) }

// Mode of Transportation
#let mode = data.at("transportation_mode", default: "")
#check(40pt, 67pt, mode == "pmv")
#check(173pt, 67pt, mode == "airplane")
#check(243pt, 67pt, mode == "bus")
#check(286pt, 67pt, mode == "train")
#check(336pt, 67pt, mode == "motorcycle")
#check(411pt, 67pt, mode == "other")

// Fields
#tf(40pt, 100pt)[#data.at("departure_date", default: "")]
#tf(123pt, 100pt)[#data.at("final_destination", default: "")]

// Itinerary Rows (via CARDS)
#{
  let row = 0
  let dy-start = 160pt
  let dy-step = 40pt
  if "CARDS" in data {
    for card in data.CARDS {
      if card.CARD == "itinerary" and row < 10 {
        let dy = dy-start + (row * dy-step)
        tf(80pt, dy)[#card.at("date", default: "")]
        tf(135pt, dy)[#card.at("departure_point", default: "")]
        tf(295pt, dy)[#card.at("arrival_point", default: "")]
        tf(450pt, dy)[#card.at("rest_length", default: "")]
        tf(515pt, dy)[#card.at("mileage", default: "")]
        row = row + 1
      }
    }
  }
}

// Flight Info
#{
  let d-flight = str(data.at("dept_flight_num", default: ""))
  if d-flight != "" { tf(400pt, 545pt)[#text(weight: "bold")[Dept Flight:] #d-flight] }
  
  let a-flight = str(data.at("arrival_flight_num", default: ""))
  if a-flight != "" { tf(450pt, 545pt)[#text(weight: "bold")[Arr Flight:] #a-flight] }
}

// Notes
#tf(40pt, 565pt)[#block(width: 530pt)[#data.at("notes", default: "")]]

// Acknowledgements
#tf(40pt, 620pt)[#data.at("organization", default: "")]
#tf(500pt, 620pt)[#data.at("briefed_date", default: "")]

#tf(40pt, 650pt)[#data.at("briefee_name", default: "")]
#tf(270pt, 650pt)[#data.at("briefee_grade", default: "")]

#tf(40pt, 680pt)[#data.at("briefer_name", default: "")]
#tf(270pt, 680pt)[#data.at("briefer_grade", default: "")]

// Emergency Contact
#tf(40pt, 700pt)[#text(size: 10pt, weight: "bold")[EMERGENCY CONTACT:] #text(size: 10pt)[#data.at("emergency_contact_name", default: ""): #data.at("emergency_contact_phone", default: "")]]
