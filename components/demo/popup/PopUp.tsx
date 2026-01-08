/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>SUCCESS CLASS | ORBIT</h2>
        <p>You are entering a luxury conversational environment powered by Gemini Live.</p>
        <p>Command Protocol:</p>
        <ol>
          <li><span className="icon">play_circle</span>Initialize the stream to take the floor.</li>
          <li><span className="icon">bolt</span>Natural speed audio with real-time function triggers.</li>
          <li><span className="icon">auto_awesome</span>AI Assistant specialized in high-performance tasks.</li>
        </ol>
        <button onClick={onClose}>Enter Success Class</button>
      </div>
    </div>
  );
};

export default PopUp;