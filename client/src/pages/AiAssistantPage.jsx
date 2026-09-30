import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, Sparkles, Send, Building2, Plus, MessageSquare, Trash2, ShieldCheck, ListChecks
} from 'lucide-react';

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  
  // UI states
  const [selectedOppId, setSelectedOppId] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [oppsRes, convsRes] = await Promise.all([
          api.listOpportunities(),
          api.getConversations()
        ]);
        
        if (oppsRes.success) {
          setOpportunities(oppsRes.data.items);
        }
        
        if (convsRes.success && convsRes.data.length > 0) {
          setConversations(convsRes.data);
          loadConversation(convsRes.data[0].id);
        } else {
          // Create an initial new conversation if none exists
          handleNewConversation();
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    loadData();
  }, []);

  const loadConversation = async (convId) => {
    setLoading(true);
    setError('');
    setSelectedConvId(convId);
    try {
      const res = await api.getConversation(convId);
      if (res.success) {
        const conv = res.data;
        setSelectedOppId(conv.opportunityId || '');
        const formattedMsgs = conv.messages.map(m => ({
          sender: m.role === 'user' ? 'user' : 'bot',
          text: m.content,
          source: m.role === 'assistant' ? 'ai-engine' : null
        }));
        
        if (formattedMsgs.length === 0) {
          formattedMsgs.push({
            sender: 'bot',
            text: 'Hello! I am your AI Opportunity Copilot. How can I help you today?',
            source: 'system'
          });
        }
        setMessages(formattedMsgs);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Could not load conversation history.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setLoading(true);
    try {
      const res = await api.createConversation({ title: 'New Conversation', opportunityId: selectedOppId || null });
      if (res.success) {
        setConversations(prev => [res.data, ...prev]);
        setSelectedConvId(res.data.id);
        setMessages([{
          sender: 'bot',
          text: 'Hello! I am your AI Opportunity Copilot. What would you like to discuss?',
          source: 'system'
        }]);
      }
    } catch (err) {
      setError('Failed to create a new conversation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(convId);
      const updated = conversations.filter(c => c.id !== convId);
      setConversations(updated);
      if (selectedConvId === convId) {
        if (updated.length > 0) {
          loadConversation(updated[0].id);
        } else {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendQuestion = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const content = textOverride || question;
    if (!content.trim() || !selectedConvId) return;

    const userMsg = { sender: 'user', text: content };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);
    setError('');

    try {
      const res = await api.sendMessage(selectedConvId, { content });
      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.content,
            source: 'grounded-engine'
          }
        ]);
        
        // Refresh conversation list to update titles/timestamps if needed
        const convsRes = await api.getConversations();
        if (convsRes.success) setConversations(convsRes.data);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Apologies, I could not process your query. Please check your network or try again.',
          source: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (actionType) => {
    if (!selectedOppId) return;
    setLoading(true);
    try {
      let prompt = '';
      if (actionType === 'eligibility') prompt = 'Check my eligibility for this opportunity based on my profile.';
      if (actionType === 'checklist') prompt = 'Generate a detailed document and action checklist for this application.';
      await handleSendQuestion(null, prompt);
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
      
      {/* Sidebar: Conversations List */}
      <div className="card" style={{ width: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Chat History</h2>
          <button onClick={handleNewConversation} className="btn btn-primary btn-sm" style={{ padding: '6px' }} title="New Chat">
            <Plus size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
                background: selectedConvId === conv.id ? 'var(--bg-tertiary)' : 'transparent',
                border: selectedConvId === conv.id ? '1px solid var(--accent-light)' : '1px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <MessageSquare size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {conv.title}
                </span>
              </div>
              <button 
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                title="Delete"
              >
                <Trash2 size={14} color="var(--error-color)" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--accent-light)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <Bot size={24} color="var(--accent-primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800' }}>AI Opportunity Copilot</h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Persistent context-aware Q&A and guidance.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
            <Building2 size={16} color="var(--text-muted)" />
            <select 
              className="form-select" 
              value={selectedOppId} 
              onChange={(e) => setSelectedOppId(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '13px' }}
            >
              <option value="">General Inquiries</option>
              {opportunities.map(o => (
                <option key={o.id} value={o.id}>{o.organization} — {o.title}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'var(--error-light)', color: 'var(--error-color)', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleQuickAction('eligibility')} className="btn btn-secondary btn-sm" disabled={loading || !selectedOppId}>
            <ShieldCheck size={16} color="var(--accent-primary)" /> Check My Eligibility
          </button>
          <button onClick={() => handleQuickAction('checklist')} className="btn btn-secondary btn-sm" disabled={loading || !selectedOppId}>
            <ListChecks size={16} color="var(--accent-secondary)" /> Generate Document Checklist
          </button>
        </div>

        {/* Chat Box */}
        <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '16px',
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </div>

              {msg.sender === 'bot' && msg.source && msg.source !== 'system' && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> Grounded Output
                </span>
              )}
            </div>
          ))}
          {loading && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>AI Copilot is thinking...</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendQuestion} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask your copilot anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading || !selectedConvId}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedConvId}>
            <Send size={18} /> Send
          </button>
        </form>

      </div>
    </div>
  );
};
