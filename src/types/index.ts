export interface Option {
  label: string;
  value: string;
  points: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Dimension {
  name: string;
  weight: number;
  questions: Question[];
}

export interface Outcome {
  headline?: string;
  description?: string;
  cta?: string;
  ctaUrl?: string;
  title?: string;
  message?: string;
  icon?: string;
}

export interface QualificationConfig {
  dimensions: Record<string, Dimension>;
  threshold: number;
  outcomes: {
    qualified: Outcome;
    disqualified: Outcome;
  };
}

export interface DimensionScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ScoreResult {
  totalScore: number;
  qualified: boolean;
  breakdown: Record<string, DimensionScore>;
}
