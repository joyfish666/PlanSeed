import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const documentGeneratorSkill: SkillDefinition = {
  id: "document-generator",
  name: "文档生成",
  description: "生成完整的项目规划文档",
  requiredFields: ["projectType", "coreFeatures", "confirmedFeatures", "usageScenario", "techStack"],
  producedFields: [],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx = context;

    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    const projectInfo = [
      `项目类型：${ctx.projectType}`,
      `核心功能：${ctx.confirmedFeatures.join("、")}`,
      `使用设备：${ctx.usageScenario.devices.join("、")}`,
      `离线支持：${ctx.usageScenario.offlineSupport ? "是" : "否"}`,
      `目标用户：${ctx.usageScenario.targetUsers}`,
      `用户规模：${ctx.usageScenario.userScale}`,
      `技术栈：${ctx.techStack.selections.join("、")}`,
      `项目规模：${ctx.projectScale === "mvp" ? "MVP 快速验证" : "完整产品"}`,
      `交付节奏：${ctx.deliveryRhythm === "once" ? "一次性交付" : "迭代式开发"}`,
    ].join("\n");

    return {
      prompt: `所有信息已收集完毕，请生成项目规划文档。\n\n项目信息：\n${projectInfo}\n\n请按以下结构生成 Markdown 文档：\n\n# [项目名称] - 项目规划\n\n## 一、项目基本原则与约束\n（项目目标、核心约束、非功能需求）\n\n## 二、功能规范\n（用户故事、验收标准、业务规则）\n\n## 三、技术栈推荐\n（技术选型、版本备注、架构说明）\n\n严格要求：\n- 第一个字符必须是 # 标题\n- 最后一个字符必须是文档内容，不要以总结或告别语结尾\n- 禁止出现"好的"、"以下是"、"以上是"、"希望"等对话性文字\n- 输出纯 Markdown 文档\n\n生成完毕后，提供选项：[OPTIONS:请求 AI 审视完整性|请求 AI 审视可行性及复杂度|修改方案|保存文档到当前目录|就此结束]`,
      context: ctx,
      isComplete: true,
    };
  },
};
