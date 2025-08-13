"use client";

import { useEffect, useState } from "react";

type TypingPrefixProps = {
  text?: string;
  speedMs?: number;
  delayMs?: number;
  className?: string;
};

export default function TypingPrefix({
  text = "Junior ",
  speedMs = 300,
  delayMs = 500,
  className,
}: TypingPrefixProps) {
  const [typedLength, setTypedLength] = useState(0);

  useEffect(() => {
    if (typedLength >= text.length) return;
    const timeoutDuration = typedLength === 0 ? delayMs : speedMs;
    const timeoutId = setTimeout(() => {
      setTypedLength((prev) => prev + 1);
    }, timeoutDuration);
    return () => clearTimeout(timeoutId);
  }, [typedLength, text, speedMs, delayMs]);

  // Pokud se otevře CV, okamžitě dopiš text, aby seděl počet písmen pro animaci
  useEffect(() => {
    function handleCvOpen() {
      setTypedLength(text.length);
    }
    window.addEventListener("cv:open", handleCvOpen);
    return () => window.removeEventListener("cv:open", handleCvOpen);
  }, [text.length]);

  const typed = text.slice(0, typedLength);

  return (
    <span className={className} aria-live="polite">
      {typed}
      <span className="typing-cursor" aria-hidden="true" />
    </span>
  );
}


