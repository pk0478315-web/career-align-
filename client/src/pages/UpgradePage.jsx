import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Crown, CheckCircle2, Zap, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UpgradePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const res = await api.getMyPlan();
      setCurrentPlan(res.data.planType);
    } catch (err) {
      console.error('Failed to load plan', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (targetPlan) => {
    if (targetPlan === currentPlan) return;
    
    try {
      setLoading(true);
      const upgradeRes = await api.createCheckoutSession({ targetPlan });
      
      if (!upgradeRes.data.devMode && upgradeRes.data.checkoutUrl) {
        window.location.href = upgradeRes.data.checkoutUrl;
      } else {
        await loadPlan();
        alert(upgradeRes.data.message);
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Basic Student',
      price: '$0',
      period: 'Forever',
      description: 'Essential tools for discovering and tracking opportunities.',
      features: ['Basic Career Profile', 'Opportunity Tracking (up to 5)', 'Standard Matching Engine', '10 AI Copilot Queries'],
      icon: <Shield size={24} />
    },
    {
      id: 'pro',
      name: 'Career Pro',
      price: '$9.99',
      period: '/ month',
      description: 'Advanced intelligence and unlimited tracking for serious career growth.',
      features: ['AI Career Roadmap Generator', 'Resume Intelligence Engine', 'Unlimited Opportunity Tracking', 'Advanced Skill-Gap Analysis', '500 AI Copilot Queries / mo'],
      icon: <Crown size={24} color="#ffd700" />,
      popular: true
    },
    {
      id: 'institution',
      name: 'Institution',
      price: 'Custom',
      period: 'Pricing',
      description: 'Comprehensive suite for universities, bootcamps, and career centers.',
      features: ['Student Management Dashboard', 'Bulk Opportunity Distribution', 'Advanced Analytics & Reporting', 'Custom Branding', 'Priority Support'],
      icon: <Zap size={24} color="#00f" />
    }
  ];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Unlock Your Career Potential</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Get the intelligence, automation, and guidance you need to land your dream opportunity faster.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className="glass-panel"
            style={{ 
              padding: '32px 24px', 
              position: 'relative',
              border: plan.id === currentPlan ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              transform: plan.popular ? 'scale(1.02)' : 'none',
              zIndex: plan.popular ? 2 : 1
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                MOST POPULAR
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {plan.icon}
              <h2 style={{ fontSize: '24px', margin: 0 }}>{plan.name}</h2>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{plan.price}</span>
              <span style={{ color: 'var(--text-muted)' }}> {plan.period}</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', minHeight: '48px' }}>
              {plan.description}
            </p>
            
            <button 
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.id === currentPlan}
              className={`btn ${plan.id === currentPlan ? 'btn-secondary' : plan.popular ? 'btn-primary' : 'btn-outline'}`}
              style={{ width: '100%', marginBottom: '32px', padding: '12px' }}
            >
              {plan.id === currentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {plan.features.map((feature, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={18} color="var(--status-shortlisted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
