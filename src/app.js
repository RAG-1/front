const chatContainer = document.getElementById("chat-container");
const messageForm = document.getElementById("message-form");
const userInput = document.getElementById("user-input");
const languageSelector = document.getElementById("language-selector");

// We'll read the API endpoint from an environment variable
const BASE_URL = process.env.API_ENDPOINT;
const url = `${BASE_URL}/chat`;
// This will be replaced at build time by Parcel with the appropriate value
// from the corresponding .env file.

function createMessageBubble(content, sender = "user") {
  const wrapper = document.createElement("div");

  if (sender === "user") {
    wrapper.className = "mb-6 flex flex-row-reverse items-start justify-end space-x-3 space-x-reverse";
  } else {
    wrapper.className = "mb-6 flex items-start justify-start space-x-3";
  }

  const bubble = document.createElement("div");
  bubble.className = "max-w-full md:max-w-2xl p-3 rounded-lg whitespace-pre-wrap leading-relaxed shadow-sm bubble-appear";
  if (sender === "user") {
    bubble.classList.add("bg-gray-200", "text-gray-900", "ml-auto");
  } else {
    bubble.classList.add("bg-pink-600", "text-white");
  }
  bubble.textContent = content;

if (sender === "assistant") {
  const avatar = document.createElement("div");
  avatar.className =
    "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold bg-gradient-to-br from-green-400 to-green-600 overflow-hidden";
  const img = document.createElement("img");
  img.src = "./src/assets/avatar.jpg";
  img.alt = "avatar";
  img.className = "w-full h-full object-cover";
  avatar.appendChild(img);
  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
} else {
  wrapper.appendChild(bubble);
}
  setTimeout(() => {
    bubble.classList.add("bubble-appear-active");
  }, 10);

  return wrapper;
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function getAssistantResponse(userMessage, codeLanguage) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userMessage,
      language: codeLanguage,
    }),  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.reply;
}

messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  const selectedLanguage = languageSelector.value;
  if (!message) return;
  if (!selectedLanguage) {
    alert("언어를 선택하세요!");
    return;
  }

  chatContainer.appendChild(createMessageBubble(message, "user"));
  userInput.value = "";
  scrollToBottom();

  try {
    const response = await getAssistantResponse(message, selectedLanguage);
    chatContainer.appendChild(createMessageBubble(response, "assistant"));
    scrollToBottom();
  } catch (error) {
    console.error("Error fetching assistant response:", error);
    chatContainer.appendChild(
      createMessageBubble(
        "Error fetching response. Check console.",
        "assistant"
      )
    );
    scrollToBottom();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  chatContainer.appendChild(
    createMessageBubble('안녕하세요. 당신의 코드를 트렌드하게 바꿔줄 "델타캐처"입니다!', "assistant")
  );
  scrollToBottom();
});