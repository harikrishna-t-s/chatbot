```
 ██████╗ █████╗ ██████╗ ██████╗ ██╗███╗   ██╗ █████╗ ██╗      ██████╗██╗  ██╗ █████╗ ████████╗
██╔════╝██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║██╔══██╗██║     ██╔════╝██║  ██║██╔══██╗╚══██╔══╝
██║     ███████║██████╔╝██║  ██║██║██╔██╗ ██║███████║██║     ██║     ███████║███████║   ██║   
██║     ██╔══██║██╔══██╗██║  ██║██║██║╚██╗██║██╔══██║██║     ██║     ██╔══██║██╔══██║   ██║   
╚██████╗██║  ██║██║  ██║██████╔╝██║██║ ╚████║██║  ██║███████╗╚██████╗██║  ██║██║  ██║   ██║   
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
```

<div align="center">

**A full-stack AI chatbot workshop — built for the classroom, designed for the curious.**

![Python](https://img.shields.io/badge/Python-3.8+-8B0000?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.3-8B0000?style=flat-square&logo=flask&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Router-8B0000?style=flat-square&logo=huggingface&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-8B0000?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Educational-8B0000?style=flat-square)

</div>

---

## Overview

**Cardinal Chat** is a three-part educational platform built around a single premise: teaching first-semester students how frontend and backend code communicate, by having them build a real, working AI chatbot.

The stack is intentionally minimal — no databases, no frontend frameworks, no build pipelines. Only clean, readable, annotated code that a beginner can follow line by line, and two companion sites that explain every concept involved.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Cardinal Chat — System Map                          │
├──────────────────┬──────────────────────────────┬───────────────────────────┤
│  learning-site   │       chatbot-project         │      teaching-site        │
│  port 8080       │       port 5000               │      port 8081            │
│                  │                               │                           │
│  Student         │  Browser ──(fetch/JSON)──►    │  Instructor               │
│  self-study      │  Flask  ──(OpenAI schema)──►  │  field guide              │
│  platform        │  Hugging Face Router          │  (17 sections)            │
└──────────────────┴──────────────────────────────┴───────────────────────────┘
```

A message travels through **five hops**:

```
  [1] User types      →   [2] JavaScript fetch()   →   [3] Flask /chat route
  [4] Hugging Face Router  →  [5] Reply rendered in DOM
```

Session memory (Flask cookies) carries the full conversation context into every API call, giving the model a coherent thread to reason from.

---

## Repository Structure

```
chatbot/
│
├── docker-compose.yaml        ←  Orchestrates all three services
├── .dockerignore
│
├── chatbot-project/           ←  The Flask backend + chat UI
│   ├── app.py                 ←  Routes, session memory, HF API client
│   ├── requirements.txt       ←  Flask · requests · python-dotenv
│   ├── Dockerfile
│   ├── templates/
│   │   └── index.html         ←  Chat interface
│   └── static/
│       ├── style.css          ←  Red & white design token system
│       └── script.js          ←  Fetch, DOM render, typing indicator
│
├── learning-site/             ←  Student adventure lab (self-study)
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── teaching-site/             ←  Instructor companion field guide
    ├── index.html
    ├── style.css
    └── script.js
```

---

## The Three Services

### `chatbot-project` — The Application

The core of the workshop. A Python/Flask server that:

- Receives messages from the browser via `POST /chat`
- Maintains conversation context using Flask session cookies (last 10 turns)
- Forwards the full history to Hugging Face's OpenAI-compatible inference router
- Returns the model's reply as JSON for the frontend to render

The model is fully configurable — swap `MODEL_NAME` in `.env` to target any chat model on the Hub with no code changes.

### `learning-site` — Student Self-Study Platform

An interactive, gamified learning site for absolute beginners. No server required — open `index.html` and it runs. Covers the full conceptual ladder from hardware and files, through the DOM and HTTP, up to LLM inference and API keys. Progress is persisted in `localStorage`.

### `teaching-site` — Instructor Field Guide

A polished, 17-section single-page site designed to be handed to students after the workshop session. It walks through every concept encountered during the build — with animated diagrams, a replayable `fetch()` walkthrough, inline quizzes, and a full message-journey sequence diagram.

---

## Running the Stack

Prerequisites: [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/).

**1. Configure the chatbot environment**

```bash
cp chatbot-project/.env.example chatbot-project/.env
```

Open `.env` and set your credentials:

```env
HF_API_KEY=your_hugging_face_access_token
MODEL_NAME=HuggingFaceH4/zephyr-7b-beta
FLASK_SECRET_KEY=replace-with-a-random-string
```

Obtain a free access token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) — a **Read** role token is sufficient.

**2. Start all services**

```bash
docker compose up --build
```

**3. Open in your browser**

| Service | URL |
|---|---|
| Chat Application | http://localhost:5000 |
| Student Study Site | http://localhost:8080 |
| Instructor Field Guide | http://localhost:8081 |

To stop: `Ctrl+C`, then `docker compose down`.

---

## Running Without Docker

If you prefer a local Python environment:

```bash
cd chatbot-project
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in your credentials
python app.py
```

The learning and teaching sites require no server — open their `index.html` files directly in a browser.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.8+, Flask 3.0.3 |
| AI Inference | Hugging Face Inference Router (OpenAI-compatible) |
| Session Memory | Flask server-side sessions (signed cookies) |
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES2020) |
| Containerisation | Docker, Docker Compose |
| Static Hosting | nginx:alpine |

---

## Swapping the Model

No code changes required. Edit `chatbot-project/.env`:

```env
MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.2
```

Restart the container and the new model is live. Any text-generation model on the Hugging Face Hub that supports the `v1/chat/completions` interface is compatible.

---

## Design

The visual identity across all three services follows a **cardinal red and white** academic palette. Design tokens are centralised in each service's `style.css` `:root` block — the entire colour scheme can be retuned from a single location without modifying layout or component styles.

---

## License

Distributed for **educational and training purposes**. Free to modify, reuse, and adapt for classroom curriculum, workshops, and self-directed learning.
