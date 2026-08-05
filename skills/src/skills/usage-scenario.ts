import type { SkillDefinition, SkillContext, SkillTurnResult } from "../types.js";

export const usageScenarioSkill: SkillDefinition = {
  id: "usage-scenario",
  name: "使用场景收集",
  description: "收集使用设备、离线支持、目标用户、用户规模",
  requiredFields: ["confirmedFeatures"],
  producedFields: ["usageScenario"],

  execute(userInput: string, context: SkillContext): SkillTurnResult {
    const ctx = { ...context };
    const scenario = { ...ctx.usageScenario };

    if (userInput) {
      ctx.conversationHistory = [
        ...ctx.conversationHistory,
        { role: "user", content: userInput },
      ];
    }

    // Determine which sub-field to collect next
    if (scenario.devices.length === 0) {
      if (userInput) {
        scenario.devices = userInput.includes("桌面") && userInput.includes("移动")
          ? ["desktop", "mobile"]
          : userInput.includes("桌面")
            ? ["desktop"]
            : userInput.includes("移动")
              ? ["mobile"]
              : userInput.includes("平板")
                ? ["tablet"]
                : ["desktop"];
      }

      if (scenario.devices.length > 0) {
        ctx.usageScenario = scenario;
        return {
          prompt: `用户选择了设备：${scenario.devices.join("、")}。\n\n请询问用户：是否需要离线使用？使用 [OPTIONS:需要离线支持|不需要离线支持] 提供选项。\n\n每条消息只问一个问题。`,
          context: ctx,
          isComplete: false,
        };
      }

      return {
        prompt: `请询问用户：这个应用主要在什么设备上使用？使用 [OPTIONS:桌面端|移动端|平板|桌面端 + 移动端] 提供选项。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: false,
      };
    }

    if (scenario.offlineSupport === false && userInput && !scenario.targetUsers) {
      scenario.offlineSupport = userInput.includes("需要") && !userInput.includes("不需要");
      ctx.usageScenario = scenario;

      return {
        prompt: `用户${scenario.offlineSupport ? "需要" : "不需要"}离线支持。\n\n请询问用户：这个应用主要是给谁用的？使用 [OPTIONS:个人用户|团队协作|公众用户] 提供选项。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: false,
      };
    }

    if (!scenario.targetUsers && userInput) {
      scenario.targetUsers = userInput;
      ctx.usageScenario = scenario;

      return {
        prompt: `用户的目标用户：${userInput}。\n\n请询问用户：预期的用户规模大约是多少？使用 [OPTIONS:个人使用(<10人)|小规模(10-100人)|中等规模(100-1000人)|大规模(1000人以上)] 提供选项。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: false,
      };
    }

    if (!scenario.userScale && userInput) {
      scenario.userScale = userInput;
      ctx.usageScenario = scenario;

      return {
        prompt: `用户规模：${userInput}。\n\n使用场景收集完毕。\n\n请根据项目需求推荐技术栈。\n\n核心原则：需求驱动，按需推荐。不预设任何技术层必须存在。纯客户端项目只推荐前端技术栈；需要服务端能力的项目按需推荐后端、数据库等。\n\n使用 [OPTIONS:...] 提供多个技术选项，让用户选择，每个选项前简要说明特点。必须包含选项「帮我推荐一个合适的」。\n\n每条消息只问一个问题。`,
        context: ctx,
        isComplete: true,
      };
    }

    return {
      prompt: `请询问用户：这个应用主要在什么设备上使用？使用 [OPTIONS:桌面端|移动端|平板|桌面端 + 移动端] 提供选项。`,
      context: ctx,
      isComplete: false,
    };
  },
};
