"use client";
import Section from "./Section";
import { cvCertifications } from "./data";

export default function Certifications() {
  if (!cvCertifications.length) return null;
  return (
    <Section title="Certifikace">
      <ul className="space-y-2">
        {cvCertifications.map((c) => (
          <li key={`${c.name}-${c.issuer}`} className="flex items-start justify-between gap-3 rounded-lg bg-white/5 border border-white/10 p-3">
            <div>
              <div className="font-medium">
                {c.url ? (
                  <a className="hover:underline" href={c.url} target="_blank" rel="noreferrer">{c.name}</a>
                ) : (
                  c.name
                )}
              </div>
              <div className="text-xs text-white/60">{c.issuer}</div>
            </div>
            {c.year && <div className="text-xs text-white/60 whitespace-nowrap">{c.year}</div>}
          </li>
        ))}
      </ul>
    </Section>
  );
}


