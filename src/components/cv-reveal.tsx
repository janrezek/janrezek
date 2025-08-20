"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./cv/Sidebar";
import Summary from "./cv/Summary";
import Experience from "./cv/Experience";
import Projects from "./cv/Projects";
import Education from "./cv/Education";
import { cvLastUpdated } from "./cv/data";

type OpenFrom = { x: number; y: number } | null;

export default function CVReveal() {
  const [isOpen, setIsOpen] = useState(false);
  const [openFrom, setOpenFrom] = useState<OpenFrom>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollThumb, setScrollThumb] = useState<{ height: number; top: number }>({ height: 0, top: 0 });
  const [scrollActive, setScrollActive] = useState(false);

  const open = useCallback((from: { x: number; y: number }) => {
    setOpenFrom(from);
    setIsOpen(true);
    try {
      window.dispatchEvent(new CustomEvent("cv:open", { detail: from }));
    } catch {}
  }, []);

  const close = useCallback(() => {
    if (!overlayRef.current) {
      setIsOpen(false);
      return;
    }

    const overlay = overlayRef.current;

    // fire reverse animation for homepage
    try {
      const origin = openFrom ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      window.dispatchEvent(new CustomEvent("cv:close", { detail: origin }));
    } catch {}

    // kick sheet reverse motion
    if (sheetRef.current) {
      sheetRef.current.classList.add("cv-sheet-exit");
    }
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setIsOpen(false);
      return;
    }

    // Reverse reveal by shrinking the clip-path back to 0
    overlay.style.setProperty("--cv-reveal-r", "0px");
    overlay.classList.remove("cv-open");

    const handler = () => {
      overlay.removeEventListener("transitionend", handler);
      setIsOpen(false);
      setOpenFrom(null);
    };
    overlay.addEventListener("transitionend", handler, { once: true });
  }, [openFrom]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    },
    [close]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      window.addEventListener("keydown", handleKey);
    } else {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKey);
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  // Auto-open if URL hash is #cv (centered)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#cv") {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      open({ x: vw / 2, y: vh / 2 });
    }
  }, [open]);

  // After the overlay mounts, kick off the radial reveal animation
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const overlay = overlayRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const originX = openFrom?.x ?? vw / 2;
    const originY = openFrom?.y ?? vh / 2;

    overlay.style.setProperty("--cv-reveal-x", `${originX}px`);
    overlay.style.setProperty("--cv-reveal-y", `${originY}px`);

    if (prefersReduced) {
      overlay.style.setProperty("--cv-reveal-r", `${Math.hypot(vw, vh)}px`);
      overlay.classList.add("cv-open");
      return;
    }

    overlay.style.setProperty("--cv-reveal-r", `0px`);

    const maxRadius = Math.max(
      Math.hypot(originX, originY),
      Math.hypot(vw - originX, originY),
      Math.hypot(originX, vh - originY),
      Math.hypot(vw - originX, vh - originY)
    );

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add("cv-open");
        overlay.style.setProperty("--cv-reveal-r", `${maxRadius + 24}px`);
      });
    });
  }, [isOpen, openFrom]);

  // Custom overlay scrollbar sync
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;

    const MIN_THUMB = 36;
    const updateThumb = () => {
      const { scrollHeight, clientHeight, scrollTop } = el;
      const hasOverflow = scrollHeight > clientHeight + 1;
      setScrollActive(hasOverflow);
      if (!hasOverflow) {
        setScrollThumb({ height: 0, top: 0 });
        return;
      }
      const trackHeight = el.clientHeight - 32; // account for paddings in visual track
      const visibleRatio = clientHeight / scrollHeight;
      const thumbHeight = Math.max(Math.floor(trackHeight * visibleRatio), MIN_THUMB);
      const maxScrollTop = scrollHeight - clientHeight;
      const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
      const maxThumbTop = trackHeight - thumbHeight;
      const top = Math.round(16 + maxThumbTop * scrollRatio); // 16px offset from top
      setScrollThumb({ height: thumbHeight, top });
    };

    updateThumb();
    el.addEventListener("scroll", updateThumb);
    window.addEventListener("resize", updateThumb);
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      window.removeEventListener("resize", updateThumb);
      ro.disconnect();
    };
  }, [isOpen]);

  const onClickOpen = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      if (typeof window !== "undefined") {
        history.replaceState(null, "", "#cv");
      }
      open({ x, y });
    },
    [open]
  );

  const onBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        if (typeof window !== "undefined") {
          history.replaceState(null, "", window.location.pathname);
        }
        close();
      }
    },
    [close]
  );

  const onCloseClick = useCallback(() => {
    if (typeof window !== "undefined") {
      history.replaceState(null, "", window.location.pathname);
    }
    close();
  }, [close]);

  // PDF generátor dočasně vypnut

  return (
    <>
      <button
        onClick={onClickOpen}
        className="text-xl text-center underline decoration-white/30 hover:decoration-white transition-colors"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        Zobrazit CV
      </button>

      {isOpen && (
        <div
          ref={overlayRef}
          className="cv-overlay fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          onClick={onBackdropClick}
        >
          <div className="absolute inset-0" />

          <div className="cv-sheet-wrapper absolute inset-0 grid place-items-center">
            <div ref={sheetRef} className="cv-sheet relative w-[min(900px,92vw)] max-h-[84vh] h-[680px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl overflow-hidden cv-sheet-enter">

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <h2 className="text-xl tracking-wide font-semibold">
                    CV
                  </h2>
                  <div className="flex items-center gap-2">

                    <button
                      onClick={onCloseClick}
                      className="cursor-pointer inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 active:bg-white/20 transition-colors"
                      aria-label="Close CV"
                    >
                      Zavřít
                    </button>
                  </div>
                </div>

                <div ref={scrollRef} className="relative p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-auto cv-content-enter cv-scroll cv-scroll--custom flex-1 min-h-0">
                  <Sidebar />
                  <div className="md:col-span-2 space-y-4">
                    <Summary />
                    <Experience />
                    <Projects />
                    <Education />
                  </div>

                  {scrollActive && (
                    <div className="cv-custom-scrollbar pointer-events-none select-none">
                      <div
                        className="cv-custom-scrollbar-thumb"
                        style={{ height: `${scrollThumb.height}px`, transform: `translateY(${scrollThumb.top}px)` }}
                      />
                    </div>
                  )}
                </div>
                <div className="px-5 py-2 border-t border-white/10 text-[11px] md:text-xs text-white/50">
                  Naposledy aktualizováno: {cvLastUpdated}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


