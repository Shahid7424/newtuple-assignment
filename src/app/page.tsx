"use client";
import React from 'react';
//import { ChatHeader } from './components/ChatHeader';
//import { ChatMessages } from './components/ChatMessage';
//import { ChatInput } from './components/ChatInput';
//import { useChat } from '../hooks/useChat';
import Chat from './components/Chat';
export default function Home() {
  // const {
  //   messages,
  //   input,
  //   setInput,
  //   isStreaming,
  //   isConnected,
  //   currentStreamingMessage,
  //   sendMessage,
  //   clearChat,
  // } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
     <Chat />
      {/* <ChatHeader 
        isConnected={isConnected} 
        messageCount={messages.length}
        onClearChat={clearChat}
      />
      
      <ChatMessages
        messages={messages}
        currentStreamingMessage={currentStreamingMessage}
        isStreaming={isStreaming}
      />
      
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={isStreaming}
        isStreaming={isStreaming}
      /> */}
      
    </div>
  );
}