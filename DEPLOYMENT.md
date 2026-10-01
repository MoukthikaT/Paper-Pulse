# PaperPulse — Production Deployment Guide

This guide details the complete production architecture, provisioning steps, environment configurations, and operational procedures for deploying PaperPulse as a public educational paper-trading simulator.

---

## 1. Architecture Overview

```text
                           CLIENT / BROWSER
                                  │
                                  │ HTTPS
                                  ▼
                   ┌──────────────────────────────┐
                   │    React 19 + Vite Frontend  │
                   │ (Vercel / Cloudflare / Nginx)│
                   └──────────────┬───────────────┘
                                  │
                                  │ HTTPS API Requests
                                  ▼
                   ┌──────────────────────────────┐
                   │     Express.js REST API      │
                   │ (Node.js 20 - Render/AWS/ECS)│
                   └──────────────┬───────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                  ▼                               ▼
   ┌──────────────────────────────┐ ┌──────────────────────────────┐
   │     MongoDB Replica Set      │ │    FastAPI ML Microservice   │
   │ (Atlas 3-Node Cluster / ACID)│ │(Python 3.11 - Container/ECS) │
   └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 2. Prerequisites & System Requirements

* **Node.js**: v20.x LTS or higher
* **Python**: v3.11.x
* **Database**: MongoDB v6.0+ (MongoDB Atlas or Replica Set cluster required for native multi-document ACID transactions)
* **Docker & Docker Compose** (Optional for containerized deployments)

---

## 3. Environment Variables Configuration

### Backend Configuration (`backend/.env`)

| Variable | Description | Example (Production) |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `production` |
| `PORT` | Node.js listening port | `5000` |
| `MONGODB_URI` | MongoDB Replica Set connection string | `mongodb+srv://user:pass@cluster.mongodb.net/paper_pulse?retryWrites=true&w=majority` |
| `JWT_SECRET` | Cryptographically random secret (64+ chars) | *(Generate via `openssl rand -hex 32`)* |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `INITIAL_WALLET_BALANCE` | Starting paper money allocation (INR) | `100000` |
| `CORS_ORIGIN` | Whitelisted frontend domain | `https://paperpulse.yourdomain.com` |
| `FRONTEND_URL` | Frontend client URL | `https://paperpulse.yourdomain.com` |
| `ML_SERVICE_URL` | FastAPI service internal HTTP URL | `http://ml-service:8000` or `https://ml.internal.domain` |
| `SEED_DEMO_USER` | Auto-seed demo trader account (`false` in prod) | `false` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Example (Production) |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public HTTP URL of the Express Backend | `https://api.paperpulse.yourdomain.com` |

---

## 4. Deployment Options

### Option A: Unified Docker Compose (Single Host / VM)

1. Clone repository on production host:
   ```bash
   git clone https://github.com/your-org/Paper-Pulse.git
   cd Paper-Pulse
   ```
2. Create `.env` file with production secrets:
   ```bash
   JWT_SECRET=$(openssl rand -hex 32)
   ```
3. Launch all services:
   ```bash
   docker compose up -d --build
   ```
4. Verify service health:
   ```bash
   docker compose ps
   curl http://localhost:5000/health
   curl http://localhost:8000/health
   ```

---

### Option B: Cloud PaaS (Vercel + Render + MongoDB Atlas)

#### 1. Database (MongoDB Atlas)
1. Provision a 3-node Replica Set (M0 free-tier or M10+ dedicated).
2. Configure Network Access IP whitelist (or VPC peering).
3. Create database user and obtain connection URI.

#### 2. ML Service (Render / Railway Web Service)
1. Deploy from `backend/ml` root.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn api.ml_api:app --host 0.0.0.0 --port $PORT`
4. Health Check Path: `/health`

#### 3. Backend API (Render / Railway / AWS ECS)
1. Deploy from `backend` directory.
2. Build Command: `npm ci --only=production`
3. Start Command: `node server.js`
4. Configure environment variables (`MONGODB_URI`, `JWT_SECRET`, `ML_SERVICE_URL`, `CORS_ORIGIN`, `SEED_DEMO_USER=false`).
5. Health Check Path: `/health`

#### 4. Frontend SPA (Vercel / Cloudflare Pages)
1. Deploy from `frontend` directory.
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variable: `VITE_API_URL=https://your-backend-api.com`

---

## 5. Health Monitoring & Observability

* **Backend Health Check**: `GET /health`
  * Returns JSON payload with database connectivity status and ML microservice status.
* **ML Service Health Check**: `GET /health`
  * Returns operational status of model inference runtime.

---

## 6. Database Backup & Recovery Policy (Infrastructure Requirement)

1. **Automated Continuous Backups**: Enable continuous snapshots via MongoDB Atlas or daily `mongodump` cron jobs.
2. **Point-in-Time Recovery**: Retain snapshots for 7 days minimum.
3. **Restoration Command**:
   ```bash
   mongorestore --uri="<MONGODB_URI>" --drop backup_dir/
   ```

---

## 7. Security Checklist for Beta Launch

- [x] Fast-fail startup if `JWT_SECRET` is missing.
- [x] Rate limiting active on `/api/auth/login` and `/api/auth/register`.
- [x] CORS restricted to verified frontend origin.
- [x] Helmet security headers active.
- [x] Plaintext passwords never stored (bcrypt 10-salt hashing).
- [x] Zero sensitive credentials committed to Git.
- [x] `SEED_DEMO_USER=false` for clean production data.
- [x] Multi-user authorization enforced across all routes via JWT tokens.
- [x] Clear educational disclaimers displayed on all user interfaces.
