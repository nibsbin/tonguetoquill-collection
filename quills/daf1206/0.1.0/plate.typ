#import "@local/quillmark-helper:0.1.0": data
#import "@local/typst-daf1206:0.1.0": form

#set text(font: "Arimo")

// Build the values dictionary for the form
#let vals = (:)

// --- Admin fields (page 1 header) ---
#if "award" in data { vals.insert("award", data.award) }
#if "category" in data { vals.insert("category", data.category) }
#if "award_period" in data { vals.insert("award_period", data.award_period) }

#if "rankname_of_nominee" in data { vals.insert("rankname_of_nominee", data.rankname_of_nominee) }
#if "rankname_of_nominee" in data { vals.insert("rankname_of_nominee_2", data.rankname_of_nominee) }

#if "majcom_fldcom_foa_or_dru" in data { vals.insert("majcom_fldcom_foa_or_dru", data.majcom_fldcom_foa_or_dru) }
#if "dafscduty_title" in data { vals.insert("dafscduty_title", data.dafscduty_title) }
#if "nominees_telephone" in data { vals.insert("nominees_telephone", data.nominees_telephone) }
#if "unitoffice_symbol" in data { vals.insert("unitoffice_symbol", data.unitoffice_symbol) }
#if "unit_commander" in data { vals.insert("unit_commander", data.unit_commander) }

// --- Accomplishments (page 1 & 2 content) ---
#if "accomplishments" in data { vals.insert("accomplishments", data.accomplishments) }
#if "accomplishments_continued" in data { vals.insert("accomplishments_continued", data.accomplishments_continued) }

// Render the form with assembled values
#form(..vals)
