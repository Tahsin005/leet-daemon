
# leet-daemon

A minimal LeetCode-style backend built as **three Node/TypeScript microservices**:

- **problem-service**: CRUD/search for problems + testcases (MongoDB)
- **submission-service**: create/fetch submissions (MongoDB) + enqueue evaluation jobs (BullMQ/Redis)
- **evaluation-service**: consumes jobs and runs user code in **locked-down Docker containers**

The two key ideas in this repo are:

1) **Containerized code execution** (no “eval”, no spawning arbitrary processes on the host)
2) **gRPC for inter-service communication** (problem + submission updates)

---

## Architecture (high-level)

### Request / evaluation flow

1. Client creates a submission via `submission-service` (HTTP)
2. `submission-service` fetches the related problem via **gRPC** (`problem-service`)
3. `submission-service` writes the submission to MongoDB with status `pending`
4. `submission-service` pushes an evaluation job to **BullMQ** (Redis)
5. `evaluation-service` worker consumes the job and sets status to `running` via **gRPC** (`submission-service`)
6. `evaluation-service` runs the submitted code against each testcase inside a Docker container
7. `evaluation-service` determines final verdict:
	 - `accepted` if all testcases match expected output
	 - otherwise `wrong_answer` (also covers runtime error / TLE for now)
8. `evaluation-service` updates the submission status + per-testcase results via **gRPC** (`submission-service`)

### Services and ports (defaults)

| Service | HTTP Port | gRPC Port |
|---|---:|---:|
| problem-service | `3001` | `50051` |
| submission-service | `3002` | `50052` |
| evaluation-service | `3003` (reserved) | (client-only) |

Infra (local via docker-compose):

- MongoDB: `27017`
- Redis: `6379`

---

## 🔒 Containerized code execution (evaluation-service)

User code is executed via **Docker containers** using [`dockerode`](https://github.com/apocas/dockerode).

The core entrypoint is:

- `evaluation-service/src/utils/containers/runCode.util.ts`

Key runtime restrictions (see `createContainer.util.ts`):

- **Network disabled**: `NetworkMode: 'none'`
- **No privilege escalation**: `SecurityOpt: ['no-new-privileges']`
- CPU and process limits:
	- `PidsLimit: 100`
	- `CpuQuota` / `CpuPeriod`
- Memory limit: currently **1GB**
- Hard timeout per language (see `LANGUAGE_CONFIG`):
	- Python: `4000ms`
	- C++: `1000ms`

### Images

Language images are configured in:

- `evaluation-service/src/config/language.config.ts`

There’s also helper code to pull images:

- `evaluation-service/src/utils/containers/pullImage.util.ts`

> Note: make sure the Docker daemon is running and the current user has permission to talk to it.

---

## 🔌 gRPC inter-service communication

This repo uses gRPC for internal calls:

### problem-service → used by submission-service

- Proto: `proto/problem.proto`
- RPCs:
	- `GetProblemById`

The gRPC handler returns testcase ids as `Testcase.id` (string). This is the value used by evaluation results.

### submission-service → used by evaluation-service

- Proto: `proto/submission.proto`
- RPCs:
	- `UpdateSubmission`

The evaluation worker updates submissions with:

- `status`: `running` → `accepted|wrong_answer`
- `output`: `map<string,string>` where key is testcase `id` and value is verdict like `AC`, `WA`, `TLE`, `Error`

---

## Local development

### Prerequisites

- Node.js + npm
- Docker (daemon running)

### 1) Create environment files

Each service ships with a `.env.example`.

- `problem-service/.env.example`
- `submission-service/.env.example`
- `evaluation-service/.env.example`

Copy each one to `.env` and adjust values.

### 2) Start infra (MongoDB + Redis)

The repo includes `docker-compose.yml` for MongoDB + Redis.

> You also need a root `.env` for docker-compose variables (e.g. `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_DB`).

### 3) Install dependencies

Install per service:

- `problem-service`
- `submission-service`
- `evaluation-service`

### 4) Start services

Each service supports:

- `npm run dev`
	- runs via nodemon + ts-node

Start order (recommended):

1. problem-service (HTTP + gRPC)
2. submission-service (HTTP + gRPC)
3. evaluation-service (worker)

---

## API quickstart

### Create a problem

- `POST http://localhost:3001/api/v1/problems`

### Create a submission

- `POST http://localhost:3002/api/v1/submissions`

### Fetch a submission

- `GET http://localhost:3002/api/v1/submissions/:id`

The `submissionData` field contains a per-testcase verdict map (keyed by testcase id).

---

## Repo layout

```
problem-service/
submission-service/
evaluation-service/
proto/
docker-compose.yml
```

