"use client";
import Section from "./Section";
import { cvEducation } from "./data";

export default function Education() {
  const extractUrl = (detail: string): { label: string; url?: string } => {
    const match = detail.match(/https?:\/\/\S+/);
    if (!match) return { label: detail };
    const url = match[0];
    const label = detail.replace(url, "").trim();
    return { label, url };
  };

  return (
    <Section title="Vzdělání">
      <div className="space-y-3">
        {cvEducation.map((e) => (
          <div key={`${e.school}-${e.degree}`} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{e.degree}</div>
                <div className="text-sm text-white/70">{e.school}</div>
              </div>
              <div className="text-xs text-white/60 whitespace-nowrap">
                {e.startDate ?? ""}{e.startDate || e.endDate ? " – " : ""}{e.endDate ?? ""}
              </div>
            </div>
            {e.details && e.details.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1 text-[13px] text-white/85">
                {e.details.map((d, i) => {
                  const { label, url } = extractUrl(d);
                  return (
                    <li key={i}>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                          aria-label={`${label} (otevřít odkaz)`}
                        >
                          {label} <span aria-hidden className="text-white/50">↗</span>
                        </a>
                      ) : (
                        <span>{label}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}


