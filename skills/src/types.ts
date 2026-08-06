/** Context that flows between skills */
export interface SkillContext {
  projectType: string;
  coreFeatures: string[];
  confirmedFeatures: string[];
  /** Tracks whether the user is mid-way through describing feature corrections */
  featureStage: "collect" | "modifying";
  usageScenario: {
    devices: ("desktop" | "mobile" | "tablet")[];
    offlineSupport: boolean | null; // null = 尚未询问离线支持
    targetUsers: string;
    userScale: string;
  };
  techStack: {
    mode: "recommend" | "custom" | "team";
    selections: string[];
    /** 0: ask tech stack, 1: awaiting choice after "帮我推荐", 2: ask project scale, 3: ask delivery rhythm, 4: done */
    stage: number;
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
