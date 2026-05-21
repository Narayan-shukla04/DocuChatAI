import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, Bot, User, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast, { Toaster } from 'react-hot-toast';

const Chat = () => {
  const { docId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    setHasError(false);
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${docId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
      toast.error('Failed to load chat history.');
      setHasError(true);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [docId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { message: userMessage.content, docId }
      );

      const aiMessage = { role: 'ai', content: res.data.reply, context: res.data.context };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error', error);
      toast.error(error.response?.data?.message || 'Failed to get a response. Please try again.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I encountered an error. Please try sending your message again.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-text-main">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1E1E2E', color: '#fff', border: '1px solid #313244' } }} />
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass-card border-b border-dark-border/50 z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-text-main transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-lg">DocuChat AI</h1>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {isLoadingHistory ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto text-text-muted">
            <Bot className="w-16 h-16 text-primary/50 mb-4" />
            <h2 className="text-2xl font-bold text-text-main mb-2">How can I help you?</h2>
            <p>Ask me anything about your document. I can summarize, extract key points, or answer specific questions.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'glass-card border border-dark-border rounded-tl-sm'
                  }`}
                >
                  <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-md my-2"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-dark-bg/50 px-1 py-0.5 rounded text-sm font-mono text-accent" {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-dark-border flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-text-muted" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="glass-card border border-dark-border rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder-text-muted shadow-lg transition-all"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-xs text-text-muted mt-3">
          DocuChat AI can make mistakes. Consider verifying important information.
        </p>
      </footer>
    </div>
  );
};

export default Chat;
