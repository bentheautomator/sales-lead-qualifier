# Sales Lead Qualifier: Visual & AI Enhancement Plan

**Status:** Vision Document | **Complexity:** 8-gate (understand → select → plan → impl → test → review → doc → deploy)
**Priority:** Enhancement | **Target:** 10,000% better engagement with sparkle animations, micro-interactions, smart UX, and AI-ready architecture

---

## Executive Summary

The current Sales Lead Qualifier is functional but visually static and lacks intelligence. This plan transforms it into an engaging, celebration-worthy experience with:

1. **Sparkle & Visual Magic** — particle effects, confetti, shimmer borders, animated gradients
2. **Micro-interactions** — button states, card selection flow, progress that feels alive
3. **Smart UX** — adaptive questioning, real-time score preview, contextual encouragement
4. **AI-Ready Architecture** — hooks for LLM-powered follow-ups, personalized CTAs, objection handling
5. **Engagement Hooks** — social proof, urgency signals, trust badges, testimonial zones

---

## Phase 1: Sparkle Animations & Visual Magic

### 1.1 Particle Effect System

Create a reusable particle component for scattered sparkle effects throughout the app.

**File:** `src/components/SparkleParticles.tsx`

```typescript
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const SparkleParticles = ({
  count = 20,
  color = 'rgba(59, 130, 246, 0.6)'
}: {
  count?: number;
  color?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const generateParticles = useCallback((): Particle[] => {
    return Array.from({ length: count }).map((_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 2 + 2.5,
      delay: Math.random() * 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [count]);

  useEffect(() => {
    const particles = generateParticles();

    return () => {
      // Cleanup on unmount
    };
  }, [generateParticles]);

  const particles = generateParticles();

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes sparkle-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes sparkle-twinkle {
          0%, 100% { opacity: var(--opacity); }
          50% { opacity: calc(var(--opacity) * 0.3); }
        }

        .sparkle {
          position: absolute;
          pointer-events: none;
          animation:
            sparkle-float var(--duration)s ease-in forwards,
            sparkle-twinkle calc(var(--duration) * 0.3)s ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="sparkle rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: color,
            '--duration': `${particle.duration}s`,
            '--delay': `${particle.delay}s`,
            '--opacity': particle.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
```

### 1.2 Shimmer Border Effect

Add a shimmering gradient border to key cards (current question, high-value CTAs).

**File:** `src/components/ShimmerBorder.tsx`

```typescript
'use client';

interface ShimmerBorderProps {
  children: React.ReactNode;
  isActive?: boolean;
  color?: 'blue' | 'emerald' | 'amber';
}

export const ShimmerBorder = ({
  children,
  isActive = true,
  color = 'blue'
}: ShimmerBorderProps) => {
  const colorMap = {
    blue: 'from-blue-400 via-blue-300 to-blue-400',
    emerald: 'from-emerald-400 via-emerald-300 to-emerald-400',
    amber: 'from-amber-400 via-amber-300 to-amber-400',
  };

  return (
    <div className="relative" style={{
      background: isActive ? `url('data:image/svg+xml,...')` : undefined
    }}>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer-border {
          position: relative;
          background-image: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

      {isActive && (
        <div
          className={`shimmer-border absolute inset-0 rounded-xl pointer-events-none
            bg-gradient-to-r ${colorMap[color]}
            opacity-30 blur-sm`}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
```

### 1.3 Confetti Explosion (Qualified Result)

Trigger when user qualifies — a quick burst of confetti from the score circle.

**File:** `src/components/Confetti.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface ConfettiPiece {
  id: string;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  color: string;
}

export const Confetti = ({ trigger = false }: { trigger?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const colors = [
      '#10b981', // emerald
      '#06b6d4', // cyan
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
    ];

    const pieces: ConfettiPiece[] = Array.from({ length: 40 }).map((_, i) => ({
      id: `confetti-${i}`,
      x: containerRef.current!.clientWidth / 2,
      y: containerRef.current!.clientHeight / 2,
      angle: (i / 40) * Math.PI * 2,
      velocity: Math.random() * 6 + 4,
      color: colors[i % colors.length],
    }));

    // Render confetti pieces
    pieces.forEach((piece) => {
      const el = document.createElement('div');
      el.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${piece.color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${piece.x}px;
        top: ${piece.y}px;
      `;

      containerRef.current?.appendChild(el);

      // Animate each piece
      let frame = 0;
      const animate = () => {
        frame++;
        const progress = frame / 60; // 1 second duration

        const vx = Math.cos(piece.angle) * piece.velocity;
        const vy = Math.sin(piece.angle) * piece.velocity;

        const newX = piece.x + vx * frame;
        const newY = piece.y + vy * frame + (frame * frame * 0.1); // gravity

        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        el.style.opacity = String(Math.max(0, 1 - progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.remove();
        }
      };

      requestAnimationFrame(animate);
    });
  }, [trigger]);

  return <div ref={containerRef} />;
};
```

### 1.4 Animated Background Gradient

Subtle moving gradient in the background of the main pages.

**File:** `src/styles/animations.css` (add to globals.css)

```css
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

.bg-animated-gradient {
  background: linear-gradient(
    -45deg,
    #e0f2fe,
    #dbeafe,
    #f0f9ff,
    #e0f2fe
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

/* Shimmer text effect for big headlines */
@keyframes shimmer-text {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.text-shimmer {
  background: linear-gradient(
    90deg,
    #1f2937 25%,
    #4b5563 50%,
    #1f2937 75%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer-text 3s infinite;
}
```

---

## Phase 2: Micro-Interactions & Responsive Feedback

### 2.1 Enhanced Button Interactions

Replace static buttons with ones that respond to hover, active, and disabled states with visual feedback.

**File:** `src/components/InteractiveButton.tsx`

```typescript
'use client';

import React from 'react';

interface InteractiveButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const InteractiveButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveButtonProps
>(({
  disabled,
  variant = 'primary',
  children,
  className = '',
  isLoading = false,
  ...props
}, ref) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 relative overflow-hidden';

  const variantClasses = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 active:scale-95 active:bg-blue-800
              disabled:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-50
              shadow-md hover:shadow-lg hover:-translate-y-0.5`,
    secondary: `bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 active:bg-gray-300
                disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400
                shadow-sm hover:shadow-md hover:-translate-y-0.5`,
    success: `bg-green-600 text-white hover:bg-green-700 active:scale-95 active:bg-green-800
              disabled:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50
              shadow-md hover:shadow-lg hover:-translate-y-0.5`,
  };

  return (
    <>
      <style jsx>{`
        @keyframes button-ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        .button-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: scale(0);
          animation: button-ripple 0.6s ease-out;
          pointer-events: none;
        }

        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .button-focus:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
          animation: pulse-ring 1.5s ease-out;
        }
      `}</style>

      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${className} button-focus`}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {children}
        </span>
      </button>
    </>
  );
});

InteractiveButton.displayName = 'InteractiveButton';
```

### 2.2 Card Selection Animation

Enhance the QuestionCard with a smooth scale and shadow animation on selection.

**File:** `src/components/QuestionCard.tsx` (updated)

```typescript
'use client';

import { memo } from 'react';
import type { Question, Option } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (questionId: string, value: string) => void;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <>
      <style jsx>{`
        @keyframes card-select {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        .option-selected {
          animation: card-select 0.3s ease-out;
        }

        @keyframes option-hover {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(4px);
          }
        }

        .option-button:hover {
          animation: option-hover 0.2s ease-out forwards;
        }
      `}</style>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">{question.text}</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options.map((option: Option) => (
            <button
              key={option.value}
              onClick={() => onSelect(question.id, option.value)}
              className={`option-button p-4 text-left rounded-lg border-2 transition-all duration-200
                ${
                  selectedValue === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 shadow-md option-selected'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    selectedValue === option.value
                      ? 'border-blue-500 bg-blue-500 shadow-md'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {selectedValue === option.value && (
                    <svg
                      className="w-3 h-3 text-white animate-bounce"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{option.label}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
});
```

### 2.3 Progress Bar That Feels Alive

Add pulsing glow and animated number counter to progress bar.

**File:** `src/components/ProgressBar.tsx` (updated)

```typescript
'use client';

import { memo, useEffect, useState } from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressBar = memo(function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animate number counter
  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();
    const duration = 600;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min(elapsed / duration, 1);
      setDisplayProgress(Math.round(percent * progress));

      if (percent < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [progress]);

  return (
    <>
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 0 rgba(59, 130, 246, 0));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
          }
        }

        .progress-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes step-complete {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .step-active {
          animation: step-complete 0.3s ease-out;
        }
      `}</style>

      <div className="w-full space-y-4">
        {/* Step indicators with labels */}
        <div className="flex justify-between items-center">
          {stepLabels.map((label, index) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white shadow-lg step-active'
                      : 'bg-gray-200 text-gray-600'
                  }`}
              >
                {index + 1}
              </div>
              <p
                className={`text-xs mt-2 text-center text-nowrap px-1 transition-colors duration-300 ${
                  index === currentStep
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar with glow */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out progress-glow"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step counter with animated number */}
        <p className="text-sm text-gray-600 text-center">
          Step <span className="font-semibold text-blue-600">{displayProgress}</span> of {totalSteps}
        </p>
      </div>
    </>
  );
});
```

---

## Phase 3: Smart UX & Adaptive Questioning

### 3.1 Adaptive Question Logic

Skip irrelevant questions based on previous answers. For example, if budget is "minimal", we might emphasize timeline urgency instead.

**File:** `src/lib/questionLogic.ts` (new)

```typescript
/**
 * Adaptive question logic — determine which questions to show based on answers
 */

import type { QualificationConfig, Question } from '@/types';

export interface AdaptiveQuestion extends Question {
  condition?: (answers: Record<string, string>) => boolean;
  followUp?: string; // Encouragement message shown before question
}

export function shouldShowQuestion(
  question: AdaptiveQuestion,
  answers: Record<string, string>
): boolean {
  if (!question.condition) return true;
  return question.condition(answers);
}

export function getFollowUpMessage(
  lastAnswered: { questionId: string; value: string },
  config: QualificationConfig
): string {
  const messages: Record<string, string> = {
    'large-budget': '💰 Excellent! With that budget, we can deliver significant value.',
    'immediate-urgency': '⏰ We love working with time-sensitive projects — let\'s discuss timeline.',
    'critical-pain': '🎯 Critical pain points need decisive solutions. Are you the decision maker?',
  };

  const key = `${lastAnswered.value}`;
  return messages[key] || '';
}

// Example: Skip authority questions if not a decision maker at budget stage
export const adaptiveConfig = {
  'decision-role': (answers: Record<string, string>) => {
    // Always show this
    return true;
  },
  'buying-process': (answers: Record<string, string>) => {
    // Only show if they're at least a contributor
    const role = answers['decision-role'];
    return role !== 'researcher';
  },
};
```

### 3.2 Real-Time Score Preview

Add a floating sidebar showing current score estimate as they answer.

**File:** `src/components/ScorePreview.tsx` (new)

```typescript
'use client';

import { useMemo } from 'react';
import { qualificationConfig } from '@/config/qualification';
import { calculateScore } from '@/lib/scoring';

interface ScorePreviewProps {
  answers: Record<string, string>;
  visible?: boolean;
}

export const ScorePreview = ({ answers, visible = true }: ScorePreviewProps) => {
  const scoreResult = useMemo(() => {
    return calculateScore(answers, qualificationConfig);
  }, [answers]);

  const { totalScore, qualified } = scoreResult;

  if (!visible || Object.keys(answers).length === 0) return null;

  return (
    <>
      <style jsx>{`
        @keyframes float-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .score-preview {
          animation: float-in 0.3s ease-out;
        }

        @keyframes score-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .score-number {
          animation: score-pulse 0.6s ease-in-out;
        }
      `}</style>

      <div className="score-preview fixed bottom-6 right-6 z-40 md:w-72 w-64">
        <div className="bg-white rounded-xl shadow-xl p-4 border-2 border-blue-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Current Score
          </p>

          <div className="flex items-end justify-between">
            <div>
              <div className="score-number text-4xl font-bold text-blue-600">
                {Math.round(totalScore)}
              </div>
              <p className="text-xs text-gray-500 mt-1">/ 100</p>
            </div>

            <div className={`text-right px-3 py-2 rounded-lg ${
              qualified
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              <p className="text-xs font-semibold">
                {qualified ? '✓ On Track' : '⚠ Needs Work'}
              </p>
              <p className="text-xs opacity-75">
                {qualificationConfig.threshold} needed
              </p>
            </div>
          </div>

          <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                qualified
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${totalScore}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
```

### 3.3 Encouraging Messages Between Steps

Show contextual, data-driven encouragement after each dimension.

**File:** `src/components/StepEncouragement.tsx` (new)

```typescript
'use client';

import { useMemo } from 'react';
import { qualificationConfig } from '@/config/qualification';
import { calculateScore } from '@/lib/scoring';

interface StepEncouragementProps {
  currentDimensionKey: string;
  answers: Record<string, string>;
}

const encouragementMessages: Record<string, Record<string, string>> = {
  budget: {
    large: '🚀 Strong budget signals you\'re serious about solutions.',
    medium: '💪 Good mid-market positioning — let\'s talk authority next.',
    small: '📈 Smaller budgets work best with clear ROI — onwards!',
  },
  authority: {
    decision_maker: '👑 As the decision maker, you have the power to drive change.',
    influencer: '🎯 Key influencers shape great solutions — let\'s explore your pain points.',
    contributor: '🤝 Contributors who understand problems drive better outcomes.',
  },
  need: {
    critical: '⚡ Critical pain is the best motivator. Timeline next?',
    high: '🔥 Real challenges need real solutions — let\'s get specific.',
  },
  timeline: {
    quick: '✅ Quick timeline = high priority. We love moving fast.',
  },
};

export const StepEncouragement = ({
  currentDimensionKey,
  answers,
}: StepEncouragementProps) => {
  const dimension = qualificationConfig.dimensions[currentDimensionKey];
  const dimensionAnswers = dimension?.questions
    .map((q) => answers[q.id])
    .filter(Boolean);

  const message = useMemo(() => {
    if (!dimensionAnswers || dimensionAnswers.length === 0) return '';

    const messages = encouragementMessages[currentDimensionKey];
    if (!messages) return '';

    // Get first answer's encouragement (or pick most relevant)
    const firstAnswer = dimensionAnswers[0];
    return messages[firstAnswer] || '';
  }, [currentDimensionKey, dimensionAnswers]);

  if (!message) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6 animate-pulse">
      <p className="text-blue-900 font-medium text-sm">{message}</p>
    </div>
  );
};
```

---

## Phase 4: AI-Ready Architecture

### 4.1 LLM Hook System

Create hooks for injecting AI-powered features without tight coupling.

**File:** `src/lib/aiHooks.ts` (new)

```typescript
/**
 * AI/LLM hook system for extensible AI features
 * Allows async injection of AI-powered follow-ups, CTAs, and objection handling
 */

export interface AIHookContext {
  answers: Record<string, string>;
  score: number;
  qualified: boolean;
  breakdown: Record<string, number>;
}

export interface AIFollowUpQuestion {
  id: string;
  text: string;
  placeholder?: string;
  type: 'text' | 'multiline' | 'select';
  options?: { label: string; value: string }[];
}

export interface PersonalizedCTA {
  text: string;
  url: string;
  reason: string; // Why this CTA was chosen
  urgency: 'high' | 'medium' | 'low';
}

/**
 * Hook 1: Generate personalized follow-up question based on answers
 */
export async function generateFollowUpQuestion(
  context: AIHookContext
): Promise<AIFollowUpQuestion | null> {
  // If you have an LLM API configured:
  // const response = await fetch('/api/ai/follow-up', {
  //   method: 'POST',
  //   body: JSON.stringify(context),
  // });
  // return response.json();

  // For now, return hardcoded example
  if (context.score >= 70) {
    return {
      id: 'demo-follow-up',
      text: `You look like a strong fit! Before we book a call, what's your biggest current challenge?`,
      type: 'multiline',
      placeholder: 'Tell us more about your pain point...',
    };
  }

  return null;
}

/**
 * Hook 2: Personalize CTA based on qualification profile
 */
export async function personalizeResultCTA(
  context: AIHookContext
): Promise<PersonalizedCTA> {
  // Example logic (replace with LLM call for real personalization)
  if (context.qualified && context.breakdown.urgency > 0.7) {
    return {
      text: 'Schedule a Strategy Call Today',
      url: '/book?urgency=high',
      reason: 'High urgency + qualified = fast-track to call',
      urgency: 'high',
    };
  }

  if (!context.qualified) {
    return {
      text: 'Download Our Implementation Guide',
      url: '/guide',
      reason: 'Not qualified yet — educate them first',
      urgency: 'low',
    };
  }

  return {
    text: 'Book a No-Pressure Consultation',
    url: '/book',
    reason: 'Qualified but not urgent — soft touch',
    urgency: 'medium',
  };
}

/**
 * Hook 3: Handle objections intelligently
 * Called when user tries to navigate away with low score
 */
export async function getObjectionResponse(
  lowScoreReason: string // e.g., "budget", "timeline", "authority"
): Promise<string> {
  const responses: Record<string, string> = {
    budget: 'No budget yet? Many of our best clients started small. Let\'s discuss flexible options.',
    timeline: 'Long timeline ahead? We often help compress timelines with proper planning.',
    authority: 'Not the decision maker? We can help you make the case to leadership.',
  };

  return responses[lowScoreReason] || '';
}
```

### 4.2 Follow-Up Question Component

Optionally show a follow-up question on results page before CTA.

**File:** `src/components/FollowUpQuestion.tsx` (new)

```typescript
'use client';

import { useState, useEffect } from 'react';
import {
  generateFollowUpQuestion,
  type AIFollowUpQuestion,
} from '@/lib/aiHooks';

interface FollowUpQuestionProps {
  answers: Record<string, string>;
  score: number;
  qualified: boolean;
  onAnswer?: (answer: string) => void;
}

export const FollowUpQuestion = ({
  answers,
  score,
  qualified,
  onAnswer,
}: FollowUpQuestionProps) => {
  const [question, setQuestion] = useState<AIFollowUpQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const q = await generateFollowUpQuestion({
          answers,
          score,
          qualified,
          breakdown: {},
        });
        setQuestion(q);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [answers, score, qualified]);

  if (loading || !question) return null;

  if (submitted) {
    return (
      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-6 rounded-r-lg mb-6">
        <p className="text-emerald-900 font-medium">
          ✓ Thanks for that insight. We'll reference it in our call.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white border-2 border-blue-100 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {question.text}
      </h3>

      {question.type === 'multiline' ? (
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder={question.placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
          rows={4}
        />
      ) : question.type === 'select' ? (
        <select
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
        >
          <option value="">Select an option...</option>
          {question.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder={question.placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
        />
      )}

      <button
        onClick={() => {
          setSubmitted(true);
          onAnswer?.(response);
        }}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Share Response
      </button>
    </div>
  );
};
```

### 4.3 Objection Handling on Exit

Intercept the "Start Over" button to show objection-handling message.

**File:** `src/components/ObjectionHandler.tsx` (new)

```typescript
'use client';

import { useState } from 'react';
import { getObjectionResponse } from '@/lib/aiHooks';

interface ObjectionHandlerProps {
  lowScoreReason?: string;
  onProceed: () => void;
}

export const ObjectionHandler = ({
  lowScoreReason = 'general',
  onProceed,
}: ObjectionHandlerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShow = async () => {
    setLoading(true);
    const response = await getObjectionResponse(lowScoreReason);
    setMessage(response);
    setLoading(false);
  };

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-4">
      {!message ? (
        <button
          onClick={handleShow}
          disabled={loading}
          className="text-amber-900 font-medium hover:underline"
        >
          {loading ? 'Loading...' : '💡 Before you go...'}
        </button>
      ) : (
        <div>
          <p className="text-amber-900">{message}</p>
          <button
            onClick={() => setDismissed(true)}
            className="text-sm text-amber-700 hover:text-amber-900 underline mt-2"
          >
            I understand, continue
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Phase 5: Engagement Hooks & Trust Signals

### 5.1 Social Proof Module

Show testimonials and stats from qualified leads.

**File:** `src/components/SocialProof.tsx` (new)

```typescript
'use client';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  qualificationScore?: number;
}

export const SocialProof = () => {
  const testimonials: Testimonial[] = [
    {
      quote: 'This platform helped us identify our best prospects faster than our old process.',
      author: 'Sarah Chen',
      role: 'VP Sales',
      company: 'TechCorp Inc',
      qualificationScore: 92,
    },
    {
      quote: 'Accuracy on lead qualification went from 60% to 88% in just 2 months.',
      author: 'Marcus Johnson',
      role: 'Head of RevOps',
      company: 'Enterprise Solutions',
      qualificationScore: 85,
    },
  ];

  const stats = [
    { label: 'Avg Score Lift', value: '34%' },
    { label: 'Time Saved', value: '12h/week' },
    { label: 'Teams Using', value: '500+' },
  ];

  return (
    <div className="py-12 bg-gradient-to-r from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            What Qualified Leads Say
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{t.author}</p>
                    <p className="text-sm text-gray-600">
                      {t.role} at {t.company}
                    </p>
                  </div>
                  {t.qualificationScore && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Qualified</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {t.qualificationScore}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 5.2 Trust Badges

Show security and compliance badges (SOC 2, GDPR, etc.).

**File:** `src/components/TrustBadges.tsx` (new)

```typescript
'use client';

interface Badge {
  icon: string;
  label: string;
  description: string;
}

export const TrustBadges = () => {
  const badges: Badge[] = [
    {
      icon: '🔒',
      label: 'SOC 2 Type II',
      description: 'Security & privacy certified',
    },
    {
      icon: '⚖️',
      label: 'GDPR Compliant',
      description: 'EU data protection standard',
    },
    {
      icon: '📊',
      label: 'Enterprise Grade',
      description: '99.9% uptime SLA',
    },
    {
      icon: '🤝',
      label: '24/7 Support',
      description: 'Dedicated account teams',
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-8">
      {badges.map((badge, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <span className="text-3xl mb-2">{badge.icon}</span>
          <p className="font-semibold text-sm text-gray-900 text-center">
            {badge.label}
          </p>
          <p className="text-xs text-gray-600 text-center mt-1">
            {badge.description}
          </p>
        </div>
      ))}
    </div>
  );
};
```

### 5.3 Urgency Indicator

Show relevant scarcity/urgency signals based on time-sensitive factors.

**File:** `src/components/UrgencyIndicator.tsx` (new)

```typescript
'use client';

interface UrgencyIndicatorProps {
  type?: 'limited_slots' | 'time_sensitive' | 'deadline' | 'none';
  message?: string;
}

export const UrgencyIndicator = ({
  type = 'none',
  message,
}: UrgencyIndicatorProps) => {
  if (type === 'none') return null;

  const config = {
    limited_slots: {
      icon: '📅',
      color: 'amber',
      default: 'Only 3 strategy calls available this week',
    },
    time_sensitive: {
      icon: '⏰',
      color: 'red',
      default: 'Quarter closes in 7 days — let\'s move fast',
    },
    deadline: {
      icon: '🔔',
      color: 'rose',
      default: 'Implementation deadline: End of Q1',
    },
  };

  const cfg = config[type];

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-${cfg.color}-50 border-l-4 border-${cfg.color}-400 rounded-r-lg mb-6`}
    >
      <span className="text-2xl">{cfg.icon}</span>
      <p className={`text-${cfg.color}-900 font-semibold text-sm`}>
        {message || cfg.default}
      </p>
    </div>
  );
};
```

---

## Phase 6: CSS Global Animations

Add to `src/app/globals.css`:

```css
/* Smooth page transitions */
@keyframes page-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: page-fade-in 0.4s ease-out;
}

/* Floating elements (for score preview, badges) */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.float {
  animation: float 3s ease-in-out infinite;
}

/* Pulse for attention-grabbing */
@keyframes pulse-attention {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pulse-attention {
  animation: pulse-attention 2s ease-in-out infinite;
}

/* Success check mark animation */
@keyframes check-bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.check-bounce {
  animation: check-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Slide in from right (for follow-up questions) */
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-right {
  animation: slide-in-right 0.4s ease-out;
}
```

---

## Phase 7: Integration Points

### 7.1 Updated Home Page (`src/app/page.tsx`)

```typescript
// Add sparkles and visual magic
import { SparkleParticles } from '@/components/SparkleParticles';
import { ScorePreview } from '@/components/ScorePreview';

export default function Home() {
  // ... existing code ...

  return (
    <div className="min-h-screen bg-animated-gradient py-8 px-4 sm:py-12 relative overflow-hidden">
      <SparkleParticles count={15} color="rgba(59, 130, 246, 0.4)" />
      {/* ... rest of content ... */}
      <ScorePreview answers={answers} visible={Object.keys(answers).length > 2} />
    </div>
  );
}
```

### 7.2 Updated Result Page (`src/app/result/page.tsx`)

```typescript
// Add confetti, follow-up questions, objection handling
import { Confetti } from '@/components/Confetti';
import { FollowUpQuestion } from '@/components/FollowUpQuestion';
import { ObjectionHandler } from '@/components/ObjectionHandler';
import { SocialProof } from '@/components/SocialProof';
import { TrustBadges } from '@/components/TrustBadges';
import { UrgencyIndicator } from '@/components/UrgencyIndicator';

function ResultContent() {
  // ... existing code ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <Confetti trigger={isQualified} />

      {/* Main card with shimmer border */}
      <ShimmerBorder isActive={isQualified} color={isQualified ? 'emerald' : 'amber'}>
        {/* ... existing result card ... */}
      </ShimmerBorder>

      {/* Follow-up question for qualified leads */}
      <FollowUpQuestion
        answers={answers}
        score={scoreNum}
        qualified={isQualified}
      />

      {/* Urgency indicator if qualified */}
      {isQualified && <UrgencyIndicator type="limited_slots" />}

      {/* Objection handler for unqualified */}
      {!isQualified && <ObjectionHandler lowScoreReason="budget" />}

      {/* Trust badges */}
      <TrustBadges />

      {/* Social proof */}
      <SocialProof />
    </div>
  );
}
```

---

## Phase 8: API Endpoints (For AI Features)

Create these endpoints to power AI hooks:

**File:** `src/app/api/ai/follow-up/route.ts`

```typescript
export async function POST(req: Request) {
  const context = await req.json();

  // Call your LLM here (e.g., Claude API)
  // const response = await fetch('https://api.anthropic.com/...', {
  //   method: 'POST',
  //   headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY },
  //   body: JSON.stringify({ context }),
  // });

  // For now, return mock
  return Response.json({
    id: 'follow-up-1',
    text: 'What would success look like for your team?',
    type: 'multiline',
    placeholder: 'Describe your ideal outcome...',
  });
}
```

**File:** `src/app/api/ai/personalize-cta/route.ts`

```typescript
export async function POST(req: Request) {
  const context = await req.json();

  // Call LLM to determine best CTA
  // ...

  return Response.json({
    text: 'Book Strategy Call',
    url: '/book?source=qualified',
    reason: 'High qualification + urgent timeline',
  });
}
```

---

## Implementation Roadmap

### Week 1: Foundation (Visual Magic)
- [ ] Implement SparkleParticles component
- [ ] Implement ShimmerBorder component
- [ ] Implement Confetti component
- [ ] Add animation CSS to globals.css

### Week 2: Micro-Interactions
- [ ] Enhance QuestionCard with scale animations
- [ ] Implement InteractiveButton component
- [ ] Update ProgressBar with pulsing glow
- [ ] Test all transitions on mobile/desktop

### Week 3: Smart UX
- [ ] Implement ScorePreview floating widget
- [ ] Implement StepEncouragement messages
- [ ] Implement AdaptiveQuestion logic
- [ ] Add real-time scoring to page.tsx

### Week 4: AI Architecture & Engagement
- [ ] Implement AIHooks system
- [ ] Create FollowUpQuestion component
- [ ] Create ObjectionHandler component
- [ ] Create SocialProof & TrustBadges
- [ ] Create API endpoints for AI features

### Week 5: Testing & Polish
- [ ] Visual regression testing (Chromatic/Percy)
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (a11y)
- [ ] Performance profiling (Lighthouse)
- [ ] A/B test confetti vs no-confetti

### Week 6: Deployment
- [ ] Deploy to production
- [ ] Monitor engagement metrics
- [ ] Collect user feedback
- [ ] Iterate based on data

---

## Success Metrics

1. **Engagement:** Track time-on-page, scroll depth, answer rate
2. **Conversion:** Measure qualified lead CTA click-through rate
3. **Satisfaction:** NPS from follow-up surveys
4. **Performance:** Core Web Vitals (LCP, CLS, FID all green)
5. **Qualitative:** Collect feedback on "magic" factor in user interviews

---

## Notes for Implementation

- **Tree-shake unused animations:** Only load confetti/sparkles on result page
- **Lazy-load AI components:** Use React.lazy for follow-up question to avoid blocking
- **A/B test everything:** Some users prefer minimal animations; have a low-motion preference flag
- **Accessibility:** Ensure all animations respect `prefers-reduced-motion` CSS media query
- **Token budgets:** Score preview is small component; use React.memo to prevent recalc
- **Type safety:** All AI hooks should return union types (success | null) for graceful fallback

---

## References

- **Confetti library (alternative):** `canvas-confetti` npm package for more complex effects
- **Animation library (alternative):** `Framer Motion` for orchestrated sequences
- **AI/LLM integration:** Claude API docs: https://docs.anthropic.com/
- **CSS animations:** MDN Web Docs on CSS Animations and Transitions

