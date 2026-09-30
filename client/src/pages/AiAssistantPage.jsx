import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  Sparkles, 
  Send, 
  ListChecks, 
  ShieldCheck, 
  Building2, 
  MessageSquare 
} from 'lucide-react';

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI Opportunity Copilot. Select an opportunity or ask me any question about eligibility, requirements, or application checklists.',
      source: 'grounded-engine'
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOpps = async () => {
      try {
        const res = await api.listOpportunities();
        if (res.success) {
          setOpportunities(res.data.items);
          if (res.data.items.length > 0) {
            setSelectedOppId(res.data.items[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      }
    };
    loadOpps();
  }, []);

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMsg = { sender: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    const currentQ = question;
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.copilotChat({
        opportunityId: selectedOppId || null,
        question: currentQ
      });

      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.answer,
            source: res.data.source || 'grounded-engine'
          }
        ]);
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
      if (actionType === 'eligibility') {
        const res = await api.checkEligibility(selectedOppId);
        if (res.success) {
          const summaryText = `Overall Eligibility Assessment: ${res.data.overallStatus.toUpperCase()}\n\nFactors:\n` +
            res.data.factors.map(f => `• ${f.criterion}: ${f.assessment} (${f.detail})`).join('\n');
          setMessages(prev => [...prev, { sender: 'user', text: 'Check my eligibility for this opportunity' }, { sender: 'bot', text: summaryText, source: 'ai-engine' }]);
        }
      } else if (actionType === 'checklist') {
        const res = await api.generateChecklist(selectedOppId);
        if (res.success) {
          const listText = `Recommended Action & Document Checklist:\n\n` +
            res.data.checklist.map(item => `[ ] ${item.item}`).join('\n');
          setMessages(prev => [...prev, { sender: 'user', text: 'Generate document checklist' }, { sender: 'bot', text: listText, source: 'ai-engine' }]);
        }
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{ background: 'var(--accent-light)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <Bot size={24} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>AI Opportunity Copilot</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Context-aware Q&A, eligibility gap analysis, and checklist generation.
            </p>
          </div>
        </div>

        {/* Opportunity Target Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', background: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <Building2 size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Focus Opportunity:</span>
          <select 
            className="form-select" 
            value={selectedOppId} 
            onChange={(e) => setSelectedOppId(e.target.value)}
            style={{ flex: 1 }}
          >
            {opportunities.map(o => (
              <option key={o.id} value={o.id}>{o.organization} — {o.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => handleQuickAction('eligibility')} className="btn btn-secondary btn-sm" disabled={loading}>
          <ShieldCheck size={16} color="var(--accent-primary)" /> Check My Eligibility
        </button>
        <button onClick={() => handleQuickAction('checklist')} className="btn btn-secondary btn-sm" disabled={loading}>
          <ListChecks size={16} color="var(--accent-secondary)" /> Generate Document Checklist
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="card" style={{ minHeight: '380px', maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
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

            {msg.sender === 'bot' && (
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Grounded Output ({msg.source})
              </span>
            )}
          </div>
        ))}
        {loading && <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>AI Copilot is thinking...</p>}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendQuestion} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Ask anything about this opportunity (e.g. stipend, deadline, prerequisites)..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Send size={18} /> Send
        </button>
      </form>

    </div>
  );
};
