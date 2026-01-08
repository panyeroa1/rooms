
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import ControlTray from './components/console/control-tray/ControlTray';
import ErrorScreen from './components/demo/ErrorScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Portal from './components/Portal';
import MediaConfig from './components/MediaConfig';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useRemoteTranscriptions } from './hooks/use-remote-transcriptions';
import { useSettings } from './lib/state';

const API_KEY = process.env.API_KEY as string;
if (!API_KEY) {
  throw new Error(
    'Missing required environment variable: process.env.API_KEY'
  );
}

function RemoteListener() {
  useRemoteTranscriptions();
  return null;
}

function App() {
  const { 
    phase,
    setPhase,
    remoteMeetingId, 
    setRemoteMeetingId, 
    setIsWatchingRemote, 
    setMeetingRole 
  } = useSettings();

  // Initialize state from URL on first mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mid = params.get('mid');
    const role = params.get('role') as any;

    if (mid) {
      setRemoteMeetingId(mid);
      setIsWatchingRemote(true);
      setMeetingRole(role || 'listener');
      setPhase('room');
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const m = p.get('mid');
      const r = p.get('role') as any;
      if (m) {
        setRemoteMeetingId(m);
        setIsWatchingRemote(true);
        setMeetingRole(r || 'listener');
        setPhase('room');
      } else {
        setRemoteMeetingId('');
        setIsWatchingRemote(false);
        setMeetingRole(null);
        setPhase('portal');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setRemoteMeetingId, setIsWatchingRemote, setMeetingRole, setPhase]);

  return (
    <div className="App">
      <LiveAPIProvider apiKey={API_KEY}>
        {phase === 'portal' && (
          <>
            <Portal />
            <Sidebar />
          </>
        )}
        
        {phase === 'config' && (
          <>
            <MediaConfig />
            <Sidebar />
          </>
        )}

        {phase === 'room' && (
          <div className="full-room-container">
            <RemoteListener />
            <ErrorScreen />
            
            {/* Immersive Embedding Platform */}
            <iframe 
              src="https://eburon.ai/main-app/index.html" 
              className="main-app-iframe"
              title="Eburon Main App"
              allow="camera; microphone; display-capture; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen"
            />

            {/* Floating Protocol UI */}
            <Header />
            <Sidebar />
            <div className="floating-controls-overlay">
              <ControlTray />
            </div>
          </div>
        )}
      </LiveAPIProvider>
    </div>
  );
}

export default App;
