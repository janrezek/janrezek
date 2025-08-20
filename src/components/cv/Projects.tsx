"use client";
import Section from "./Section";
import { cvProjects } from "./data";

export default function Projects() {
  return (
    <Section title="Projekty">
      <div className="space-y-3">
        {cvProjects.map((p) => (
          <div key={p.name} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">
                {p.url ? (
                  <a className="hover:underline" href={p.url} target="_blank" rel="noreferrer">{p.name}</a>
                ) : (
                  p.name
                )}
              </div>
            </div>
            <div className="text-sm text-white/85 mt-1">{p.description}</div>
            {p.technologies && p.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.technologies.map((t) => (
                  <span key={t} className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/80">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}


