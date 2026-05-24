import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const projectTypeSkill: SkillDefinition = {
  id: "project-type",
  name: "项目类型选择",
  description: "引导用户选择或描述想做的项目类型",
  requiredFields: [],
  producedFields: ["projectType"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx = { ...context };

    if (userInput) {
      ctx.projectType = userInput;
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    const prompt = userInput
      ? `用户已选择项目类型：「${userInput}」。\n\n请用一句话确认用户的项目类型，然后询问用户可以在应用里做什么（核心功能）。使用 [OPTIONS:...] 提供常见功能选项，同时允许用户自定义输入。\n\n记住：每条消息只问一个问题。`
      : `用户刚开始规划项目。\n\n请直接询问用户想做一个什么样的项目。用具体项目实例引导（比如：日历应用、待办事项、博客、商城、聊天室等），不要停留在抽象的类型层面。\n\n使用 [OPTIONS:...] 提供选项，每条消息只问一个问题。`;

    return {
      prompt,
      context: ctx,
      isComplete: !!userInput,
    };
  },
};
