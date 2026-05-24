/** Context that flows between skills */
export interface SkillContext {
  projectType: string;
  coreFeatures: string[];
  confirmedFeatures: string[];
  usageScenario: {
    devices: ("desktop" | "mobile" | "tablet")[];
    offlineSupport: boolean;
    targetUsers: string;
    userScale: string;
  };
  techStack: {
    mode: "recommend" | "custom" | "team";
    selections: string[];
  };
  projectScale: "mvp" | "full";
  deliveryRhythm: "once" | "iterative";
  additionalRequirements: string;
  conversationHistory: Array<{ role: string; content: string }>;
}

/** Result from a single skill execution turn */
export interface SkillTurnResult {
  /** The prompt/instruction for the host LLM to interpret */
  prompt: string;
  /** Updated context after this turn */
  context: SkillContext;
  /** Whether the skill has gathered all information it needs */
  isComplete: boolean;
}

/** The contract every skill must implement */
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  requiredFields: (keyof SkillContext)[];
  producedFields: (keyof SkillContext)[];
  /**
   * Execute one turn.
   * @param userInput - The user's latest message (empty string for initial invocation)
   * @param context - Current accumulated context
   * @returns The prompt for the host LLM, updated context, and completion status
   */
  execute(userInput: string, context: SkillContext): SkillTurnResult;
}

export type MessageMode = "select" | "qa" | "none";

export interface ParsedMessage {
  mode: MessageMode;
  options: { label: string; value: string }[];
  displayText: string;
  reviewPass?: "completeness" | "feasibility";
}

export interface PipelineRunner {
  currentSkillId(): string;
  currentSkillName(): string;
  turn(userInput: string): SkillTurnResult;
  getContext(): Readonly<SkillContext>;
  remainingSkills(): string[];
  reset(): void;
  setContext(updates: Partial<SkillContext>): void;
}
