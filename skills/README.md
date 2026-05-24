# PlanSeed Agent Skill

> MCP-based project planning skill for Claude Code, Cursor, and Codex CLI

[中文文档](#中文文档)

---

## Overview

PlanSeed Agent Skill is a standalone MCP (Model Context Protocol) server that brings PlanSeed's project planning capabilities directly into AI coding agents. Instead of using the web interface, you can now plan projects conversationally right inside your terminal or IDE.

**Key difference from the web version**: The skill doesn't call external AI APIs. It acts as a pure flow controller, returning structured prompts for the host agent (Claude, Codex, etc.) to interpret and present to the user. This means no API keys or model configuration needed.

## Quick Start

### Prerequisites

- Node.js >= 18
- Claude Code CLI (or Cursor / Codex CLI)

### Installation

```bash
# Clone the repository
git clone https://github.com/joyfish666/PlanSeed.git
cd PlanSeed/skills

# Install dependencies
npm install

# Build the skill
npm run build
```

### Register the MCP Server

**For Claude Code (user scope - works in all directories):**

```bash
claude mcp add planseed -s user -- node /absolute/path/to/PlanSeed/skills/dist/index.js
```

**For Claude Code (project scope - only works in current directory):**

```bash
claude mcp add planseed -- node /absolute/path/to/PlanSeed/skills/dist/index.js
```

**For Cursor:**

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "planseed": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/PlanSeed/skills/dist/index.js"]
    }
  }
}
```

**For Codex CLI:**

Add to `codex.toml`:

```toml
[mcp_servers.planseed]
command = "node"
args = ["/absolute/path/to/PlanSeed/skills/dist/index.js"]
```

## Usage

### Starting a Planning Session

In Claude Code, use the MCP prompt command:

```
/plan-project
```

Or with an initial idea:

```
/plan-project idea:做一个日历应用
```

Alternatively, just type naturally:

```
请使用 start_planning 工具帮我规划项目
```

### The Planning Flow

The skill guides you through 7 sequential stages:

```
1. Project Type       → What kind of app/project?
2. Core Features      → What can users do?
3. Feature Confirm    → Review and add missing features
4. Usage Scenario     → Devices, offline support, target users
5. Tech Stack         → Recommend technologies
6. Document Generate  → Create the Markdown specification
7. Review             → Completeness and feasibility checks
```

At each stage, the skill presents numbered options. You can:
- Type a **number** (e.g., `1`) to select an option
- Type **text** for custom input

### After Document Generation

Once the document is generated, you can:

- **Review completeness** - Check for gaps in the specification
- **Review feasibility** - Assess technical complexity and timeline
- **Save document** - Write `PROJECT_PLAN.md` to your current working directory
- **Modify** - Adjust the document based on feedback
- **Finish** - End the session and optionally start development

## Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Host Agent (Claude)                    │
│                                                          │
│  User ←→ Agent ←→ MCP Tools ←→ PlanSeed Skill Server    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

1. **Host Agent** (Claude Code / Cursor / Codex) connects to the MCP server
2. **User** interacts with the agent naturally
3. **Agent** calls MCP tools (`start_planning`, `send_message`, etc.)
4. **Skill Server** returns structured prompts (not AI responses)
5. **Agent** interprets the prompts and presents them to the user

### Key Design Principles

**No AI client code in skills**: The skills are pure state machines. They don't call any AI API - they return prompts that the host agent interprets. This means:
- No API keys needed
- No model configuration needed
- Works with any capable host agent

**Pipeline architecture**: Skills execute sequentially, each producing a `SkillTurnResult`:

```typescript
interface SkillTurnResult {
  prompt: string;      // Instructions for the host agent
  context: SkillContext; // Updated state
  isComplete: boolean;  // Whether to advance to next skill
}
```

### MCP Tools

| Tool | Description |
|------|-------------|
| `start_planning` | Start a new planning session |
| `send_message` | Send user input to the current skill |
| `get_planning_context` | Get collected project information |
| `get_document` | Get the generated Markdown document |
| `reset_planning` | Reset and start over |
| `list_skills` | List all available skills in the pipeline |

### MCP Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Planning Context | `planseed://context` | Current session state as JSON |

### MCP Prompts

| Prompt | Description |
|--------|-------------|
| `plan-project` | Start a guided planning conversation |

## Project Structure

```
skills/
├── src/
│   ├── skills/
│   │   ├── project-type.ts        # Project type selection
│   │   ├── core-features.ts       # Core features collection
│   │   ├── feature-confirmation.ts # Feature confirmation loop
│   │   ├── usage-scenario.ts      # Device, users, offline support
│   │   ├── tech-stack.ts          # Tech stack recommendation
│   │   ├── document-generator.ts  # Markdown document generation
│   │   └── review.ts              # Completeness and feasibility review
│   ├── prompts/
│   │   ├── base-persona.ts        # Shared behavioral rules
│   │   ├── project-type.ts        # Project type prompt template
│   │   ├── core-features.ts       # Core features prompt template
│   │   ├── feature-confirmation.ts
│   │   ├── usage-scenario.ts
│   │   ├── tech-stack.ts
│   │   └── review.ts
│   ├── index.ts                   # MCP server entry point
│   ├── pipeline.ts                # Pipeline runner
│   ├── types.ts                   # TypeScript interfaces
│   └── message-parser.ts          # Option/Q&A marker parser
├── package.json
├── tsconfig.json
└── dist/                          # Compiled output (auto-generated)
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Adding a New Skill

1. Create `src/skills/my-skill.ts` implementing `SkillDefinition`
2. Add the skill to the `PIPELINE` array in `src/pipeline.ts`
3. Optionally create a prompt template in `src/prompts/`
4. Rebuild with `npm run build`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MCP server not found in other directories | Register with `-s user` flag for global access |
| Changes not taking effect | Run `npm run build` after modifying code |
| Options not displaying as numbered list | Rebuild the project |
| `claude mcp list` shows disconnected | Check that the Node.js path is correct |

---

## 中文文档

### 简介

PlanSeed Agent Skill 是一个基于 MCP（模型上下文协议）的独立服务，将 PlanSeed 的项目规划能力直接带入 AI 编码助手。无需使用网页界面，直接在终端或 IDE 中完成项目规划。

**与网页版的核心区别**：Skill 不调用外部 AI API，而是作为纯流程控制器，返回结构化提示词供宿主 Agent（Claude、Codex 等）解读。无需 API Key 或模型配置。

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/joyfish666/PlanSeed.git
cd PlanSeed/skills

# 安装依赖与构建
npm install
npm run build

# 注册为全局 MCP 服务（任意目录可用）
claude mcp add planseed -s user -- node /你的绝对路径/PlanSeed/skills/dist/index.js
```

### 使用方式

在 Claude Code 中输入以下任一方式启动：

```
/plan-project
```

```
/plan-project idea:做一个日历应用
```

```
请使用 start_planning 工具帮我规划项目
```

### 规划流程

```
1. 项目类型选择    → 你想做什么类型的项目？
2. 核心功能收集    → 用户可以在应用里做什么？
3. 功能确认        → 审视并补充缺失功能
4. 使用场景收集    → 设备、离线支持、目标用户
5. 技术栈推荐      → 根据需求推荐技术方案
6. 文档生成        → 生成 Markdown 项目规划文档
7. 文档审查        → 完整性与可行性审查
```

每个阶段提供编号选项，输入数字即可选择。文档生成后可保存为 `PROJECT_PLAN.md` 到当前目录。

### MCP 工具列表

| 工具 | 说明 |
|------|------|
| `start_planning` | 开始新的规划会话 |
| `send_message` | 发送用户输入到当前技能 |
| `get_planning_context` | 获取已收集的项目信息 |
| `get_document` | 获取生成的 Markdown 文档 |
| `reset_planning` | 重置并重新开始 |
| `list_skills` | 列出所有可用技能 |

### 工作原理

```
┌──────────────────────────────────────────┐
│           宿主 Agent (Claude)             │
│                                          │
│  用户 ←→ Agent ←→ MCP 工具 ←→ Skill 服务  │
│                                          │
└──────────────────────────────────────────┘
```

Skill 是纯状态机，不调用任何 AI API。它返回提示词，由宿主 Agent 解读后呈现给用户。这意味着：
- 无需 API Key
- 无需模型配置
- 任何支持 MCP 的 Agent 均可使用

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 其他目录找不到 MCP 服务 | 使用 `-s user` 参数注册为用户级 |
| 修改代码后不生效 | 重新执行 `npm run build` |
| 选项没有编号 | 重新构建即可 |
| `claude mcp list` 显示断开 | 检查 Node.js 路径是否正确 |
