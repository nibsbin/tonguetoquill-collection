I visually mapped out a bunch of fields on the form to the typst field names. The intent is to write a plate and field schema that interfaces with the Typst form and exposes an ergonomic API to the Quill consumer. See [Creating Quills](https://quillmark.readthedocs.io/en/latest/guides/creating-quills/) to learn how to write the field schema. 

Note that the following field names are not authortative; use your discretion to name them ergonomically.

## Admin Fields

Name: `commonforms_text_p1_1`
Unit: `commonforms_text_p1_2`
Grade/CCC Level: `commonforms_text_p1_3`

## Record of Experience table fields

Date: `commonforms_text_p1_{4,7,18,...,109}` and `commonforms_text_p2_{1,8,15,...141}`
Mandatory Actions to be Reported: `commonforms_text_p1_{5,12,19,...,110}` and `commonforms_text_p2_{2,9,16,...,142}`
written_grade: `commonforms_text_p1_{6,13,...111}` and `commonforms_text_p2_{3,10,...,143}`
writen_grade_date: `commonforms_text_p1_{7,14,...,112}` and `commonforms_text_p2_{4,11,144}`
positional_grade: `commonforms_text_p1_{8,15,...,113}` and `commonforms_text_p2_{5,12,...,145}`
positional_grade_date: `commonforms_text_p1_{9,...,114}` and
`commonforms_text_p2_{6,...,145}`
auth_or_remarks: `commonforms_text_p1_{10,...,115}` and `commonforms_text_p2_{7,...,146}`