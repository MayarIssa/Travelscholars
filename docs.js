/* My documents: saved files, and a CV and
   motivation letter that are generated for each program. */

const DOC_FILES = {
  mayar: [{"g": "gen", "id": "grad", "t": "Graduation Statement (English proof, MOI)", "n": "Use as English proof everywhere.", "f": "Mayar_Issa_Graduation_Statement_English.pdf", "fn": "Mayar_Issa_Graduation_Statement_English.pdf", "kb": 725}, {"g": "gen", "id": "degtr", "t": "Degree certificate and transcript (one file)", "n": "For degree / transcript upload fields (6 pages).", "f": "Mayar_Issa_Degree_Certificate_and_Transcript.pdf", "fn": "Mayar_Issa_Degree_Certificate_and_Transcript.pdf", "kb": 6239}, {"g": "gen", "id": "diploma", "t": "Diploma (English provisional + Arabic final)", "n": "When only the degree certificate is asked.", "f": "Mayar_Issa_Diploma.pdf", "fn": "Mayar_Issa_Diploma.pdf", "kb": 2901}, {"g": "gen", "id": "transcript", "t": "Transcript of records", "n": "When only the transcript is asked.", "f": "Mayar_Issa_Transcript.pdf", "fn": "Mayar_Issa_Transcript.pdf", "kb": 2614}, {"g": "gen", "id": "certs", "t": "Certificates (CCNA, ICPC, AUF, innovEgypt, AI symposium)", "n": "Additional qualifications.", "f": "Mayar_Issa_Certificates.pdf", "fn": "Mayar_Issa_Certificates.pdf", "kb": 1872}, {"g": "gen", "id": "courses", "t": "Course descriptions (compressed, 4 MB)", "n": "When course content or module handbook is asked.", "f": "Mayar_Issa_Course_Descriptions.pdf", "fn": "Mayar_Issa_Course_Descriptions.pdf", "kb": 4193}, {"g": "gen", "id": "cvpdf", "t": "CV (ready PDF)", "n": "The CV already uploaded to Hildesheim and LMU.", "f": "Mayar_Mohamed_Issa_CV.pdf", "fn": "Mayar_Mohamed_Issa_CV.pdf", "kb": 40}, {"g": "hildesheim-da", "id": "rec", "t": "Application record", "n": "Every answer in the Hildesheim form.", "f": "hildesheim-da_Application_Record_Hildesheim_Data_Analytics.pdf", "fn": "Application_Record_Hildesheim_Data_Analytics.pdf", "kb": 45}, {"g": "hildesheim-da", "id": "letter", "t": "Motivation letter (as uploaded)", "n": "Inside the additional documents too.", "f": "hildesheim-da_Mayar_Issa_Motivation_Letter.pdf", "fn": "Mayar_Issa_Motivation_Letter.pdf", "kb": 29}, {"g": "hildesheim-da", "id": "adddocs", "t": "Additional documents bundle (15 MB)", "n": "Cover, letter, certificates, course descriptions.", "f": "hildesheim-da_Mayar_Issa_Additional_Documents.pdf", "fn": "Mayar_Issa_Additional_Documents.pdf", "kb": 14727}, {"g": "lmu-stats", "id": "rec", "t": "Application record", "n": "Every answer in the LMU form.", "f": "lmu-stats_Application_Record_LMU_Statistics_Data_Science.pdf", "fn": "Application_Record_LMU_Statistics_Data_Science.pdf", "kb": 43}, {"g": "thws-ai", "id": "rec", "t": "Application record", "n": "Every answer in the THWS form.", "f": "thws-ai_Application_Record_THWS_AI.pdf", "fn": "Application_Record_THWS_AI.pdf", "kb": 42}, {"g": "tud-aiml", "id": "elig", "t": "Academic eligibility checklist", "n": "Your courses mapped to the 19 TU Darmstadt modules.", "f": "tud-aiml_TU_Darmstadt_AIML_Eligibility_Checklist_Mayar_Issa.pdf", "fn": "TU_Darmstadt_AIML_Eligibility_Checklist_Mayar_Issa.pdf", "kb": 37}],
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
