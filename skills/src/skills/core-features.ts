import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const coreFeaturesSkill: SkillDefinition = {
  id: "core-features",
  name: "核心功能收集",
  description: "引导用户明确项目的核心功能",
  requiredFields: ["projectType"],
  producedFields: ["coreFeatures"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx = { ...context };

    // Check if user wants to finish adding features
    const isDone = userInput.includes("功能已足够") || userInput.includes("足够") || userInput.includes("继续");

    if (userInput && !isDone) {
      ctx.coreFeatures = [...ctx.coreFeatures, userInput];
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    if (isDone && ctx.coreFeatures.length > 0) {
      return {
        prompt: `已收集的核心功能：${ctx.coreFeatures.join("、")}\n\n请确认这些功能，然后告知用户将进入下一步。`,
        context: ctx,
        isComplete: true,
      };
    }

    const featureList = ctx.coreFeatures.length > 0
      ? `\n\n已收集的功能：${ctx.coreFeatures.join("、")}`
      : "";

    const prompt = ctx.coreFeatures.length > 0
      ? `用户已选择功能：「${userInput}」。${featureList}\n\n请确认用户的选择，然后询问是否还有其他核心功能需要添加。\n\n使用 [OPTIONS:...] 提供常见功能选项，并包含"功能已足够，继续"选项。每条消息只问一个问题。`
      : `项目类型是「${ctx.projectType}」。\n\n请询问用户：在这个应用里，用户可以做什么？使用 [OPTIONS:...] 提供该类型项目的常见功能选项，同时允许用户自定义输入。\n\n每条消息只问一个问题。`;

    return {
      prompt,
      context: ctx,
      isComplete: false,
    };
  },
};
