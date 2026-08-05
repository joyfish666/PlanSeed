# PlanSeed

> Conversational Project Planning Document Generator

**PlanSeed** guides non-technical users through a structured AI-driven dialogue to produce a professional Markdown project specification document.

**Every idea, no matter how simple, deserves to be taken seriously.**

[中文文档](./README-zh.md) | [Development Documentation](./开发文档.md) | [Live Demo](https://joyfish666.github.io/PlanSeed/)

---

## Two Ways to Use

PlanSeed offers two usage modes:

| Mode | Best For | Setup |
|------|----------|-------|
| **Web App** | Visual interface with real-time preview | Clone repo, `npm install`, `npm run dev` |
| **Agent Skill** | Terminal/IDE users, works with Claude Code / Cursor / Codex | Clone repo, `cd skills`, `npm install && npm run build`, register MCP server |

- **Web App**: Full-featured UI with chat interface, Markdown preview panel, and export options. Requires an API key for the AI model.
- **Agent Skill**: Lightweight MCP server that runs inside your AI coding agent. No API key needed — reuses the host agent's model. See [skills/README.md](./skills/README.md) for setup.

## Overview

PlanSeed bridges the gap between "I have an idea" and "I have a plan." It acts as a patient guide, asking questions in plain language, presenting choices as clickable options, and assembling a structured document in real time — no coding knowledge required.

The generated document covers three sections:
1. **Project Principles & Constraints** — core rules, technical boundaries, non-functional requirements
2. **Functional Specifications** — user stories, acceptance criteria, business rules
3. **Tech Stack Recommendations** — demand-driven, only what the project actually needs

## Features

### Conversational Guidance
The AI interview follows a single-question-per-message principle. Users answer through option buttons or free-text input. The flow covers: project type, core features, usage scenarios, target users, and tech stack — with dynamic follow-up questions to uncover implicit requirements.

### Feature Confirmation Loop
After initial feature selection, the AI dynamically suggests up to 3 missing features per round (based on the current feature set, not a static list). Users can add features, input custom ones, or confirm completeness. A final summary requires explicit user approval before proceeding.

### Demand-Driven Tech Stack
Tech stack recommendations are the last step, only after all features are confirmed. No technology layer is assumed — frontend, backend, databases, and middleware are recommended only when the project requires them. The AI autonomously selects candidates based on project needs rather than picking from a hardcoded list.

### Real-Time Document Preview
A Markdown preview panel is generated automatically from the conversation (the first time a document is produced, then on demand to keep API usage low). Users can refresh it manually at any time. The preview uses `react-markdown` with GFM support (tables, strikethrough, task lists).

### AI Review Mechanism
After document generation, users can request two types of review:
- **Completeness Review** — checks all three document sections for gaps or vague descriptions
- **Feasibility & Complexity Review** — evaluates technical feasibility, implementation difficulty, estimated timeline, and optimization opportunities

### Export Options
- Copy as raw Markdown
- Copy as AI Prompt (with a brief preamble for downstream tools)
- Download as `.md` file

### Settings & Persistence
API Key, Endpoint, and Model are stored in `localStorage`. The API Key is masked in the UI. Default provider: DeepSeek (`deepseek-v4-flash`).

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| State Management | Zustand 5 |
| Markdown Rendering | react-markdown 10 + remark-gfm |
| AI Interface | OpenAI-compatible API (user-provided) |

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/joyfish666/PlanSeed.git
cd PlanSeed
npm install
```

### Development

```bash
npm run dev
```

Open the URL shown in the terminal. Click the **Settings** button in the top-right corner to configure your API Key, Endpoint, and Model name.

### Build

```bash
npm run build        # Type-check + production build
npm run preview      # Preview the production build locally
```

### Other Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking only |

## Project Structure

```
PlanSeed/
├── src/
│   ├── components/
│   │   ├── chat/            # ChatContainer, MessageList, MessageBubble, TextInput
│   │   ├── preview/         # PreviewPanel, MarkdownRenderer
│   │   ├── export/          # ExportBar
│   │   └── common/          # SettingsModal
│   ├── stores/              # Zustand store (useAppStore)
│   ├── services/            # AI API service (aiService)
│   ├── prompts/             # System prompt and template constants
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Utilities (parseAIMessage, generateId, etc.)
│   ├── App.tsx              # Root component with responsive layout
│   └── main.tsx             # Entry point
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Documentation

| Document | Language | Description |
|----------|----------|-------------|
| [README.md](./README.md) | English | Project overview and quick start (this file) |
| [README-zh.md](./README-zh.md) | Chinese | Comprehensive Chinese documentation |
| [开发文档.md](./开发文档.md) | Chinese | Technical development specification |
| [skills/README.md](./skills/README.md) | EN/CN | Agent Skill setup and usage guide |
| [项目交接文档.md](./项目交接文档.md) | Chinese | Handover doc: current state, pitfalls, next steps |

## Deployment

This is a pure static application — no server-side code. Deploy to any static hosting provider:

- **GitHub Pages**: Use the included GitHub Actions workflow — [live site](https://joyfish666.github.io/PlanSeed/)
- **Vercel / Netlify**: Connect the repo, set build command to `npm run build`, output directory to `dist`

## Security

- API Keys are stored only in the user's browser `localStorage`
- No data is sent to any server other than the user-configured AI endpoint
- The application is fully client-side

## License

See the repository for license information.
