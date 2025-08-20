export type CVProfile = {
  name: string;
  title: string;
  location?: string;
  photoUrl?: string;
};

export type CVContactInfo = {
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  location?: string;
};

export type CVSkillCategory = {
  name: string;
  skills: string[];
};

export type CVLanguage = {
  name: string;
  level: string; // e.g., Native, C1, B2
};

export type CVExperienceItem = {
  company: string;
  role: string;
  location?: string;
  startDate: string; // e.g., 2022-01
  endDate: string | "present"; // e.g., 2024-06 or "present"
  bullets: string[];
  technologies?: string[];
};

export type CVProjectItem = {
  name: string;
  description: string;
  url?: string;
  technologies?: string[];
};

export type CVEducationItem = {
  school: string;
  degree: string;
  startDate?: string;
  endDate?: string;
  details?: string[];
};

export type CVCertificationItem = {
  name: string;
  issuer: string;
  year?: string;
  url?: string;
};

export type CVLinks = {
  label: string;
  href: string;
}[];


