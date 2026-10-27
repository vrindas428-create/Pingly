// Course catalog for the Notes Hub. Each course has a subject list for
// every semester (1-8). This is demo data written for the class
// assessment — subject names are the common/generic titles used across
// most Indian university programs, not copied from any specific syllabus.
export const COURSES = [
  { id: "cse-core", name: "B.E. — CSE (Core)" },
  { id: "cse-aiml", name: "B.E. — CSE (AI & ML)" },
  { id: "cse-ds", name: "B.E. — CSE (Data Science)" },
  { id: "cse-cyber", name: "B.E. — CSE (Cyber Security)" },
  { id: "ece", name: "B.E. — Electronics & Communication" },
  { id: "mech", name: "B.E. — Mechanical Engineering" },
  { id: "civil", name: "B.E. — Civil Engineering" },
  { id: "bpharma", name: "B.Pharmacy" },
  { id: "bba", name: "BBA" },
  { id: "bcom", name: "B.Com (Hons)" },
  { id: "bca", name: "BCA" },
];

// Two subjects per semester per course — kept compact on purpose so the
// Notes Hub demo stays easy to walk a professor through.
export const SUBJECTS_BY_COURSE = {
  "cse-core": {
    1: ["Engineering Mathematics I", "Programming Fundamentals (C)"],
    2: ["Engineering Mathematics II", "Basic Electrical & Electronics"],
    3: ["Data Structures", "Web Development (HTML/CSS/JS)"],
    4: ["Database Management Systems", "Operating Systems"],
    5: ["Computer Networks", "Design & Analysis of Algorithms"],
    6: ["Software Engineering", "Machine Learning Basics"],
    7: ["Cloud Computing", "Compiler Design"],
    8: ["Major Project", "Elective — Blockchain Basics"],
  },
  "cse-aiml": {
    1: ["Engineering Mathematics I", "Programming Fundamentals (Python)"],
    2: ["Engineering Mathematics II", "Data Structures using Python"],
    3: ["Object-Oriented Programming (Java)", "Web Development (HTML/CSS/JS)"],
    4: ["Database Management Systems", "Probability & Statistics for AI"],
    5: ["Machine Learning", "Computer Networks"],
    6: ["Deep Learning", "Natural Language Processing"],
    7: ["Computer Vision", "Reinforcement Learning"],
    8: ["Major Project", "Elective — MLOps Basics"],
  },
  "cse-ds": {
    1: ["Engineering Mathematics I", "Programming Fundamentals (Python)"],
    2: ["Engineering Mathematics II", "Data Structures"],
    3: ["Statistics for Data Science", "Web Development (HTML/CSS/JS)"],
    4: ["Database Management Systems", "Data Visualization"],
    5: ["Machine Learning", "Big Data Fundamentals"],
    6: ["Data Mining", "Cloud Computing"],
    7: ["Deep Learning", "Time Series Analysis"],
    8: ["Major Project", "Elective — MLOps Basics"],
  },
  "cse-cyber": {
    1: ["Engineering Mathematics I", "Programming Fundamentals (C)"],
    2: ["Engineering Mathematics II", "Data Structures"],
    3: ["Computer Networks", "Web Development (HTML/CSS/JS)"],
    4: ["Operating Systems", "Cryptography Basics"],
    5: ["Network Security", "Database Management Systems"],
    6: ["Ethical Hacking", "Cloud Security"],
    7: ["Digital Forensics", "Security Operations"],
    8: ["Major Project", "Elective — IoT Security"],
  },
  ece: {
    1: ["Engineering Mathematics I", "Basic Electrical Engineering"],
    2: ["Engineering Mathematics II", "Electronic Devices"],
    3: ["Digital Electronics", "Signals & Systems"],
    4: ["Analog Communication", "Microprocessors"],
    5: ["Digital Communication", "Control Systems"],
    6: ["VLSI Design", "Embedded Systems"],
    7: ["Wireless Communication", "Antenna & Wave Propagation"],
    8: ["Major Project", "Elective — IoT Fundamentals"],
  },
  mech: {
    1: ["Engineering Mathematics I", "Engineering Mechanics"],
    2: ["Engineering Mathematics II", "Engineering Graphics"],
    3: ["Thermodynamics", "Strength of Materials"],
    4: ["Fluid Mechanics", "Manufacturing Processes"],
    5: ["Machine Design", "Heat Transfer"],
    6: ["Dynamics of Machines", "Industrial Engineering"],
    7: ["CAD/CAM", "Automobile Engineering"],
    8: ["Major Project", "Elective — Robotics Basics"],
  },
  civil: {
    1: ["Engineering Mathematics I", "Engineering Mechanics"],
    2: ["Engineering Mathematics II", "Building Materials"],
    3: ["Surveying", "Strength of Materials"],
    4: ["Structural Analysis", "Fluid Mechanics"],
    5: ["Geotechnical Engineering", "Concrete Technology"],
    6: ["Transportation Engineering", "Environmental Engineering"],
    7: ["Design of Steel Structures", "Estimation & Costing"],
    8: ["Major Project", "Elective — Earthquake Engineering"],
  },
  bpharma: {
    1: ["Human Anatomy & Physiology I", "Pharmaceutical Analysis I"],
    2: ["Human Anatomy & Physiology II", "Pharmaceutical Inorganic Chemistry"],
    3: ["Pharmaceutical Organic Chemistry I", "Physical Pharmaceutics I"],
    4: ["Pharmaceutical Organic Chemistry II", "Pharmaceutical Microbiology"],
    5: ["Pharmacology I", "Medicinal Chemistry I"],
    6: ["Pharmacology II", "Pharmaceutical Jurisprudence"],
    7: ["Pharmacology III", "Industrial Pharmacy"],
    8: ["Pharmacy Practice", "Biopharmaceutics & Pharmacokinetics"],
  },
  bba: {
    1: ["Principles of Management", "Business Communication"],
    2: ["Financial Accounting", "Micro Economics"],
    3: ["Business Statistics", "Organizational Behaviour"],
    4: ["Marketing Management", "Macro Economics"],
    5: ["Human Resource Management", "Financial Management"],
    6: ["Operations Management", "Consumer Behaviour"],
    7: ["Strategic Management", "Entrepreneurship Development"],
    8: ["Major Project", "Elective — Digital Marketing"],
  },
  bcom: {
    1: ["Financial Accounting", "Business Organisation"],
    2: ["Corporate Accounting", "Business Law"],
    3: ["Cost Accounting", "Income Tax Law & Practice"],
    4: ["Company Law", "Business Statistics"],
    5: ["Management Accounting", "Auditing"],
    6: ["Financial Management", "GST & Indirect Taxes"],
    7: ["Investment Management", "International Business"],
    8: ["Project Work", "Elective — Financial Markets"],
  },
  bca: {
    1: ["Programming Fundamentals (C)", "Computer Fundamentals"],
    2: ["Data Structures", "Digital Electronics"],
    3: ["Object-Oriented Programming (Java)", "Web Development (HTML/CSS/JS)"],
    4: ["Database Management Systems", "Operating Systems"],
    5: ["Computer Networks", "Software Engineering"],
    6: ["Python for Data Analysis", "Mobile App Development"],
    7: ["Cloud Computing", "Machine Learning Basics"],
    8: ["Major Project", "Elective — Cyber Security Basics"],
  },
};

// Auto-generate exactly two notes per subject (a Unit Notes PDF and a
// Previous Year Questions PDF) instead of hand-writing hundreds of
// entries — a small use of array methods over the subject list above.
let noteId = 1;
export const NOTES_CATALOG = COURSES.flatMap((course) => {
  const bySem = SUBJECTS_BY_COURSE[course.id] || {};
  return Object.entries(bySem).flatMap(([sem, subjects]) =>
    subjects.flatMap((subject) => [
      {
        id: noteId++,
        courseId: course.id,
        sem: Number(sem),
        subject,
        title: `${subject} — Unit Notes`,
        kind: "Unit Notes",
        pdf: "/notes/sample-unit-notes.pdf",
        upvotes: 40 + ((noteId * 7) % 260),
      },
      {
        id: noteId++,
        courseId: course.id,
        sem: Number(sem),
        subject,
        title: `${subject} — Previous Year Questions`,
        kind: "PYQ",
        pdf: "/notes/sample-pyq.pdf",
        upvotes: 30 + ((noteId * 11) % 220),
      },
    ])
  );
});
