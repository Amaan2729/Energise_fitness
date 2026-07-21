// =========================================================
// FitGenie — frontend chat widget
// Talks to OUR OWN backend (backend/routes/fitgenieRoutes.js),
// which securely calls the Groq API. No API key lives here.
// =========================================================

const FITGENIE_ENDPOINT = "/api/fitgenie/chat";

const fitgenieToggle = document.getElementById("fitgenieToggle");
const fitgeniePanel = document.getElementById("fitgeniePanel");
const fitgenieBody = document.getElementById("fitgenieBody");
const fitgenieInput = document.getElementById("fitgenieInput");
const fitgenieSend = document.getElementById("fitgenieSend");

let conversationHistory = [];
const MAX_HISTORY_TURNS = 12;

fitgenieToggle.addEventListener("click", () => {
  fitgeniePanel.classList.toggle("active");
  if (fitgeniePanel.classList.contains("active")) {
    fitgenieInput.focus();
  }
});

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.classList.add("fitgenie-message", sender);
  message.textContent = text;
  fitgenieBody.appendChild(message);
  fitgenieBody.scrollTop = fitgenieBody.scrollHeight;
  return message;
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.classList.add("fitgenie-message", "bot", "fitgenie-typing");
  typing.innerHTML = `<span></span><span></span><span></span>`;
  fitgenieBody.appendChild(typing);
  fitgenieBody.scrollTop = fitgenieBody.scrollHeight;
  return typing;
}

function setInputDisabled(disabled) {
  fitgenieInput.disabled = disabled;
  fitgenieSend.disabled = disabled;
}

async function sendMessage() {
  const text = fitgenieInput.value.trim();
  if (text === "") return;

  addMessage(text, "user");
  fitgenieInput.value = "";
  setInputDisabled(true);

  const typingBubble = showTypingIndicator();

  try {
    const response = await fetch(FITGENIE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: conversationHistory
      })
    });

    const data = await response.json().catch(() => ({}));

    typingBubble.remove();

    if (!response.ok) {
      addMessage(
        data.message || "Something went wrong. Please try again.",
        "bot"
      );
      return;
    }

    const botReply = data.reply || "Sorry, I couldn't generate a response. Try again!";
    addMessage(botReply, "bot");

    conversationHistory.push({ role: "user", content: text });
    conversationHistory.push({ role: "assistant", content: botReply });
    conversationHistory = conversationHistory.slice(-MAX_HISTORY_TURNS * 2);
  } catch (error) {
    console.error("FitGenie request failed:", error);
    typingBubble.remove();
    addMessage("⚠️ Connection error. Check your internet or try again!", "bot");
  } finally {
    setInputDisabled(false);
    fitgenieInput.focus();
  }
}

fitgenieSend.addEventListener("click", sendMessage);
fitgenieInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});