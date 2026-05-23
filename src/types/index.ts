export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'selection' | 'input';
}

export interface ProjectContext {
  projectType: string;
  coreFeatures: string[];
  usageScenario: UsageScenario;
  techPreference: TechPreference;
  projectScale: 'mvp' | 'full';
  deliveryRhythm: 'once' | 'iterative';
  additionalRequirements: string;
}

export interface UsageScenario {
  devices: ('desktop' | 'mobile' | 'tablet')[];
  offlineSupport: boolean;
  concurrentUsers?: number;
}

export interface TechPreference {
  mode: 'recommend' | 'custom' | 'team';
  customStack?: string[];
  teamStandard?: string;
}

export interface TechStack {
  primary: StackOption;
  alternatives?: StackOption[];
  versionNotes: string;
}

export interface StackOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  learningCurve: 'low' | 'medium' | 'high';
}

export interface ReviewResult {
  issues: ReviewIssue[];
  suggestions: string[];
  overallScore: number;
}

export interface ReviewIssue {
  section: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export type ConversationStep =
  | 'welcome'
  | 'project_type'
  | 'core_features'
  | 'usage_scenario'
  | 'tech_preference'
  | 'project_scale'
  | 'ai_followup'
  | 'generating'
  | 'review'
  | 'complete';
