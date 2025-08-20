"use client";
import Section from "./Section";
import { cvExperience } from "./data";

export default function Experience() {
  return (
    <Section title="Praxe">
      <div className="space-y-4">
        {cvExperience.map((item) => (
          <div key={`${item.company}-${item.role}-${item.startDate}`} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">
                  {item.role} <span className="text-white/60">@ {item.company}</span>
                </div>
                {item.location && (
                  <div className="text-xs text-white/50">{item.location}</div>
                )}
              </div>
              <div className="text-xs text-white/60 whitespace-nowrap">
                {item.startDate} – {item.endDate}
              </div>
            </div>
            {item.bullets.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1 text-[13px] text-white/85">
                {item.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}
            {item.technologies && item.technologies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.technologies.map((t) => (
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


