"use client";
import Section from "./Section";
import { cvSummary } from "./data";

export default function Summary() {
  if (!cvSummary) return null;
  return (
    <Section title="Shrnutí">
      <p className="text-sm leading-relaxed text-white/90">{cvSummary}</p>
    </Section>
  );
}


