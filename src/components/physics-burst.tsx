"use client";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type Vector = { x: number; y: number };
type Body = {
  el: HTMLElement;
  baseLeft: number;
  baseTop: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  av: number;
  width: number;
  height: number;
  radius: number;
  mass: number;
};

// removed unused applyPhysics helper (was not referenced)

export default function PhysicsBurst({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTargetsRef = useRef<HTMLElement[] | null>(null);
  const lastOriginRef = useRef<Vector | null>(null);
  const lastFinalPositionsRef = useRef<Vector[] | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const lettersRef = useRef<HTMLElement[] | null>(null);
  const simActiveRef = useRef(false);
  const bodiesRef = useRef<Body[] | null>(null);
  const simRafRef = useRef<number | null>(null);
  const isExplodedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const outwardReadyRef = useRef(false);
  const pendingReverseRef = useRef(false);
  const returnRafRef = useRef<number | null>(null);

  useEffect(() => {
    // Shared canvas for font metrics (ascent/descent) to compute baseline offset
    let metricsCanvas: HTMLCanvasElement | null = null;
    let metricsCtx: CanvasRenderingContext2D | null = null;
    const originalVisibilityMap = new WeakMap<HTMLElement, string | undefined>();

    function ensureMetricsCtx(): CanvasRenderingContext2D | null {
      if (metricsCtx) return metricsCtx;
      metricsCanvas = document.createElement("canvas");
      metricsCtx = metricsCanvas.getContext("2d");
      return metricsCtx;
    }

    function buildFontShorthand(style: CSSStyleDeclaration): string {
      // Keep it simple: weight size family
      const weight = style.fontWeight || "normal";
      const size = style.fontSize || "16px";
      const family = style.fontFamily || "sans-serif";
      return `${weight} ${size} ${family}`;
    }

    function parsePx(value: string): number {
      const n = parseFloat(value || "0");
      return isNaN(n) ? 0 : n;
    }

    function resolveUsedLineHeightPx(style: CSSStyleDeclaration): number {
      const lh = style.lineHeight || "normal";
      const fontSizePx = parsePx(style.fontSize);
      if (lh.endsWith("px")) return parsePx(lh);
      if (/^\d+(?:\.\d+)?$/.test(lh)) return parseFloat(lh) * fontSizePx;
      // measure when 'normal' or non-px value
      const probe = document.createElement("span");
      probe.textContent = "A";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.whiteSpace = "pre";
      probe.style.fontFamily = style.fontFamily;
      probe.style.fontSize = style.fontSize;
      probe.style.fontWeight = style.fontWeight as string;
      probe.style.letterSpacing = style.letterSpacing;
      probe.style.lineHeight = style.lineHeight;
      document.body.appendChild(probe);
      const h = probe.getBoundingClientRect().height;
      document.body.removeChild(probe);
      return h || fontSizePx || 16;
    }

    function computeBaselineAdjustPx(style: CSSStyleDeclaration): number {
      // topLeading = (usedLineHeight - (ascent + descent)) / 2
      const ctx = ensureMetricsCtx();
      if (!ctx) return 0;
      ctx.font = buildFontShorthand(style);
      const m = ctx.measureText("Hg");
      const ascent = typeof m.actualBoundingBoxAscent === "number" ? m.actualBoundingBoxAscent : parsePx(style.fontSize) * 0.8;
      const descent = typeof m.actualBoundingBoxDescent === "number" ? m.actualBoundingBoxDescent : parsePx(style.fontSize) * 0.2;
      const usedLH = resolveUsedLineHeightPx(style);
      const topLeading = (usedLH - (ascent + descent)) / 2;
      return isFinite(topLeading) ? topLeading : 0;
    }

    function createOverlay(): HTMLDivElement {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "59"; // CV has 60
      return overlay;
    }

    function* textNodesIn(node: Node): Generator<Text> {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let current: Node | null = walker.nextNode();
      while (current) {
        const text = current as Text;
        if (text.nodeValue && text.nodeValue.trim().length > 0) {
          yield text;
        }
        current = walker.nextNode();
      }
    }

    function splitIntoLetters(target: HTMLElement, overlay: HTMLElement): HTMLElement[] {
      const created: HTMLElement[] = [];
      const originalVisibility = target.style.visibility;
      target.style.visibility = "hidden";
      originalVisibilityMap.set(target, originalVisibility);

      for (const textNode of textNodesIn(target)) {
        const parentEl = textNode.parentElement ?? target;
        const style = window.getComputedStyle(parentEl);
        const value = textNode.nodeValue ?? "";
        const baselineAdjust = computeBaselineAdjustPx(style);

        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          if (char === "\n") continue;
          const range = document.createRange();
          try {
            range.setStart(textNode, i);
            range.setEnd(textNode, i + 1);
          } catch {
            continue;
          }
          const rect = range.getBoundingClientRect();
          range.detach();
          if (!rect || rect.width === 0 || rect.height === 0) continue;

          const span = document.createElement("span");
          span.textContent = char;
          span.style.position = "fixed";
          span.style.left = `${rect.left}px`;
          // push down by top leading so glyph aligns with original line box
          span.style.top = `${rect.top + baselineAdjust}px`;
          span.style.width = `${rect.width}px`;
          span.style.height = `${rect.height}px`;
          span.style.display = "block";
          span.style.transformOrigin = "0 0";
          span.style.willChange = "transform, opacity";
          // inherit key text styles
          span.style.fontFamily = style.fontFamily;
          span.style.fontSize = style.fontSize;
          span.style.fontWeight = style.fontWeight as string;
          span.style.letterSpacing = style.letterSpacing;
          span.style.lineHeight = style.lineHeight;
          span.style.color = style.color;
          span.style.whiteSpace = "pre"; // preserve spaces
          // store baseline adjust for return alignment
          span.dataset["baselineAdjust"] = String(baselineAdjust);
          overlay.appendChild(span);
          created.push(span);

          // Fine alignment: measure placed rect and nudge so it matches source rect exactly
          const placed = span.getBoundingClientRect();
          const dx = rect.left - placed.left;
          const dy = rect.top - placed.top;
          if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            span.style.left = `${parseFloat(span.style.left) + dx}px`;
            span.style.top = `${parseFloat(span.style.top) + dy}px`;
          }
          // Having nudged into exact place, zero-out stored adjust so return path doesn't double-shift
          span.dataset["baselineAdjust"] = "0";
        }
      }

      // Store info for later restore on element itself
      return created;
    }

    function restoreTargets(targets: HTMLElement[]) {
      targets.forEach((t) => {
        const vis = originalVisibilityMap.get(t);
        t.style.visibility = vis ?? "";
        originalVisibilityMap.delete(t);
      });
    }

    function onOpen(e: Event) {
      // Pokud běží návratová animace nebo je aktivní overlay, okamžitě ji dokonči a vyčisti, aby mohlo začít nové otevření
      if (isAnimatingRef.current || overlayRef.current) {
        try {
          const letters = lettersRef.current || [];
          letters.forEach((el) => {
            try { el.getAnimations().forEach((a) => a.cancel()); } catch {}
          });
        } catch {}
        if (returnRafRef.current) cancelAnimationFrame(returnRafRef.current);
        if (simRafRef.current) cancelAnimationFrame(simRafRef.current);
        simActiveRef.current = false;
        overlayRef.current?.remove();
        const lastTargets = lastTargetsRef.current;
        if (lastTargets && lastTargets.length) {
          restoreTargets(lastTargets as HTMLElement[]);
        }
        lastTargetsRef.current = null;
        lastOriginRef.current = null;
        lastFinalPositionsRef.current = null;
        lettersRef.current = null;
        overlayRef.current = null;
        isExplodedRef.current = false;
        isAnimatingRef.current = false;
        outwardReadyRef.current = false;
        pendingReverseRef.current = false;
      }
      if (isExplodedRef.current) return;
      isExplodedRef.current = true;
      outwardReadyRef.current = false;
      pendingReverseRef.current = false;

      const origin = (e as CustomEvent<Vector>).detail as Vector;
      const container = containerRef.current;
      if (!container || !origin) return;

      // Počkej na další snímek, aby React stihl dopsat TypingPrefix po cv:open
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const overlay = createOverlay();
          document.body.appendChild(overlay);
          overlayRef.current = overlay;

          const rawTargets = Array.from(container.querySelectorAll<HTMLElement>("[data-physics-target]"));
          // odfiltruj vnořené cíle, aby se nespouštěly dvakrát (duplicita např. u TypingPrefix)
          const targets = rawTargets.filter((t) => !rawTargets.some((o) => o !== t && o.contains(t)));
          const letters = targets.flatMap((el) => splitIntoLetters(el, overlay));

          if (letters.length === 0) {
            overlay.remove();
            restoreTargets(targets);
            return;
          }

          // Remember for reverse animation
          lastTargetsRef.current = targets;
          lastOriginRef.current = origin;
          lettersRef.current = letters;
          simActiveRef.current = true;
          outwardReadyRef.current = true; // připraveno hned po vytvoření
          
          // Build rigid bodies with mass proportional to glyph area
          const bodies: Body[] = letters.map((el) => {
            const r = el.getBoundingClientRect();
            const baseLeft = r.left;
            const baseTop = r.top;
            const width = Math.max(1, r.width);
            const height = Math.max(1, r.height);
            const cx = baseLeft + width / 2;
            const cy = baseTop + height / 2;
            const dx = cx - origin.x;
            const dy = cy - origin.y;
            const dist = Math.hypot(dx, dy) || 1;
            const nx = dx / dist;
            const ny = dy / dist;
            const baseImpulse = 1200;
            const impulse = baseImpulse * Math.min(1.2, 260 / dist);
            const vx = nx * impulse + (Math.random() - 0.5) * 120;
            const vy = ny * impulse - 200 + (Math.random() - 0.5) * 120;
            const angle = 0;
            const av = (Math.random() - 0.5) * 600;
            const radius = Math.max(2, Math.min(width, height) * 0.5);
            const mass = Math.max(1, (width * height) * 0.002);
            return { el, baseLeft, baseTop, x: 0, y: 0, vx, vy, angle, av, width, height, radius, mass };
          });
          bodiesRef.current = bodies;

          // Physics params
          const gravity = 1800;
          const airDrag = 0.02;
          const restitutionBodies = 0.2; // between letters
          const restitutionWalls = 0.45; // walls/floor
          const groundFriction = 0.02;
          const positionalCorrectionPercent = 0.8;
          const slop = 0.5;

          let last = performance.now();
          const step = (now: number) => {
            if (!simActiveRef.current) return;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            // Integrate and collide with world
            for (const b of bodies) {
              b.vy += gravity * dt;
              b.vx *= 1 - airDrag * dt;
              b.vy *= 1 - airDrag * dt;
              b.x += b.vx * dt;
              b.y += b.vy * dt;
              b.angle += b.av * dt;

              const right = window.innerWidth - b.width;
              const floor = window.innerHeight - b.height;
              let absX = b.baseLeft + b.x;
              let absY = b.baseTop + b.y;

              // walls
              if (absX < 0) {
                absX = 0;
                b.x = absX - b.baseLeft;
                b.vx = -b.vx * restitutionWalls;
                b.av *= 0.9;
              } else if (absX > right) {
                absX = right;
                b.x = absX - b.baseLeft;
                b.vx = -b.vx * restitutionWalls;
                b.av *= 0.9;
              }
              // floor
              if (absY > floor) {
                absY = floor;
                b.y = absY - b.baseTop;
                b.vy = -b.vy * restitutionWalls;
                b.vx *= 1 - groundFriction - Math.min(0.08, Math.abs(b.vx) / 2000);
                b.av *= 0.92;
                if (Math.abs(b.vy) < 18 && Math.abs(b.vx) < 12) {
                  b.vx = 0; b.vy = 0; b.av = 0;
                }
              }
            }

            // Pairwise collisions (disc approximation)
            for (let i = 0; i < bodies.length; i++) {
              const a = bodies[i];
              const ax = a.baseLeft + a.x + a.width / 2;
              const ay = a.baseTop + a.y + a.height / 2;
              for (let j = i + 1; j < bodies.length; j++) {
                const b: Body = bodies[j];
                const bx = b.baseLeft + b.x + b.width / 2;
                const by = b.baseTop + b.y + b.height / 2;
                const dx = bx - ax;
                const dy = by - ay;
                const dist = Math.hypot(dx, dy);
                const minDist = a.radius + b.radius;
                if (dist <= 0 || dist >= minDist) continue;

                const nx = dx / dist;
                const ny = dy / dist;
                const overlap = minDist - dist;

                // Position correction to separate
                const invMassA = 1 / a.mass;
                const invMassB = 1 / b.mass;
                const correction = (Math.max(overlap - slop, 0) / (invMassA + invMassB)) * positionalCorrectionPercent;
                a.x -= correction * invMassA * nx;
                a.y -= correction * invMassA * ny;
                b.x += correction * invMassB * nx;
                b.y += correction * invMassB * ny;

                // Resolve velocities along normal
                const rvx: number = b.vx - a.vx;
                const rvy: number = b.vy - a.vy;
                const velAlongNormal: number = rvx * nx + rvy * ny;
                if (velAlongNormal > 0) continue;
                const impulseMag: number = -(1 + restitutionBodies) * velAlongNormal / (invMassA + invMassB);
                const impulseX = impulseMag * nx;
                const impulseY = impulseMag * ny;
                a.vx -= impulseX * invMassA;
                a.vy -= impulseY * invMassA;
                b.vx += impulseX * invMassB;
                b.vy += impulseY * invMassB;
              }
            }

            // Write transforms
            for (const b of bodies) {
              b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
            }

            simRafRef.current = requestAnimationFrame(step);
          };

          simRafRef.current = requestAnimationFrame(step);
          if (pendingReverseRef.current) {
            pendingReverseRef.current = false;
            onClose(new CustomEvent("cv:close", { detail: lastOriginRef.current || origin }) as unknown as Event);
          }
        });
      });

      // end of deferred open
    }

    function onClose(e: Event) {
      if (!isExplodedRef.current || isAnimatingRef.current) return;
      if (!outwardReadyRef.current) {
        pendingReverseRef.current = true;
        return;
      }
      isAnimatingRef.current = true;

      const targets = lastTargetsRef.current;
      const overlay = overlayRef.current;
      const letters = lettersRef.current;
      if (!targets || targets.length === 0) return;
      if (!overlay || !letters || letters.length === 0) return;

      // Stop physics simulation
      simActiveRef.current = false;
      if (simRafRef.current) cancelAnimationFrame(simRafRef.current);

      // 1) Compute destination rects per character BEFORE touching targets
      //    IMPORTANT: must mirror filtering logic from splitIntoLetters (skip zero-size rects)
      const destinations: { x: number; y: number }[] = [];
      for (const target of targets) {
        for (const textNode of textNodesIn(target)) {
          const value = textNode.nodeValue ?? "";
          for (let i = 0; i < value.length; i++) {
            const char = value[i];
            if (char === "\n") continue;
            const range = document.createRange();
            try {
              range.setStart(textNode, i);
              range.setEnd(textNode, i + 1);
            } catch {
              continue;
            }
            const rect = range.getBoundingClientRect();
            range.detach();
            if (rect && rect.width > 0 && rect.height > 0) {
              destinations.push({ x: rect.left, y: rect.top });
            }
          }
        }
      }

      // If count differs (e.g., due to collapsed spaces), align lengths to avoid index drift
      if (destinations.length !== letters.length) {
        if (destinations.length > letters.length) {
          destinations.length = letters.length;
        } else {
          // Not enough destinations → gracefully finish by restoring targets
          overlay.remove();
          restoreTargets(targets as HTMLElement[]);
          lastTargetsRef.current = null;
          lastOriginRef.current = null;
          lastFinalPositionsRef.current = null;
          lettersRef.current = null;
          overlayRef.current = null;
          isExplodedRef.current = false;
          isAnimatingRef.current = false;
          outwardReadyRef.current = false;
          return;
        }
      }

      // 2) Nech cíle viditelné, ale skryté přes opacity – umožní hladký crossfade bez posunu
      targets.forEach((t) => {
        const vis = originalVisibilityMap.get(t);
        t.style.visibility = vis ?? ""; // obnov viditelnost už teď
        t.style.opacity = "0";          // ale ponech je vizuálně neviditelné
      });

      // Animate characters physically towards their destinations
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        letters.forEach((el, idx) => {
          const d = destinations[idx];
          if (!d) return el.remove();
          el.style.transition = "transform 220ms ease-out, opacity 220ms ease-out";
          const cur = el.getBoundingClientRect();
          const adj = parseFloat(el.dataset?.["baselineAdjust"] ?? "0");
          el.style.transform = `translate(${d.x - cur.left}px, ${d.y + adj - cur.top}px)`;
          el.style.opacity = "0";
          setTimeout(() => el.remove(), 240);
        });
         overlay.remove();
         restoreTargets(targets);
         lastTargetsRef.current = null;
         lastOriginRef.current = null;
         lastFinalPositionsRef.current = null;
         lettersRef.current = null;
         overlayRef.current = null;
        isExplodedRef.current = false;
        isAnimatingRef.current = false;
        outwardReadyRef.current = false;
        return;
      }

      // Reparo-like return: spring + swirl back with rotation
      type ReturnState = {
        el: HTMLElement;
        baseLeft: number;
        baseTop: number;
        tx: number; ty: number; vx: number; vy: number;
        rot: number; vr: number; swirlPhase: number;
        targetX: number; targetY: number;
      };

      function getRotationDegrees(node: HTMLElement): number {
        const cs = getComputedStyle(node);
        const t = cs.transform;
        if (!t || t === "none") return 0;
        try {
          const m = new DOMMatrixReadOnly(t);
          const angle = Math.atan2(m.b, m.a) * (180 / Math.PI);
          return angle;
        } catch {
          return 0;
        }
      }

      const states: ReturnState[] = letters.map((el, idx) => {
        const cur = el.getBoundingClientRect();
        const d = destinations[idx];
        el.style.left = `${cur.left}px`;
        el.style.top = `${cur.top}px`;
        const currentRot = getRotationDegrees(el);
        el.style.transform = `translate(0px,0px) rotate(${currentRot}deg)`;
        const adj = parseFloat(el.dataset?.["baselineAdjust"] ?? "0");
        return {
          el,
          baseLeft: cur.left,
          baseTop: cur.top,
          tx: 0, ty: 0, vx: 0, vy: 0,
          rot: currentRot, vr: (Math.random() - 0.5) * 720,
          swirlPhase: Math.random() * Math.PI * 2,
          targetX: d.x, targetY: d.y + adj,
        };
      });

      const stiffness = 44; // rychlejší pružina
      const damping = 18;   // silnější tlumení
      const rotStiff = 10;
      const rotDamp = 9;
      const swirlStrength = 140; // menší víření
      let lastT = performance.now();

      const pendingFinal = 0;

        function crossfadeAndCleanup() {
          const tgs = targets as HTMLElement[];

          // zviditelni cíle s průhledností 0 a přefade-uj
          tgs.forEach((t) => {
            const vis = originalVisibilityMap.get(t);
            t.style.visibility = vis ?? "";
            t.style.opacity = "0";
            t.style.transition = "opacity 160ms ease-out";
          });
          if (overlay) {
            overlay.style.transition = "opacity 160ms ease-out";
            overlay.style.opacity = "0";
          }
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              tgs.forEach((t) => { t.style.opacity = "1"; });
            });
          });
          setTimeout(() => {
            (letters || []).forEach((el) => el.remove());
            if (overlay) overlay.remove();
            // vyčisti styly cílů
            tgs.forEach((t) => {
              t.style.transition = "";
              t.style.opacity = "";
            });
            lastTargetsRef.current = null;
            lastOriginRef.current = null;
            lastFinalPositionsRef.current = null;
            lettersRef.current = null;
            overlayRef.current = null;
            isExplodedRef.current = false;
            isAnimatingRef.current = false;
            outwardReadyRef.current = false;
          }, 180);
        }

       function stepReturn(now: number) {
        const dt = Math.min(0.032, (now - lastT) / 1000);
        lastT = now;
        let anyActive = false;

        for (const s of states) {
          const curX = s.baseLeft + s.tx;
          const curY = s.baseTop + s.ty;
          const dx = s.targetX - curX;
          const dy = s.targetY - curY;

          // spring towards target
          const ax = stiffness * dx - damping * s.vx;
          const ay = stiffness * dy - damping * s.vy;

          // swirl orthogonal component
          const dirLen = Math.hypot(dx, dy) || 1;
          const nx = dx / dirLen, ny = dy / dirLen;
          const orthoX = -ny, orthoY = nx;
          const swirl = Math.sin(now / 200 + s.swirlPhase) * (swirlStrength * Math.min(1, dirLen / 300));

          s.vx += (ax + orthoX * swirl) * dt;
          s.vy += (ay + orthoY * swirl) * dt;
          s.tx += s.vx * dt;
          s.ty += s.vy * dt;

          // rotate back to 0 with spring
          const aRot = -rotStiff * s.rot - rotDamp * s.vr;
          s.vr += aRot * dt;
          s.rot += s.vr * dt;

          s.el.style.transform = `translate(${s.tx}px, ${s.ty}px) rotate(${s.rot}deg)`;


          // If jsme velmi blízko cíli, přepneme na krátkou finální animaci, která dojede přesně
          const nearPos = Math.abs(dx) < 0.9 && Math.abs(dy) < 0.9;
          const slow = Math.abs(s.vx) < 9 && Math.abs(s.vy) < 9;
          const nearRot = Math.abs(s.rot) < 1;
           if (nearPos && slow && nearRot) {

            continue;
          }


          anyActive = true;
        }

        if (anyActive) {
          returnRafRef.current = requestAnimationFrame(stepReturn);
        } else {
          // Pokud nejsou aktivní a žádné finální animace neběží, ukliď
          if (pendingFinal === 0) {
            crossfadeAndCleanup();
          }
        }
      }

       returnRafRef.current = requestAnimationFrame(stepReturn);
    }

    window.addEventListener("cv:open", onOpen as EventListener);
    window.addEventListener("cv:close", onClose as EventListener);
    return () => {
      window.removeEventListener("cv:open", onOpen as EventListener);
      window.removeEventListener("cv:close", onClose as EventListener);
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}


