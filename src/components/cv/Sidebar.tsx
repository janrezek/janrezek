"use client";
import { useCallback, useEffect, useState } from "react";
import Section from "./Section";
import { cvContact, cvLanguages, cvLinks, cvProfile, cvSkillCategories } from "./data";

export default function Sidebar() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = useCallback(() => setIsLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen, closeLightbox]);

  return (
    <div className="md:col-span-1 space-y-4">
      <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cvProfile.photoUrl ? openLightbox : undefined}
            className="h-16 w-16 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white/80 overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label={cvProfile.photoUrl ? "Zvětšit fotku" : undefined}
          >
            {cvProfile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cvProfile.photoUrl} alt={cvProfile.name} className="h-16 w-16 object-cover" />
            ) : (
              <span>Photo</span>
            )}
          </button>
          <div>
            <div className="text-base font-semibold">{cvProfile.name}</div>
            <div className="text-sm text-white/70">{cvProfile.title}</div>
            {cvProfile.location && (
              <div className="text-xs text-white/50">{cvProfile.location}</div>
            )}
          </div>
        </div>
      </div>

      <Section title="Kontakt">
        <ul className="space-y-1 text-[13px]">
          {cvContact.email && (
            <li>
              <a className="hover:underline" href={`mailto:${cvContact.email}`}>{cvContact.email}</a>
            </li>
          )}
          {cvContact.phone && <li>{cvContact.phone}</li>}
          {cvContact.website && (
            <li>
              <a className="hover:underline" href={cvContact.website} target="_blank" rel="noreferrer">Web</a>
            </li>
          )}
          {cvContact.github && (
            <li>
              <a className="hover:underline" href={cvContact.github} target="_blank" rel="noreferrer">GitHub</a>
            </li>
          )}
          {cvContact.linkedin && (
            <li>
              <a className="hover:underline" href={cvContact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </li>
          )}
          {cvContact.location && <li>{cvContact.location}</li>}
        </ul>
      </Section>

      <Section title="Dovednosti">
        <div className="space-y-3">
          {cvSkillCategories.map((cat) => (
            <div key={cat.name}>
              <div className="text-[11px] uppercase tracking-wide text-white/60 mb-1">{cat.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/80">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Jazyky">
        <ul className="space-y-1">
          {cvLanguages.map((l) => (
            <li key={l.name} className="flex items-center justify-between text-sm">
              <span>{l.name}</span>
              <span className="text-white/60">{l.level}</span>
            </li>
          ))}
        </ul>
      </Section>

      {cvLinks.length > 0 && (
        <Section title="Odkazy">
          <ul className="space-y-1 text-[13px]">
            {cvLinks.map((l) => (
              <li key={l.href}>
                <a className="hover:underline" href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {isLightboxOpen && cvProfile.photoUrl && (
        <div
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div className="absolute inset-0" />
          <div className="relative max-w-[90vw] max-h-[85vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cvProfile.photoUrl}
              alt={cvProfile.name}
              className="max-w-full max-h-[85vh] rounded-lg border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 rounded-full bg-white text-black text-xs px-2 py-1 shadow hover:bg-white/90"
              aria-label="Zavřít náhled"
            >
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


