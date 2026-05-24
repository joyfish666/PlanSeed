import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const featureConfirmationSkill: SkillDefinition = {
  id: "feature-confirmation",
  name: "功能确认",
  description: "完成功能确认流程：推荐缺失功能 → 用户确认",
  requiredFields: ["projectType", "coreFeatures"],
  producedFields: ["confirmedFeatures"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx = { ...context };

    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    // User confirmed features are complete
    if (userInput === "正确" || userInput === "功能已足够，继续") {
      ctx.confirmedFeatures = [...ctx.coreFeatures];
      return {
        prompt: `用户确认功能清单完整。\n\n已确认的功能：${ctx.confirmedFeatures.join("、")}\n\n请进入使用场景收集阶段。询问用户：这个应用主要在什么设备上使用？使用 [OPTIONS:桌面端|移动端|平板|桌面端 + 移动端] 提供选项。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: true,
      };
    }

    // User says features need modification
    if (userInput === "不准确，需修改") {
      return {
        prompt: `用户认为功能清单不准确。\n\n请询问用户需要修改哪些内容，然后根据反馈调整功能清单，重新总结并再次确认。\n\n使用 [OPTIONS:正确|不准确，需修改] 让用户确认。`,
        context: ctx,
        isComplete: false,
      };
    }

    // User selected "自定义" - wait for custom input
    if (userInput === "自定义") {
      return {
        prompt: `用户选择了自定义功能。\n\n请等待用户输入自定义功能描述，然后将其添加到功能列表中。\n\n添加后，审视还有哪些关键功能缺失，推荐最多 3 个新选项。格式：[OPTIONS:功能A|功能B|功能C|自定义|功能已足够，继续]`,
        context: ctx,
        isComplete: false,
      };
    }

    // Normal flow: recommend missing features
    const featureList = ctx.coreFeatures.join("、");
    const prompt = userInput
      ? `用户添加了功能：「${userInput}」。当前功能列表：${featureList}\n\n请审视还有哪些关键功能缺失，从中挑选最相关的最多 3 个推荐给用户。\n\n格式：[OPTIONS:功能A|功能B|功能C|自定义|功能已足够，继续]\n\n每条消息只问一个问题。`
      : `当前已收集的功能：${featureList}\n\n请审视还有哪些关键功能缺失，从中挑选最相关的最多 3 个推荐给用户。\n\n格式：[OPTIONS:功能A|功能B|功能C|自定义|功能已足够，继续]\n\n每条消息只问一个问题。`;

    return {
      prompt,
      context: ctx,
      isComplete: false,
    };
  },
};
