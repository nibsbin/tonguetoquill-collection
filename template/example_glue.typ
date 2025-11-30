#import "@preview/tonguetoquill-cmu-letter:0.1.0": frontmatter, mainmatter, backmatter

#show: frontmatter.with(
  wordmark: image("assets/cmu-wordmark.svg"),
  department: json(bytes("\"Department Here\"")),
  address: json(bytes("[\"5000 Forbes Avenue\",\"Pittsburgh, PA 15213-3890\"]")),
  url: json(bytes("\"cmu.edu\"")),
  date: datetime(year: 2025, month: 11, day: 29),
  recipient: json(bytes("[\"[Donor's Name]\",\"[Address 1]\",\"[City, State] [Zip Code]\"]")),
)

#show: mainmatter

#eval("Dear \\[Donor's Salutation\\],\n\nThis is just greek copy to show suggested formatting. Please use Open Sans typeface if available.\n\nTiisque volecab il modit facersperrum arum nonse dolum qui omnis as sequibus molluptaquam aliquae. Aque moluptaquam facessimperi dolut etur, que a consequo et harias consenecti que disi ut inctore, odit qui quia cuptas earchillamus modi ut veror sendandae perit aut apitincipici de nobis qui commodi quatem. Volorruntios dist ent ut fuga.\n\nEnclosed, please find the:\n\n- Aditent ut lique consentota ium, same dolorepre por sim num et magnam, te volorrum ent reius, in culparum facerib repelique ercid qui optat officabo. Cum doleste modigenim ipsanim ditem eniatus estior molesequo tecti alit, aut ellacea nisitasi blabo.\n- Olore odia aut omniste nectur, et latatus, sequi od expe ea que praest aut assi ditisci isciantem sum doluptas minihit atemporibus essint aliquidellor architatur?\n\nQui quia cuptas earchillamus modi ut veror sendandae perit aut apitincipici de nobis qui commodi quatem. Volorruntios dist.\n\nRegards,\n\n", mode: "markup")

#backmatter(
  signature_block: json(bytes("[\"First M. Last\",\"Title\"]"))
)