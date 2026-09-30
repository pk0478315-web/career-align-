import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OpportunityCard } from '../components/OpportunityCard';
import { OpportunityDetailModal } from '../components/OpportunityDetailModal';
import { Search, Filter, Compass, Plus, SlidersHorizontal } from 'lucide-react';

export const DiscoverPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [isRemote, setIsRemote] = useState('');
  const [sort, setSort] = useState('freshness');
  const [opportunities, setOpportunities] = useState([]);
  const [trackedItems, setTrackedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.listOpportunities({
        search,
        category,
        remote: isRemote,
        sort
      });
      if (res.success) {
        setOpportunities(res.data.items);
      }

      if (user) {
        const trackRes = await api.getMyOpportunities();
        if (trackRes.success) setTrackedItems(trackRes.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [category, isRemote, sort, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const isTracked = (oppId) => trackedItems.some(i => i.opportunityId === oppId);
  const getTrackedStatus = (oppId) => trackedItems.find(i => i.opportunityId === oppId)?.status;

  const handleTrackOpportunity = async (opp) => {
    if (!user) {
      alert('Please sign in or register to save opportunities.');
      return;
    }
    try {
      await api.trackOpportunity({ opportunityId: opp.id, status: 'saved' });
      fetchOpportunities();
    } catch (err) {
      console.error('Error tracking opportunity:', err);
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'scholarship', label: 'Scholarships' },
    { id: 'internship', label: 'Internships' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'fellowship', label: 'Fellowships' },
    { id: 'research', label: 'Research' },
    { id: 'competition', label: 'Competitions' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search & Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800' }}>Discover Opportunities</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Search verified scholarships, internships, hackathons, and research grants.
          </p>
        </div>

        {/* Search Bar + Controls */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by keywords, organization, skills (e.g. Python, Google)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Search
          </button>

          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto' }}>
            <option value="freshness">Sort: Newest</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="title">Sort: Title</option>
          </select>

          <select className="form-select" value={isRemote} onChange={(e) => setIsRemote(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Format: All</option>
            <option value="true">Remote Only</option>
            <option value="false">Onsite / Hybrid</option>
          </select>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`btn btn-sm ${category === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: '9999px', fontSize: '12px' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid Results */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading opportunities...</p>
      ) : opportunities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Compass size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3>No Opportunities Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Try adjusting your search terms or selecting a different category filter.
          </p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {opportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isTracked={isTracked(opp.id)}
              currentStatus={getTrackedStatus(opp.id)}
              onSelect={(selected) => setSelectedOpp(selected)}
              onTrack={handleTrackOpportunity}
            />
          ))}
        </div>
      )}

      {/* Modal View */}
      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onTrack={handleTrackOpportunity}
          isTracked={isTracked(selectedOpp.id)}
          currentStatus={getTrackedStatus(selectedOpp.id)}
        />
      )}

    </div>
  );
};
