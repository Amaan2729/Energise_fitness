// ===== FITGENIE AI CHATBOT =====

const fitgenieToggle =
document.getElementById("fitgenieToggle");

const fitgeniePanel =
document.getElementById("fitgeniePanel");

const fitgenieBody =
document.getElementById("fitgenieBody");

const fitgenieInput =
document.getElementById("fitgenieInput");

const fitgenieSend =
document.getElementById("fitgenieSend");

/* =========================
   OPEN / CLOSE CHAT
========================= */

fitgenieToggle.addEventListener(
    "click",
    () => {

        fitgeniePanel.classList.toggle(
            "active"
        );

        if(
            fitgeniePanel.classList.contains(
                "active"
            )
        ){

            fitgenieInput.focus();

        }

    }
);

/* =========================
   ADD MESSAGE
========================= */

function addMessage(
    text,
    sender
){

    const message =
    document.createElement("div");

    message.classList.add(
        "fitgenie-message"
    );

    message.classList.add(
        sender
    );

    message.textContent = text;

    fitgenieBody.appendChild(
        message
    );

    fitgenieBody.scrollTop =
    fitgenieBody.scrollHeight;

}

/* =========================
   SEND MESSAGE
========================= */

function sendUserMessage(){

    const text =
    fitgenieInput.value.trim();

    if(!text) return;

    addMessage(
        text,
        "user"
    );

    fitgenieInput.value = "";

    botReply(text);

}

/* =========================
   AI BOT REPLY
========================= */

async function botReply(
    userMessage
){

    addMessage(
        "⏳ Thinking...",
        "bot"
    );

    try{

        const response =
        await fetch(
            "https://energise.onrender.com/api/chat",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({
                    message:userMessage
                })
            }
        );

        const data =
        await response.json();

        /* REMOVE THINKING */

        const thinking =
        document.querySelectorAll(
            ".fitgenie-message.bot"
        );

        if(thinking.length > 0){

            thinking[
                thinking.length - 1
            ].remove();

        }

        addMessage(
            data.reply ||
            "No response received",
            "bot"
        );

    }

    catch(error){

        console.error(error);

        const thinking =
        document.querySelectorAll(
            ".fitgenie-message.bot"
        );

        if(thinking.length > 0){

            thinking[
                thinking.length - 1
            ].remove();

        }

        addMessage(
            "⚠️ AI server unavailable",
            "bot"
        );

    }

}

/* =========================
   EVENTS
========================= */

fitgenieSend.addEventListener(
    "click",
    sendUserMessage
);

fitgenieInput.addEventListener(
    "keypress",
    (e) => {

        if(e.key === "Enter"){

            e.preventDefault();

            sendUserMessage();

        }

    }
);