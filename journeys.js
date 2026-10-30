/* How the money is obtained for each program, and the full step by step path until travel.
   FUNDING[id].how: "auto" = comes with admission, "separate" = separate scholarship application,
   "none" = no scholarship needed (no tuition, you live on your own money), "partial" = possible but not guaranteed. */

const FUNDING = {
  /* ---------- Mayar and Rodayna ---------- */
  "passau-aie": { how: "none", text: "There is no scholarship to apply for: the university has no tuition, so admission alone is enough. You pay only the semester fee and live on your blocked account money.", apply: [
    "Create a uni-assist account and upload: degree, transcript, MOI letter, module descriptions, CV, project abstract, passport",
    "Choose Passau M.Sc. AI Engineering (summer 2027) and pay the EUR 75 uni-assist fee",
    "Submit between 1 Nov and 15 Dec 2026",
    "uni-assist checks your papers and forwards them to Passau (about 4 to 6 weeks)",
    "Receive the admission letter from Passau by email" ] },
  "passau-cs": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "In the same uni-assist account, add Passau M.Sc. Computer Science (EUR 30 as a second application)",
    "Submit by 15 Dec 2026",
    "Receive the admission letter by email" ] },
  "thws-ai": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Email mai.fiw@thws.de to confirm your MOI letter is accepted",
    "Request a uni-assist VPD for THWS now (takes 4 to 6 weeks, EUR 75)",
    "Fill the THWS application form (Summer 2027 version) digitally",
    "Apply on the THWS CampusPortal and pay the EUR 50 application fee; aim for 15 Nov 2026",
    "Upload the VPD when it arrives (final deadline 15 Dec 2026)",
    "Receive the admission letter" ] },
  "tud-aiml": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Fill TU Darmstadt's Academic Eligibility Checklist (match 60 ECTS of your courses)",
    "Optional: take the GRE to avoid the on-campus entrance exam",
    "Apply online on TUCaN between 1 Dec 2026 and 15 Jan 2027",
    "Print, sign and courier the application form and documents so they ARRIVE by 15 Jan",
    "If asked, sit the entrance exam in Darmstadt in early March (or send GRE / GATE by 20 Feb)",
    "Receive the admission letter" ] },
  "hildesheim-da": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Apply now on the Data Analytics online portal (free, rolling admission, deadline 15 Dec 2026)",
    "Upload MOI letter, English degree certificate, transcript, CV",
    "Wait for the decision email (do not send paper documents before it)" ] },
  "dortmund-ds": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Fill the self-disclosure form (sign it twice) and take the online self-assessment test",
    "Apply through uni-assist (about 18 Nov 2026 to 15 Jan 2027, EUR 75)",
    "Receive the admission letter" ] },
  "hhu-aids": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Request the uni-assist VPD for HHU at least 8 weeks before the deadline",
    "Apply on the HHU portal by 15 Jul 2027",
    "Receive the admission letter" ] },
  "tuhh-ds": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Take IELTS (6.5) or TOEFL (90)",
    "Do the TUHH online pre-check and application between 1 Dec 2026 and 1 Mar 2027 (free)",
    "Receive the admission letter" ] },
  "mun-cs": { how: "auto", text: "The money comes WITH admission, not from a separate scholarship: when a professor agrees to supervise you, your admission offer states the funding (about CAD 20,000 per year). There is nothing extra to apply for, but you MUST find the supervisor.", apply: [
    "Find 3 to 5 MUN Computer Science professors working on ML / generative AI",
    "Email each one: who you are, why their work, your project, CV and GitHub attached",
    "Apply online to the M.Sc. CS (thesis) and pay CAD 120 by 1 Dec 2026; name the professors who replied",
    "Upload the MOI letter as 'Grad Proof of English Proficiency'",
    "Your 3 referees submit their letters online",
    "Receive the offer letter that states your funding amount, and accept it" ] },
  "vt-cs": { how: "separate", text: "The tuition waiver and stipend come from a GTA or GRA job, not automatically. You ask for assistantship consideration in your application, and the department or a professor offers it. Check the offer before accepting.", apply: [
    "Email the VT CS graduate office to confirm your MOI letter is accepted",
    "Apply online by about 15 Dec 2026 and say you want to be considered for a GTA / GRA",
    "Mention your TA experience at Pharos in the statement of purpose",
    "Contact professors whose labs might hire a GRA",
    "Receive the admission offer and check it includes the assistantship" ] },
  "asu-ai": { how: "partial", text: "Funding is NOT automatic: PhD students get it as teaching or research assistants. Ask professors whether they have funded places, and only accept an offer that includes funding.", apply: [
    "Email AI professors at ASU to ask about funded PhD places",
    "Fill the ASU Medium of Instruction Form and attach the Pharos MOI letter",
    "Apply by 31 Dec 2026 with 3 letters, letter of intent and CV",
    "Accept only an offer that includes an assistantship" ] },
  "gt-phd": { how: "auto", text: "PhD admission at Georgia Tech normally comes with funding (research assistantship: tuition + stipend). It is stated in the offer letter.", apply: [
    "Pick 2 to 3 professors and explain the fit in your research statement",
    "Apply by mid December 2026 with 3 strong letters",
    "Receive the offer with the funding details" ] },
  "lakehead-ai": { how: "partial", text: "Funding is NOT guaranteed: it comes from a professor's grant or a teaching assistantship. Only go if a professor confirms funding in writing.", apply: [
    "Email Lakehead professors in AI and ask about funded thesis positions",
    "Ask Pharos to email the MOI letter directly to gstudent@lakeheadu.ca",
    "Apply with the Computer Science Background Form, CV and 3 references",
    "Accept only with a written funding offer" ] },
  "hkust-mphil": { how: "auto", text: "The Postgraduate Studentship (HKD 229,620 per year) comes with the MPhil admission offer. There is no separate scholarship form, but a professor has to agree to supervise you.", apply: [
    "Find HKUST CSE professors in ML and email them with your CV and diffusion model project",
    "Apply online on the HKUST graduate portal as early as possible (rolling)",
    "Do the interview with the professor if invited",
    "Receive the offer letter that includes the studentship" ] },
  "sh-elte": { how: "separate", text: "Separate scholarship: you apply to Stipendium Hungaricum (the Hungarian government scholarship), choosing the ELTE program inside that application. You also need a nomination from Egypt's Ministry of Higher Education. If you win, tuition, dorm and stipend are all included.", apply: [
    "When the portal opens (expected mid November), create an account on apply.stipendiumhungaricum.hu",
    "Choose ELTE M.Sc. Computer Science (AI) as your first choice (you can add a second)",
    "Upload MOI letter, degree, transcript, motivation letter, recommendation letters, medical certificate, passport",
    "Ask Egypt's Cultural and Missions Sector (eman.eid@cdm.edu.eg) for the nomination and follow their deadline",
    "Submit by about 15 Jan 2027",
    "Do the ELTE online interview (spring)",
    "Get the final scholarship result (usually June)" ] },
  "iyt-italy": { how: "separate", text: "Two separate steps: first you get admitted to an Italian university program that is on the Invest Your Talent list, then you apply to the Invest Your Talent scholarship (Italian Foreign Ministry). Fees are waived only if you win the scholarship.", apply: [
    "Choose an English AI / data / computer engineering master's that is on the IYT program list",
    "Apply to that university (deadlines usually winter to spring)",
    "When the IYT call opens (expected April 2027), apply online with your MOI certificate",
    "Get the scholarship result (summer)" ] },
  "csc-hust": { how: "separate", text: "Separate scholarship: you apply to the Chinese Government Scholarship (CSC) through the CSC online system AND to the university. If you win, everything is covered.", apply: [
    "Choose an English-taught program at HUST (or another CSC university)",
    "Fill the CSC online application (Type B, through the university) between about November and February",
    "Apply on the university's own portal and upload the CSC form",
    "Upload study plan, 2 recommendation letters, physical examination form, notarized degree and transcript",
    "Get the result (usually June to July)" ] },
  "hbku-ds": { how: "partial", text: "Merit-based funding (full or partial tuition waiver, stipend) is decided with your admission. It is not guaranteed; check your offer.", apply: [
    "Apply on the HBKU portal with the MOI documentation",
    "Ask in your application to be considered for full funding",
    "Receive the offer and check the funding part" ] },
  "eth-cs": { how: "separate", text: "Separate scholarship inside the same portal: you apply to the master's AND to the Excellence Scholarship (ESOP) in ETH eApply, by 30 Nov. Without ESOP there is no tuition waiver or stipend.", apply: [
    "Ask the Pharos Registrar for the MOI letter with ETH's exact wording",
    "Write the ESOP master's thesis pre-proposal",
    "Ask 2 professors for references",
    "In eApply (1 to 30 Nov 2026): apply to the master's, tick ESOP, upload everything, pay CHF 150",
    "Possible interview in February",
    "Results at the end of March 2027" ] },
  "epfl-cs": { how: "separate", text: "Same application, one extra tick: in the EPFL master's application you tick the box to be considered for the Excellence Fellowship. It must be paid and validated by 15 Dec. The fellowship does not cover tuition.", apply: [
    "Fill the EPFL master's online application",
    "Tick the box to be considered for an Excellence Fellowship",
    "Pay and validate the application by 15 Dec 2026",
    "Make sure referees upload letters within one week after the deadline",
    "Receive the admission and fellowship decision" ] },
  "polimi-cse": { how: "separate", text: "Separate form in the same portal: you apply to the master's in the Early bird window (fee paid between 1 Oct and 1 Dec 2026), then fill the merit scholarship form on Online Services. If you win, tuition is waived and you get up to EUR 10,000 per year.", apply: [
    "Create an account on Politecnico di Milano Online Services",
    "Apply to M.Sc. Computer Science and Engineering and pay the admission fee by 1 Dec 2026 (Early bird)",
    "Upload the Pharos document certifying English as the teaching language, degree, transcript, CV",
    "Fill the separate merit scholarship form (expected by 15 Dec 2026)",
    "Receive the admission and scholarship results",
    "Also apply for the Lombardy regional grant (DSU) for housing if you need it" ] },
  "bocconi-ai": { how: "partial", text: "Graduate Merit Awards (full tuition waiver) are considered automatically with your admission, and the AI Scholarship (100%, 60% or 20% off tuition) is decided with the Bocconi4Access to Education form. Neither pays a stipend, so you still need living money.", apply: [
    "Email Bocconi admissions to ask if your English-taught degree counts as English proof",
    "Take the GMAT / GRE or the Bocconi online test",
    "Apply on Apply2B in Round II (by 26 Jan 2027) and pay EUR 100",
    "Fill the Bocconi4Access to Education 2027-2028 form for the AI Scholarship",
    "Get the result (4 Mar 2027 for Round II) together with any award" ] },
  "lmu-stats": { how: "none", text: "No scholarship needed: LMU has no tuition, even for non-EU students. Admission is enough; you live on your blocked account (or DAAD, see the Money guide).", apply: [
    "Email the Statistics department your transcript to confirm your statistics / data science focus",
    "Ask Pharos for the official MOI letter",
    "Apply on the department portal (April 2027 start: by 15 Nov 2026; October 2027 start: 1 Apr to 15 May 2027)",
    "Apply to the LMU International Office in parallel (by 15 Jan or 15 Jul)",
    "If you get 10 to 17 points: do the written test (2 weeks) and the 15-minute interview",
    "Receive the admission letter" ] },
  "lmu-ds": { how: "none", text: "No scholarship needed: LMU has no tuition. Admission is enough; you live on your blocked account (or DAAD).", apply: [
    "Email m-datascience@lmu.de to ask if your MOI letter is accepted (otherwise take IELTS)",
    "Write the Data Science essay (max 1,000 words)",
    "Apply online when the portal opens (about late April to 1 Jun 2027)",
    "Apply to the LMU International Office in parallel (by 15 Jul)",
    "Video interview (end of June)",
    "Final result by email (mid July)" ] },
  "tum-inf": { how: "partial", text: "There is no full scholarship: tuition is EUR 4,000 to 6,000 per semester. TUM gives merit tuition waivers for the first 2 semesters to top-ranked new master's students (you apply separately in the TUM scholarship portal with your application number), and need-based waivers in hardship. Living costs come from your blocked account (or DAAD, see the Money guide).", apply: [
    "Ask Pharos for an official confirmation that the bachelor's was taught in English, and an official class ranking certificate",
    "Request a uni-assist VPD for TUM (4 to 6 weeks, EUR 75)",
    "Fill the curriculum analysis form and collect module descriptions",
    "Write the statement of reasons and the 1,000-word scientific essay",
    "Apply on TUMonline (summer 2027 by 30 Nov 2026, or winter 2027/28 between 1 Feb and 31 May 2027)",
    "If invited, take the 90-minute written test",
    "Apply for the merit tuition waiver in the TUM scholarship portal using your application number (winter intake: 1 Jan to 31 May)",
    "Receive the admission and waiver decisions" ] },
  "usask-cs": { how: "auto", text: "Funding comes with admission to the thesis M.Sc.: tuition plus CAD 18,000 in year 1 and CAD 12,000 after. No separate scholarship form.", apply: [
    "Take IELTS (7.0, no band below 6.5) or Duolingo (120)",
    "Email professors in your area",
    "Apply online by 15 Dec 2026 and pay CAD 145",
    "Receive the offer with the funding" ] },
  "kaust-cs": { how: "auto", text: "Automatic: the KAUST Fellowship is given to every admitted student (tuition, housing, health insurance, relocation and a stipend of about USD 20,000 per year for master's). No separate application.", apply: [
    "Apply online by 1 Dec 2026 (first priority round)",
    "Send IELTS or TOEFL (can come after you apply, before enrolment)",
    "Possible interview",
    "Receive the offer that includes the fellowship" ] },
  "mbzuai-ml": { how: "auto", text: "Automatic: MBZUAI gives a full scholarship to every admitted full-time student (tuition, housing, insurance, yearly trip home, visa and a monthly stipend). No separate application.", apply: [
    "Take IELTS or TOEFL before applying",
    "Apply online by 15 Dec 2026",
    "Do the online assessment / interview if invited",
    "Receive the offer with the full scholarship" ] },
  "emai": { how: "separate", text: "Same application, ranked for scholarships: you apply to the program and ask for the Erasmus Mundus scholarship in the same form. Only the top-ranked applicants get it.", apply: [
    "Take IELTS, or email emai.eu@upf.edu to ask whether MOI is accepted",
    "Apply online in the scholarship round (early 2027) and tick the scholarship option",
    "Upload motivation letter, recommendation letters, Europass CV",
    "Receive the ranking result (spring)" ] },

  /* ---------- Aya ---------- */
  "deb-bio": { how: "separate", text: "Separate scholarship: you apply to Stipendium Hungaricum and choose Debrecen M.Sc. Biology inside it, with a nomination from Egypt. If you win, tuition, dorm and stipend are included.", apply: [
    "When the portal opens (expected mid November), create an account on apply.stipendiumhungaricum.hu",
    "Choose Debrecen M.Sc. Biology (and a second choice)",
    "Upload MOI certificate, degree, transcript, motivation letter, recommendation letters, medical certificate, passport",
    "Get the nomination from Egypt's Cultural and Missions Sector (eman.eid@cdm.edu.eg)",
    "Submit by about 15 Jan 2027",
    "Do Debrecen's online interview",
    "Final result (usually June)" ] },
  "deb-pharma": { how: "separate", text: "Through Stipendium Hungaricum if the program is listed in the 2027 course list (free + stipend). Otherwise you would apply self-funded directly to Debrecen (USD 6,000 per year).", apply: [
    "In November, check the program is in the Stipendium Hungaricum course list",
    "If yes: apply through Stipendium Hungaricum like the Biology program, with the Egyptian nomination",
    "If no: decide whether self-funded is possible (deadline 15 Jun 2027)",
    "Do the entrance interview" ] },
  "deb-env": { how: "separate", text: "Separate scholarship: Stipendium Hungaricum, choosing Debrecen M.Sc. Environmental Science, with the Egyptian nomination.", apply: [
    "Email fonai.lilla@edu.unideb.hu to confirm your degree is accepted",
    "Apply on the Stipendium Hungaricum portal (mid November to about 15 Jan 2027)",
    "Get the Egyptian nomination",
    "Online interview",
    "Final result (June)" ] },
  "deb-food": { how: "separate", text: "Separate scholarship: Stipendium Hungaricum, choosing Debrecen Food Safety and Quality Engineering, with the Egyptian nomination.", apply: [
    "Email fonai.lilla@edu.unideb.hu to confirm a Microbiology and Chemistry degree is accepted",
    "Apply on the Stipendium Hungaricum portal by about 15 Jan 2027",
    "Get the Egyptian nomination",
    "Online interview",
    "Final result (June)" ] },
  "szeged-bio": { how: "separate", text: "Separate scholarship: Stipendium Hungaricum, choosing Szeged Biology M.Sc., with the Egyptian nomination. Needs IELTS 5.5.", apply: [
    "Take IELTS (5.5) or TOEFL (72)",
    "Apply on the Stipendium Hungaricum portal by about 15 Jan 2027",
    "Get the Egyptian nomination",
    "Final result (June)" ] },
  "bremen-eco": { how: "none", text: "No scholarship needed: no tuition. Admission is enough; you live on the blocked account.", apply: [
    "Email the Ecology program to confirm your MOI letter exempts you from C1",
    "Check your transcript shows at least 3 credit points in Ecology",
    "Apply on the MOIN portal (opens about mid March, deadline 30 Apr 2027)",
    "Upload the one-page motivation letter",
    "Receive the admission letter" ] },
  "iyt-aya": { how: "separate", text: "Two steps: admission to an Italian program that is on the Invest Your Talent list, then the separate Invest Your Talent scholarship application.", apply: [
    "Choose an English master's on the IYT list (food, environment, quality, management)",
    "Apply to that university",
    "Apply to the IYT call when it opens (expected April 2027) with the MOI certificate",
    "Scholarship result (summer)" ] },
  "me3-4s": { how: "separate", text: "Same application, ranked for scholarships: apply to ME3-4S and ask for the Erasmus Mundus scholarship in the same form.", apply: [
    "Check the new ME3-4S website in November for eligibility and English rules",
    "Apply in the scholarship round (usually December to January)",
    "Scholarship ranking result (spring)" ] },
  "csc-aya": { how: "separate", text: "Separate scholarship: Chinese Government Scholarship (CSC) application plus the university application.", apply: [
    "Choose an English-taught program (environment, biology or food science)",
    "Fill the CSC online application (about November to February)",
    "Apply on the university portal and upload the CSC form, study plan, letters, physical exam, notarized papers",
    "Result (June to July)" ] },
  "marmic": { how: "partial", text: "No tuition. Scholarships are offered inside the university AFTER you are accepted; they are not guaranteed, so plan for the blocked account.", apply: [
    "Get a C1 English certificate",
    "Apply on the MarMic page between 7 Dec 2026 and 28 Feb 2027",
    "Interview if invited",
    "After acceptance, ask the program about available scholarships" ] },
  "idoh": { how: "separate", text: "Same application, ranked for scholarships: apply to IDOH and ask for the Erasmus Mundus scholarship in the same form.", apply: [
    "Check the English rule when the call opens on 1 Dec",
    "Apply between 1 Dec 2026 and 31 Jan 2027, ticking the scholarship option",
    "Scholarship ranking result (spring)" ] },
  "kaust-bio": { how: "auto", text: "Automatic: the KAUST Fellowship is given to every admitted student (tuition, housing, insurance, relocation and about USD 20,000 per year stipend for master's).", apply: [
    "Apply online by 1 Dec 2026",
    "Send IELTS or TOEFL (can come later)",
    "Receive the offer with the fellowship" ] },
};

/* What happens after admission, until you travel and settle in */
const JOURNEY = {
  Germany: [
    "Accept the admission and do the online enrolment steps the university asks for",
    "Open the blocked account (Expatrio, Fintiba or Coracle) and transfer EUR 11,904; keep the confirmation",
    "Buy travel health insurance for the trip and get the public student health insurance confirmation (TK, AOK, Barmer)",
    "Book the national (student) visa appointment at the German Embassy in Cairo as early as possible: waiting times can be long",
    "Visa documents: passport, photos, admission letter, blocked account confirmation, insurance, degree and transcript, MOI letter, CV, visa fee (EUR 75)",
    "Apply for a student dorm (Studierendenwerk) right after admission; rooms go fast",
    "Book the flight once the visa is in your passport",
    "After arrival: register your address (Anmeldung) within 2 weeks",
    "Open a German bank account and activate the monthly blocked account payments",
    "Pay the semester fee, finish enrolment, get your student card",
    "Apply for the residence permit at the foreigners office (Auslaenderbehoerde) before the visa expires",
  ],
  Canada: [
    "Accept the offer and keep the official acceptance letter and the funding letter",
    "Ask the university whether you need a Provincial Attestation Letter (PAL) and get it if required",
    "Prepare proof of funds: funding letter + bank statement for the gap",
    "Apply for the study permit online (CAD 150) and pay biometrics (CAD 85)",
    "Give biometrics at the VFS centre in Cairo; do a medical exam if asked",
    "Wait for the approval letter and visa (passport request)",
    "Book housing (shared room near campus) and the flight",
    "At the Canadian airport: show your papers and receive the study permit",
    "After arrival: get a Social Insurance Number (SIN), open a bank account, register at the university",
  ],
  USA: [
    "Accept the offer and send the financial documents the university asks for",
    "Receive the I-20 form from the university",
    "Pay the SEVIS I-901 fee (USD 350)",
    "Fill the DS-160 visa form online and pay the visa fee (USD 185)",
    "Book and attend the visa interview at the US Embassy in Cairo (bring I-20, offer, funding proof, transcripts)",
    "Pay the visa integrity fee (USD 250) if charged when the visa is issued",
    "Find housing and book the flight (you can enter up to 30 days before the program starts)",
    "After arrival: check in with the international office, start the assistantship paperwork",
  ],
  "Hong Kong": [
    "Accept the offer",
    "The university sponsors your student visa: fill the visa form (ID 995A) and send the documents they ask for",
    "Pay the visa fee and receive the e-Visa",
    "Apply for a student hall room",
    "Book the flight",
    "After arrival: apply for the Hong Kong ID card and open a bank account",
  ],
  Hungary: [
    "After the June result, accept the scholarship and the university admission",
    "Apply for the student residence permit / visa through the Hungarian embassy in Cairo (Enter Hungary system); the university sends supporting letters",
    "Confirm your dorm place with the university",
    "Book the flight",
    "After arrival: register at the university, collect the residence permit card, open a bank account for the stipend",
  ],
  Italy: [
    "Do the pre-enrolment on the Universitaly portal for your Italian program",
    "Get the Declaration of Value or a CIMEA statement for your degree if the university asks",
    "Apply for the study visa at the Italian embassy / visa centre in Cairo",
    "Find housing (university residences or shared flat)",
    "Book the flight",
    "After arrival: get the codice fiscale (tax code) and apply for the permesso di soggiorno within 8 days",
  ],
  China: [
    "After the July result, receive the admission notice and JW201 / JW202 form by mail",
    "Apply for the X1 student visa at the Chinese embassy in Cairo",
    "Book the flight (the dorm is provided)",
    "After arrival: medical check, residence permit within 30 days, open a bank account for the stipend",
  ],
  Qatar: [
    "Accept the offer",
    "The university sponsors your student residence visa; send the documents they ask for",
    "Book the flight",
    "After arrival: medical test, fingerprints and Qatar ID",
  ],
  Switzerland: [
    "Accept the admission and the scholarship / fellowship",
    "Apply for the Swiss student (national D) visa at the Swiss embassy in Cairo with the admission letter and the award letter as proof of funds; it can take 8 to 12 weeks",
    "Apply for student housing early (Zurich and Lausanne rooms go fast)",
    "Book the flight",
    "After arrival: register at your commune within 14 days, get Swiss health insurance (mandatory), receive the residence permit card",
  ],
  "Saudi Arabia": [
    "Accept the offer",
    "KAUST arranges your visa and relocation: send the documents they ask for and do the medical tests",
    "KAUST books your flight and campus housing",
    "After arrival: orientation, residence card (Iqama), bank account for the stipend",
  ],
  UAE: [
    "Accept the offer",
    "MBZUAI sponsors your student residence visa: send the documents they ask for",
    "Book the flight (check what the university covers)",
    "After arrival: medical test, Emirates ID, campus housing",
  ],
  "Europe (several countries)": [
    "After the scholarship result, sign the Erasmus Mundus agreement",
    "Apply for the student visa of the first study country (the consortium sends support letters)",
    "Health insurance is provided by the scholarship: get the certificate",
    "Book the flight and housing for the first city",
    "After arrival: residence registration in each country you study in",
  ],
};

const FUND_LABEL = {
  auto: { text: "Comes automatically with admission", cls: "good" },
  separate: { text: "Separate scholarship application", cls: "warn" },
  none: { text: "No scholarship needed (no tuition)", cls: "good" },
  partial: { text: "Possible, not guaranteed", cls: "pay" },
};

function stepsFor(p) {
  const f = FUNDING[p.id];
  const before = ["Prepare your papers (see My checklist): MOI letter, English degree and transcript, CV, letters"];
  return [
    ...before.map((t) => ({ phase: "Before applying", t })),
    ...((f && f.apply) || ["Apply on the official page (see link above)"]).map((t) => ({ phase: "Apply and get the money", t })),
    ...(JOURNEY[p.country] || ["Accept the offer", "Apply for the student visa", "Book housing and the flight"]).map((t) => ({ phase: "After admission until you settle in", t })),
  ];
}
