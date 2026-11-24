
export const site = {
  name: "Fawaz Zahran",
  role: "Informatics Student / Developer",

  // Start year
  since: 2026,

  email: "fwzhrn@gmail.com",

  socials: [
    { label: "GitHub", href: "https://github.com/fwzhrn" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/usernamekamu" },
    { label: "Instagram", href: "https://www.instagram.com/fwzhrn" },
  ] as { label: string; href: string }[],

  intro:
    "An Informatics student who enjoys building web interfaces, from structure and styling to interactive experiences.",

  photo: "/images/profile.jpg",

  about: {
    statement:
      "I build web experiences that feel alive. To me, a good interface is not just about looking clean, but also about rhythm, details, and purpose behind every interaction.",

    // Words highlighted with the accent color
    highlight: ["alive", "purpose"],

    body: [
      "I am an Informatics student at Siliwangi University with an interest in web development, especially the parts that directly interact with users: structure, typography, and interaction.",
      "This portfolio is where I showcase my projects, experiments, and progress as I continue learning and exploring new technologies.",
    ],

    facts: [
      { label: "Role", value: "Informatics Student / Developer" },
      { label: "Focus", value: "Web Development & Creative Development" },
      { label: "Based in", value: "Tasikmalaya, Indonesia" },
      { label: "Currently Learning", value: "TypeScript, Next.js & Modern Web Development" },
    ],
  },

  skills: [
    {
      name: "HTML",
      group: "Fundamentals",
      note: "Semantic structure and accessibility",
    },
    {
      name: "CSS",
      group: "Fundamentals",
      note: "Layouts, responsive design, and visual details",
    },
    {
      name: "JavaScript",
      group: "Fundamentals",
      note: "Browser logic and interactive experiences",
    },
    {
      name: "TypeScript",
      group: "Fundamentals",
      note: "Safer and more structured code",
    },
    {
      name: "React",
      group: "Framework",
      note: "Building user interfaces with reusable components",
    },
    {
      name: "Next.js",
      group: "Framework",
      note: "Routing, rendering, and performance optimization",
    },
    {
      name: "Tailwind CSS",
      group: "Styling",
      note: "Utility-first styling and design systems",
    },
    {
      name: "GSAP",
      group: "Animation",
      note: "Timeline-based and scroll-triggered animations",
    },
    {
      name: "Motion",
      group: "Animation",
      note: "Micro-interactions and layout transitions",
    },
    {
      name: "Three.js",
      group: "3D",
      note: "Exploring WebGL experiences in the browser",
    },
  ],
};

export const nav = [
  { id: "about", label: "About", href: "/#about" },
  { id: "skills", label: "Skills", href: "/#skills" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "journey", label: "Journey", href: "/#journey" },
  { id: "playground", label: "Playground", href: "/#playground" },
  { id: "contact", label: "Contact", href: "/#contact" },
];
