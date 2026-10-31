/* My documents: saved files, and a CV and
   motivation letter that are generated for each program. */

const DOC_FILES = {
  mayar: [{"g": "gen", "id": "grad", "t": "Graduation Statement (English proof, MOI)", "n": "Use as English proof everywhere.", "f": "Mayar_Issa_Graduation_Statement_English.pdf", "fn": "Mayar_Issa_Graduation_Statement_English.pdf", "kb": 725}, {"g": "gen", "id": "degtr", "t": "Degree certificate and transcript (one file)", "n": "For degree / transcript upload fields (6 pages).", "f": "Mayar_Issa_Degree_Certificate_and_Transcript.pdf", "fn": "Mayar_Issa_Degree_Certificate_and_Transcript.pdf", "kb": 6239}, {"g": "gen", "id": "diploma", "t": "Diploma (English provisional + Arabic final)", "n": "When only the degree certificate is asked.", "f": "Mayar_Issa_Diploma.pdf", "fn": "Mayar_Issa_Diploma.pdf", "kb": 2901}, {"g": "gen", "id": "transcript", "t": "Transcript of records", "n": "When only the transcript is asked.", "f": "Mayar_Issa_Transcript.pdf", "fn": "Mayar_Issa_Transcript.pdf", "kb": 2614}, {"g": "gen", "id": "certs", "t": "Certificates (CCNA, ICPC, AUF, innovEgypt, AI symposium)", "n": "Additional qualifications.", "f": "Mayar_Issa_Certificates.pdf", "fn": "Mayar_Issa_Certificates.pdf", "kb": 1872}, {"g": "gen", "id": "courses", "t": "Course descriptions (compressed, 4 MB)", "n": "When course content or module handbook is asked.", "f": "Mayar_Issa_Course_Descriptions.pdf", "fn": "Mayar_Issa_Course_Descriptions.pdf", "kb": 4193}, {"g": "gen", "id": "cvpdf", "t": "CV (ready PDF)", "n": "The CV already uploaded to Hildesheim and LMU.", "f": "Mayar_Mohamed_Issa_CV.pdf", "fn": "Mayar_Mohamed_Issa_CV.pdf", "kb": 40}, {"g": "hildesheim-da", "id": "rec", "t": "Application record", "n": "Every answer in the Hildesheim form.", "f": "hildesheim-da_Application_Record_Hildesheim_Data_Analytics.pdf", "fn": "Application_Record_Hildesheim_Data_Analytics.pdf", "kb": 45}, {"g": "hildesheim-da", "id": "letter", "t": "Motivation letter (as uploaded)", "n": "Inside the additional documents too.", "f": "hildesheim-da_Mayar_Issa_Motivation_Letter.pdf", "fn": "Mayar_Issa_Motivation_Letter.pdf", "kb": 29}, {"g": "hildesheim-da", "id": "adddocs", "t": "Additional documents bundle (15 MB)", "n": "Cover, letter, certificates, course descriptions.", "f": "hildesheim-da_Mayar_Issa_Additional_Documents.pdf", "fn": "Mayar_Issa_Additional_Documents.pdf", "kb": 14727}, {"g": "lmu-stats", "id": "rec", "t": "Application record", "n": "Every answer in the LMU form.", "f": "lmu-stats_Application_Record_LMU_Statistics_Data_Science.pdf", "fn": "Application_Record_LMU_Statistics_Data_Science.pdf", "kb": 43}, {"g": "thws-ai", "id": "rec", "t": "Application record", "n": "Every answer in the THWS form.", "f": "thws-ai_Application_Record_THWS_AI.pdf", "fn": "Application_Record_THWS_AI.pdf", "kb": 42}, {"g": "tud-aiml", "id": "elig", "t": "Academic eligibility checklist", "n": "Your courses mapped to the 19 TU Darmstadt modules.", "f": "tud-aiml_TU_Darmstadt_AIML_Eligibility_Checklist_Mayar_Issa.pdf", "fn": "TU_Darmstadt_AIML_Eligibility_Checklist_Mayar_Issa.pdf", "kb": 37}],
  rodayna: [{"g": "gen", "id": "grad", "t": "Graduation Statement (English proof, MOI)", "n": "Says all subjects were taught and assessed in English. Use as English proof.", "f": "rodayna_Rodayna_Emad_Graduation_Statement_English.pdf", "fn": "Rodayna_Emad_Graduation_Statement_English.pdf", "kb": 178}, {"g": "gen", "id": "degtr", "t": "Degree certificate and transcript (one file)", "n": "Provisional certificate, Graduation Statement, transcript and Arabic final certificate (6 pages).", "f": "rodayna_Rodayna_Emad_Degree_Certificate_and_Transcript.pdf", "fn": "Rodayna_Emad_Degree_Certificate_and_Transcript.pdf", "kb": 1249}, {"g": "gen", "id": "diploma", "t": "Diploma (English provisional + Arabic final)", "n": "When only the degree certificate is asked. The final certificate in English is still missing.", "f": "rodayna_Rodayna_Emad_Diploma.pdf", "fn": "Rodayna_Emad_Diploma.pdf", "kb": 698}, {"g": "gen", "id": "transcript", "t": "Transcript of records", "n": "When only the transcript is asked (3 pages).", "f": "rodayna_Rodayna_Emad_Transcript.pdf", "fn": "Rodayna_Emad_Transcript.pdf", "kb": 380}, {"g": "gen", "id": "certs", "t": "Certificates (IBM, AWS, WorldQuant, DataCamp, LinkedIn, ICPC and more)", "n": "Additional qualifications, one copy of each.", "f": "rodayna_Rodayna_Emad_Certificates.pdf", "fn": "Rodayna_Emad_Certificates.pdf", "kb": 3320}, {"g": "gen", "id": "courses", "t": "Course descriptions (compressed)", "n": "When course content or module descriptions are asked.", "f": "rodayna_Rodayna_Emad_Course_Descriptions.pdf", "fn": "Rodayna_Emad_Course_Descriptions.pdf", "kb": 714}, {"g": "gen", "id": "cvpdf", "t": "CV (ready PDF)", "n": "Two page CV for uploads.", "f": "rodayna_Rodayna_Emad_CV.pdf", "fn": "Rodayna_Emad_CV.pdf", "kb": 38}],
};

/* ---------- CV (same base, profile line changes with the program) ---------- */
const CV_ME = {
  mayar: {
    name: "Mayar Mohamed Issa",
    contact: "Alexandria, Egypt &nbsp;|&nbsp; Myar.issa2003@gmail.com &nbsp;|&nbsp; linkedin.com/in/mayar-issa<br>github.com/MayarIssa &nbsp;|&nbsp; mayar-issa.vercel.app",
    profile: (focus) => `Computer Science graduate from Pharos University in Alexandria (Excellent with Honors). I studied in English, enjoyed the machine learning and maths courses the most, and spent the last year as a Teaching Assistant. I also build web apps in my free time and freelance as a developer. Now I want to focus on ${focus}.`,
    body: `
<h2>Education</h2>
<div class="blk"><div class="row"><b>B.Sc. in Computer Science, Pharos University in Alexandria</b><span class="r">2021 to 2025</span></div>
Faculty of Computer Science and Artificial Intelligence, taught in English<br>
CGPA: 3.7621 / 4.00 (88.99%), Excellent with Honors, 140 credit hours<br>
Graduation project: Mentoro (grade A)
<ul><li>Machine Learning (94), Data Science Methodology (90), Intelligent Systems (89), Introduction to AI (85), Introduction to Data Sciences (82), Robotics (96)</li>
<li>Numerical Computations (97), Linear Algebra (91), Discrete Structures (89), Probability and Statistics (87), Calculus II (84)</li>
<li>Compiler and Language Theory (97), Healthcare Database Systems (95), System Programming (94), Advanced Programming (91)</li></ul></div>
<div class="blk"><div class="row"><b>High School Diploma, El Quds American School, Alexandria</b><span class="r">2021</span></div>GPA: 3.9 / 4.0</div>
<h2>Experience</h2>
<div class="blk"><div class="row"><b>Teaching Assistant, Pharos University in Alexandria</b><span class="r">Nov 2025 to Sep 2026</span></div>
<ul><li>Taught labs for Programming 1, System Programming, Compiler Design and Human-Computer Interaction (Figma and Flutter)</li>
<li>Prepared lab sheets, quizzes and practical exams and graded student projects</li>
<li>Helped review exam blueprints for several CS courses as part of the faculty's quality work</li></ul></div>
<div class="blk"><div class="row"><b>Full Stack Developer (Freelance), Sublime+</b><span class="r">Aug 2026 to now</span></div>
<ul><li>Built the company website (sublime-plus.com) with Next.js, hosted on Vercel and Cloudflare, and set up Search Console and Analytics</li>
<li>Made an interactive 3D mascot for the landing page with React Three Fiber and cut the model size from about 70 MB to 10 MB</li>
<li>Tested and compared image and video generation models for the team (quality, cost, speed)</li></ul></div>
<h2>Projects</h2>
<div class="blk"><div class="row"><b>Mentoro: One-to-One Guidance Platform with AI Assistance for Adaptive Course Recommendation</b><span class="r">2024 to 2025</span></div>
Graduation project, team of six, supervised by Dr. Soha Ahmed. Live at mentoro2.vercel.app
<ul><li>A mentoring platform that suggests courses, tasks and mentors to learners based on their goals and progress</li>
<li>I designed the whole UI/UX in Figma and worked on the frontend (Next.js, TypeScript, Tailwind CSS): home page, profiles and mentor and mentee connections</li></ul></div>
<div class="blk"><div class="row"><b>Image Generation with Diffusion Models</b><span class="r">Python</span></div><ul><li>Trained a diffusion model to generate images on the CIFAR-10 dataset</li></ul></div>
<div class="blk"><div class="row"><b>BuildFin</b><span class="r">2026</span></div><ul><li>Web app for building owners to record residents' payments, see monthly totals and track expenses (building11.vercel.app)</li></ul></div>
<div class="blk"><div class="row"><b>Nour HR</b><span class="r">2026</span></div><ul><li>Arabic and English HR system for a pharmacy with login and staff records (hr-pharmacy-nine.vercel.app)</li></ul></div>
<div class="blk"><div class="row"><b>Ozouma (in progress)</b><span class="r">2026</span></div><ul><li>Hands-free cooking app in Arabic and English: say "next" to move between steps, timers start by themselves and the screen stays on. Website in Next.js and a Flutter app</li></ul></div>
<h2>Certificates and Courses</h2>
<ul><li>Cisco CCNA: Introduction to Networks; Switching, Routing and Wireless Essentials; Enterprise Networking, Security and Automation (Skills Plus Egypt, 2025)</li>
<li>Back-End Development Diploma (.NET Core), Route Academy (2024)</li>
<li>innovEgypt program, ITIDA and TIEC: 45 hour course and a startup project</li>
<li>ST Smart Robotics with AI summer program (2023)</li></ul>
<h2>Competitions and Events</h2>
<ul><li>ICPC ECPC Qualifications 2023: Honorable Mention. Took part again in 2024</li>
<li>AUF Regional Hackathon on Artificial Intelligence (March 2023)</li>
<li>Symposium "AI and the Research Frontier", Pharos University (February 2026)</li></ul>
<h2>Skills</h2>
<p><b>Programming:</b> Python, TypeScript, JavaScript, C#, SQL, Dart<br>
<b>Data and ML:</b> machine learning basics, statistics, data preparation, Jupyter<br>
<b>Web:</b> Next.js, React, Tailwind CSS, .NET Core, Supabase, MongoDB, SQL Server<br>
<b>Design:</b> Figma, UI/UX, Blender<br>
<b>Tools:</b> Git and GitHub, Vercel, Cloudflare</p>
<h2>Languages</h2>
<p>Arabic (native), English (fluent, my whole degree was in English)</p>`,
  },
  rodayna: {
    name: "Rodayna Emad Mohamed Abdelkader Abdelmawla",
    city: "Alexandria, Egypt",
    email: "rodynaemad@gmail.com",
    contact: "Alexandria, Egypt &nbsp;|&nbsp; rodynaemad@gmail.com &nbsp;|&nbsp; +20 128 721 5632<br>linkedin.com/in/rodayna-emad &nbsp;|&nbsp; github.com/itsRou",
    profile: (focus) => `Computer Science graduate from Pharos University in Alexandria (CGPA 3.88 / 4.00, Excellent with Honors). I studied in English and did best in statistics, machine learning and data science courses. I have worked on data science projects since 2023 and spent the last year as a Teaching Assistant. Now I want to focus on ${focus}.`,
    letter: (p) => letterRodayna(p),
    body: `
<h2>Education</h2>
<div class="blk"><div class="row"><b>B.Sc. in Computer Science, Pharos University in Alexandria</b><span class="r">2021 to 2025</span></div>
Faculty of Computer Science and Artificial Intelligence, taught and assessed in English<br>
CGPA: 3.8836 / 4.00 (92.13%), Excellent with Honors, 140 credit hours, graduated July 2025<br>
Graduation project: BloomTech, smart agriculture system (grade A)
<ul><li>Data and AI: Data Science Methodology (94), Introduction to AI (94), Machine Learning (93), Introduction to Data Sciences (93), Intelligent Systems (91), Bioinformatics Programming and Scripting (91), Healthcare Database Systems (A)</li>
<li>Maths: Probability and Statistics (97), Linear Algebra (95), Calculus II (93), Theory of Computation (91), Numerical Computations (88), Discrete Structures (87)</li>
<li>Computing: Algorithms Design (97), Programming II (97), Compiler and Language Theory (94), Database Systems (93), System Programming (93), Data Structures and Algorithms (92)</li></ul></div>
<h2>Experience</h2>
<div class="blk"><div class="row"><b>Teaching Assistant, Pharos University in Alexandria</b><span class="r">Oct 2025 to Oct 2026</span></div>
Researcher Teaching Assistant, Faculty of Computer Science and Artificial Intelligence</div>
<div class="blk"><div class="row"><b>Data Science Intern (online), WorldQuant University</b><span class="r">Jan 2023 to Dec 2024</span></div>
<ul><li>Completed data science projects in Python: loading and cleaning messy CSV data with pandas, exploring it with plots and heatmaps, and building machine learning pipelines with feature encoding and imputation</li></ul></div>
<div class="blk"><div class="row"><b>Node.js Intern, Route</b><span class="r">Jul 2024 to Sep 2024</span></div></div>
<div class="blk"><div class="row"><b>Embedded Systems Intern, Information Technology Institute (ITI)</b><span class="r">Jul 2024 to Aug 2024</span></div></div>
<div class="blk"><div class="row"><b>International Account Advisor, Vodafone UK, _VOIS</b><span class="r">Jun 2023 to Dec 2023</span></div>
<ul><li>Worked with Vodafone UK customer accounts, in English</li></ul></div>
<h2>Projects</h2>
<div class="blk"><div class="row"><b>BloomTech: Smart Agriculture System (graduation project)</b><span class="r">Sep 2024 to Jul 2025</span></div>
Image processing, Flutter, Firebase, IoT sensors, solar power
<ul><li>A system for smart pots and farm land that detects plant diseases from photos and suggests a cure. The detection reached over 90% accuracy on more than 1,000 test images</li>
<li>Flutter app with live sensor readings, smart irrigation control, plant care tips, and services such as renting tools and ordering seeds</li>
<li>Solar powered IoT sensors, so the pots and field sensors work without batteries</li></ul></div>
<div class="blk"><div class="row"><b>Bitcoin Price Prediction</b><span class="r">Oct 2024 to Dec 2024</span></div>
Python, pandas, LSTM, ARIMA, Random Forest, Plotly
<ul><li>Compared ARIMA, Random Forest and LSTM models on historical Bitcoin data. LSTM gave the best results, with about 18% lower RMSE than the baseline</li>
<li>Added features such as rolling averages and RSI, tuned the models with cross validation, and showed the forecasts in an interactive dashboard</li>
<li>Received Top Project Recognition at the faculty project showcase</li></ul></div>
<div class="blk"><h2>Certificates and Courses</h2>
<ul><li>IBM (Cognitive Class, 2022): Data Science 101, Data Science Methodology, Python 101 for Data Science, Data Analysis with Python, SQL and Relational Databases 101; IBM badges: Data Science Foundations Level 1, Data Analysis Using Python</li>
<li>AWS (2022): Machine Learning Essentials for Business and Technical Decision Makers; Fundamentals of a Modern Data Strategy; Modern Applications on AWS</li>
<li>LinkedIn Learning (2022): Build Your Analytical Skills with Statistical Analysis (learning path); SQL for Exploratory Data Analysis</li>
<li>DataCamp (2022): Introduction to Python, Intermediate Python, Introduction to SQL, Intermediate SQL Queries</li>
<li>Artificial Intelligence in Healthcare, Children's Cancer Hospital Egypt 57357 (2023); C++ Programming, Unihance (2023); Database Fundamentals, ITI Mahara-Tech (2022); Entrepreneurship, Cisco Networking Academy (2022)</li></ul></div>
<h2>Competitions</h2>
<ul><li>ICPC ECPC Qualifications 2022 (Collegiate Programming Contest), team from Pharos University</li></ul>
<h2>Leadership and Volunteering</h2>
<ul><li>Head of PR, TEDx PUA (2024 to 2025); Head of HR, Hult Prize PUA (2024 to 2025); Head of HR, GDSC PUA (2024 to 2025)</li>
<li>Head of Operations, IEEE PUA (2022 to 2024); Vice President, Rally PUA (2023 to 2025); TIEC Ambassador (2024); AIESEC in Egypt member (2024); Head of Arts, PUA Student Union (2021 to 2022)</li></ul>
<h2>Skills</h2>
<p><b>Programming:</b> Python, SQL, Java, C, C++, JavaScript, Dart<br>
<b>Data and ML:</b> pandas, NumPy, regression, classification, SVM, k-means, KNN, LSTM, ARIMA, statistics, SAS<br>
<b>Visualisation:</b> Matplotlib, Seaborn, Plotly, Tableau, Power BI, Looker Studio, Excel and Power Query<br>
<b>Databases and tools:</b> SQL Server, MongoDB, Firebase, Flutter, Node.js, Git</p>
<h2>Languages</h2>
<p>Arabic (native), English (fluent, my whole degree was taught and assessed in English)</p>`,
  },
};
const CV_CSS = `@page{size:A4;margin:14mm 17mm 13mm}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Calibri,Carlito,Arial,sans-serif;color:#000;font-size:10.5pt;line-height:1.3;background:#fff}
h1{font-size:19pt;text-align:center;font-weight:bold;letter-spacing:.3px}
.contact{text-align:center;font-size:10pt;margin:3px 0 4px}
h2{font-size:11pt;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;margin:11px 0 5px;padding-bottom:1px}
.row{display:flex;justify-content:space-between;gap:10px}.r{white-space:nowrap}
ul{margin:2px 0 6px 17px}li{margin:1px 0}.blk{margin-bottom:6px;break-inside:avoid}`;

/* what the CV and letter say I want to focus on, by the program's fields */
function docFocus(p) {
  const f = p.field || [];
  if (f.includes("Data") && !f.includes("AI")) return "data science, statistics and machine learning";
  if (f.includes("Data")) return "data analytics and machine learning";
  if (f.includes("AI")) return "artificial intelligence and machine learning";
  return "computer science, especially machine learning";
}

/* ---------- motivation letter ---------- */
const LETTER_WHY = {
  "hildesheim-da": "The International Master in Data Analytics fits this goal very well. I like that the program combines a strong base in machine learning and statistics with practical work on real data, and that it is closely connected to the university's machine learning research. Studying in English in an international group is also important to me, since my whole bachelor's degree was taught and assessed in English.",
  "lmu-stats": "The M.Sc. Statistics and Data Science at LMU is exactly the step I need. My degree gave me a solid computing and machine learning side, and this program would give me the statistical depth behind it: statistical learning, modelling and inference, taught by a department that is strong in all of them. I know my statistics background is lighter than a statistics graduate's, and I am ready to work extra to close that gap.",
  "thws-ai": "The M.Sc. Artificial Intelligence at THWS appeals to me because it is practical and applied. I want to learn how AI methods are built, tested and used in real systems, not only in theory, and the program's mix of methods and project work matches how I learn best. The summer start also lets me begin without losing a year.",
  "tud-aiml": "The M.Sc. Artificial Intelligence and Machine Learning at TU Darmstadt is one of the programs I want most. It is offered by one of the strongest computer science departments in Germany, it focuses fully on AI and machine learning, and my bachelor's courses already cover most of its core requirements, from algorithms and operating systems to compilers and probability.",
  "tub-cs": "The M.Sc. Computer Science at TU Berlin gives me a broad, strong computer science degree in English while letting me focus my electives on machine learning and data. Berlin's research and tech environment is also a place where I would like to grow.",
  "bht-ds": "The M.Sc. Data Science at BHT Berlin attracts me because it is practical and fully taught in English. I want to learn to work with real data end to end, from cleaning and modelling to presenting results, and this program is built around exactly that.",
  "passau-aie": "The M.Sc. Artificial Intelligence Engineering at Passau fits me because it connects machine learning with the engineering of real systems. I enjoy both sides, the models and the software around them, and this program brings them together.",
  "passau-cs": "The M.Sc. Computer Science at Passau lets me deepen my computer science foundation while focusing on AI and data, which is the direction I want to take.",
  "dortmund-ds": "The M.Sc. Data Science at TU Dortmund combines statistics and computer science, which is exactly the combination I want to strengthen. I bring the computing side from my bachelor's, and I want the statistical depth this program is known for.",
  "lmu-ds": "The M.Sc. Data Science at LMU, which combines statistics, computer science and mathematics, is the kind of rigorous program I want. It would give me the foundations to work on data problems properly, not only to use existing tools.",
  "tum-inf": "The M.Sc. Informatics at TU Munich offers a wide choice of advanced courses in machine learning and data, at one of the strongest technical universities in Europe. It would let me build a deep and broad base for my career.",
  "tuhh-ds": "The M.Sc. Data Science at TU Hamburg fits my goal of working on data and machine learning problems, with a practical focus and teaching in English.",
  "hhu-aids": "The M.Sc. Artificial Intelligence and Data Science at Düsseldorf combines exactly the two areas I want to work in, with teaching in English.",
};
function letterDefault(p, name) {
  const why = LETTER_WHY[p.id] || `The ${p.prog} at ${p.uni} fits this goal very well. It gives me the chance to build a strong foundation in ${docFocus(p)} and to apply it in real projects, and studying in English fits my background, since my whole bachelor's degree was taught and assessed in English.`;
  return [
    "Dear Members of the Admissions Committee,",
    `I am writing to apply for the ${p.prog} at ${p.uni}. I graduated in July 2025 with a B.Sc. in Computer Science from Pharos University in Alexandria, Excellent with Honors (CGPA 3.76 out of 4.00), and over the past year I have become sure that I want to build my career in ${docFocus(p)}.`,
    "My interest really started in my third year, in the Machine Learning course. Until then most of my courses were about writing programs that follow rules I define myself. Seeing a model learn those rules from data instead felt completely different, and I finished the course with 94, one of my best grades. After that I paid more attention to the mathematics behind it. I did well in Numerical Computations (97), Linear Algebra (91) and Probability and Statistics (87), and courses like Data Science Methodology and Intelligent Systems showed me how much work goes into a dataset before any model is trained.",
    "For my graduation project, Mentoro, our team of six built a mentoring platform that recommends courses, tasks and mentors to learners based on their goals and progress. I designed the full interface in Figma and built a large part of the web frontend. I noticed that the hard questions were never about the interface. They were about data: what we actually know about a learner, how to measure progress, and how to tell whether a recommendation is good. I could not answer those questions properly with what I knew, and that is one of the main reasons I am applying. On my own I also worked on image generation with diffusion models on CIFAR-10, which taught me how much patience training and debugging a model really takes.",
    "After graduating, I worked for a year as a Teaching Assistant at my faculty, teaching labs in Programming 1, System Programming, Compiler Design and Human-Computer Interaction. Explaining the same idea to a full lab of students in different ways made my own understanding much more solid. Since August 2026 I also work as a freelance full stack developer for a small marketing agency, where part of my work is testing and comparing image and video generation models. Using these models every day made me want to understand how they work from the inside, not only how to call them.",
    why,
    "After the master's, I would like to work as a data scientist or machine learning engineer, ideally on recommendation and personalisation problems, especially in education, where I have already seen how much good guidance changes a learner's path.",
    "I know the program is demanding, and I am ready for that. Thank you for considering my application. I would be very happy to provide any further information.",
    `Sincerely,\n\n${name}`,
  ].join("\n\n");
}
const LETTER_CSS = `@page{size:A4;margin:16mm 19mm 12mm}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Calibri,Carlito,Arial,sans-serif;color:#111;font-size:10.5pt;line-height:1.36;background:#fff}
.top{display:flex;justify-content:space-between;font-size:10pt;margin-bottom:14px}.top b{font-size:12pt}
p{margin-bottom:7px;text-align:justify;white-space:pre-line}.subj{font-weight:bold;margin:12px 0 10px}`;

/* ---------- Rodayna's motivation letter ---------- */
const LETTER_WHY_R = {
  "hildesheim-da": "The International Master in Data Analytics fits me very well. It is built around exactly what I want to get better at: machine learning, statistics and working with real data. I also like that it is close to the university's machine learning research lab, so the courses are not only theory. Studying in English in an international group suits me, since my whole bachelor's degree was taught and assessed in English.",
  "lmu-stats": "The M.Sc. Statistics and Data Science at LMU is the step I need. My degree and my online courses gave me the data science and programming side, and I took every data science course my faculty offered. What I want now is the statistical depth behind it: statistical learning, modelling and inference, taught by a department that is strong in all three. I know a statistics graduate would have more statistics courses than me, and I am ready to work hard to close that gap.",
  "thws-ai": "The M.Sc. Artificial Intelligence at THWS appeals to me because it is practical. I want to learn how AI methods are built, tested and used in real systems, which is what I enjoyed most in my graduation project. The program's mix of methods and project work matches how I learn best, and the summer start lets me begin without losing more time.",
  "tud-aiml": "The M.Sc. Artificial Intelligence and Machine Learning at TU Darmstadt is one of the programs I want most. It is offered by one of the strongest computer science departments in Germany, it focuses fully on AI and machine learning, and my bachelor's courses already cover most of its core requirements, from algorithms and operating systems to compilers, theory of computation and probability.",
  "tum-dea": "The M.Sc. Data Engineering and Analytics at TUM brings together the two sides of data work that I have seen in my projects: building reliable data pipelines and getting real insight out of the data. Studying it at one of the strongest technical universities in Europe would give me a deep base for my career.",
  "tum-inf": "The M.Sc. Informatics at TU Munich offers a wide choice of advanced courses in machine learning and data, at one of the strongest technical universities in Europe. It would let me build a deep and broad base for my career.",
  "tub-cs": "The M.Sc. Computer Science at TU Berlin gives me a broad and strong computer science degree in English while letting me focus my electives on machine learning and data. Berlin's research and tech environment is also a place where I would like to grow.",
};
function letterRodayna(p) {
  const focus = docFocus(p);
  const uni = /^(University|Technical University)\b/.test(p.uni) ? "the " + p.uni : p.uni;
  const why = LETTER_WHY_R[p.id] || LETTER_WHY[p.id] || `The ${p.prog} at ${p.uni} fits this goal very well. It gives me the chance to build a strong base in ${focus} and to use it in real projects. Studying in English also fits my background, since my whole bachelor's degree was taught and assessed in English.`;
  return [
    "Dear Members of the Admissions Committee,",
    `I am writing to apply for the ${p.prog} at ${uni}. I graduated in July 2025 with a B.Sc. in Computer Science from Pharos University in Alexandria, Excellent with Honors (CGPA 3.88 out of 4.00, 92.13%). I want to build my career in ${focus}, and this master's is the next step for me.`,
    "My interest in data started in my first year, in Introduction to Data Sciences. I liked that the answer was not written in the code. It was hidden in the data, and you had to find it. In 2023 I joined WorldQuant University's online data science program, where I worked on real, messy datasets: cleaning them with pandas, exploring them with plots and heatmaps, and building my first machine learning pipelines. Around the same time I took IBM's data science courses and AWS's machine learning course. At university my best grades came in the courses closest to this field: Probability and Statistics (97), Linear Algebra (95), Data Science Methodology (94), Machine Learning (93) and Introduction to Data Sciences (93).",
    "Two projects taught me the most. In my graduation project, BloomTech, our team built a smart agriculture system that detects plant diseases from photos, monitors soil and water with solar powered sensors, and helps farmers through a mobile app. Getting the disease detection above 90% accuracy on more than 1,000 test images showed me that a model is only as good as the data behind it. In another project I predicted Bitcoin prices and compared ARIMA, Random Forest and LSTM models. The LSTM worked best, but the more useful lesson was learning to test a time series model honestly, on data it has never seen. The project received Top Project Recognition at our faculty showcase.",
    "After graduating, I worked for a year as a Teaching Assistant at my faculty. Explaining the same idea to many students in different ways made my own understanding much more solid. Before that I did internships in Node.js development at Route and in embedded systems at ITI, and worked for six months as an international account advisor for Vodafone UK at _VOIS, where I learned to communicate clearly in English under pressure. At university I also led teams as Head of Operations at IEEE PUA and Head of HR at GDSC PUA.",
    why,
    "After the master's, I would like to work as a data scientist or machine learning engineer. I am especially interested in using data in agriculture and health, two areas where I have already seen, in BloomTech and in my Healthcare Database Systems course, how much good data can change real decisions.",
    "I know the program is demanding, and I am ready for that. Thank you for considering my application. I would be very happy to provide any further information.",
    `Sincerely,\n\nRodayna Emad Mohamed Abdelkader Abdelmawla`,
  ].join("\n\n");
}
