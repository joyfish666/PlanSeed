import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

function buildProjectInfo(ctx: SkillContext): string {
  return `项目类型：${ctx.projectType}\n核心功能：${ctx.confirmedFeatures.join("、")}\n使用场景：${ctx.usageScenario.devices.join("、")}，${ctx.usageScenario.offlineSupport ? "需要" : "不需要"}离线支持\n目标用户：${ctx.usageScenario.targetUsers}，${ctx.usageScenario.userScale}`;
}

const ASK_TECH_STACK_PROMPT = `项目信息汇总：
{projectInfo}

请根据项目需求推荐技术栈。

核心原则：需求驱动，按需推荐。不预设任何技术层必须存在。纯客户端项目只推荐前端技术栈；需要服务端能力的项目按需推荐后端、数据库等。

使用 [OPTIONS:...] 提供多个技术选项，让用户选择。每个选项前简要说明特点。
必须包含选项「帮我推荐一个合适的」，当用户选择此项时，你应给出首选方案并说明理由，同时附带 1-2 个备选方案。

每条消息只问一个问题。`;

function askProjectScale(ctx: SkillContext): string {
  return `技术栈已确认：${ctx.techStack.selections.join("、")}。\n\n接下来询问用户：项目规模是 MVP 快速验证，还是完整的正式产品？\n\n使用 [OPTIONS:MVP 快速验证|完整产品] 提供选项。\n\n每条消息只问一个问题。`;
}

export const techStackSkill: SkillDefinition = {
  id: "tech-stack",
  name: "技术栈推荐",
  description: "推荐技术栈，收集项目规模和交付节奏",
  requiredFields: ["usageScenario"],
  producedFields: ["techStack", "projectScale", "deliveryRhythm"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx: SkillContext = {
      ...context,
      techStack: { ...context.techStack },
      usageScenario: { ...context.usageScenario },
    };
    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    const stage = ctx.techStack.stage;

    // Stage 0: collect the tech stack choice
    if (stage === 0) {
      if (!userInput) {
        return {
          prompt: ASK_TECH_STACK_PROMPT.replace("{projectInfo}", buildProjectInfo(ctx)),
          context: ctx,
          isComplete: false,
        };
      }

      // User asked AI to recommend a stack -> need a follow-up choice
      if (userInput.includes("帮我推荐") || userInput.includes("推荐一个")) {
        ctx.techStack = { ...ctx.techStack, stage: 1 };
        return {
          prompt: `用户希望由 AI 推荐技术栈。\n\n请根据项目需求给出首选方案并简要说明理由，同时附带 1-2 个备选方案，然后询问用户选择哪一个。\n\n使用 [OPTIONS:首选方案|备选方案A|备选方案B|暂不修改] 让用户选择。\n\n每条消息只问一个问题。`,
          context: ctx,
          isComplete: false,
        };
      }

      // Any other input is treated as a concrete tech stack choice
      ctx.techStack = { ...ctx.techStack, selections: [userInput], stage: 2 };
      return { prompt: askProjectScale(ctx), context: ctx, isComplete: false };
    }

    // Stage 1: user picked a stack after AI recommendation
    if (stage === 1) {
      ctx.techStack = { ...ctx.techStack, selections: [userInput], stage: 2 };
      return { prompt: askProjectScale(ctx), context: ctx, isComplete: false };
    }

    // Stage 2: collect project scale
    if (stage === 2) {
      ctx.projectScale = /完整|full/i.test(userInput) ? "full" : "mvp";
      ctx.techStack = { ...ctx.techStack, stage: 3 };
      return {
        prompt: `项目规模已记录：${ctx.projectScale === "full" ? "完整产品" : "MVP 快速验证"}。\n\n接下来询问用户：希望一次性交付，还是迭代式开发逐步上线？\n\n使用 [OPTIONS:一次性交付|迭代式开发] 提供选项。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: false,
      };
    }

    // Stage 3: collect delivery rhythm -> complete
    ctx.deliveryRhythm = /一次性|once/i.test(userInput) ? "once" : "iterative";
    ctx.techStack = { ...ctx.techStack, stage: 4 };
    return {
      prompt: `交付节奏已记录：${ctx.deliveryRhythm === "once" ? "一次性交付" : "迭代式开发"}。\n\n所有信息已收集完毕。请询问用户是否准备好生成项目规划文档。\n\n使用 [OPTIONS:生成项目规划文档|还需要补充信息] 提供选项。\n\n每条消息只问一个问题。`,
      context: ctx,
      isComplete: true,
    };
  },
};
