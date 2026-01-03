# Fasberry Minecraft

[![License](https://img.shields.io/github/license/ProjectFasberry/fasberry?style=for-the-badge)](./LICENSE)

Unified monorepo containing all applications and shared packages for the Fasberry Minecraft ecosystem.  
Includes frontends, backend, build tooling, and internal libraries, developed under a single dependency graph using **Bun**.

---

## 1. Overview

Fasberry Minecraft provides a modular environment for developing, deploying, and maintaining the Minecraft-related applications of the Fasberry platform.  
The repository includes:

- `landing` - Public-facing landing application.  
- `app` - User-facing Minecraft control and visualization frontend.  
- `backend` - Core backend services for Minecraft integration.  
- `ui` - Shared UI component library.  
- `shared` - Shared types, lib and configs.
- `config-biome` - Biome config.
- `config-typescript` - TS config. 

---

## 2. Requirements

- **Bun** ≥ 1.2.0  
- **Node.js** ≥ 22  
- **Git** ≥ 2.40
- OS: macOS, Linux, or WSL2 (Windows)

Install Bun globally if not present:

```bash
curl -fsSL https://bun.sh/install | bash
```

### 3. Installation

Clone and initialize the repository:

git clone https://github.com/ProjectFasberry/fasberry.git
cd fasberry
bun install

### 4. Development

Run all applications in development mode:

```bash
bun run dev
```

Applications are automatically launched with shared environment settings.
Check logs to see port assignments for each sub-application.

### Common Commands

| Command         | Description                                         |
|-----------------|-----------------------------------------------------|
| `bun run dev`   | Starts all applications in development mode.        |
| `bun run build` | Builds all applications and packages for production.|
| `bun run start` | Launches built applications.                        |

### 5. Documentation

Full system and API documentation:
https://deepwiki.com/ProjectFasberry/fasberry/1-overview

Direct API reference:
https://api.fasberry.fun/minecraft/openapi

### 6. License

Distributed under the MIT License. See LICENSE for full text.
