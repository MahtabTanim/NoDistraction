import React, { useState } from 'react';
import { ArrowLeft, Trash2, Calendar, MapPin, Zap, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Download } from 'lucide-react';
import { exportHistoryToCSV } from '../utils/storage';

export default function HistoryPanel({ isOpen, onClose, history, onDeleteItem }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (isoStr) => {
    try {
      const date = new Date(isoStr);
      const now = new Date();
      const timeOpts = { hour: '2-digit', minute: '2-digit' };

      if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], timeOpts)}`;
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], timeOpts)}`;
      }

      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], timeOpts)}`;
    } catch (e) {
      return 'Unknown Date';
    }
  };

  const todayHistory = history.filter(item => {
    try {
      return new Date(item.timestamp).toDateString() === new Date().toDateString();
    } catch(e) { return false; }
  });

  return (
    <div className={`overlay-panel ${isOpen ? 'open' : ''}`}>
      <div className="overlay-header">
        <button className="icon-btn" onClick={onClose} title="Back" aria-label="Back to Timer">
          <ArrowLeft size={16} />
        </button>
        <h3 className="overlay-title">Today's History</h3>
        <button className="icon-btn" onClick={exportHistoryToCSV} title="Export CSV" aria-label="Export CSV">
          <Download size={16} />
        </button>
      </div>

      <div className="overlay-content">
        {todayHistory.length === 0 ? (
          <div className="history-empty">
            <Calendar size={36} style={{ strokeWidth: 1.5, color: 'var(--color-text-muted)' }} />
            <p>No completed focus sessions today.</p>
          </div>
        ) : (
          todayHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="history-card">
                <div className="history-card-header" onClick={() => toggleExpand(item.id)}>
                  <div className="history-card-info">
                    <h4 style={{ color: item.interrupted ? 'var(--color-text-muted)' : 'inherit', textDecoration: item.interrupted ? 'line-through' : 'none' }}>
                      {item.outcome || 'Untitled Session'}
                    </h4>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.interrupted && <AlertTriangle size={10} style={{ color: 'var(--color-warning)' }} />}
                      {formatDate(item.timestamp)} • {item.interrupted ? 'Interrupted' : `${item.duration}m`}
                    </span>
                  </div>
                  <div className="history-card-action">
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: '#ef4444' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this history record?')) {
                          onDeleteItem(item.id);
                        }
                      }}
                      title="Delete Entry"
                      aria-label="Delete Entry"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="history-card-body">
                    {/* Interruption Reason */}
                    {item.interrupted && (
                      <div className="history-detail-group" style={{ marginBottom: '12px' }}>
                        <span className="history-detail-label" style={{ color: 'var(--color-warning)' }}>Interruption Reason</span>
                        <span className="history-detail-val" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                          {item.interruptionReason || 'Unknown'}
                        </span>
                      </div>
                    )}

                    {/* Ratings */}
                    <div className="history-meta-row">
                      <div className="history-meta-item">
                        <MapPin size={11} style={{ color: 'var(--color-accent-work)' }} />
                        Workspace: <strong>{item.workspaceRating}/10</strong>
                      </div>
                      <div className="history-meta-item">
                        <Zap size={11} style={{ color: 'var(--color-warning)' }} />
                        Energy: <strong>{item.energyRating}/10</strong>
                      </div>
                    </div>

                    {/* Distractions */}
                    <div className="history-detail-group">
                      <span className="history-detail-label">Distractions</span>
                      <span className="history-detail-val">
                        {item.distractions ? item.distractions.join(', ') : 'None'}
                      </span>
                    </div>

                    {/* Activation Ritual */}
                    {item.activationRitual && (
                      <div className="history-detail-group">
                        <span className="history-detail-label">Activation Ritual</span>
                        <span className="history-detail-val">{item.activationRitual}</span>
                      </div>
                    )}

                    {/* Distraction Dump */}
                    {item.distractionDump && (
                      <div className="history-detail-group">
                        <span className="history-detail-label" style={{ color: 'var(--color-accent-break)' }}>Distraction Dump</span>
                        <span className="history-detail-val">{item.distractionDump}</span>
                      </div>
                    )}

                    {/* Things Not To Do */}
                    {item.thingsNotToDo && (
                      <div className="history-detail-group">
                        <span className="history-detail-label" style={{ color: 'var(--color-warning)' }}>
                          Things NOT to do
                        </span>
                        <span className="history-detail-val" style={{ color: 'var(--color-warning)' }}>
                          {item.thingsNotToDo}
                        </span>
                      </div>
                    )}

                    {/* Closing Ritual Checklist */}
                    <div className="history-detail-group">
                      <span className="history-detail-label">Closing Ritual</span>
                      <span className="history-detail-val" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={11} style={{ color: 'var(--color-accent-break)' }} />
                        Completed checklist steps
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
