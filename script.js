/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

const workerURL = "https://loreal-worker.wcummings1.workers.dev/";

// Track full conversation context
const messages = [
  {
    role: "system",
    content: `
      You are a helpful and polite beauty assistant for L’Oréal.
      You can answer questions about L’Oréal products, skincare and haircare routines, makeup recommendations, and beauty-related advice.
      If a user asks anything unrelated to beauty, gently decline and suggest a related topic.
      Try to remember the user's name and preferences if provided.
    `,
  },
];

// Optional: Store user name if collected
let userName = "";

// Initial greeting
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! I'm your L’Oréal beauty advisor. What can I help you with today?</div>`;

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to context
  messages.push({ role: "user", content: message });

  // Display user message
  appendMessage("user", message);
  userInput.value = "";

  // Show "thinking" message
  appendMessage("ai", "🤔 Thinking...");

  try {
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();
    const aiReply =
      data.choices?.[0]?.message?.content || "Sorry, I didn’t understand that.";

    // Replace thinking message with AI reply
    replaceLastMessage("ai", aiReply);

    // Add AI reply to context
    messages.push({ role: "assistant", content: aiReply });

    // Optional: Capture user name if mentioned
    if (!userName && /my name is (\w+)/i.test(message)) {
      userName = message.match(/my name is (\w+)/i)[1];
    }
  } catch (err) {
    console.error("API error:", err);
    replaceLastMessage(
      "ai",
      "⚠️ Oops! Something went wrong. Please try again later."
    );
  }
});

/* Append message to chat */
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Replace last AI message (e.g., "Thinking...") */
function replaceLastMessage(sender, newText) {
  const messages = chatWindow.querySelectorAll(`.msg.${sender}`);
  const lastMsg = messages[messages.length - 1];
  if (lastMsg) {
    lastMsg.textContent = newText;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}
