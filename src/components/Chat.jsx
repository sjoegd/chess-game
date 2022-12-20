import React, { useEffect, useRef } from 'react';

import ChatMessage from './ChatMessage';
import GameMessage from './GameMessage';

export default function Chat(props) {
  let { chatMessages: chat_messages, gameMessages: game_messages } = props;
  let chatMessages = chat_messages.map(message => <ChatMessage key={message.id} message={message} />);
  let gameMessages = game_messages.map(message => <GameMessage key={message.id} message={message} />);

  const bottomRefChat = useRef(null);
  const bottomRefGame = useRef(null);
  useEffect(() => {
    bottomRefChat.current?.scrollIntoView();
  }, [chat_messages]);
  useEffect(() => {
    bottomRefGame.current?.scrollIntoView();
  }, [game_messages]);

  return (
    <div className="border-black border rounded-sm w-[17.5rem]">
      <div className="h-[50%]">
        <div className="max-h-full h-full overflow-y-scroll flex flex-col space-y-2 scroll-smooth">
          {gameMessages}
          <div ref={bottomRefGame} />
        </div>
      </div>
      <div className="h-[50%] border-t border-black">
        <div className="max-h-full h-[92.5%] overflow-y-scroll flex flex-col space-y-2 scroll-smooth">
          {chatMessages}
          <div ref={bottomRefChat} />
        </div>
        <input className="h-[7.5%] w-full border-t border-black"></input>
      </div>
    </div>
  );
}
