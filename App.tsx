/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { useSettings } from './lib/state';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useRemoteTranscriptions } from './hooks/use-remote-transcriptions';
import Portal from './components/Portal';
import MediaConfig from './components/MediaConfig';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ControlTray from './components/console/control-tray/ControlTray';

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
    setRemoteMeetingId, 
    setIsWatchingRemote, 
    setMeetingRole 
  } = useSettings();

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
  }, [setRemoteMeetingId, setIsWatchingRemote, setMeetingRole, setPhase]);

  return (
    <div className="App">
      <LiveAPIProvider apiKey={API_KEY}>
        <RemoteListener />
        
        {phase === 'portal' && <Portal />}
        
        {phase === 'config' && <MediaConfig />}

        {phase === 'room' && (
          <div className="full-room-container">
            <iframe 
              src="https://eburon.ai/main-app/index.html" 
              className="main-app-iframe-fullscreen"
              title="Eburon Main App"
              allow="camera; microphone; display-capture; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen"
            />
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