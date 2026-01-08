/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useRef, useState } from 'react';
import PopUp from '../popup/PopUp';
import { Modality, LiveServerContent } from '@google/genai';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import {
  useSettings,
  useLogStore,
  useTools,
} from '../../../lib/state';
import { supabase } from '../../../lib/supabase';

export default function StreamingConsole() {
  const { client, setConfig, volume, connected } = useLiveAPIContext();
  const { systemPrompt, voice, meetingRole, remoteMeetingId } = useSettings();
  const { tools } = useTools();
  const turns = useLogStore(state => state.turns);
  const [showPopUp, setShowPopUp] = useState(true);

  // Persistence logic for transcriptions
  useEffect(() => {
    if (meetingRole !== 'transcriber' || !remoteMeetingId) return;

    const lastTurn = turns.at(-1);
    if (lastTurn && lastTurn.isFinal && lastTurn.role !== 'system') {
      supabase.from('transcriptions').insert({
        meeting_id: remoteMeetingId,
        transcribe_text_segment: lastTurn.text,
        full_transcription: lastTurn.text,
        speaker: lastTurn.role,
        created_at: lastTurn.timestamp
      }).then(({ error }) => {
        if (error) console.error('Failed to persist transcription:', error);
      });
    }
  }, [turns, meetingRole, remoteMeetingId]);

  useEffect(() => {
    const enabledTools = tools
      .filter(tool => tool.isEnabled)
      .map(tool => ({
        functionDeclarations: [
          {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        ],
      }));

    const config: any = {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      tools: enabledTools,
    };
    setConfig(config);
  }, [setConfig, systemPrompt, tools, voice]);

  useEffect(() => {
    const { addTurn, updateLastTurn } = useLogStore.getState();

    const handleInputTranscription = (text: string, isFinal: boolean) => {
      const currentTurns = useLogStore.getState().turns;
      const last = currentTurns[currentTurns.length - 1];
      if (last && last.role === 'user' && !last.isFinal) {
        updateLastTurn({ text: last.text + text, isFinal });
      } else {
        addTurn({ role: 'user', text, isFinal });
      }
    };

    const handleOutputTranscription = (text: string, isFinal: boolean) => {
      const currentTurns = useLogStore.getState().turns;
      const last = currentTurns[currentTurns.length - 1];
      if (last && last.role === 'agent' && !last.isFinal) {
        updateLastTurn({ text: last.text + text, isFinal });
      } else {
        addTurn({ role: 'agent', text, isFinal });
      }
    };

    const handleContent = (serverContent: LiveServerContent) => {
      const text = serverContent.modelTurn?.parts?.map((p: any) => p.text).filter(Boolean).join(' ') ?? '';
      if (!text) return;

      const currentTurns = useLogStore.getState().turns;
      const last = currentTurns.at(-1);

      if (last?.role === 'agent' && !last.isFinal) {
        updateLastTurn({ text: last.text + text });
      } else {
        addTurn({ role: 'agent', text, isFinal: false });
      }
    };

    const handleTurnComplete = () => {
      const last = useLogStore.getState().turns.at(-1);
      if (last && !last.isFinal) {
        updateLastTurn({ isFinal: true });
      }
    };

    client.on('inputTranscription', handleInputTranscription);
    client.on('outputTranscription', handleOutputTranscription);
    client.on('content', handleContent);
    client.on('turncomplete', handleTurnComplete);

    return () => {
      client.off('inputTranscription', handleInputTranscription);
      client.off('outputTranscription', handleOutputTranscription);
      client.off('content', handleContent);
      client.off('turncomplete', handleTurnComplete);
    };
  }, [client]);

  // Reactive Orb Scale bound to audio volume
  const orbScale = connected ? 1 + (volume * 1.8) : 1;
  const orbGlow = connected ? `0 0 ${60 + (volume * 150)}px var(--gold-glow)` : `0 0 30px rgba(0,0,0,0.5)`;

  return (
    <div className="orb-platform-container">
      {showPopUp && <PopUp onClose={() => setShowPopUp(false)} />}
      
      <div className="orb-centerpiece">
        <div 
          className="main-orb" 
          style={{ 
            transform: `scale(${orbScale})`,
            boxShadow: orbGlow
          }}
        >
          <div className="orb-core"></div>
          <div className="orb-glass-layer"></div>
          <div className="orb-rim-glow"></div>
        </div>
        <div className="orb-shadow-reactive" style={{ transform: `scale(${0.8 + volume})`, opacity: 0.3 + volume }}></div>
      </div>

      <div className="transcription-overlay">
        {turns.slice(-2).map((t, i) => (
          <div key={i} className={`minimal-turn ${t.role}`}>
             <p>{t.text}</p>
          </div>
        ))}
      </div>

      {!connected && (
        <div className="platform-hint">
          PROTOCOL READY. INITIATE STREAM TO START CONVERSATION.
        </div>
      )}
    </div>
  );
}