import React, { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';

const ToastNotification = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Connect to Node.js SSE stream
        const eventSource = new EventSource('http://localhost:8000/api/stream');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notice') {
                const id = Date.now();
                setToasts(prev => [...prev, { id, title: data.title, message: data.message }]);

                // Auto dismiss after 5 seconds
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id));
                }, 5000);
            }
        };

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            // In a production app, we would handle reconnection logic gracefully
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {toasts.map(toast => (
                <div key={toast.id} className="toast slide-in" style={{
                    background: 'var(--surface-color)',
                    borderLeft: '4px solid var(--primary-color)',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    minWidth: '300px'
                }}>
                    <BellRing style={{ color: 'var(--primary-color)' }} size={20} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{toast.title}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#ccc' }}>{toast.message}</p>
                    </div>
                    <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastNotification;
