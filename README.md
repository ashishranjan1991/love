# 💌 Say Yes Or Else — Interactive Date Invitation Web App

A charming, playful, and responsive interactive date proposal web application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite**.

---

## ✨ Features

- **Dodging "No" Button**: Playful elusive button physics with funny changing text prompts, particle celebrations, and sound effects.
- **Date & Time Selector**: Choose specific dates with morning or evening time slots and witty banter.
- **Activity & Food Picker**: Tailored morning walks, coffee, dining options (Pizza, Sushi, Tacos, etc.), or custom inputs.
- **Real-Time Date Weather Forecast**:
  - Live weather forecast powered by the Open-Meteo API.
  - Automatic GPS & IP geolocation with manual city switcher.
  - Smart dating advice: **Pack an Umbrella! ☔** (with shared umbrella prompt) vs. **Bring Sunglasses! 🕶️** with animated weather icons.
- **Calendar & Share Actions**:
  - Add directly to **Google Calendar**.
  - Download standard `.ics` file for Apple Calendar, Outlook, and mobile devices.
  - Instant pre-filled WhatsApp share link.
- **Customizable Links**: Personalize for your crush with URL query params (`?to=Name&from=YourName`) or the built-in creator tool.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Server/Production**: Multi-stage Docker container with Nginx on Alpine Linux.
- **APIs**: Open-Meteo Weather API, Nominatim OpenStreetMap Geocoding.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- Node.js (version 20 or higher recommended)
- npm, yarn, or pnpm

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
```

This compiles optimized static assets into the `dist/` folder.

### 4. Run Lint & Type Check

```bash
npm run lint
```

---

## 🐳 Docker Deployment Process

The project includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml`.

### Architecture

```
[Source Code] ──> [Stage 1: node:20-alpine] ──(npm run build)──> [dist/]
                                                                    │
[nginx.conf]  ──> [Stage 2: nginx:alpine]  <───────────────────────┘
                       │
                  Serves on Port 80 (Lightweight ~25MB image)
```

### Method 1: Deploy with Docker Compose (Recommended)

To build and run the container in detached mode:

```bash
docker compose up --build -d
```

- **URL**: [http://localhost:3000](http://localhost:3000)
- **Check logs**:
  ```bash
  docker compose logs -f
  ```
- **Stop the application**:
  ```bash
  docker compose down
  ```

---

### Method 2: Deploy with Docker CLI

#### 1. Build the Docker Image

```bash
docker build -t say-yes-app .
```

#### 2. Run the Container

```bash
docker run -d -p 3000:80 --name say-yes-app-container say-yes-app
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

#### 3. Useful Docker Commands

- **View running containers**:
  ```bash
  docker ps
  ```
- **Follow container logs**:
  ```bash
  docker logs -f say-yes-app-container
  ```
- **Stop container**:
  ```bash
  docker stop say-yes-app-container
  ```
- **Remove container**:
  ```bash
  docker rm say-yes-app-container
  ```

---

## ☁️ Cloud Deployment

### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/say-yes-app
gcloud run deploy say-yes-app --image gcr.io/YOUR_PROJECT_ID/say-yes-app --platform managed --port 80 --allow-unauthenticated
```

### DigitalOcean / Render / AWS ECS
Point your repository to Dockerfile deployment. The container exposes port `80` with SPA routing enabled out of the box.

---

## 📄 License

MIT License — Feel free to customize and share with someone special! 💕
