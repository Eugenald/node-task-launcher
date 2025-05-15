# Node C++ Task Launcher

**Node / NestJS backend that starts, tracks and analyses native jobs written in C / C++ (or any script/batch).**  
It was built as the solution for the _“Senior Backend Developer Task”_ and demonstrates:

- parallel process execution with back-pressure (`async-sema`)
- retry / crash-detection logic
- pluggable in-memory / Redis job-store (current build ships with the in-memory driver)
- REST API **(Swagger available)** + DTO validation
- automatic **/stats** endpoint that shows correlations between job-properties and success-rate
- full e2e coverage **(Jest)** and a standalone **smoke-test shell script**

---

## Table of contents

1. [Quick-start](#quick-start)
2. [Configuration](#configuration)
3. [Executable matrix](#executable-matrix)
4. [API](#api)
5. [Testing](#testing)
6. [Project structure](#project-structure)
7. [Prerequisites & Tips](#prerequisites--tips)

---

## Quick-start

```bash
git clone https://github.com/you/node-cpp-task-launcher.git
cd node-cpp-task-launcher

cp .env.example .env         # edit if needed
npm install

npm run start:dev            # hot-reload dev mode
```

Swagger UI: **http://localhost:3030/api**

---

## Configuration

`.env` (or real env vars) is read via **@nestjs/config**.  
Key variables:

| Var             | Default      | Meaning                               |
|----------------|--------------|---------------------------------------|
| `HOST`         | `0.0.0.0`     | Interface to bind HTTP server         |
| `PORT`         | `3030`        | Port for REST API                     |
| `JOB_DRIVER`   | `memory`      | Storage driver (`memory` \| `redis`) |
| `MAX_PARALLEL` | `4`           | Max concurrent native jobs            |
| `TASK`         | `task_app.sh` | Path **inside `task/`** to executable |

Example:

```env
HOST=localhost
PORT=3030
JOB_DRIVER=memory
MAX_PARALLEL=8
TASK=task_app.exe          # Windows binary (Wine on *nix)
```
---

## Executable matrix

| Host OS           | `TASK` extension | Execution method                      |
|-------------------|------------------|----------------------------------------|
| **Windows**       | `.exe`           | direct spawn                          |
|                   | `.bat`           | direct spawn (`shell: true`)          |
|                   | `.sh`            | ❌ not supported on Windows            |
| **Linux / macOS** | `.sh`            | direct spawn via shell                |
|                   | `.exe`           | `wine task_app.exe …`                 |
|                   | `.bat`           | `wine cmd /c task_app.bat …`          |

> 💡 To run Windows `.exe` or `.bat` on macOS/Linux, install [Wine](https://www.winehq.org/):
>
> ```bash
> brew install --cask xquartz
> brew install --cask wine-stable
> ```

---

## API

| Method | Path       | Description                                       |
|--------|------------|---------------------------------------------------|
| `POST` | `/v1/jobs` | Start a new job. Body: `{ jobName, arguments }`  |
| `GET`  | `/v1/jobs` | Get all submitted jobs and their statuses        |
| `GET`  | `/v1/stats`| Correlation-based analysis of job success/failure|

> Interactive documentation: **http://localhost:3030/api**

---

## Testing

### 1. e2e tests (Jest + Supertest)

```bash
npm run test:e2e
```
- Tests located in `tests/e2e/`
- Config is in `package.json`
- `testTimeout` is set to 30s to allow time for real job execution

---

### 2. Smoke test (bash + curl + jq)
This integration script launches randomized jobs, waits for all to complete, and prints a summary and stats.

```bash
npm run smoke
```

You can override the defaults:

```bash
HOST=localhost PORT=3030 TOTAL=20 npm run smoke
```

Script path: `tests/smoke/test.sh`
- Requirements: `bash`, `curl`, `jq`

---

## Project structure

```bash
src/
├── job-runner/           # Native job runner (spawn / wine)
├── job-manager/          # Job queueing, retry, and semaphores
├── job-execution-store/  # Abstract store with in-memory implementation
├── api/                  # API-related modules
│   ├── job/              # REST API (v1/jobs)
│   └── stats/            # REST API (v1/stats)
└── common/               # Types and shared interfaces

tests/
├── e2e/                  # Jest e2e test cases
└── smoke/                # Bash smoke test

task/
└── task_app.(sh|bat|exe) # Native executable for job simulation
```
## Prerequisites & Tips

- For Windows-exe on macOS/Linux: **Wine 7+**
- Building your own C / C++ job:
  ```bash
  brew install mingw-w64
  x86_64-w64-mingw32-g++ task_app.c -o task_app.exe
  ```
- Concurrency is controlled only by **MAX_PARALLEL**
