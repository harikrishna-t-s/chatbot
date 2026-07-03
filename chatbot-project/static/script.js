/*
  script.js
  ---------
  This file controls the FRONTEND behavior of our chatbot:
    - Sending the user's message to the backend (Flask server)
    - Displaying messages in the chat window
    - Showing a "typing" indicator while waiting for a reply
    - Handling errors gracefully (distinguishing between network and server crashes)
    - Auto-scrolling to the latest message
    - Allowing "Enter" key to send messages
    - Clearing chat history via Flask session reset
*/

// ---------------------------------------------------------------------
// STEP 1: Grab references to the HTML elements we need to work with
// ---------------------------------------------------------------------

const chatHistory = document.getElementById("chat-history");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const clearButton = document.getElementById("clear-button");
const typingIndicator = document.getElementById("typing-indicator");


// ---------------------------------------------------------------------
// STEP 2: Helper function -> Add a message bubble to the chat window
// ---------------------------------------------------------------------

/**
 * Adds a new message bubble to the chat history.
 *
 * @param {string} text - The message text to display.
 * @param {string} sender - Who sent it: "user", "bot", or "error".
 */
function addMessage(text, sender) {
    // Create a new <div> element for the message bubble.
    const messageDiv = document.createElement("div");

    // Add CSS classes based on who sent the message.
    // This controls the color/alignment via style.css.
    if (sender === "user") {
        messageDiv.classList.add("message", "user-message");
    } else if (sender === "error") {
        messageDiv.classList.add("message", "error-message");
    } else {
        messageDiv.classList.add("message", "bot-message");
    }

    // Wrap the text in a <p> tag for proper spacing/line-height.
    const paragraph = document.createElement("p");
    paragraph.textContent = text; // textContent avoids HTML injection (XSS protection)
    messageDiv.appendChild(paragraph);

    // Add the new message bubble to the chat history container.
    chatHistory.appendChild(messageDiv);

    // Scroll to the bottom so the newest message is always visible.
    scrollToBottom();
}


// ---------------------------------------------------------------------
// STEP 3: Helper function -> Auto-scroll to the latest message
// ---------------------------------------------------------------------

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}


// ---------------------------------------------------------------------
// STEP 4: Helper functions -> Show / hide the typing indicator
// ---------------------------------------------------------------------

function showTypingIndicator() {
    typingIndicator.classList.remove("hidden");
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.classList.add("hidden");
}


// ---------------------------------------------------------------------
// STEP 5: Main function -> Send the user's message to the backend
// ---------------------------------------------------------------------

async function sendMessage() {
    // Get the text from the input box and remove extra whitespace.
    const message = userInput.value.trim();

    // Validation: don't send empty messages
    if (message === "") {
        return; // Do nothing if the input is empty
    }

    // Display the user's message immediately in the chat window.
    addMessage(message, "user");

    // Clear the input box so the user can type a new message.
    userInput.value = "";

    // Disable the input and buttons while we wait for a response.
    // This prevents the user from spamming multiple requests at once.
    userInput.disabled = true;
    sendButton.disabled = true;
    clearButton.disabled = true;

    // Show the animated typing indicator (three bouncing dots).
    showTypingIndicator();

    try {
        // Send a POST request to our Flask backend's "/chat" endpoint.
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message }),
        });

        // Hide the typing indicator now that we have a response.
        hideTypingIndicator();

        // Check if the response content is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            // If the response is HTML, the server likely crashed and returned a Flask traceback.
            addMessage(
                `⚠️ Server Error (Status ${response.status}): The backend returned HTML (a traceback or crash page) instead of JSON. Please check your server console!`,
                "error"
            );
            return;
        }

        // Convert the server's JSON response into a JavaScript object.
        const data = await response.json();

        if (response.ok) {
            // Success! Display the AI's reply.
            addMessage(data.reply, "bot");
        } else {
            // The server responded with an error status (400/500).
            // We still display the friendly message it sent us.
            addMessage(data.reply || "Something went wrong. Please try again.", "error");
        }

    } catch (error) {
        // This block runs if the fetch() call itself fails — usually
        // because of no internet connection or the server being down.
        hideTypingIndicator();
        addMessage(
            "⚠️ Network Error: Could not connect to the Flask server. Please make sure app.py is running and you have internet access.",
            "error"
        );
        console.error("Fetch connection error:", error);

    } finally {
        // Whatever happens, re-enable the input and buttons so the user can send another message.
        userInput.disabled = false;
        sendButton.disabled = false;
        clearButton.disabled = false;
        userInput.focus();
    }
}


// ---------------------------------------------------------------------
// STEP 6: Main function -> Clear the session history from the server
// ---------------------------------------------------------------------

async function clearChat() {
    if (!confirm("Are you sure you want to clear the conversation memory? This resets the AI's context.")) {
        return;
    }

    try {
        const response = await fetch("/clear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            // Clear all messages from the screen, keeping only a fresh welcome message.
            chatHistory.innerHTML = `
                <div class="message bot-message">
                    <p>Hi! I'm your AI assistant. How can I help you today? I'll remember our conversation context as long as this session is active.</p>
                </div>
            `;
            userInput.focus();
        } else {
            alert("Failed to clear chat session on the server.");
        }
    } catch (error) {
        console.error("Error clearing chat session:", error);
        alert("Network error: Could not reach the server to clear chat session.");
    }
}


// ---------------------------------------------------------------------
// STEP 7: Event listeners -> connect user actions to our functions
// ---------------------------------------------------------------------

// Send the message when the "Send" button is clicked.
sendButton.addEventListener("click", sendMessage);

// Clear the chat history when the "Clear" button is clicked.
clearButton.addEventListener("click", clearChat);

// Send the message when the user presses "Enter" in the input box.
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Stops any default form behavior (like reloading the page)
        sendMessage();
    }
});

// Automatically focus the input box when the page loads.
window.addEventListener("load", function () {
    userInput.focus();
});
