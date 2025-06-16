import anime from 'animejs/lib/anime.es.js';  // Ensure anime.js is imported
import emojiRegex from 'emoji-regex';
const animateBotReply = (id) => {
  const replyElement = document.querySelector(`#message-${id}`);
  if (replyElement) {
    anime({
      targets: replyElement,
      opacity: [0, 1],         // Fade-in effect
      translateY: [50, 0],     // Slide in from below
      duration: 700,           // Smooth animation
      easing: "easeInOutCubic",
    });
  }
};
function generateSessionId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
function getSessionId() {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('session_id', sessionId);
    console.log('New session created:', sessionId);
  } else {
    console.log('Existing session:', sessionId);
  }

  return sessionId;
}


async function getVisitorIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log("Visitor's IP address:", data.ip); // Correctly log the IP address
    return data.ip; // Return only the IP address

  } catch (error) {
    console.error("Error fetching IP address:", error);
    return null;
  }
}


const splitMessage = (text) => {
  const regex = emojiRegex();
  const chunks = [];
  let start = 0;
  const sentenceEndRegex = /([.!?])(\s?|$)/;
  while (start < text.length) {
    let sentenceEnd = text.slice(start).search(sentenceEndRegex);

    if (sentenceEnd !== -1) {
      let end = start + sentenceEnd + 1;
      const emojiMatch = text.slice(start + sentenceEnd).match(regex);
      if (emojiMatch) {
        const emoji = emojiMatch[0];
        const emojiIndex = text.indexOf(emoji, start);
        if (/\d️⃣/.test(emoji)) {
          const beforeEmoji = text.substring(start, emojiIndex).trim();
          const afterEmoji = text.substring(emojiIndex, emojiIndex + emoji.length).trim();
          const nextSentenceEnd = text.slice(emojiIndex).search(sentenceEndRegex);
          if (beforeEmoji) {
            chunks.push(beforeEmoji);
          }
          if (nextSentenceEnd !== -1) {
            const emojiChunkEnd = emojiIndex + nextSentenceEnd + 1;
            const emojiChunk = text.substring(emojiIndex, emojiChunkEnd).trim();
            chunks.push(emojiChunk);
            start = emojiChunkEnd;
          } else {
            chunks.push(afterEmoji);
            start = emojiIndex + emoji.length;
          }
          continue;
        } else {
          const emojiChunk = text.substring(start, emojiIndex + emoji.length).trim();
          chunks.push(emojiChunk);
          start = emojiIndex + emoji.length;
          continue;
        }
      }
      chunks.push(text.substring(start, end).trim());
      start = end;
    } else {
      chunks.push(text.slice(start).trim());
      break;
    }
  }
  return chunks;
};
const fetchBotReply = async (message) => {
  const zoneTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" });
  const ip = await getVisitorIp();
  const data = {
    session_id: getSessionId(),
    message,
    Zone: "Asia/Karachi",
    zoneTime,
    ip: ip || "IP not available",
  };
  console.log("Sending data to the bot:", data);
  const response = await fetch(import.meta.env.VITE_CHAT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to fetch bot reply");
  return response.json();
};
const fetchControlPanelSettings = async (bot_type) => {
  try {
    const apiUrl = `https://bot.devspandas.com/api/panel/control-panel-settings?bot_type=${bot_type}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const data = await response.json();
    // debugger
    console.log("123 Control Panel Settings:", data);
    return data;
  } catch (error) {
    console.error("Error fetching control panel settings:", error);
  }
};
export { animateBotReply, getSessionId, getVisitorIp, splitMessage, fetchBotReply, fetchControlPanelSettings };
