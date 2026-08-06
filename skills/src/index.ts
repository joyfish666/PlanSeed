#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPipelineRunner } from "./pipeline.js";
import type { PipelineRunner } from "./pipeline.js";
import type { SkillContext } from "./types.js";
import { BASE_PERSONA } from "./prompts/base-persona.js";

// ── Session State ──────────────────────────────────────────────────────────────

let runner: PipelineRunner | null = null;
let generatedDocument = "";

function wrapPrompt(prompt: string): string {
  return `${BASE_PERSONA}\n\n---\n\n${prompt}`;
}

function formatContext(ctx: Readonly<SkillContext>): string {
  const lines: string[] = [];
  if (ctx.projectType) lines.push(`项目类型: ${ctx.projectType}`);
  if (ctx.coreFeatures.length) lines.push(`核心功能: ${ctx.coreFeatures.join(", ")}`);
  if (ctx.confirmedFeatures.length) lines.push(`已确认功能: ${ctx.confirmedFeatures.join(", ")}`);
  if (ctx.usageScenario.devices.length) lines.push(`设备: ${ctx.usageScenario.devices.join(", ")}`);
  if (ctx.usageScenario.targetUsers) lines.push(`目标用户: ${ctx.usageScenario.targetUsers}`);
  if (ctx.usageScenario.userScale) lines.push(`用户规模: ${ctx.usageScenario.userScale}`);
  if (ctx.techStack.selections.length) lines.push(`技术栈: ${ctx.techStack.selections.join(", ")}`);
  lines.push(`项目规模: ${ctx.projectScale}`);
  lines.push(`交付节奏: ${ctx.deliveryRhythm}`);
  return lines.join("\n");
}

// ── MCP Server ─────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "planseed-mcp",
  version: "1.2.0",
});

// ── Tools ──────────────────────────────────────────────────────────────────────

server.tool(
  "start_planning",
  "Start a new project planning session. Returns a prompt for you to interpret and present to the user.",
  {},
  async () => {
    runner = createPipelineRunner();
    const result = runner.turn("");

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              prompt: wrapPrompt(result.prompt),
              currentSkill: runner.currentSkillId(),
              remainingSkills: runner.remainingSkills(),
              context: formatContext(runner.getContext()),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.tool(
  "send_message",
  "Send a user message to the planning session. Returns a prompt for you to interpret and present to the user.",
  {
    message: z.string().describe("The user's message or selected option"),
  },
  async ({ message }) => {
    if (!runner) {
      return {
        content: [{ type: "text" as const, text: "No active session. Call start_planning first." }],
        isError: true,
      };
    }

    const result = runner.turn(message);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              prompt: wrapPrompt(result.prompt),
              currentSkill: runner.currentSkillId(),
              isComplete: result.isComplete,
              remainingSkills: runner.remainingSkills(),
              context: formatContext(runner.getContext()),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.tool(
  "get_planning_context",
  "Get the current planning session context (collected project information).",
  {},
  async () => {
    if (!runner) {
      return {
        content: [{ type: "text" as const, text: "No active session. Call start_planning first." }],
      };
    }

    const ctx = runner.getContext();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              currentSkill: runner.currentSkillId(),
              remainingSkills: runner.remainingSkills(),
              context: formatContext(ctx),
              raw: ctx,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.tool(
  "save_document",
  "Save the generated project planning document so it can be retrieved later via get_document. Call this with the full Markdown content whenever the document is produced or modified.",
  {
    document: z.string().describe("The full Markdown document content"),
  },
  async ({ document }) => {
    generatedDocument = document;
    return {
      content: [{ type: "text" as const, text: "Document saved. Use get_document to retrieve it." }],
    };
  },
);

server.tool(
  "get_document",
  "Get the generated project planning document.",
  {},
  async () => {
    if (!generatedDocument) {
      return {
        content: [{ type: "text" as const, text: "No document saved yet. Generate the document and call save_document first." }],
      };
    }
    return {
      content: [{ type: "text" as const, text: generatedDocument }],
    };
  },
);

server.tool(
  "reset_planning",
  "Reset the planning session and start over.",
  {},
  async () => {
    runner = null;
    generatedDocument = "";
    return {
      content: [{ type: "text" as const, text: "Session reset. Call start_planning to begin a new session." }],
    };
  },
);

server.tool(
  "list_skills",
  "List all available planning skills in the pipeline.",
  {},
  async () => {
    const skills = [
      { id: "project-type", name: "项目类型选择", description: "引导用户选择项目类型" },
      { id: "core-features", name: "核心功能收集", description: "收集核心功能" },
      { id: "feature-confirmation", name: "功能确认", description: "功能确认循环" },
      { id: "usage-scenario", name: "使用场景收集", description: "收集设备、目标用户等" },
      { id: "tech-stack", name: "技术栈推荐", description: "推荐技术栈" },
      { id: "document-generator", name: "文档生成", description: "生成项目规划文档" },
      { id: "review", name: "文档审查", description: "完整性与可行性审查" },
    ];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              skills,
              currentSkill: runner?.currentSkillId() ?? null,
              hasDocument: !!generatedDocument,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Resources ──────────────────────────────────────────────────────────────────

server.resource(
  "planning-context",
  "planseed://context",
  async (uri) => {
    if (!runner) {
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ active: false }) }],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              active: true,
              currentSkill: runner.currentSkillId(),
              remainingSkills: runner.remainingSkills(),
              context: runner.getContext(),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ── Prompts ────────────────────────────────────────────────────────────────────

server.prompt(
  "plan-project",
  "Start a guided project planning conversation",
  {
    idea: z.string().optional().describe("A brief description of your project idea"),
  },
  ({ idea }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: idea
            ? `我想规划一个项目：${idea}。请引导我完成规划流程。`
            : "我想规划一个新项目。请一步步引导我完成规划。",
        },
      },
    ],
  }),
);

// ── Start ──────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PlanSeed MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
