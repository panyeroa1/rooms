import React, { useState, useEffect } from 'react';
import { useSettings } from '../lib/state';
import { supabase } from '../lib/supabase';

export default function Portal() {
  const { setPhase, setMeetingRole, setRemoteMeetingId, setIsWatchingRemote } = useSettings();
  const [showJoin, setShowJoin] = useState(false);
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
      setPhase('config'); // Still go through config to check media
    }
  };

  return (
    <div className="portal-container">
      <button className="settings-btn-top" onClick={() => setPhase('config')}>
        <span className="icon">settings</span>
      </button>

      <div className="container-bento">
        <h1>SUCCESS <span>CLASS</span></h1>
        
        <div className="bento">
          <div className="tile large" onClick={handleStartInstant}>
            <div className="tile-icon">🎙️</div>
            <h3>Start Instant Class</h3>
            <p>Create Room & Take Floor</p>
          </div>
          
          <div className="tile" onClick={() => setShowJoin(true)}>
            <div className="tile-icon">🔗</div>
            <h3>Join</h3>
          </div>
          
          <div className="tile" onClick={() => alert('Scheduling coming soon!')}>
            <div className="tile-icon">📅</div>
            <h3>Schedule</h3>
          </div>
        </div>

        {showJoin && (
          <div className="join-area fade-in">
            <input 
              type="text" 
              placeholder="MEET-XXXXXX" 
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <button className="btn-join" onClick={handleJoin}>Connect to Orbit</button>
          </div>
        )}

        <div id="auth-status" className={authStatus.includes('ONLINE') ? 'online' : ''}>
          {authStatus}
        </div>
      </div>
    </div>
  );
}