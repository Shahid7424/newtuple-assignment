"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Copy, Check, Trash2, Wifi, WifiOff } from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Avatar Component
const Avatar: React.FC<{ role: 'user' | 'assistant' }> = ({ role }) => (
  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
    role === 'user' 
      ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
      : 'bg-gradient-to-br from-purple-500 to-pink-500'
  }`}>
    <span className="text-white font-bold text-sm">
      {role === 'user' ? 'U' : 'AI'}
    </span>
  </div>
);

// Message Component (handles both regular and streaming)
const Message: React.FC<{ 
  message: Message; 
  isStreaming?: boolean;
}> = ({ message, isStreaming = false }) => {
  const [copied, setCopied] = useState(false);

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={message.role} />

      <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`group relative px-5 py-3 rounded-2xl ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
            : 'bg-white/10 backdrop-blur-lg text-white border border-white/10'
        }`}>
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content || '...'}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-purple-400 ml-1 animate-pulse" />
            )}
          </p>
          
          {!isStreaming && message.content && (
            <button
              onClick={copyMessage}
              className="absolute -top-2 -right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          )}
        </div>
        
        {!isStreaming && (
          <span className={`text-xs text-purple-300 mt-1.5 px-1 ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}>
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

// Typing Indicator
const TypingIndicator: React.FC = () => (
  <div className="flex gap-4">
    <Avatar role="assistant" />
    <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10">
      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay, i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" 
            style={{ animationDelay: `${delay}ms` }} 
          />
        ))}
      </div>
    </div>
  </div>
);

// Empty State
const EmptyState: React.FC = () => (
  <div className="text-center py-20">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <span className="text-white font-bold text-3xl">AI</span>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Start a conversation</h2>
    <p className="text-purple-300">Ask me anything and watch the response stream in real-time</p>
  </div>
);

// Main Chat Component
export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreamingContent('');
    setIsStreaming(true);
    setIsConnected(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6);
          if (data === '[DONE]') {
            // Save the complete message
            setMessages(prev => [...prev, {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: fullContent,
              timestamp: new Date(),
            }]);
            setStreamingContent('');
            setIsStreaming(false);
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.text || '';
            if (text) {
              fullContent += text;
              setStreamingContent(fullContent);
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Stream error:', error);
        setIsConnected(false);
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: ${error.message}`,
          timestamp: new Date(),
        }]);
      }
      setStreamingContent('');
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      setStreamingContent('');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar role="assistant" />
            <div>
              <h1 className="text-xl font-bold text-white">Gemini Chat</h1>
              <p className="text-xs text-purple-300">Real-time streaming responses</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400 font-medium">Disconnected</span>
                </>
              )}
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-5 h-5 text-purple-300" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !streamingContent && <EmptyState />}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {streamingContent && (
            <Message 
              message={{
                id: 'streaming',
                role: 'assistant',
                content: streamingContent,
                timestamp: new Date(),
              }}
              isStreaming
            />
          )}

          {isStreaming && !streamingContent && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-black/30 backdrop-blur-lg border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isStreaming}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-5 py-4 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                style={{ minHeight: '56px', maxHeight: '200px' }}
              />
              
              {input.length > 0 && (
                <span className="absolute bottom-2 right-3 text-xs text-purple-300">
                  {input.length}
                </span>
              )}
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}