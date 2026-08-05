import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const featureConfirmationSkill: SkillDefinition = {
  id: "feature-confirmation",
  name: "功能确认",
  description: "完成功能确认流程：推荐缺失功能 → 用户确认",
  requiredFields: ["projectType", "coreFeatures"],
  producedFields: ["confirmedFeatures"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx: SkillContext = {
      ...context,
      coreFeatures: [...context.coreFeatures],
    };
    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    // Confirmation complete: lock in the full accumulated feature list
    if (userInput === "正确" || (ctx.featureStage === "collect" && userInput === "功能已足够，继续")) {
      ctx.confirmedFeatures = [...ctx.coreFeatures];
      ctx.featureStage = "collect";
      return {
        prompt: `用户确认功能清单完整。\n\n已确认的功能：${ctx.confirmedFeatures.join("、")}\n\n请进入使用场景收集阶段。询问用户：这个应用主要在什么设备上使用？使用 [OPTIONS:桌面端|移动端|平板|桌面端 + 移动端] 提供选项。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: true,
      };
    }

    // After the user described corrections: re-summarize and re-confirm
    if (ctx.featureStage === "modifying") {
      ctx.featureStage = "collect";
      return {
        prompt: `请根据用户的修改意见调整功能清单，然后总结当前功能：${ctx.coreFeatures.join("、")}，并询问是否正确。\n\n使用 [OPTIONS:正确|不准确，需修改] 让用户确认。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: false,
      };
    }

    // User says the feature list is inaccurate
    if (userInput === "不准确，需修改") {
      ctx.featureStage = "modifying";
      return {
        prompt: `用户认为功能清单不准确。\n\n请询问用户需要修改哪些内容，根据反馈调整功能清单，然后重新总结并再次确认。\n\n使用 [OPTIONS:正确|不准确，需修改] 让用户确认。`,
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

    // Any other input is a feature the user wants to add: accumulate it
    if (userInput) {
      ctx.coreFeatures = [...ctx.coreFeatures, userInput];
    }

    return {
      prompt: `当前已收集的功能：${ctx.coreFeatures.join("、")}\n\n请审视还有哪些关键功能缺失，从中挑选最相关的最多 3 个推荐给用户。\n\n格式：[OPTIONS:功能A|功能B|功能C|自定义|功能已足够，继续]\n\n每条消息只问一个问题。`,
      context: ctx,
      isComplete: false,
    };
  },
};
