# Visual & UX Overhaul — The Alchemist's Domain

**Owner:** The Alchemist
**Estimated effort:** 2-3 days
**Phase:** 1-2 (concurrent with AI prep)
**Goal:** Make this look like a $50K SaaS product. Sparkles, animations, micro-interactions.

---

## Overview

Current state: Functional but bland. Bootstrap-tier styling.

Target state: Premium product that makes prospects say "whoa" before they even see the questions.

---

## Component Breakdown

### 1. Global Styles & Animation Library

**File:** `src/app/globals.css`

**Changes:**

```css
/* Tailwind v4 imports */
@import "tailwindcss";

/* Custom animation keyframes */
@layer utilities {
  /* Sparkle particle animation */
  @keyframes sparkle {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0);
    }
  }

  /* Floating card entrance */
  @keyframes float-in {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Gradient shimmer */
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  /* Glow pulse (for active elements) */
  @keyframes glow-pulse {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
    }
  }

  /* Confetti burst (celebration) */
  @keyframes confetti-burst {
    0% {
      opacity: 1;
      transform: translateY(0) rotateZ(0deg);
    }
    100% {
      opacity: 0;
      transform: translateY(100px) rotateZ(360deg);
    }
  }

  /* Smooth expand */
  @keyframes expand-smooth {
    0% {
      max-height: 0;
      opacity: 0;
    }
    100% {
      max-height: 500px;
      opacity: 1;
    }
  }
}

/* Gradient background animation */
@layer components {
  .gradient-bg {
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #4facfe 75%,
      #00f2fe 100%
    );
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
}

/* Glassmorphism effect */
.glassmorphic {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glassmorphic-dark {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Why:** Foundation for all animations. Keyframes are reusable across components. Glassmorphism is the trend in premium SaaS (Vercel, Linear, Notion).

---

### 2. Sparkle Effect Component

**File:** `src/components/SparkleEffect.tsx`

**What it does:** Canvas-based particle emitter that shoots sparkles across the screen on form completion.

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface SparkleProps {
  count?: number;
  colors?: string[];
  duration?: number;
}

export function SparkleEffect({
  count = 50,
  colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899'],
  duration = 2000
}: SparkleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];

    // Generate particles
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 4,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1,
      });
    }

    const startTime = Date.now();

    const animate = () => {
      if (Date.now() - startTime > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= 0.01;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [count, colors, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50 }}
    />
  );
}
```

**Why:** Canvas is fast, smooth, doesn't trigger re-renders. Sparkles feel magical vs. DOM particles.

---

### 3. Animated Gradient Background

**File:** `src/components/AnimatedGradient.tsx`

**What it does:** SVG-based animated gradient that shifts colors subtly in the background.

```typescript
'use client';

export function AnimatedGradient() {
  return (
    <svg
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1, opacity: 0.6 }}
    >
      <defs>
        <linearGradient id="animated-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="25%" stopColor="#764ba2" />
          <stop offset="50%" stopColor="#f093fb" />
          <stop offset="75%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#00f2fe" />
          <animate
            attributeName="x1"
            values="0%;100%;0%"
            dur="20s"
            repeatCount="indefinite"
          />
        </linearGradient>

        {/* Animated blobs for extra visual interest */}
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
      </defs>

      {/* Floating blob circles */}
      <circle
        cx="20%"
        cy="30%"
        r="300"
        fill="url(#animated-gradient)"
        filter="url(#blur)"
        opacity="0.3"
      >
        <animate
          attributeName="cx"
          values="20%;80%;20%"
          dur="25s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="30%;70%;30%"
          dur="25s"
          repeatCount="indefinite"
        />
      </circle>

      <circle
        cx="80%"
        cy="70%"
        r="250"
        fill="url(#animated-gradient)"
        filter="url(#blur)"
        opacity="0.3"
      >
        <animate
          attributeName="cx"
          values="80%;20%;80%"
          dur="30s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values="70%;30%;70%"
          dur="30s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
```

**Why:** Subtle motion in the background conveys premium design without distracting from form.

---

### 4. Enhanced Layout with Dark Mode

**File:** `src/app/layout.tsx` (modifications)

**Add:**

```typescript
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AnimatedGradient } from '@/components/AnimatedGradient';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dark mode color scheme */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 transition-colors duration-300`}
      >
        <ThemeProvider>
          <AnimatedGradient />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Create:** `src/components/ThemeProvider.tsx` (dark mode toggle + persistence)

---

### 5. Enhanced Main Form Page

**File:** `src/app/page.tsx` (modifications)

**Key enhancements:**

```typescript
// Add at top
import { SparkleEffect } from '@/components/SparkleEffect';
import { ThemeToggle } from '@/components/ThemeToggle';

// In JSX, replace main div:
return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:py-12 relative overflow-hidden">
    {/* Header with theme toggle */}
    <div className="absolute top-4 right-4 z-10">
      <ThemeToggle />
    </div>

    <div className="max-w-2xl mx-auto">
      {/* Header with premium styling */}
      <div className="mb-8 text-center animate-float-in">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
          Sales Lead Qualifier
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Let's find out if we're the right fit for your business
        </p>
      </div>

      {/* Progress with glassmorphism */}
      <div className="mb-12 glassmorphic p-4 rounded-2xl shadow-xl">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={DIMENSIONS.length}
          stepLabels={DIMENSIONS.map(([, dim]) => dim.name)}
        />
      </div>

      {/* Question card with animations */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 dark:border-slate-700/50 animate-float-in" style={{ animationDelay: '100ms' }}>
        <div className="space-y-6">
          {dimension.questions.map((question, idx) => (
            <div key={question.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-float-in">
              <QuestionCard
                question={question}
                selectedValue={answers[question.id]}
                onSelect={handleSelectOption}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Buttons with premium styling and hover effects */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            currentStep === 0
              ? 'text-gray-400 bg-gray-100 dark:bg-slate-800 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 active:scale-95 shadow-md'
          }`}
        >
          ← Back
        </button>

        {/* Next/Submit with glow effect on hover */}
        {currentStep < DIMENSIONS.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!allQuestionsAnswered}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              !allQuestionsAnswered
                ? 'bg-blue-300 dark:bg-blue-800 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/50 active:scale-95 shadow-lg'
            }`}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              !allQuestionsAnswered || isSubmitting
                ? 'bg-green-300 dark:bg-green-800 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/50 active:scale-95 shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);
```

**Why:** Gradient text, glassmorphic cards, animations on entrance, dark mode, glow effects on buttons.

---

### 6. Result Page with Celebration

**File:** `src/app/result/page.tsx` (modifications)

**Key additions:**

```typescript
// After qualified determination, trigger sparkles:
useEffect(() => {
  if (mounted && isQualified) {
    // Trigger sparkle effect for qualified leads
    const timer = setTimeout(() => {
      const event = new CustomEvent('trigger-sparkles');
      window.dispatchEvent(event);
    }, 500);
    return () => clearTimeout(timer);
  }
}, [mounted, isQualified]);

// Add to JSX:
{isQualified && <SparkleEffect count={80} duration={2500} />}

// Enhanced score circle with glow:
<div className={`relative w-40 h-40 mb-6 ${isQualified ? 'drop-shadow-xl shadow-emerald-500/50' : ''}`}>
  {/* ...existing circle code, but add glow animation... */}
</div>

// Animated breakdown with stagger:
{Object.entries(breakdown).map(([dimension, score], index) => (
  <div
    key={dimension}
    className="animate-float-in"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    {/* ...breakdown bar... */}
  </div>
))}
```

**Why:** Celebration feels personal. Makes the qualified outcome memorable.

---

### 7. Enhanced QuestionCard Component

**File:** `src/components/QuestionCard.tsx` (modifications)

**Key changes:**

```typescript
// Add hover glow effect to option buttons:
className={`p-4 text-left rounded-lg border-2 transition-all duration-200 cursor-pointer ${
  selectedValue === option.value
    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-400 dark:ring-blue-600 shadow-lg shadow-blue-500/20'
    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:shadow-md active:scale-95'
}`}

// Add transform on click for tactile feedback
onClick={() => {
  onSelect(question.id, option.value);
  // Pulse animation could be added here
}}
```

**Why:** Subtle feedback confirms the selection was registered.

---

## Dependencies to Add

**package.json:**

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.14"
  }
}
```

Note: Tailwind v4 includes animation utilities, so `tailwindcss-animate` is not needed.

---

## Testing Checklist

- [ ] Sparkles render smoothly on result page (60 fps)
- [ ] Dark mode toggle persists across page reloads
- [ ] Animations play smoothly on mobile (no jank)
- [ ] All existing tests still pass
- [ ] Glassmorphic cards are readable in both light/dark mode
- [ ] Gradient text is accessible (good contrast)
- [ ] Animation performance is good on low-end devices (use `prefers-reduced-motion`)

---

## Accessibility Notes

Add to globals.css:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Why:** Users with vestibular disorders or motion sensitivity can opt out of animations.

---

## Performance Considerations

1. **Canvas sparkles** — Only render when needed (qualified result), not on every interaction
2. **SVG gradient animation** — Use CSS animations (GPU-accelerated), not JavaScript
3. **Dark mode** — Use `dark:` Tailwind classes, not runtime switches
4. **Image optimization** — Use `next/image` for any background images added

---

## Next Steps

1. Install Framer Motion: `npm install framer-motion`
2. Create animation utility module: `src/lib/animations.ts`
3. Implement ThemeProvider and ThemeToggle components
4. Update globals.css with keyframes and utility classes
5. Create SparkleEffect and AnimatedGradient components
6. Update page.tsx and result/page.tsx with new styling
7. Update QuestionCard and ProgressBar components
8. Test animations on mobile devices
9. Run performance audit (Lighthouse)
10. Get design review from team (does it look $50K??)

---

**Owner:** The Alchemist
**Next review:** After Phase 1 completion (Day 2)
