import { useState, useEffect } from 'react';
import chaticon from './assets/images/chaticon.png';
import homeicon from './assets/images/homeicon.png';
import sendicon from './assets/images/sendicon.png';
import Message from './Message';
import { Chat, Contact, Resources, Services } from './Svg';
import powerby from './assets/images/footerlogo.png';
import { fetchControlPanelSettings } from './Function';
function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatTab, setIsChatTab] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const togglePopup = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsChatTab(false);
    }
  };
  const goToChatTab = () => {
    setIsChatTab(true);
  };
  useEffect(() => {
    // eslint-disable-next-line
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 1500);
    const initializeChatbot = async () => {
      try {
        const settings = await fetchControlPanelSettings('qubit_devpandas');
        console.log('456 Control panel settings:', settings.data.settings);
        if (settings.data.settings.disableBot === false) {
          setIsDisabled(true);
          return;
        }
        if (settings.data.settings.autoOpenChatbot === true) {
          setIsOpen(true);
          setIsChatTab(true);
        }
        const floatingIconDelay = (settings.data.settings.botResponseDelay) * 1000 || 0;
        console.log('Floating icon delay:', floatingIconDelay);
        console.log('disableBot:', settings.data.disableBot);
        if (floatingIconDelay > 0) {
          const timer = setTimeout(() => setShowIcon(true), floatingIconDelay);
          return () => clearTimeout(timer);
        } else {
          setShowIcon(true);
        }

      } catch (error) {
        console.error('Error fetching control panel settings:', error);
      }
    };
    initializeChatbot();
  }, []);
  if (isDisabled) return null;
  return (
    <div className="chatbot-container floating-chat">
      {showIcon && (
        <div className={`chat-icon-wrap ${isOpen ? 'hidden' : ''}`} onClick={togglePopup}>
          <img src={chaticon} alt="Chat Icon" className="chat-icon" />
        </div>
      )}
      {showAnimation && (
        <p className={`animation scrolling-text `}>
          Got questions? Ask!
        </p>
      )}
      <div className={`chat-popup ${isOpen ? 'open' : ''}`}>
        <div className="chat enter">
          {isChatTab ? (
            <div className="header">
              <div className="left-btn-wrap">
                <span className="back-arrow" onClick={() => setIsChatTab(false)}>
                  <i className="fa-solid fa-arrow-left"></i>
                </span>
                {/* <span className="dropdown" id="dropdown">
                  <i className="fa-solid fa-ellipsis"></i>
                </span> */}
              </div>
              <span className="title" >Royal LePage Team Realty</span>
              <i onClick={togglePopup} className="fa fa-times" aria-hidden="true" style={{ fontSize: '30px' }}></i>
            </div>
          ) : (
            <div className="header-two">
              <button style={{ visibility: 'hidden' }}>
                <i className="fa-solid fa-house"></i>
              </button>
              <span className="title" style={{ visibility: 'hidden' }}>
                <i className="fa-solid fa-message"></i> Chatbot
              </span>
              <button>
                <i onClick={togglePopup} className="fa-regular fa-window-minimize"></i>
              </button>
            </div>
          )}
          {!isChatTab ? (
            <>
              <ul className="messages-two">
                <div className="home-icon-wrap">
                  <img className="home-icon" src={homeicon} alt="Home Icon" />
                </div>
                <h1>Chat with us!</h1>
                <li>
                  <div className="first-list">
                    <img src={sendicon} alt="Send Icon" />
                    <span className="online-icon"></span>
                    <span>
                      <p>Royal LePage Team Realty</p>
                      <p>Hello there!</p>
                    </span>
                  </div>
                  <button onClick={goToChatTab} className="chat-button">
                    Chat now
                    <Chat />
                  </button>
                </li>
                <a href="https://realpro.com/" target="_blank" rel="noopener noreferrer">
                  <li>
                    🎓 Services
                    <Services />
                  </li>
                </a>
                <a href="https://realpro.com/buy/" target="_blank" rel="noopener noreferrer">
                  <li>
                    🎉 Resources
                    <Resources />
                  </li>
                </a>
                <a href="https://realpro.com/contact-us/" target="_blank" rel="noopener noreferrer">
                  <li>
                    💬 Contact us
                    <Contact />
                  </li>
                </a>
              </ul>
              <div className="footer-two">
                <button>
                  <i className="fa-solid fa-house"></i>
                  <span>Home</span>
                </button>
                <button onClick={goToChatTab}>
                  <i className="fa-regular fa-comments"></i>
                  <span>Chat</span>
                </button>
              </div>
              <p className="copyright">
                Powered by <img src={powerby} alt="Footer Logo" />
              </p>
            </>
          ) : (
            <Message />
          )}
        </div>
      </div>
    </div>
  );
}
export default Chatbot;

































// import { useState } from 'react';
// import chaticon from '../assets/images/chaticon.png';
// import Message from './Message';
// function Chatbot() {
//   const [isOpen, setIsOpen] = useState(false);
//   const togglePopup = () => {
//     setIsOpen(!isOpen);
//   };
//   return (
//     <div className="chatbot-container">
//       <div className={`chat-icon-wrap ${isOpen ? 'hidden' : ''}`} onClick={togglePopup}>
//         <img src={chaticon} alt="Chat Icon" className="chat-icon" />
//       </div>
//       <div className={`chat-popup ${isOpen ? 'open' : ''}`}>
//         <div className="header">
//           <div className="left-btn-wrap">
//             <span className="back-arrow">
//               <i className="fa-solid fa-arrow-left"></i>
//             </span>
//             <span className="dropdown" id="dropdown">
//               <i className="fa-solid fa-ellipsis"></i>
//             </span>
//           </div>
//           <span className="title">Qubit</span>
//           <i onClick={togglePopup} className="fa fa-times" aria-hidden="true" style={{ fontSize: '30px' }}></i>
//         </div>
//         <Message />
//       </div>
//     </div>
//   );
// }
// export default Chatbot;