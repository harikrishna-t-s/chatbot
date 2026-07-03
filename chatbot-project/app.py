"""
app.py
------
This is the BACKEND of our simple AI chatbot.

What this file does (in plain English):
1. Starts a small web server using Flask.
2. Manages session memory (cookies) to help the chatbot remember the conversation.
3. Listens for chat messages and clear requests sent from the webpage.
4. Forwards the conversation history to the Hugging Face Inference Router in
   an industry-standard chat completion format.
5. Sends the reply back to the webpage so it can be displayed.
"""

# ---------------------------------------------------------------------------
# STEP 1: Import the libraries we need
# ---------------------------------------------------------------------------

import os                      # Lets us read environment variables (like our API key)
import requests                # Lets us make HTTP requests to the Hugging Face API
from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv  # Lets us load variables from a .env file


# ---------------------------------------------------------------------------
# STEP 2: Load and validate environment variables
# ---------------------------------------------------------------------------

load_dotenv()

# Read the Hugging Face API key from the environment.
HF_API_KEY = os.getenv("HF_API_KEY")

# Read which AI model we want to use. We default to a highly efficient open model.
MODEL_NAME = os.getenv("MODEL_NAME", "HuggingFaceH4/zephyr-7b-beta")

# This is the OpenAI-compatible Inference Router URL provided by Hugging Face.
# Using this standardized endpoint allows us to use the 'messages' format.
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"


# ---------------------------------------------------------------------------
# STEP 3: Create the Flask application
# ---------------------------------------------------------------------------

app = Flask(__name__)

# To use Flask sessions (cookies stored on the user's browser), we need a
# secret key. This key encrypts the session cookie so users cannot tamper with it.
app.secret_key = os.getenv("FLASK_SECRET_KEY", "chatbot-educational-secret-key-1092")


# ---------------------------------------------------------------------------
# STEP 4: Helper function -> Call the Hugging Face API
# ---------------------------------------------------------------------------

def ask_huggingface(messages_history):
    """
    Sends the conversation history list to Hugging Face's router and returns the reply.

    Parameters:
        messages_history (list): A list of dictionaries representing the chat history:
                                 [{"role": "user", "content": "hi"}, ...]

    Returns:
        str: The AI's reply text.
    """

    if not HF_API_KEY:
        raise Exception(
            "No Hugging Face API key found. Please add HF_API_KEY to your .env file."
        )

    # Standard API headers
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json",
    }

    # Standard OpenAI-compatible payload format
    payload = {
        "model": MODEL_NAME,
        "messages": messages_history,
        "max_tokens": 250,      # Limit the length of the reply
        "temperature": 0.7,     # Controls creativity (0.0 = deterministic, 1.0 = creative)
    }

    try:
        # Send a POST request to the router
        response = requests.post(
            HF_API_URL, headers=headers, json=payload, timeout=30
        )

    except requests.exceptions.ConnectionError:
        raise Exception(
            "Could not connect to the internet. Please check your network connection."
        )

    except requests.exceptions.Timeout:
        raise Exception(
            "The AI server took too long to respond. Please try again in a moment."
        )

    # Check the HTTP status code
    if response.status_code == 401:
        raise Exception("Invalid Hugging Face API key. Please check your .env file.")
    elif response.status_code == 503:
        raise Exception("The AI model is still loading on the server. Please try again in a few seconds.")
    elif response.status_code != 200:
        raise Exception(f"Hugging Face API returned error status: {response.status_code}")

    try:
        data = response.json()
    except ValueError:
        raise Exception("Received an invalid response format from the AI server.")

    # Check for direct errors sent in the payload
    if isinstance(data, dict) and "error" in data:
        raise Exception(f"AI model error: {data['error']}")

    # Parse the standardized OpenAI chat completion response
    try:
        reply_text = data["choices"][0]["message"]["content"].strip()
        if not reply_text:
            reply_text = "I received your message, but generated an empty response. Try asking something else."
        return reply_text
    except (KeyError, IndexError, TypeError):
        raise Exception("Unexpected JSON structure returned from the AI model.")


# ---------------------------------------------------------------------------
# STEP 5: Define the ROUTES (URLs) our app responds to
# ---------------------------------------------------------------------------

@app.route("/")
def home():
    """
    GET /
    Serves the main frontend page (templates/index.html).
    """
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    """
    POST /chat
    Receives user input as JSON, stores it in session context, contacts the LLM,
    stores the assistant response, and returns the response.
    """
    data = request.get_json(silent=True)

    if not data or "message" not in data:
        return jsonify({"reply": "Error: No message field found in request."}), 400

    user_message = data["message"].strip()

    if user_message == "":
        return jsonify({"reply": "Please type a message before sending."}), 400

    # Retrieve existing chat history from the session, or start a new empty list.
    chat_history = session.get("chat_history", [])

    # Append the new user message to our history.
    chat_history.append({"role": "user", "content": user_message})

    # Keep conversation history to a reasonable length (e.g. last 10 messages)
    # to avoid blowing up the token context window.
    if len(chat_history) > 10:
        chat_history = chat_history[-10:]

    # Log variables to the server terminal to help students visualize the backend
    print(f"\n📥 [Frontend -> Backend] Received User Message: '{user_message}'")
    print(f"💬 [Session context] Size: {len(chat_history)} messages.")

    try:
        # Call the model passing the FULL conversation history
        reply_text = ask_huggingface(chat_history)

        # Append the AI's reply to the history so it remembers it in the next turn
        chat_history.append({"role": "assistant", "content": reply_text})
        
        # Save the updated history back into the session
        session["chat_history"] = chat_history
        session.modified = True

        print(f"📤 [Backend -> Frontend] Generated AI Reply: '{reply_text[:60]}...'")
        return jsonify({"reply": reply_text})

    except Exception as error:
        print(f"❌ [Backend Error] {error}")
        return jsonify({"reply": f"⚠️ {str(error)}"}), 500


@app.route("/clear", methods=["POST"])
def clear():
    """
    POST /clear
    Clears the session cookie's conversation memory.
    """
    session.pop("chat_history", None)
    print("\n🧹 [Backend Session] Conversation history cleared.")
    return jsonify({"status": "cleared"})


# ---------------------------------------------------------------------------
# STEP 6: Startup checks & Run the application
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Proactive startup checks for debugging
    print("--------------------------------------------------")
    print("🚀 Starting Simple AI Chatbot Backend server...")
    
    if not os.path.exists(".env"):
        print("⚠️  WARNING: '.env' file not found! Copy '.env.example' to '.env'.")
    elif not os.getenv("HF_API_KEY"):
        print("⚠️  WARNING: 'HF_API_KEY' is empty in '.env'. The chatbot cannot fetch responses!")
    else:
        print("✅ Environment check passed: '.env' and API key loaded.")
    
    print(f"🤖 Configured Model: {MODEL_NAME}")
    print("👉 Serving web app at: http://127.0.0.1:5000")
    print("--------------------------------------------------")

    app.run(host="0.0.0.0",debug=True, port=5000)
