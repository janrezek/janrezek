import {
  CVContactInfo,
  CVCertificationItem,
  CVEducationItem,
  CVExperienceItem,
  CVLanguage,
  CVLinks,
  CVProfile,
  CVProjectItem,
  CVSkillCategory,
} from "./types";

export const cvLastUpdated: string = "20.08.2025"; // např. "srpen 2025"

export const cvProfile: CVProfile = {
  name: "Jan Rezek, 25 let",
  title: "Full‑stack Developer",
  location: "Brno, Česko",
  photoUrl: "/me.JPG", // volitelné: /me.jpg
};

export const cvSummary: string =
  "Full‑stack Developer se zkušenostmi v Next.js, React, TypeScript, Tailwind CSS, Node.js, Prisma, PostgreSQL, Vercel a AWS. Rozsáhlé zkušenosti s WordPressem, Woocommerce, Elementorem a vytváření custom WordPress pluginů. Background v InfoSec.";

export const cvContact: CVContactInfo = {
  email: "hello@janrezek.me",
  github: "https://github.com/janrezek",
  linkedin: "https://www.linkedin.com/in/jan-rezek-dev/",
};

export const cvSkillCategories: CVSkillCategory[] = [
  { name: "Languages", skills: ["JavaScript", "TypeScript", "Python", "Java", "PHP", "HTML", "CSS"] },
  { name: "Wordpress", skills: ["WordPress", "Woocommerce", "Elementor", "ACF", "WP-Rocket", "WPML", "Custom WordPress Plugins", "Custom WordPress Themes"] },
  { name: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"] },
  { name: "Backend", skills: ["Next.js", "Node.js", "Prisma", "PostgreSQL", "FastAPI", "Flask"] },
  { name: "DevOps", skills: ["Vercel", "AWS", "CI/CD"] },
  { name: "AI", skills: ["OpenAI API", "Anthropic API", "Velké zkušenosti s prací s AI (ChatGPT, Claude, Cursor)"] },
  { name: "InfoSec", skills: ["Asymetrická kryptografie", "Symetrická kryptografie", "Hash funkce"] },
];

export const cvLanguages: CVLanguage[] = [
  { name: "Čeština", level: "rodilý mluvčí" },
  { name: "Angličtina", level: "B2" },
];

export const cvLinks: CVLinks = [
  { label: "GitHub", href: "https://github.com/janrezek" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jan-rezek-dev/" },
];

export const cvExperience: CVExperienceItem[] = [
  {
    company: "Freelance",
    role: "Wordpress Developer",
    location: "Brno",
    startDate: "2021-09",
    endDate: "Současnost",
    bullets: [
      "Vývoj a údržba WordPress stránek a pluginů",
      "Opravy chyb, údržba a vylepšení stránek",
    ],
    technologies: ["WordPress", "Woocommerce", "Elementor", "Custom WordPress Plugins"],
  },
  {
    company: "Audified",
    role: "Full‑stack WordPress Developer",
    location: "Brno",
    startDate: "2022-09",
    endDate: "Současnost",
    bullets: [
      "Vývoj a údržba WordPress stránek a pluginů",
      "Vývoj custom pluginů a backend logiky.",
    ],
    technologies: ["WordPress", "Woocommerce", "Elementor", "ACF", "WP-Rocket", "Custom WordPress Plugins"],
  },
];

export const cvProjects: CVProjectItem[] = [
  {
    name: "Joyful Craftsmen - WordPress Website",
    description: "Vývoj a údržba WordPress stránky a pluginů. Vývoj většího množství custom komponent.",
    url: "https://joyfulcraftsmen.com",
    technologies: ["WordPress", "Woocommerce", "Elementor", "ACF", "WP-Rocket", "Custom WordPress Plugins"],
  },

  {
    name: "Presendoo - WordPress Website",
    description: "Vytvoření WordPress webu s elementorem. Vývoj custom komponent.",
    url: "https://presendoo.com",
    technologies: ["WordPress", "Elementor", "WPML"],
  },
  {
    name: "Audified - WordPress + Woocommerce Website",
    description: "Vývoj a údržba WordPress webu s woocommerce + elementor. Vývoj custom pluginů a backend logiky. (U tohoto webu je připravován rebuild s důrazem na ryhlost a SEO)",
    url: "https://audified.com",
    technologies: ["WordPress", "Woocommerce", "Elementor", "ACF", "WP-Rocket", "Custom WordPress Plugins"],
  },
  {
    name: "Dalších X WordPress webů",
    description: "Mohu dodat na vyžádání",
    url: "",
    technologies: ["WordPress", "Elementor"],
  },
];

export const cvEducation: CVEducationItem[] = [
  {
    school: "VUT FEKT",
    degree: "Ing. – Informační Bezpečnost",
    startDate: "2023",
    endDate: "2025",
    details: ["Diplomová práce: Nástroj pro uchování webových stránek v důkazní kvalitě https://www.vut.cz/studenti/zav-prace/detail/167312", "Informace o oboru https://www.vut.cz/studenti/programy/program/8924"],
  },
  {
    school: "VUT FEKT",
    degree: "Bc. – Informační Bezpečnost",
    startDate: "2020",
    endDate: "2023",
    details: ["Bakalářská práce: Webové stránky jako elektronický důkaz https://www.vut.cz/studenti/zav-prace/detail/151212", "Informace o oboru https://www.vut.cz/studenti/programy/program/7911"],
  },
];

export const cvCertifications: CVCertificationItem[] = [

];


