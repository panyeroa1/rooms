
import React, { useState, useEffect } from 'react';
import { useSettings } from '../lib/state';
import { supabase } from '../lib/supabase';

export default function Portal() {
  const { setPhase, setMeetingRole, setRemoteMeetingId, setIsWatchingRemote } = useSettings();
  const [view, setView] = useState<'bento' | 'join'>('bento');
  const [joinId, setJoinId] = useState('');
  const [authStatus, setAuthStatus] = useState('● Connecting to Satellite...');

  useEffect(() => {
    async function boot() {
      try {
        const { data } = await supabase.auth.signInAnonymously();
        if (data?.user) {
          setAuthStatus(`● ONLINE ID: ${data.user.id.slice(0, 8)}`);
        }
      } catch (e) {
        setAuthStatus('● OFFLINE');
      }
    }
    boot();
  }, []);

  const handleStartInstant = () => {
    const mid = "MEET-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    setRemoteMeetingId(mid);
    setMeetingRole('transcriber');
    setPhase('config');
  };

  const handleJoin = () => {
    if (joinId.trim()) {
      setRemoteMeetingId(joinId.trim());
      setMeetingRole('listener');
      setIsWatchingRemote(true);
      setPhase('config');
    }
  };

  return (
    <div className="portal-container">
      <button className="settings-btn-top" onClick={() => setPhase('config')}>
        <span className="icon">settings</span>
      </button>

      <div className="container-bento">
        <h1 className="portal-main-title">SUCCESS <span>CLASS</span></h1>
        
        {view === 'bento' ? (
          <div className="bento fade-in">
            <div className="tile large" onClick={handleStartInstant}>
              <div className="tile-icon">🎙️</div>
              <h3>Start Instant Class</h3>
              <p>Initialize Floor & Create Meeting ID</p>
            </div>
            
            <div className="tile" onClick={() => setView('join')}>
              <div className="tile-icon">🔗</div>
              <h3>Join Session</h3>
              <p>Enter ID</p>
            </div>
            
            <div className="tile" onClick={() => alert('Classroom reservation system offline.')}>
              <div className="tile-icon">📅</div>
              <h3>Schedule</h3>
              <p>Secure Slot</p>
            </div>
          </div>
        ) : (
          <div className="join-area-fullscreen fade-in">
             <div className="tile large" style={{ height: 'auto', justifyContent: 'center', padding: '50px' }}>
                <h3 style={{ marginBottom: '20px' }}>Connect to Orbit</h3>
                <input 
                  type="text" 
                  placeholder="MEET-XXXXXX" 
                  className="config-select"
                  style={{ fontSize: '1.4rem', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '4px' }}
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="back-btn-circle" onClick={() => setView('bento')}>
                    <span className="icon">arrow_back</span>
                  </button>
                  <button className="btn-join-platform" style={{ margin: 0 }} onClick={handleJoin}>Initialize Sync</button>
                </div>
             </div>
          </div>
        )}

        <div id="auth-status" className={authStatus.includes('ONLINE') ? 'online' : ''}>
          {authStatus}
        </div>
      </div>
    </div>
  );
}
