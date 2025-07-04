// 마크다운 파서 옵션: 한 줄 개행도 줄바꿈으로 보이게 설정
marked.setOptions({ breaks: true });

import avatarimg from "url:./assets/DeltaCat.png";

const chatContainer = document.getElementById("chat-container");
const messageForm = document.getElementById("message-form");
const userInput = document.getElementById("user-input");
const languageSelector = document.getElementById("language-selector");

// 환경변수에서 API 엔드포인트 읽기
const BASE_URL = process.env.API_ENDPOINT;
console.log("BASE_URL:", BASE_URL);
const url = `${BASE_URL}/chat`;


function createMessageBubble(content, sender = "user") {
  const wrapper = document.createElement("div");

  if (sender === "user") {
    wrapper.className = "mb-6 mr-6 flex flex-row-reverse items-end justify-end space-x-3 space-x-reverse";
  } else {
    wrapper.className = "mb-6 flex items-start justify-start space-x-3";
  }

  const bubble = document.createElement("div");
  bubble.className =
    (sender === "user" ? "user " : "assistant ") +
    "max-w-[60%] p-3 rounded-3xl leading-relaxed shadow-lg bubble-appear font-semibold text-base";
  if (sender === "user") {
    bubble.classList.add("bg-gray-200", "text-pink-500", "ml-auto", "whitespace-pre-line");
    bubble.textContent = content;
  } else {
    bubble.classList.add("bg-pink-400", "md:max-w-2xl", "text-white");

    function cleanMarkdown(content) {
      let temp = content.replace(/\\r\\n|\\n/g, '\n');
      const codeBlocks = [];
      const codeBlockPattern = /``````/g;
      temp = temp.replace(codeBlockPattern, (match) => {
        codeBlocks.push(match);
        return `__CODEBLOCK_${codeBlocks.length - 1}__`;
      });
      temp = temp.replace(/^[ \t]/gm, '');
      temp = temp.replace(/__CODEBLOCK_(\d+)__/g, (_, idx) => codeBlocks[idx]);

      return temp.trim();
    }

    // assistant 메시지: 마크다운 파싱 및 스타일 적용
    let cleanContent = cleanMarkdown(content);
    bubble.innerHTML = marked.marked(cleanContent);
  }

  // assistant 메시지에 아바타(고양이) 추가
  if (sender === "assistant") {
    const avatar = document.createElement("div");
    avatar.className =
      "avatar-cute w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden";
    const img = document.createElement("img");
    img.src = avatarimg
    img.alt = "avatar";
    img.className = "w-full h-full object-cover";
    avatar.appendChild(img);
    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
  } else {
    wrapper.appendChild(bubble);
  }

  // 버블 애니메이션 효과
  setTimeout(() => {
    bubble.classList.add("bubble-appear-active");
  }, 10);

  return wrapper;
}

// 채팅창을 항상 최신 메시지로 스크롤
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 백엔드에 질문을 보내고 assistant 응답을 받아오는 함수
async function getAssistantResponse(userMessage, codeLanguage) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: userMessage,
      language: codeLanguage,
    }),  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.reply;
}

// 메시지 전송 이벤트 핸들러
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
  userInput.style.height = "";
  scrollToBottom();

  try {
    const response = await getAssistantResponse(message, selectedLanguage);
    chatContainer.appendChild(createMessageBubble(response, "assistant"));
    console.log("Assistant response:", response);
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

// 페이지 로드시 첫인사 메시지 출력
window.addEventListener("DOMContentLoaded", () => {
  chatContainer.appendChild(
    createMessageBubble('안녕하세요. 당신의 코드를 트렌드하게 바꿔줄 "델타캐처"입니다!', "assistant")
  );
  scrollToBottom();
});

// 입력창 자동 높이 조절 및 엔터 입력 처리
const textarea = document.getElementById('user-input');

textarea.addEventListener('input', () => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
});

textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('message-form').requestSubmit();
  }
});