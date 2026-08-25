import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { processAIQuery } from '../../engine/aiQueryEngine';
import { AIMessage } from '../../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ShieldAlert, 
  HelpCircle,
  Flame,
  ArrowRight,
  Brain,
  RotateCcw
} from 'lucide-react';

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'ai',
    text: `👋 Hello! I am **SpendWise AI**, your intelligent financial companion.\n\nBecause SpendWise learns **why** you pay each recipient (even personal UPI IDs like Ramesh Kumar), I have complete visibility into your true spending behavior.\n\nTry asking me any question below or type your own!`,
    timestamp: 'Just now',
    suggestedFollowUps: [
      'Where did most of my money go?',
      'How much did I spend on food?',
      'Who do I pay most frequently?',
      'Where am I spending unnecessarily?',
      'How much did I spend at Ramesh Kumar?',
      'What are my biggest money leaks?',
    ],
  },
];

export const AiAssistantScreen: React.FC = () => {
  const { transactions, merchantMemory, selectedMonth, monthlyIncome } = useApp();

  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate natural brief AI computation delay
    setTimeout(() => {
      const response = processAIQuery(
        query,
        transactions,
        merchantMemory,
        selectedMonth,
        monthlyIncome
      );
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-glow-indigo">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
              <span>SpendWise Financial AI</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                ON-DEVICE NLP
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Grounded directly on your classified UPI transaction dataset
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(INITIAL_MESSAGES)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-slideUp`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-sm shadow-glow-emerald'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Optional Data Visual Widget */}
                {msg.dataVisual && !isUser && (
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2 animate-fadeIn">
                    {msg.dataVisual.type === 'metric' && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">
                            {msg.dataVisual.data.label}
                          </p>
                          <p className="text-base font-black text-emerald-400 font-mono">
                            {msg.dataVisual.data.value}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-300 font-bold bg-indigo-500/15 px-2.5 py-1 rounded-lg">
                          {msg.dataVisual.data.comparison || msg.dataVisual.data.count}
                        </span>
                      </div>
                    )}

                    {msg.dataVisual.type === 'recipient_history' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>{msg.dataVisual.data.recipient} Profile</span>
                          <span className="text-emerald-400 font-mono">
                            ₹{msg.dataVisual.data.totalSpent?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block">Typical Range</span>
                            <span className="font-semibold text-slate-200">{msg.dataVisual.data.normalRange}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block">Category</span>
                            <span className="font-semibold text-emerald-400">{msg.dataVisual.data.primaryCategory}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {msg.dataVisual.type === 'leak_summary' && (
                      <div className="flex items-center justify-between bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        <div>
                          <span className="text-[10px] text-rose-300 uppercase font-semibold">
                            Target Savings
                          </span>
                          <p className="text-sm font-bold text-rose-400 font-mono">
                            +₹{msg.dataVisual.data.monthlySavings}/mo
                          </p>
                        </div>
                        <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                          ≈ ₹{msg.dataVisual.data.annualSavings?.toLocaleString('en-IN')}/year
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Follow up suggested chips */}
                {msg.suggestedFollowUps && !isUser && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedFollowUps.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[11px] font-medium bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 px-3 py-1 rounded-full transition-all text-left flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{chip}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-1">Analyzing transaction memory...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <div className="pt-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 focus-within:border-indigo-500 transition-all shadow-xl">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (e.g., 'How much did I spend at Ramesh Kumar?')..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-glow-indigo transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
