/* Rodayna's own notes on the shared program list in data.js.
   Mayar and Rodayna see the same programs, but these notes, chances and checklist lines
   are worked out from Rodayna's transcript. Only Rodayna's profile uses this file.
   Credits: Pharos gives 140 credit hours for a 4 year degree (240 ECTS), so 1 credit hour is about 1.7 ECTS.
   Last checked: 31 October 2026. */

const PROFILE_TWEAKS = {
  rodayna: {
    /* words to swap anywhere in the shared text (things that only fit Mayar) */
    swap: [
      [/3\.76 GPA/g, "3.88 GPA"],
      [/a 3\.76\b/g, "a 3.88"],
      [/graduation project \(Mentoro\)/g, "graduation project (BloomTech)"],
      [/diffusion model project report/g, "Bitcoin price prediction (LSTM) project report"],
      [/diffusion model report/g, "Bitcoin price prediction (LSTM) report"],
      [/your diffusion model project/g, "your Bitcoin price prediction (LSTM) and BloomTech plant disease projects"],
      [/diffusion model project/g, "Bitcoin price prediction (LSTM) project"],
      [/El Quds American School/g, "your secondary school"],
      [/Your year as a Teaching Assistant and your freelance developer work count as first experience\./g, "Your year as a Teaching Assistant at Pharos and your internships (ITI, Route, _VOIS) count as first experience."],
      [/TA contract, freelance work/g, "TA contract, internship certificates"],
      [/diffusion model, Mentoro, CareChart, Nour HR/g, "BloomTech plant disease detection, Bitcoin price prediction with LSTM, WorldQuant data science projects"],
    ],

    bestNote: "How it is ranked: the same order as Mayar's list (chance of admission, money, AI fit, how soon you can start). Rodayna's grade is higher (CGPA 3.88, 92.13%), so her chances are the same or better almost everywhere. Where her transcript changes the picture, the program has its own note.",

    checklist: {
      highschool: "High school certificate and marks, official English version (THWS needs it now, Hildesheim at enrolment, uni-assist always)",
      degree: "Final degree certificate in English (official English version from Pharos). You only have the Arabic final certificate and the English provisional one",
      transcript: "Grading scale from Pharos (A = 90 to 100 and so on), or a transcript that prints it",
      "cv-acad": "Academic CV (TA role, internships, BloomTech, Bitcoin LSTM project, ICPC ECPC 2022 at the top)",
      abstract: "BloomTech graduation project abstract (1 to 2 pages) and a link to the full report",
    },
    checklistAdd: [
      ["Papers from Pharos", ["ranking", "Class ranking certificate (your rank in the class). Needed for the TUM tuition waiver (top 5%) and helps for ETH ESOP (top 10%)", "TUM, ETH"]],
    ],

    programs: {
      "passau-aie": {
        academic: "Bachelor in CS or maths (3+ years) with 120 ECTS in CS and maths: at least 35 ECTS maths (including theoretical CS) and 40 ECTS CS. German grade 2.7 or better. Your grade is about 1.2 (CGPA 3.88), far better than needed. Your maths: Calculus I and II, Probability and Statistics, Linear Algebra, Numerical Computations, Discrete Structures and Theory of Computation = 16 credit hours (about 27 ECTS). With Algorithms Design and Compiler and Language Theory as theoretical CS it is 22 credit hours (about 38 ECTS).",
        chance: "Medium to High",
        watch: "The 35 ECTS maths rule is close for you: send the course descriptions and point to Theory of Computation, Algorithms Design and Compiler and Language Theory as theoretical CS. Book German A1 classes after you arrive.",
      },
      "thws-ai": {
        academic: "Bachelor with 210 ECTS in CS, grade 2.0 or better. At least 20 ECTS maths (statistics, linear algebra, calculus) and 15 ECTS CS. You have 140 credit hours (240 ECTS) and a grade of about 1.2. Maths: Calculus I (70), Calculus II (93), Linear Algebra (95), Probability and Statistics (97), Numerical Computations (88) = 10 credit hours (about 17 ECTS), plus Discrete Structures (87, 3 credit hours) = about 22 ECTS.",
        chance: "High",
        watch: "THWS asks for your high school certificate, which is still missing. The VPD takes 4 to 6 weeks, so request it now. Use the application form version dated 08.10.2026. Email mai.fiw@thws.de to confirm the Graduation Statement counts as English proof.",
      },
      "tud-aiml": {
        academic: "B.Sc. in Computer Science or equivalent with at least 60 ECTS matching TU Darmstadt's B.Sc. Informatik core. Your courses match most of the 19 checklist modules: Programming I and II and Advanced Programming, Data Structures and Algorithms and Algorithms Design, Logic Circuit Design, Computer Architecture, Operating Systems, Compiler and Language Theory, Theory of Computation, Discrete Structures, Computer Networks, Advanced Computer Networks, Distributed Systems, Computer Security, Database Systems, Software Engineering, Computer Graphics, Introduction to AI, Probability and Statistics, Numerical Computations. That is far more than 60 ECTS.",
        chance: "Medium to High",
      },
      "hildesheim-da": {
        chance: "High",
        why: "More than half of the ranking is your overall grade (CGPA 3.88, 92.13%), and another 35% is data courses, where you have Machine Learning 93, Introduction to Data Sciences 93, Data Science Methodology 94 and Bioinformatics Programming 91. Your WorldQuant and IBM data science work counts as practical work. Free to apply, no uni-assist.",
        watch: "They admit continuously, so apply early. Documents must be official English versions from Pharos (no self translation). Your high school certificate is needed at enrolment, not now.",
      },
      "dortmund-ds": {
        chance: "Medium to High",
        watch: "Your transcript has only one statistics course (Probability and Statistics, 2 credit hours). Check the statistics ECTS in the self-disclosure form before paying uni-assist; Numerical Computations, Data Science Methodology and Machine Learning may help.",
      },
      "passau-cs": { academic: "Bachelor in CS or related with at least 110 ECTS of computer science. Grade 2.7 or better. You easily have more than 110 ECTS of CS and a grade of about 1.2." },
      "hhu-aids": { chance: "Medium to High", watch: "Restricted admission: ranked by grade when there are more applicants than places. Your grade (3.88) helps a lot here." },
      "mun-cs": { academic: "Bachelor in CS or Computer Engineering with at least 75%. You have 92.13%. GRE encouraged, not required." },
      "asu-ai": { academic: "GPA 3.0+ in the last 60 hours, Calculus 1 and 2 (you have both), 3 letters, letter of intent, CV." },
      "lmu-stats": {
        academic: "Bachelor (180 ECTS) with Statistics or Data Science as a major, minor or focus; at least 150 ECTS must be shown when applying. Points (max 20): grades up to 5, statistical learning and modelling up to 6, mathematical foundations up to 5, software and programming up to 4. 18 to 20 points = direct admission, 10 to 17 = written test + 15-minute interview, under 10 = rejected. Your data science courses (Introduction to Data Sciences 93, Data Science Methodology 94, Machine Learning 93, Bioinformatics Programming 91, Healthcare Database Systems) and a 97 in Probability and Statistics show a data science focus, but there is only one statistics course.",
        chance: "Medium",
        accept: "Expect about 13 to 16 points: full points for grades and programming, fewer for statistics and maths. That most likely means the written test and an interview in January.",
        watch: "Show the data science focus clearly: list every DS-coded course, the WorldQuant projects, the IBM data science certificates and the LinkedIn statistical analysis path. Munich is expensive and you need the blocked account. The April 2027 deadline is 15 Nov 2026.",
      },
      "tum-inf": {
        watch: "NOT free: non-EU students pay EUR 4,000 to 6,000 per semester. With a 3.88 CGPA you may be in the top 5% of your class: ask Pharos for a class ranking certificate now, because it can get you the merit waiver for the first 2 semesters. You also need the blocked account and a uni-assist VPD.",
      },
      "tum-dea": {
        watch: "NOT free: non-EU students pay EUR 4,000 to 6,000 per semester. With a 3.88 CGPA you may be in the top 5% of your class: ask Pharos for a class ranking certificate now (waiver window for summer: 1 Nov 2026 to 15 Jan 2027). The written test (summer intake) is on campus in Munich between January and March. You also need the blocked account and a uni-assist VPD.",
      },
      "eth-cs": { watch: "The MOI letter wording must be exact, otherwise the application is rejected. ESOP expects the top 10%: a Pharos class ranking certificate would prove it. Without ESOP, Zurich is very expensive. Deadline is in November, so start the pre-proposal now." },
      "tub-cs": {
        academic: "Bachelor in Computer Science or related with 36 credits of CS basics (12 theoretical CS, 12 computer engineering / IT, 12 practical CS), 18 credits of maths and at least 30 more credits of CS. Theoretical CS: Theory of Computation, Algorithms Design, Compiler and Language Theory. Computer engineering: Logic Circuit Design, Computer Architecture, Operating Systems, Embedded Systems. Maths: your 5 maths courses give about 17 ECTS, so Discrete Structures must be counted as maths to reach 18.",
      },
      "bht-ds": { academic: "Relevant bachelor (CS, Maths, Statistics or Data Science) with at least 20 ECTS of maths / statistics and at least 25 ECTS of computer science. Your maths and statistics courses give about 17 ECTS, about 22 with Discrete Structures, and you have far more than 25 ECTS of CS." },
    },
  },
};
