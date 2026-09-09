'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { Sparkles, Send, X, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am **CampusTrack AI**, your intelligent attendance assistant. I can calculate exact shortage predictions, safe miss buffers, what-if simulations, and condonation eligibility.\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        "Am I at risk of shortage anywhere?",
        "How many classes can I miss in Data Structures?",
        "What if I miss the next 2 classes?",
        "Check my condonation eligibility"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();

      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: "I experienced an error retrieving your attendance records. Please try asking again.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "Network issue. Please ensure your backend server is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">CampusTrack AI</h3>
            <p className="text-[11px] text-slate-400">Context-Grounded Natural Language Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-1 px-1">
              <span>{msg.sender === 'user' ? 'You' : 'CampusTrack AI'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-4 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {msg.text}
            </div>

            {/* Suggested Action Chips */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="mt-3 space-y-1.5 max-w-[90%]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Suggested Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action)}
                      className="text-left text-[11px] py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-blue-300 transition-all flex items-center space-x-1"
                    >
                      <span>{action}</span>
                      <ArrowRight className="h-3 w-3 text-blue-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 w-fit">
            <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
            <span>Analyzing student attendance data & computing math engine...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Query Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask CampusTrack AI (e.g. Can I miss DS tomorrow?)"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-md shadow-blue-600/30 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
