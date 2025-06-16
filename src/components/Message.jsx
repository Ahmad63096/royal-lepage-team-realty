import { useState, useRef, useEffect } from "react";
import powerby from "./assets/images/footerlogo.png";
import Svg, { Emoji } from "./Svg";
import typing from "./assets/images/typing.gif";
import { animateBotReply, fetchBotReply, splitMessage } from "./Function";
import EmojiPicker from "../../node_modules/emoji-picker-react"

function Message() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingSent, setWaitingSent] = useState(false);
  const [thankYouSent, setThankYouSent] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const timers = useRef({ waiting: null, thankYou: null });

  const getTimestamp = () => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "pm" : "am";
    return `${hours}:${minutes} ${ampm}`;
  };

  const getUniqueMessageId = () => Date.now();

  const resetTimers = () => {
    clearTimeout(timers.current.waiting);
    clearTimeout(timers.current.thankYou);
    timers.current.waiting = null;
    timers.current.thankYou = null;
    setWaitingSent(false);
    setThankYouSent(false);
  };

  const startInactivityTimer = () => {
    resetTimers();
    timers.current.waiting = setTimeout(() => {
      if (!waitingSent) {
        showWaitingMessage();
        setWaitingSent(true);
      }
      timers.current.thankYou = setTimeout(() => {
        if (!thankYouSent) {
          showThankYouMessage();
          setThankYouSent(true);
        }
      }, 120000);
    }, 600000);
  };

  const showWaitingMessage = () => {
    const waitingMessage = {
      sender: "bot",
      text: "Are you still there? Feel free to ask any questions!",
      timestamp: getTimestamp(),
      id: getUniqueMessageId(),
    };
    setMessages((prevMessages) => [...prevMessages, waitingMessage]);
  };

  const showThankYouMessage = () => {
    const thankYouMessage = {
      sender: "bot",
      text: "Thank you for visiting! The session has ended.",
      timestamp: getTimestamp(),
      id: getUniqueMessageId(),
    };
    setMessages((prevMessages) => [...prevMessages, thankYouMessage]);
    localStorage.removeItem("session_id");
  };

  const sendMessage = async (message = currentMessage) => {
    if (message.trim()) {
      resetTimers();
      startInactivityTimer();
      const userMessage = {
        sender: "user",
        text: message,
        timestamp: getTimestamp(),
        id: getUniqueMessageId(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setCurrentMessage("");
      inputRef.current?.focus();
      setIsTyping(true);
      try {
        const botReply = await fetchBotReply(message);
        console.log("Bot reply:", botReply);
        if (botReply) {
          const { main_response, follow_up_question, show_button } = botReply;
          const displayMessages = async (response) => {
            if (response?.trim()) {
              const messages = splitMessage(response.trim());
              for (let index = 0; index < messages.length; index++) {
                const chunk = messages[index];
                await new Promise((resolve) =>
                  setTimeout(() => {
                    const message = {
                      sender: "bot",
                      text: chunk,
                      timestamp: getTimestamp(),
                      id: getUniqueMessageId() + index,
                    };
                    setMessages((prevMessages) => [...prevMessages, message]);
                    setTimeout(() => animateBotReply(message.id), 0);
                    resolve();
                  }, index * 1000)
                );
              }
            }
          };
          if (main_response?.trim() || follow_up_question?.trim()) {
            if (main_response?.trim()) {
              await displayMessages(main_response, "main_response");
            }
            if (follow_up_question?.trim()) {
              await displayMessages(follow_up_question, "follow_up_question");
            }
          }
          console.log("show button", show_button);
          if (show_button === 1) {
            setTimeout(() => {
              const buttonMessage = {
                sender: "bot",
                text: "",
                timestamp: getTimestamp(),
                id: getUniqueMessageId(),
                buttons: [
                  "Buy a Home",
                  "Sell a Property",
                  "Relocation Help",
                  "Real Estate Investment"
                ],
              };
              setMessages((prevMessages) => [...prevMessages, buttonMessage]);
              setTimeout(() => animateBotReply(buttonMessage.id), 0);
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Error fetching bot reply:", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleButtonClick = (buttonText) => {
    resetTimers();
    startInactivityTimer();
    const buttonResponses = {
      "Buy a Home": "I want to know about Buy a Home.",
      "Sell a Property": "I want to know about Sell a Property.",
      "Relocation Help": "I want to know about Relocation Help.",
      "Real Estate Investment": "I want to know about Real Estate Investment."
    };
    const responseMessage = buttonResponses[buttonText] || "Sorry, I didn't understand that.";
    sendMessage(responseMessage);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    setCurrentMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false); // Hide the emoji picker after selection
  };

  useEffect(() => {
    localStorage.removeItem("session_id");
    return () => resetTimers();
  }, []);

  useEffect(() => {
    const fetchGreetingMessage = async () => {
      try {
        const data = "Hey there! I’m your virtual assistant at Royal LePage Team Realty. How are you today?😊";
        const greetingMessage = {
          sender: "bot",
          text: data,
          timestamp: getTimestamp(),
          id: getUniqueMessageId(),
        };
        setMessages([greetingMessage]);
        setTimeout(() => animateBotReply(greetingMessage.id), 0);
        startInactivityTimer();
      } catch (error) {
        console.error("Error fetching greeting message:", error);
      }
    };
    fetchGreetingMessage();
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <>
      <ul ref={messagesContainerRef} className="messages">
        {messages.map((msg) =>
          msg.buttons ? (
            <div key={msg.id} id={`message-${msg.id}`} className="buttons-container">
              {msg.text && (
                <li className="other">
                  {msg.text}
                  <div className="timestamp">{msg.timestamp}</div>
                </li>
              )}
              <div className="btn-wrap">
                {msg.buttons.map((buttonText, index) => (
                  <button key={index} onClick={() => handleButtonClick(buttonText)}>
                    {buttonText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <li key={msg.id} id={`message-${msg.id}`} className={msg.sender === "user" ? "self" : "other"}>
              {msg.text}
              <div className="timestamp">{msg.timestamp}</div>
            </li>
          )
        )}
      </ul>
      {isTyping && (
        <li className="typing">
          <img src={typing} alt="Typing indicator" />
        </li>
      )}
      <div className="footer">
        <textarea
          ref={inputRef}
          className="text-box"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Enter here...."
          rows={1}
          autoFocus
        />
        <button id="fileadd">
          <Emoji />
        </button>
        <button id="emojibutton" onClick={() => setShowEmojiPicker((prev) => !prev)}>
          <i className="fa-regular fa-face-smile"></i>
        </button>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <button id="sendMessage" onClick={(e) => { e.preventDefault(); sendMessage(); }} disabled={!currentMessage.trim()}>
          <Svg />
        </button>
      </div>
      <p className="copyright-two">
        Powered by <img src={powerby} alt="Powered by logo" />
      </p>
    </>
  );
}

export default Message;





























// import { useState, useRef, useEffect } from "react";
// import powerby from "./assets/images/footerlogo.png";
// import Svg, { Emoji } from "./Svg";
// import typing from "./assets/images/typing.gif";
// import { animateBotReply, fetchBotReply,  splitMessage } from "./Function";
// function Message() {
//   const [messages, setMessages] = useState([]);
//   const [currentMessage, setCurrentMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [waitingSent, setWaitingSent] = useState(false);
//   const [thankYouSent, setThankYouSent] = useState(false);
//   const messagesContainerRef = useRef(null);
//   const inputRef = useRef(null);
//   const timers = useRef({ waiting: null, thankYou: null });
//   const getTimestamp = () => {
//     const now = new Date();
//     const hours = now.getHours() % 12 || 12;
//     const minutes = String(now.getMinutes()).padStart(2, "0");
//     const ampm = now.getHours() >= 12 ? "pm" : "am";
//     return `${hours}:${minutes} ${ampm}`;
//   };
//   const getUniqueMessageId = () => Date.now();
//   const resetTimers = () => {
//     clearTimeout(timers.current.waiting);
//     clearTimeout(timers.current.thankYou);
//     timers.current.waiting = null;
//     timers.current.thankYou = null;
//     setWaitingSent(false);
//     setThankYouSent(false);
//   };
//   const startInactivityTimer = () => {
//     resetTimers();
//     timers.current.waiting = setTimeout(() => {
//       if (!waitingSent) {
//         showWaitingMessage();
//         setWaitingSent(true);
//       }
//       timers.current.thankYou = setTimeout(() => {
//         if (!thankYouSent) {
//           showThankYouMessage();
//           setThankYouSent(true);
//         }
//       }, 120000);
//     }, 600000);
//   };
//   const showWaitingMessage = () => {
//     const waitingMessage = {
//       sender: "bot",
//       text: "Are you still there? Feel free to ask any questions!",
//       timestamp: getTimestamp(),
//       id: getUniqueMessageId(),
//     };
//     setMessages((prevMessages) => [...prevMessages, waitingMessage]);
//   };
//   const showThankYouMessage = () => {
//     const thankYouMessage = {
//       sender: "bot",
//       text: "Thank you for visiting! The session has ended.",
//       timestamp: getTimestamp(),
//       id: getUniqueMessageId(),
//     };
//     setMessages((prevMessages) => [...prevMessages, thankYouMessage]);
//     localStorage.removeItem("session_id");
//   };
//   const sendMessage = async (message = currentMessage) => {
//     if (message.trim()) {
//       resetTimers();
//       startInactivityTimer();
//       const userMessage = {
//         sender: "user",
//         text: message,
//         timestamp: getTimestamp(),
//         id: getUniqueMessageId(),
//       };
//       setMessages((prevMessages) => [...prevMessages, userMessage]);
//       setCurrentMessage("");
//       inputRef.current?.focus();
//       setIsTyping(true);
//       try {
//         const botReply = await fetchBotReply(message);
//         console.log("Bot reply:", botReply);
//         if (botReply) {
//           const { main_response, follow_up_question, show_button } = botReply;
//           const displayMessages = async (response) => {
//             if (response?.trim()) {
//               const messages = splitMessage(response.trim());
//               for (let index = 0; index < messages.length; index++) {
//                 const chunk = messages[index];
//                 await new Promise((resolve) =>
//                   setTimeout(() => {
//                     const message = {
//                       sender: "bot",
//                       text: chunk,
//                       timestamp: getTimestamp(),
//                       id: getUniqueMessageId() + index,
//                     };
//                     setMessages((prevMessages) => [...prevMessages, message]);
//                     setTimeout(() => animateBotReply(message.id), 0);
//                     resolve();
//                   }, index * 1000)
//                 );
//               }
//             }
//           };
//           if (main_response?.trim() || follow_up_question?.trim()) {
//             if (main_response?.trim()) {
//               await displayMessages(main_response, "main_response");
//             }
//             if (follow_up_question?.trim()) {
//               await displayMessages(follow_up_question, "follow_up_question");
//             }
//           }
//           console.log("show button", show_button);
//           if (show_button === 1) {
//             setTimeout(() => {
//               const buttonMessage = {
//                 sender: "bot",
//                 text: "",
//                 timestamp: getTimestamp(),
//                 id: getUniqueMessageId(),
//                 buttons: [
//                   "AI BOT Development",
//                   "Software Development",
//                   "DevOps & cloud computing",
//                   "Schedule Demo",
//                 ],
//               };
//               setMessages((prevMessages) => [...prevMessages, buttonMessage]);
//               setTimeout(() => animateBotReply(buttonMessage.id), 0);
//             }, 3000);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching bot reply:", error);
//       } finally {
//         setIsTyping(false);
//       }
//     }
//   };
//   const handleButtonClick = (buttonText) => {
//     resetTimers();
//     startInactivityTimer();
//     const buttonResponses = {
//       "AI BOT Development": "I want to know about AI chatbots.",
//       "Software Development": "I want to know about software development.",
//       "DevOps & cloud computing": "I want to know about DevOps & Cloud computing.",
//       "Schedule Demo": "I want to book a demo.",
//     };
//     const responseMessage = buttonResponses[buttonText] || "Sorry, I didn't understand that.";
//     sendMessage(responseMessage);
//   };
//   useEffect(() => {
//     localStorage.removeItem("session_id");
//     return () => resetTimers();
//   }, []);
//   useEffect(() => {
//     const fetchGreetingMessage = async () => {
//       try {
//         const apiUrl = import.meta.env.VITE_GREATING_MESSAGE;
//         const response = await fetch(apiUrl);
//         const data = await response.json();
//         console.log("data: ", data);
//         const greetingMessage = {
//           sender: "bot",
//           text: data.data,
//           timestamp: getTimestamp(),
//           id: getUniqueMessageId(),
//         };
//         setMessages([greetingMessage]);
//         setTimeout(() => animateBotReply(greetingMessage.id), 0);
//         startInactivityTimer();
//       } catch (error) {
//         console.error("Error fetching greeting message:", error);
//       }
//     };
//     fetchGreetingMessage();
//   }, []);
//   useEffect(() => {
//     const container = messagesContainerRef.current;
//     if (container) {
//       container.scrollTo({
//         top: container.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages]);
//   return (
//     <>
//       <ul ref={messagesContainerRef} className="messages">
//         {messages.map((msg) =>
//           msg.buttons ? (
//             <div key={msg.id} id={`message-${msg.id}`} className="buttons-container">
//               {msg.text && (
//                 <li className="other">
//                   {msg.text}
//                   <div className="timestamp">{msg.timestamp}</div>
//                 </li>
//               )}
//               <div className="btn-wrap">
//                 {msg.buttons.map((buttonText, index) => (
//                   <button key={index} onClick={() => handleButtonClick(buttonText)}>
//                     {buttonText}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <li key={msg.id} id={`message-${msg.id}`} className={msg.sender === "user" ? "self" : "other"}>
//               {msg.text}
//               <div className="timestamp">{msg.timestamp}</div>
//             </li>
//           )
//         )}
//       </ul>
//       {isTyping && (
//         <li className="typing">
//           <img src={typing} alt="Typing indicator" />
//         </li>
//       )}
//       <div className="footer">
//         <textarea
//           ref={inputRef}
//           className="text-box"
//           value={currentMessage}
//           onChange={(e) => setCurrentMessage(e.target.value)}
//           onKeyPress={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault();
//               sendMessage();
//             }
//           }}
//           placeholder="Enter here...."
//           rows={1}
//           autoFocus
//         />
//         <button id="fileadd">
//           <Emoji />
//         </button>
//         <button id="emojibutton">
//           <i className="fa-regular fa-face-smile"></i>
//         </button>
//         <button id="sendMessage" onClick={sendMessage} disabled={!currentMessage.trim()}>
//           <Svg />
//         </button>
//       </div>
//       <p className="copyright-two">
//         Powered by <img src={powerby} alt="Powered by logo" />
//       </p>
//     </>
//   );
// }
// export default Message;



































// import { useState, useRef, useEffect } from "react";
// import powerby from "../assets/images/footerlogo.png";
// import Svg, { Emoji } from "./Svg";
// import typing from "../assets/images/typing.gif";
// import { animateBotReply, getSessionId, getVisitorIp } from "./Function";
// function Message() {
//   const [messages, setMessages] = useState([]);
//   const [currentMessage, setCurrentMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [waitingSent, setWaitingSent] = useState(false);
//   const [thankYouSent, setThankYouSent] = useState(false);
//   const messagesContainerRef = useRef(null);
//   const inputRef = useRef(null);
//   const timers = useRef({ waiting: null, thankYou: null });
//   const getTimestamp = () => {
//     const now = new Date();
//     const hours = now.getHours() % 12 || 12;
//     const minutes = String(now.getMinutes()).padStart(2, "0");
//     const ampm = now.getHours() >= 12 ? "pm" : "am";
//     return `${hours}:${minutes} ${ampm}`;
//   };
//   const getUniqueMessageId = () => Date.now();
//   const resetTimers = () => {
//     clearTimeout(timers.current.waiting);
//     clearTimeout(timers.current.thankYou);
//     timers.current.waiting = null;
//     timers.current.thankYou = null;
//     setWaitingSent(false);
//     setThankYouSent(false);
//   };
//   const startInactivityTimer = () => {
//     resetTimers();
//     timers.current.waiting = setTimeout(() => {
//       if (!waitingSent) {
//         showWaitingMessage();
//         setWaitingSent(true);
//       }
//       timers.current.thankYou = setTimeout(() => {
//         if (!thankYouSent) {
//           showThankYouMessage();
//           setThankYouSent(true);
//         }
//       }, 120000);
//     }, 120000);
//   };
//   const showWaitingMessage = () => {
//     const waitingMessage = {
//       sender: "bot",
//       text: "Are you still there? Feel free to ask any questions!",
//       timestamp: getTimestamp(),
//       id: getUniqueMessageId(),
//     };
//     setMessages((prevMessages) => [...prevMessages, waitingMessage]);
//   };
//   const showThankYouMessage = () => {
//     const thankYouMessage = {
//       sender: "bot",
//       text: "Thank you for visiting! The session has ended.",
//       timestamp: getTimestamp(),
//       id: getUniqueMessageId(),
//     };
//     setMessages((prevMessages) => [...prevMessages, thankYouMessage]);
//     localStorage.removeItem("session_id");
//   };
//   const sendMessage = async (message = currentMessage) => {
//     if (message.trim()) {
//       resetTimers();
//       startInactivityTimer();

//       const userMessage = {
//         sender: "user",
//         text: message,
//         timestamp: getTimestamp(),
//         id: getUniqueMessageId(),
//       };
//       setMessages((prevMessages) => [...prevMessages, userMessage]);
//       setCurrentMessage("");
//       inputRef.current?.focus();
//       setIsTyping(true);
//       try {
//         const botReply = await fetchBotReply(message);
//         console.log('boot reply', botReply);
//         if (botReply) {
//           const { main_response, follow_up_question, show_button } = botReply;
//           if (main_response?.trim()) {
//             const mainMessages = splitMessage(main_response.trim());
//             mainMessages.forEach((messageChunk, index) => {
//               setTimeout(() => {
//                 const mainMessage = {
//                   sender: "bot",
//                   text: messageChunk,
//                   timestamp: getTimestamp(),
//                   id: getUniqueMessageId() + index,
//                 };
//                 setMessages((prevMessages) => [...prevMessages, mainMessage]);
//                 setTimeout(() => animateBotReply(mainMessage.id), 0);
//                 if (index === mainMessages.length - 1 && follow_up_question?.trim()) {
//                   const followUpMessages = splitMessage(follow_up_question.trim());
//                   followUpMessages.forEach((questionChunk, qIndex) => {
//                     setTimeout(() => {
//                       const followUpMessage = {
//                         sender: "bot",
//                         text: questionChunk,
//                         timestamp: getTimestamp(),
//                         id: getUniqueMessageId() + qIndex,
//                       };
//                       setMessages((prevMessages) => [...prevMessages, followUpMessage]);
//                       setTimeout(() => animateBotReply(followUpMessage.id), 0);
//                     }, qIndex * 1000);
//                   });
//                 }
//               }, index * 1000);
//             });
//           }
//           if (show_button) {
//             setTimeout(() => {
//               const buttonMessage = {
//                 sender: "bot",
//                 text: "",
//                 timestamp: getTimestamp(),
//                 id: getUniqueMessageId(),
//                 buttons: [
//                   "AI BOT Development",
//                   "Software Development",
//                   "DevOps & cloud computing",
//                   "Schedule Demo",
//                 ],
//               };
//               setMessages((prevMessages) => {
//                 if (!prevMessages.some((msg) => msg.buttons)) {
//                   return [...prevMessages, buttonMessage];
//                 }
//                 return prevMessages;
//               });
//               setTimeout(() => animateBotReply(buttonMessage.id), 0);
//             }, 3000);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching bot reply:", error);
//       } finally {
//         setIsTyping(false);
//       }
//     }
//   };
//   const handleButtonClick = (buttonText) => {
//     resetTimers();
//     startInactivityTimer();
//     const buttonResponses = {
//       "AI BOT Development": "I want to know about AI chatbots.",
//       "Software Development": "I want to know about software development.",
//       "DevOps & cloud computing": "I want to know about DevOps & Cloud computing.",
//       "Schedule Demo": "I want to book a demo.",
//     };
//     const responseMessage = buttonResponses[buttonText] || "Sorry, I didn't understand that.";
//     sendMessage(responseMessage);
//   };
//   const splitMessage = (text, maxLength = 100) => {
//     const chunks = [];
//     let start = 0;
//     while (start < text.length) {
//       let end = start + maxLength;
//       if (end < text.length) {
//         const sentenceEndIndex = text.slice(end).search(/[.!?]/);
//         if (sentenceEndIndex !== -1) {
//           end += sentenceEndIndex + 1;
//         } else {
//           const nextSpaceIndex = text.slice(end).search(/\s/);
//           if (nextSpaceIndex !== -1) {
//             end += nextSpaceIndex;
//           }
//         }
//       }
//       const chunk = text.substring(start, end).trim();
//       if (chunk.length < 10 && end < text.length) {
//         end += maxLength;
//         const extendedChunk = text.substring(start, end).trim();
//         if (extendedChunk.length > chunk.length) {
//           chunks.push(extendedChunk);
//           start = end;
//           continue;
//         }
//       }
//       chunks.push(chunk);
//       start = end;
//     }
//     return chunks;
//   };
//   const fetchBotReply = async (message) => {
//     const zoneTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" });
//     const ip = await getVisitorIp();
//     const data = {
//       session_id: getSessionId(),
//       message,
//       Zone: "Asia/Karachi",
//       zoneTime,
//       ip: ip || "IP not available",
//     };
//     const response = await fetch("https://bot.devspandas.com/v1/devbot/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//     if (!response.ok) throw new Error("Failed to fetch bot reply");
//     return response.json();
//   };
//   useEffect(() => {
//     localStorage.removeItem("session_id");
//     return () => resetTimers();
//   }, []);
//   useEffect(() => {
//     const fetchGreetingMessage = async () => {
//       try {
//         const response = await fetch("https://bot.devspandas.com/api/config/get_greetings_message");
//         const data = await response.json();
//         const greetingMessage = {
//           sender: "bot",
//           text: data.data,
//           timestamp: getTimestamp(),
//           id: getUniqueMessageId(),
//         };
//         setMessages([greetingMessage]);
//         setTimeout(() => animateBotReply(greetingMessage.id), 0);
//         startInactivityTimer();
//       } catch (error) {
//         console.error("Error fetching greeting message:", error);
//       }
//     };
//     fetchGreetingMessage();
//   }, []);
//   useEffect(() => {
//     const container = messagesContainerRef.current;
//     if (container) {
//       container.scrollTo({
//         top: container.scrollHeight,
//         behavior: "smooth",
//       });
//     }
//   }, [messages]);
//   return (
//     <>
//       <ul ref={messagesContainerRef} className="messages">
//         {messages.map((msg) =>
//           msg.buttons ? (
//             <div key={msg.id} id={`message-${msg.id}`} className="buttons-container">
//               {msg.text && (
//                 <li className="other">
//                   {msg.text}
//                   <div className="timestamp">{msg.timestamp}</div>
//                 </li>
//               )}
//               <div className="btn-wrap">
//                 {msg.buttons.map((buttonText, index) => (
//                   <button key={index} onClick={() => handleButtonClick(buttonText)}>
//                     {buttonText}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <li key={msg.id} id={`message-${msg.id}`} className={msg.sender === "user" ? "self" : "other"}>
//               {msg.text}
//               <div className="timestamp">{msg.timestamp}</div>
//             </li>
//           )
//         )}
//       </ul>
//       {isTyping && (
//         <li className="typing">
//           <img src={typing} alt="Typing indicator" />
//         </li>
//       )}
//       <div className="footer">
//         <textarea
//           ref={inputRef}
//           className="text-box"
//           value={currentMessage}
//           onChange={(e) => setCurrentMessage(e.target.value)}
//           onKeyPress={(e) => {
//             if (e.key === "Enter" && !e.shiftKey) {
//               e.preventDefault();
//               sendMessage();
//             }
//           }}
//           placeholder="Enter here...."
//           rows={1}
//           autoFocus
//         />
//         <button id="fileadd">
//           <Emoji />
//         </button>
//         <button id="emojibutton">
//           <i className="fa-regular fa-face-smile"></i>
//         </button>
//         <button id="sendMessage" onClick={sendMessage} disabled={!currentMessage.trim()}>
//           <Svg />
//         </button>
//       </div>
//       <p className="copyright-two">
//         Powered by <img src={powerby} alt="Powered by logo" />
//       </p>
//     </>
//   );
// }
// export default Message;