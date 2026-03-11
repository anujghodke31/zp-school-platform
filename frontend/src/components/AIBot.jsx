import React, { useState } from 'react';

const AIBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: "Namaste! 🙏 I'm Vishwa-Mitra, your school support assistant. Ask me about fees, homework, school events, or student progress — in Marathi or English!" }
    ]);
    const [input, setInput] = useState('');

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { sender: 'user', text: input }]);
        setInput('');

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text: 'I am a demo AI. In a real environment, I would connect to the MahaVidya language models to provide accurate, context-aware information directly translated.' }]);
        }, 800);
    };

    return (
        <div className="vm-widget" aria-label="Vishwa-Mitra AI Assistant">
            <div className={`vm-chat-panel ${isOpen ? 'visible' : ''}`} role="dialog" aria-modal="true" aria-label="Vishwa-Mitra AI chat">
                <div className="vm-chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="vm-avatar"><i className="fa-solid fa-robot"></i></div>
                        <div>
                            <strong style={{ color: '#fff' }}>Vishwa-Mitra AI</strong>
                            <br />
                            <span className="vm-online-indicator">● Online — Marathi & English</span>
                        </div>
                    </div>
                    <button
                        onClick={toggleChat}
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                        aria-label="Close chat"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="vm-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`vm-msg ${msg.sender === 'bot' ? 'vm-msg-bot' : 'vm-msg-user'}`}>
                            <div className="vm-bubble">{msg.text}</div>
                        </div>
                    ))}
                </div>

                <div className="vm-input-bar">
                    <button className="vm-voice-btn" aria-label="Start voice input in Marathi">
                        <i className="fa-solid fa-microphone"></i>
                    </button>
                    <input
                        type="text"
                        className="vm-input"
                        placeholder="Type in English or मराठी..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="vm-send-btn" onClick={handleSend} aria-label="Send message">
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
            </div>

            <button className="vm-fab" onClick={toggleChat} aria-label="Open Vishwa-Mitra AI Assistant" aria-expanded={isOpen}>
                <i className="fa-solid fa-robot vm-fab-icon"></i>
                <span className="vm-fab-label">Ask AI</span>
            </button>
        </div>
    );
};

export default AIBot;
