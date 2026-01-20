
export enum ExpertiseLevel {
  EL5 = "Explain Like I'm 5",
  JUNIOR = "Junior Engineer",
  SENIOR = "Senior Engineer",
  PRINCIPAL = "Principal / Architect"
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface Section {
  title: string;
  content: string; // Markdown supported
  icon?: string;
  codeSnippet?: CodeSnippet;
}

export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RabbitHole {
  topic: string;
  hook: string; // A catchy, click-bait style title
  type: "Deep Dive" | "Related" | "Prerequisite" | "Similar";
}

export interface LessonData {
  topic: string;
  expertiseLevel: ExpertiseLevel;
  summary: string;
  historicalContext: string;
  coreConcepts: Section[];
  diagramMermaid: string; // Mermaid JS code
  realWorldExample: string;
  commonUseCases: string[]; // List of specific industry use cases
  pitfalls: string[]; // Common mistakes or anti-patterns
  popularity: string; // e.g. "Industry Standard", "Niche", "Legacy"
  hotTake: string; // A controversial or nuance engineering opinion
  quiz: Quiz;
  rabbitHoles: RabbitHole[]; // Suggestions for next topics
  followUpSuggestions: string[];
}

export interface ComparisonPoint {
  feature: string;
  topicAValue: string;
  topicBValue: string;
}

export interface ComparisonData {
  topicA: string;
  topicB: string;
  overview: string; // How they relate generally
  similarities: string[];
  differences: ComparisonPoint[];
  verdict: string; // When to use which
  topicAUseCases: string[];
  topicBUseCases: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface InterviewTurn {
  question: string;
  userAnswer?: string;
  feedback?: {
    rating: number; // 1-10
    critique: string;
    betterAnswer: string;
  };
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  keyPoints: string[];
}

export interface SystemDesignChallenge {
  scenario: string;
  constraints: string[];
  approach: string; // Markdown
}

export interface InterviewPrepData {
  topic: string;
  technicalQuestions: InterviewQuestion[];
  systemDesignChallenge: SystemDesignChallenge;
  resumeBulletPoints: string[];
  starExample: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}
