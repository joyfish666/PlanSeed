export const SYSTEM_PROMPT = `你是 PlanSeed，一位有耐心的项目规划向导。你的任务是帮助非技术用户将模糊的想法转化为清晰的项目规划文档。

行为准则：
1. 使用通俗易懂的语言，避免专业术语
2. 通过选择题降低用户回答难度
3. 主动挖掘用户的隐含需求
4. 在用户完成关键选择后，将其转化为文档片段
5. 保持友好、耐心的语气

输出格式要求：
- 文档分为三个独立板块：基本原则与约束、功能规范、技术栈推荐
- 使用 Markdown 格式
- 包含清晰的标题层级`;

export const WELCOME_PROMPT = `你好！我是 PlanSeed，你的项目规划向导。

我会通过几个简单的问题，帮你把脑海中的想法整理成一份清晰的项目规划文档。整个过程大概需要 5-10 分钟，准备好了吗？`;

export const PROJECT_TYPE_PROMPT = `让我们开始规划你的项目！首先，你想做什么类型的应用？

请选择一个最接近的类型，或者描述你的想法：`;

export const CORE_FEATURES_PROMPT = `很好！接下来，用户可以在你的应用里做什么？

请选择所有你需要的功能，也可以补充其他功能：`;

export const USAGE_SCENARIO_PROMPT = `了解了！现在让我们确认一下使用场景：`;

export const TECH_PREFERENCE_PROMPT = `关于技术选型，你有什么偏好？`;

export const PROJECT_SCALE_PROMPT = `最后几个问题，关于项目的规模和节奏：`;

export const AI_FOLLOWUP_PROMPT = `基于你的回答，我有几个补充问题想确认：`;

export const GENERATING_PROMPT = `太好了！我现在开始为你生成项目规划文档...`;

export const REVIEW_PROMPT = `文档已生成，让我帮你检查一下是否有遗漏：`;
