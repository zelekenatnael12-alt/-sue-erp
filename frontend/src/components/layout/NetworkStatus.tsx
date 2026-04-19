import React, { useState, useEffect } from 'react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="network-indicator online" title="System Online">
        <span className="dot"></span>
        <span className="label">Online</span>
        <style>{`
          .network-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.7rem;
            font-weight: 800;
            color: #059669;
            background: #d1fae5;
            padding: 4px 10px;
            border-radius: 100px;
          }
          .network-indicator .dot {
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="network-indicator offline" title="System Offline">
      <span className="dot"></span>
      <span className="label">Offline</span>
      <style>{`
        .network-indicator.offline {
          color: #dc2626;
          background: #fee2e2;
        }
        .network-indicator.offline .dot {
          background: #ef4444;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NetworkStatus;
