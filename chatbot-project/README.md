# ⛩️ Cardinal Chat (Flask + Hugging Face)

A minimal, beginner-friendly full-stack AI chatbot designed for first-semester students. Built using **Python (Flask)** on the backend, **vanilla HTML/CSS/JavaScript** on the frontend, and the **Hugging Face Inference Router** (OpenAI-compatible) for AI responses.

This project is tailored to teach how frontend client code and backend server code communicate. It features **no databases, no complex build tools, and no frontend frameworks** — just clean, readable, well-commented code aligned with the accompanying interactive **Field Guide**.

---

## ✦ Project Architecture & Flow

```
[ Browser (Client) ] <====== (JSON via Fetch) ======> [ Flask Server (Backend) ] <====== (OpenAI Schema) ======> [ Hugging Face Router ]
```

1. **User Input**: A user types a message and clicks **Send** or presses **Enter**.
2. **AJAX Request**: JavaScript sends the message to the Flask server via `fetch()` to `/chat`.
3. **Session Memory**: Flask stores the message in a session list (cookie) to keep track of the conversation context.
4. **AI API Call**: Flask forwards the context history to the Hugging Face Inference Router (`v1/chat/completions`) using the standardized message format.
5. **AI Response**: The model generates a reply, which Flask returns to the browser.
6. **DOM Render**: JavaScript displays the reply in the chat window and scrolls down automatically.
7. **Resetting Context**: Clicking **Clear** sends a request to `/clear` which removes the session history, allowing students to start a fresh conversation.

---

## ✦ Key Features

*   **Academic Red & White Theme**: A clean, elegant, minimal design built on a CSS design token system.
*   **Conversation Memory**: Remembers context across turns using Flask session cookies.
*   **Standardized API Endpoint**: Calls Hugging Face using the industry-standard OpenAI chat completions format.
*   **Fail-Fast Startup Checks**: Proactively warns students in the terminal at startup if `.env` or `HF_API_KEY` is missing.
*   **Resilient Error Handling**: JavaScript distinguishes between network connection failures and backend server crashes (Status 500 HTML tracebacks).
*   **Bouncing Typing Indicator**: Visual feedback while waiting for responses.
*   **Input Lockout**: Disables button and field inputs to prevent spamming during active requests.
*   **Context Resetting**: A minimal "Clear" button in the header resets session memory.

---

## ✦ Folder Structure

```
chatbot-project/
│
├── app.py                # Flask backend server (routes, session memory, HF API router)
├── requirements.txt       # Python dependencies (Flask, python-dotenv, requests)
├── README.md               # This documentation guide
├── .env.example            # Environment variables template file
├── .gitignore               # Directs Git to ignore local configurations (.env, venv)
│
├── templates/
│   └── index.html          # Main HTML structure
│
├── static/
│   ├── style.css            # Custom CSS variables, typography, and layout rules
│   └── script.js            # Frontend JavaScript event listeners and Fetch API calls
│
└── learning-site/          # Companion Field Guide (interactive student manual)
    ├── index.html          # 17-section student curriculum guide
    ├── style.css            # Design tokens and layout stylesheet
    └── script.js            # Scrollspy navigation, quizzes, and animations
```

---

## ✦ Requirements

*   **Python 3.8+**
*   A free **Hugging Face Account** (to obtain a Read Access Token)
*   An active internet connection to contact the model API

---

## ✦ Installation & Setup

### 1. Initialize Project Directory
Verify that your folder structure matches the layout detailed above.

### 2. Configure a Virtual Environment
A virtual environment keeps project dependencies isolated.

**Windows Terminal / CMD:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux Terminal:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You will see `(venv)` prepended to your command line prompt when successful.

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create the Local `.env` Configuration File
Copy the provided `.env.example` file to create your local variables:

**Windows:**
```bash
copy .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Open `.env` in your text editor and fill in your details:
```env
HF_API_KEY=your_actual_api_key_here
MODEL_NAME=HuggingFaceH4/zephyr-7b-beta
```

### 5. Fetch Your Hugging Face Access Token
1. Register or log in at [huggingface.co](https://huggingface.co).
2. Go to **Settings ➜ Access Tokens** ([huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).
3. Select **"New token"**, choose the **"Read"** role, name your token, and click generate.
4. Copy the key and paste it as the `HF_API_KEY` value inside your `.env` file.

---

## ✦ Running the Application

With your virtual environment active, run the server:

```bash
python app.py
```

The console will perform startup checks and print the following status:

```
--------------------------------------------------
🚀 Starting Simple AI Chatbot Backend server...
✅ Environment check passed: '.env' and API key loaded.
🤖 Configured Model: HuggingFaceH4/zephyr-7b-beta
👉 Serving web app at: http://127.0.0.1:5000
--------------------------------------------------
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## ✦ Swapping the AI Model

This project is built to allow seamless model swapping. You do not need to rewrite any code to test a new model:

1. Open your `.env` file.
2. Edit `MODEL_NAME` to any text generation model hosted on the Hugging Face Hub (e.g. `mistralai/Mistral-7B-Instruct-v0.2`).
3. Save the file and restart the Flask server (`Ctrl+C` then `python app.py`).

*Note: Some models may require accepting terms of use on their Hugging Face model pages before API tokens can invoke them.*

---

## ✦ Troubleshooting & Diagnostics

| Symptom | Probable Cause | Action |
|---|---|---|
| Startup warning regarding missing key | Env file missing or incomplete | Re-verify that `.env` exists and contains `HF_API_KEY` |
| Bouncing indicator stays forever | API is loading a cold model (503) | Wait 15-30 seconds for the serverless container to boot up and try again |
| Red text bubble indicating Status 500 | Python code crashed during execution | Look at your terminal console running Flask for the traceback error |
| Red text indicating Network Error | Flask server is not running | Verify the server is running on `http://127.0.0.1:5000` |
| JavaScript fails to trigger on page | Script file not loaded | Check browser console (F12) to verify `static/script.js` exists |

---

## ✦ Suggested Curriculum Extensions

Once students are comfortable with the core architecture, encourage them to build these upgrades:
1. **Developer Tools Hunt**: Instruct students to open DevTools (**F12**), visit the Network tab, send a chat message, and inspect the JSON response payload.
2. **Temperature Adjustments**: Expose temperature in the `.env` configuration, load it in `app.py`, and inspect how the responses become more rigid (0.1) or creative (1.0).
3. **Persistent History**: Replace Flask's in-memory session cookies with a lightweight SQLite database file to keep history saved even when the browser is closed.

---

## ✦ License

This repository is distributed for **educational and training purposes**. You are free to modify, reuse, and share it for classroom curriculum, workshops, and individual learning.
