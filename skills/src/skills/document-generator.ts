import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const documentGeneratorSkill: SkillDefinition = {
  id: "document-generator",
  name: "文档生成",
  description: "生成完整的项目规划文档",
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
      prompt: `所有信息已收集完毕，请生成项目规划文档。

项目信息：
${projectInfo}

请按以下结构生成 Markdown 文档：

# [项目名称] - 项目规划

## 一、项目基本原则与约束
（项目目标、核心约束、非功能需求）

## 二、功能规范
（用户故事、验收标准、业务规则）

## 三、技术栈推荐
（技术选型、版本备注、架构说明）

严格要求：
- 第一个字符必须是 # 标题
- 最后一个字符必须是文档内容，不要以总结或告别语结尾
- 禁止出现"好的"、"以下是"、"以上是"、"希望"等对话性文字
- 输出纯 Markdown 文档

生成完毕后，调用 save_document 工具，把完整的 Markdown 文档内容作为 document 参数传入保存。然后用一句话告知用户文档已生成，并主动询问用户是否将文档保存到当前会话目录：使用 [OPTIONS:保存到当前目录|暂不保存] 提供选项。若用户选择「保存到当前目录」，把完整 Markdown 写入当前工作目录下的 Markdown 文件（文件名用项目名称，如「随手记-项目规划.md」），并告知用户保存路径。保存处理完成后，再提供后续选项：[OPTIONS:请求 AI 审视完整性|请求 AI 审视可行性及复杂度|修改方案|就此结束]。每条消息只问一个问题。`,
      context: ctx,
      isComplete: true,
    };
  },
};
