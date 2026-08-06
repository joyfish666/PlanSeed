import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const reviewSkill: SkillDefinition = {
  id: "review",
  name: "文档审查",
  description: "对文档进行完整性、可行性审查",
  requiredFields: ["projectType", "coreFeatures", "confirmedFeatures", "usageScenario", "techStack"],
  producedFields: [],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx: SkillContext = {
      ...context,
      conversationHistory: [...context.conversationHistory],
    };

    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    if (userInput.includes("审视完整性") || userInput.includes("完整性")) {
      return {
        prompt: `请审查文档的完整性。\n\n检查三个板块（基本原则与约束、功能规范、技术栈推荐）是否有遗漏或描述含糊。\n- 如果发现不完整，指出具体缺失项并引导用户补充\n- 补充完毕后，告知用户完整性审查通过\n- 输出 [REVIEW_PASS:completeness]\n- 提供选项：[OPTIONS:请求 AI 审视可行性及复杂度|修改方案|就此结束]`,
        context: ctx,
        isComplete: false,
      };
    }

    if (userInput.includes("审视可行性") || userInput.includes("可行性")) {
      return {
        prompt: `请审查文档的可行性及复杂度。\n\n- 评估技术可行性\n- 分析各功能模块的实现难度（简单/中等/复杂）\n- 预估整体开发周期\n- 提出优化建议和潜在风险\n- 输出 [REVIEW_PASS:feasibility]\n- 提供选项：[OPTIONS:修改方案|就此结束]`,
        context: ctx,
        isComplete: false,
      };
    }

    if (userInput.includes("修改方案") || userInput.includes("修改")) {
      return {
        prompt: `用户希望修改方案。\n\n请询问用户需要修改哪些内容，然后根据反馈调整文档。\n\n修改完成后，调用 save_document 工具把更新后的完整 Markdown 文档保存，然后再提供选项：[OPTIONS:请求 AI 审视完整性|请求 AI 审视可行性及复杂度|修改方案|就此结束]`,
        context: ctx,
        isComplete: false,
      };
    }

    if (userInput.includes("就此结束") || userInput.includes("结束")) {
      return {
        prompt: `项目规划流程已完成。\n\n请主动询问用户是否将文档保存到当前会话目录：使用 [OPTIONS:保存到当前目录|暂不保存] 提供选项。若用户选择「保存到当前目录」，把完整 Markdown 写入当前工作目录下的 Markdown 文件（文件名用项目名称），并告知用户保存路径。保存处理完成后，收尾时用一句话简要建议用户可以将这份 Markdown 文档发送给 AI 编码工具或常见的 Agent 来实际落地项目。每条消息只问一个问题。`,
        context: ctx,
        isComplete: true,
      };
    }

    return {
      prompt: `请提供后续选项：[OPTIONS:请求 AI 审视完整性|请求 AI 审视可行性及复杂度|修改方案|就此结束]`,
      context: ctx,
      isComplete: false,
    };
  },
};
