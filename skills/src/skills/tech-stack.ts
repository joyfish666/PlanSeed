import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const techStackSkill: SkillDefinition = {
  id: "tech-stack",
  name: "技术栈推荐",
  description: "推荐技术栈，收集项目规模和交付节奏",
  requiredFields: ["usageScenario"],
  producedFields: ["techStack", "projectScale", "deliveryRhythm"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx = { ...context };

    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    // Collect project scale
    if (ctx.projectScale === "mvp" && userInput && !ctx.conversationHistory.some(m => m.content.includes("项目规模"))) {
      if (userInput.includes("完整") || userInput.includes("full")) {
        ctx.projectScale = "full";
      }
    }

    // Collect delivery rhythm
    if (ctx.deliveryRhythm === "iterative" && userInput) {
      if (userInput.includes("一次性") || userInput.includes("once")) {
        ctx.deliveryRhythm = "once";
      }
    }

    // Collect tech stack selections
    if (userInput && (userInput.includes("React") || userInput.includes("Vue") || userInput.includes("推荐") || userInput.includes("帮我"))) {
      ctx.techStack = { ...ctx.techStack, selections: [...ctx.techStack.selections, userInput] };
    }

    const projectInfo = `项目类型：${ctx.projectType}\n核心功能：${ctx.confirmedFeatures.join("、")}\n使用场景：${ctx.usageScenario.devices.join("、")}，${ctx.usageScenario.offlineSupport ? "需要" : "不需要"}离线支持\n目标用户：${ctx.usageScenario.targetUsers}，${ctx.usageScenario.userScale}`;

    if (ctx.techStack.selections.length > 0) {
      return {
        prompt: `技术栈已确认：${ctx.techStack.selections.join("、")}。\n\n所有信息收集完毕！请告诉用户所有必要信息已收集完成，询问是否要生成项目规划文档。\n\n使用 [OPTIONS:生成项目规划文档|还需要补充信息] 提供选项。`,
        context: ctx,
        isComplete: true,
      };
    }

    return {
      prompt: `项目信息汇总：\n${projectInfo}\n\n请根据项目需求推荐技术栈。\n\n核心原则：需求驱动，按需推荐。不预设任何技术层必须存在。纯客户端项目只推荐前端技术栈，需要服务端能力的项目按需推荐后端、数据库等。\n\n使用 [OPTIONS:...] 提供多个技术选项，让用户选择。每个选项前简要说明特点。\n\n必须包含选项"帮我推荐一个合适的"，当用户选择此项时，你应根据项目需求直接推荐最合适的技术栈并简要说明理由。\n\n每条消息只问一个问题。`,
      context: ctx,
      isComplete: false,
    };
  },
};
