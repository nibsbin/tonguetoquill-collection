// form.typ (generated — do not edit)
#import "lib.typ": render-form

#let form(
  debug: false,
  AWARD: "",  // text
  CATEGORY_If_Applicable: "",  // text
  AWARD_PERIOD: "",  // text
  RANKNAME_OF_NOMINEE_First_Middle_Initial_Last: "",  // text
  MAJCOM_FLDCOM_FOA_OR_DRU: "",  // text
  DAFSCDUTY_TITLE: "",  // text
  NOMINEES_TELEPHONE__DSN__Commercial: "",  // text
  UNITOFFICE_SYMBOLSTREET_ADDRESSBASESTATEZIP_CODE: "",  // text
  RANKNAME_OF_UNIT_COMMANDER_First_Middle_Initial_LastCOMMANDERS_TELEPHONE_DSN__Commercial: "",  // text
  SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806: "",  // text
  RANKNAME_OF_NOMINEE_First_Middle_Initial_Last_2: "",  // text
  SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806_Continued: "",  // text
) = render-form(
  schema: json("FIELDS.json"),
  backgrounds: ("page1.svg", "page2.svg",),
  values: (
    "AWARD": AWARD,
    "CATEGORY If Applicable": CATEGORY_If_Applicable,
    "AWARD PERIOD": AWARD_PERIOD,
    "RANKNAME OF NOMINEE First Middle Initial Last": RANKNAME_OF_NOMINEE_First_Middle_Initial_Last,
    "MAJCOM FLDCOM FOA OR DRU": MAJCOM_FLDCOM_FOA_OR_DRU,
    "DAFSCDUTY TITLE": DAFSCDUTY_TITLE,
    "NOMINEES TELEPHONE  DSN  Commercial": NOMINEES_TELEPHONE__DSN__Commercial,
    "UNITOFFICE SYMBOLSTREET ADDRESSBASESTATEZIP CODE": UNITOFFICE_SYMBOLSTREET_ADDRESSBASESTATEZIP_CODE,
    "RANKNAME OF UNIT COMMANDER First Middle Initial LastCOMMANDERS TELEPHONE DSN  Commercial": RANKNAME_OF_UNIT_COMMANDER_First_Middle_Initial_LastCOMMANDERS_TELEPHONE_DSN__Commercial,
    "SPECIFIC ACCOMPLISHMENTS Use Performance Statements IAW DAFMAN 362806": SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806,
    "RANKNAME OF NOMINEE First Middle Initial Last_2": RANKNAME_OF_NOMINEE_First_Middle_Initial_Last_2,
    "SPECIFIC ACCOMPLISHMENTS Use Performance Statements IAW DAFMAN 362806 Continued": SPECIFIC_ACCOMPLISHMENTS_Use_Performance_Statements_IAW_DAFMAN_362806_Continued,
  ),
  debug: debug,
)
