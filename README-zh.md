# PlanSeed：对话式项目规划文档生成器

> 再简单的想法，也值得被认真对待。

[English](./README.md) | [开发文档](./开发文档.md)

---

## 一句话描述

一款面向 AI 开发初学者的对话式项目规划文档生成器，采用纯前端技术实现。通过 AI 驱动的结构化引导，帮助非技术用户将模糊的想法转化为清晰、专业、可供下游 AI 编码工具或开发者参考的项目规划文档。

## 核心价值

从"我有一个想法"到"这是一份可以开始讨论的方案"，中间隔着一段对新手来说最难的路。PlanSeed 不做代码生成，而是专注填补这段空白：像一位有耐心的向导，用你听得懂的语言，一步步帮你把模糊的想法梳理成一份结构完整、表述清晰的项目说明书。

## 目标用户

| 用户画像 | 痛点 |
|----------|------|
| 有产品想法但缺乏需求梳理经验的创业者 | 脑中的想法无法形成结构化的需求文档，与 AI 编码工具或开发者沟通时说不清楚自己要什么 |
| 想用 AI 工具开发应用但经验为零的初学者 | 不知道从哪里开始、怎么问，面对空白 Prompt 框无所适从 |

## 核心功能

### 1. 对话式需求引导
AI 以选择题和开放式提问相结合的方式，逐步引导用户明确以下维度：

- **项目类型**：你想做什么？
- **核心功能**：用户可以在你的应用里做什么？
- **使用场景**：主要在什么设备上使用？是否需要离线功能？
- **目标用户**：这个应用主要是给谁用的？
- **技术偏好**：你对技术选型的态度是什么？
- **项目规模与交付节奏**：快速验证还是完整产品？一次性还是迭代式？

每条消息只提出一个问题，降低用户回答负担。AI 会主动挖掘隐含需求，并将确认结果实时补充进方案中。

### 2. 功能确认与补充流程
核心功能确认后，AI 不会立即跳到下一步，而是执行功能核对流程：

- 基于当前已确认功能，动态推荐最多 3 个缺失功能（非固定列表）
- 用户可逐个添加、自定义输入，或选择"功能已足够，继续"
- 每轮添加后重新审视缺失项，生成新一轮推荐
- 最终总结所有功能并要求用户明确确认："正确"或"不准确，需修改"

### 3. 需求驱动的技术栈推荐
技术栈推荐是规划流程的最后一步，必须在功能核对全部完成之后进行：

- **不预设任何技术层**：前端、后端、数据库、缓存、中间件均按需推荐
- **前端与后端地位等价**：纯前端项目不推荐后端，纯后端项目不推荐前端
- **AI 自主判断**：不从预设列表中选取，根据项目需求自主推荐
- 用户选择"帮我推荐"时，AI 给出首选方案及 1-2 个备选

### 4. 实时文档预览
对话过程中，右侧预览面板同步展示 Markdown 文档：

- 每次 AI 响应后自动更新预览
- 支持手动刷新
- 完整 GFM 支持（表格、删除线、任务列表等）
- 使用 `react-markdown` + `remark-gfm` 渲染

### 5. AI 辅助评审
文档生成后，用户可请求两种审查：

**完整性审视**：
- 检查三个板块（基本原则、功能规范、技术栈推荐）是否有遗漏
- 发现缺失时引导用户补充
- 通过后标记为 `completeness_passed`

**可行性及复杂度审视**：
- 评估技术可行性
- 分析各功能模块实现难度（简单/中等/复杂）
- 预估整体开发周期
- 提出优化建议和潜在风险

### 6. 导出功能
提供三种导出方式：

- **复制 Markdown**：保留完整标题层级
- **复制 AI Prompt**：附带引导语的 Markdown，可直接发送给 AI 编码工具
- **下载 Markdown**：保存为 `.md` 文件

### 7. 设置与持久化
- API Key、Endpoint、Model 存储于 `localStorage`
- API Key 在界面中显示为掩码 `***`
- 支持模型连接检测
- 默认使用 DeepSeek（`deepseek-v4-flash`）

## 技术栈

| 类别 | 技术方案 | 说明 |
|------|----------|------|
| 前端框架 | React 19 + TypeScript | 组件化开发，类型安全 |
| 构建工具 | Vite 8 | 快速热更新 |
| 样式方案 | Tailwind CSS v4 | 原子化 CSS |
| 状态管理 | Zustand 5 | 轻量级状态管理 |
| Markdown 渲染 | react-markdown 10 + remark-gfm | 支持 GFM 扩展语法 |
| AI 接口 | OpenAI 兼容 API | 用户自备 API Key |

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/joyfish666/PlanSeed.git
cd PlanSeed

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开终端显示的 URL，点击右上角 **设置** 按钮配置 API Key、Endpoint 和模型名称。

### 构建与部署

```bash
npm run build        # 类型检查 + 生产构建
npm run preview      # 本地预览生产版本
```

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（HMR） |
| `npm run build` | TypeScript 检查 + Vite 生产构建 |
| `npm run preview` | 本地预览生产版本 |
| `npm run lint` | ESLint 代码检查 |
| `npm run type-check` | 仅 TypeScript 类型检查 |

## 项目结构

```
PlanSeed/
├── src/
│   ├── components/
│   │   ├── chat/            # 对话组件（ChatContainer, MessageList, MessageBubble, TextInput）
│   │   ├── preview/         # 预览组件（PreviewPanel, MarkdownRenderer）
│   │   ├── export/          # 导出组件（ExportBar）
│   │   └── common/          # 通用组件（SettingsModal, LoadingIndicator）
│   ├── stores/              # Zustand 状态管理（useAppStore）
│   ├── services/            # AI API 服务（aiService）
│   ├── prompts/             # 系统提示词与模板常量
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数（parseAIMessage, generateId 等）
│   ├── App.tsx              # 根组件（响应式布局）
│   └── main.tsx             # 入口文件
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 文档索引

| 文档 | 语言 | 说明 |
|------|------|------|
| [README.md](./README.md) | English | 项目概览与快速开始 |
| [README-zh.md](./README-zh.md) | 中文 | 完整中文文档（本文件） |
| [开发文档.md](./开发文档.md) | 中文 | 技术开发规范 |

## 部署方案

本项目为纯静态应用，可部署到任何静态托管平台：

- **GitHub Pages**：使用项目内置的 GitHub Actions 工作流
- **Vercel / Netlify**：连接仓库，构建命令 `npm run build`，输出目录 `dist`

## 安全说明

- API Key 仅存储在用户浏览器的 `localStorage` 中
- 除用户配置的 AI 接口外，不向任何服务器发送数据
- 应用完全运行在客户端

## 许可证

详见仓库中的许可信息。
