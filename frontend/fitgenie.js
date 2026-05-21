// ===== HUGGING FACE FREE API - FIXED =====
const HF_API_KEY = "";

const fitgenieToggle = document.getElementById("fitgenieToggle");
const fitgeniePanel = document.getElementById("fitgeniePanel");
const fitgenieBody = document.getElementById("fitgenieBody");
const fitgenieInput = document.getElementById("fitgenieInput");
const fitgenieSend = document.getElementById("fitgenieSend");

// Open/Close Chat
fitgenieToggle.addEventListener("click", () => {
    fitgeniePanel.classList.toggle("active");
    if (fitgeniePanel.classList.contains("active")) {
        fitgenieInput.focus();
    }
});

// Add Message Function
function addMessage(text, sender) {
    const message = document.createElement("div");
    message.classList.add("fitgenie-message");
    message.classList.add(sender);
    message.textContent = text;
    fitgenieBody.appendChild(message);
    fitgenieBody.scrollTop = fitgenieBody.scrollHeight;
}

// Send Message
function sendMessage() {
    const text = fitgenieInput.value.trim();
    if (text === "") return;

    addMessage(text, "user");
    fitgenieInput.value = "";
    
    // Show loading indicator
    addMessage("⏳ Thinking...", "bot");
    
    botReply(text);
}

// AI Response with Hugging Face API - CORRECTED
async function botReply(userMessage) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            {
                headers: { 
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: `You are FitGenie AI, a professional fitness coach for EnerGise gym. Answer fitness questions with actionable advice. Keep it concise and helpful.

User Question: ${userMessage}

Answer:`,
                })
            }
        );

        const result = await response.json();
        console.log("API Response:", result); // Debug log
        
        // Remove loading message
        const messages = fitgenieBody.querySelectorAll(".fitgenie-message.bot");
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }

        let botMessage = "Sorry, couldn't generate response. Try again!";
        
        // FIX: Correct way to extract response from Hugging Face
        if (result && result[0] && result[0].generated_text) {
            // Extract only the answer part (after "Answer:")
            const fullText = result[0].generated_text;
            const answerPart = fullText.split("Answer:")[1];
            
            if (answerPart) {
                botMessage = answerPart.trim();
            } else {
                botMessage = fullText.trim();
            }
        } else if (result.error) {
            botMessage = `⚠️ Error: ${result.error}`;
        }

        addMessage(botMessage, "bot");

    } catch (error) {
        console.error("API Error:", error);
        
        // Remove loading message
        const messages = fitgenieBody.querySelectorAll(".fitgenie-message.bot");
        if (messages.length > 0) {
            messages[messages.length - 1].remove();
        }
        
        addMessage("⚠️ Connection error. Check your internet or try again!", "bot");
    }
}

// Event Listeners
fitgenieSend.addEventListener("click", sendMessage);
fitgenieInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});