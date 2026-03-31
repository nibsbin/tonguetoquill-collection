#import "@local/quillmark-helper:0.1.0": data
#import "@local/typst-daf1206:0.1.0": form

#set text(font: "Arimo")

// Build the values dictionary for the form
#let vals = (:)

// --- Admin fields (page 1 header) ---
#if "AWARD" in data { vals.insert("AWARD", data.AWARD) }
#if "CATEGORY" in data { vals.insert("CATEGORY_If_Applicable", data.CATEGORY) }
#if "AWARD_PERIOD" in data { vals.insert("AWARD_PERIOD", data.AWARD_PERIOD) }

#if "RANKNAME_OF_NOMINEE" in data { vals.insert("RANKNAME_OF_NOMINEE_First_Middle_Initial_Last", data.RANKNAME_OF_NOMINEE) }
#if "RANKNAME_OF_NOMINEE" in data { vals.insert("RANKNAME_OF_NOMINEE_First_Middle_Initial_Last_2", data.RANKNAME_OF_NOMINEE) }

#if "MAJCOM_FLDCOM_FOA_OR_DRU" in data { vals.insert("MAJCOM_FLDCOM_FOA_OR_DRU", data.MAJCOM_FLDCOM_FOA_OR_DRU) }
#if "DAFSCDUTY_TITLE" in data { vals.insert("DAFSCDUTY_TITLE", data.DAFSCDUTY_TITLE) }
#if "NOMINEES_TELEPHONE" in data { vals.insert("NOMINEES_TELEPHONE__DSN__Commercial", data.NOMINEES_TELEPHONE) }
#if "UNITOFFICE_SYMBOL" in data { vals.insert("UNITOFFICE_SYMBOLSTREET_ADDRESSBASESTATEZIP_CODE", data.UNITOFFICE_SYMBOL) }
#if "UNIT_COMMANDER" in data { vals.insert("RANKNAME_OF_UNIT_COMMANDER_First_Middle_Initial_LastCOMMANDERS_TELEPHONE_DSN__Commercial", data.UNIT_COMMANDER) }

// --- Accomplishments (page 1 & 2 content) ---
#if "ACCOMPLISHMENTS" in data { vals.insert("SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806", data.ACCOMPLISHMENTS) }
#if "ACCOMPLISHMENTS_CONTINUED" in data { vals.insert("SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806_Continued", data.ACCOMPLISHMENTS_CONTINUED) }

// Render the form with assembled values
#form(..vals)
