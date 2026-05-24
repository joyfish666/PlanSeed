import type { SkillDefinition, SkillContext, SkillTurnResult } from "./types.js";
import { projectTypeSkill } from "./skills/project-type.js";
import { coreFeaturesSkill } from "./skills/core-features.js";
import { featureConfirmationSkill } from "./skills/feature-confirmation.js";
import { usageScenarioSkill } from "./skills/usage-scenario.js";
import { techStackSkill } from "./skills/tech-stack.js";
import { documentGeneratorSkill } from "./skills/document-generator.js";
import { reviewSkill } from "./skills/review.js";

const PIPELINE: SkillDefinition[] = [
  projectTypeSkill,
  coreFeaturesSkill,
  featureConfirmationSkill,
  usageScenarioSkill,
  techStackSkill,
  documentGeneratorSkill,
  reviewSkill,
];

export function createEmptyContext(): SkillContext {
  return {
    projectType: "",
    coreFeatures: [],
    confirmedFeatures: [],
    usageScenario: {
      devices: [],
      offlineSupport: false,
      targetUsers: "",
      userScale: "",
    },
    techStack: {
      mode: "recommend",
      selections: [],
    },
    projectScale: "mvp",
    deliveryRhythm: "iterative",
    additionalRequirements: "",
    conversationHistory: [],
  };
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

export function createPipelineRunner(): PipelineRunner {
  let currentSkillIndex = 0;
  let context = createEmptyContext();

  return {
    currentSkillId(): string {
      return PIPELINE[currentSkillIndex].id;
    },

    currentSkillName(): string {
      return PIPELINE[currentSkillIndex].name;
    },

    turn(userInput: string): SkillTurnResult {
      const skill = PIPELINE[currentSkillIndex];
      const result = skill.execute(userInput, context);
      context = result.context;

      if (result.isComplete && currentSkillIndex < PIPELINE.length - 1) {
        currentSkillIndex++;
      }

      return result;
    },

    getContext(): Readonly<SkillContext> {
      return context;
    },

    remainingSkills(): string[] {
      return PIPELINE.slice(currentSkillIndex).map((s) => s.name);
    },

    reset(): void {
      currentSkillIndex = 0;
      context = createEmptyContext();
    },

    setContext(updates: Partial<SkillContext>): void {
      context = { ...context, ...updates };
    },
  };
}

/**
 * Run the entire pipeline headless (non-interactive).
 * `getInput` is called with (skillId, prompt) and should return user input.
 */
export function runPipelineHeadless(
  getInput: (skillId: string, prompt: string) => string,
): { document: string; context: SkillContext } {
  const runner = createPipelineRunner();

  // Bootstrap
  let skillId = runner.currentSkillId();
  let result = runner.turn("");
  let userInput = getInput(skillId, result.prompt);

  while (true) {
    skillId = runner.currentSkillId();
    result = runner.turn(userInput);

    if (skillId === "document-generator") {
      return { document: result.prompt, context: runner.getContext() };
    }

    if (skillId === "review" && result.isComplete) {
      return { document: "", context: runner.getContext() };
    }

    userInput = getInput(skillId, result.prompt);
  }
}
