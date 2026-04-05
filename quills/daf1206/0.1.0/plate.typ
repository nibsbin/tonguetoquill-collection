#import "@local/quillmark-helper:0.1.0": data
#import "@local/typst-daf1206:0.1.0": form

#set text(font: "Arimo")

// Build the values dictionary for the form
#let vals = (:)

// --- Admin fields (page 1 header) ---
#if "award" in data { vals.insert("AWARD", data.award) }
#if "category" in data { vals.insert("CATEGORY_If_Applicable", data.category) }
#if "award_period" in data { vals.insert("AWARD_PERIOD", data.award_period) }

#if "rankname_of_nominee" in data { vals.insert("RANKNAME_OF_NOMINEE_First_Middle_Initial_Last", data.rankname_of_nominee) }
#if "rankname_of_nominee" in data { vals.insert("RANKNAME_OF_NOMINEE_First_Middle_Initial_Last_2", data.rankname_of_nominee) }

#if "majcom_fldcom_foa_or_dru" in data { vals.insert("MAJCOM_FLDCOM_FOA_OR_DRU", data.majcom_fldcom_foa_or_dru) }
#if "dafscduty_title" in data { vals.insert("DAFSCDUTY_TITLE", data.dafscduty_title) }
#if "nominees_telephone" in data { vals.insert("NOMINEES_TELEPHONE__DSN__Commercial", data.nominees_telephone) }
#if "unitoffice_symbol" in data { vals.insert("UNITOFFICE_SYMBOLSTREET_ADDRESSBASESTATEZIP_CODE", data.unitoffice_symbol) }
#if "unit_commander" in data { vals.insert("RANKNAME_OF_UNIT_COMMANDER_First_Middle_Initial_LastCOMMANDERS_TELEPHONE_DSN__Commercial", data.unit_commander) }

// --- Accomplishments (page 1 & 2 content) ---
#if "accomplishments" in data { vals.insert("SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806", data.accomplishments) }
#if "accomplishments_continued" in data { vals.insert("SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806_Continued", data.accomplishments_continued) }

// Render the form with assembled values
#form(..vals)
