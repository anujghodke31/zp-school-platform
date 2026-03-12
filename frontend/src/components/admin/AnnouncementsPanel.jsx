import React, { useState } from 'react';
import api from '../../utils/api';

const AnnouncementsPanel = () => {
    const [noticeText, setNoticeText] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!noticeText.trim()) return;
        setSending(true);
        try {
            await api.post('/notices', { title: 'Admin Announcement', message: noticeText, audience: 'All' });
            setNoticeText('');
        } catch (err) {
            console.error('Failed to send notice:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="panel slide-in active">
            <div className="panel-card" style={{ maxWidth: '600px' }}>
                <h4 className="panel-section-title">Broadcast Announcement (SSE)</h4>
                <div className="form-group mb-sm">
                    <label className="form-label">Notice Title</label>
                    <input className="form-input" value="Admin Announcement" disabled />
                </div>
                <div className="form-group mb-sm">
                    <label className="form-label">Message</label>
                    <textarea
                        className="form-input"
                        rows="4"
                        placeholder="Type your notice here..."
                        value={noticeText}
                        onChange={e => setNoticeText(e.target.value)}
                    />
                </div>
                <button className="btn btn-saffron w-100" onClick={handleSend} disabled={sending}>
                    {sending ? 'Sending…' : 'Broadcast to Network'} <i className="fa-solid fa-tower-broadcast" />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementsPanel;
