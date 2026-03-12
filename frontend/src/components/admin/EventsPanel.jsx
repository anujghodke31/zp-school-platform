import React, { useState } from 'react';
import api from '../../utils/api';

const EventsPanel = ({ events, onRefresh }) => {
    const [form, setForm] = useState({ title: '', description: '', date: '' });
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleAdd = async () => {
        if (!form.title || !form.date) return;
        setAdding(true);
        try {
            await api.post('/data/events', form);
            setForm({ title: '', description: '', date: '' });
            setShowForm(false);
            onRefresh();
        } catch (err) {
            console.error('Add event error:', err);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="panel slide-in active">
            <div className="panel-card">
                <div className="panel-title-row">
                    <span>School Events &amp; Holidays</span>
                    <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
                        <i className="fa-solid fa-plus" /> Add Event
                    </button>
                </div>

                {showForm && (
                    <div className="form-inline-row">
                        <input className="form-input" placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        <input className="form-input" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        <button className="btn btn-saffron" onClick={handleAdd} disabled={adding}>{adding ? 'Saving…' : 'Save'}</button>
                    </div>
                )}

                <div className="events-list">
                    {events.length > 0 ? events.map(event => {
                        const d = new Date(event.date);
                        return (
                            <div key={event.id} className="event-item">
                                <div className="event-date-badge">
                                    <div className="event-day">{d.getDate().toString().padStart(2, '0')}</div>
                                    <div className="event-month">{d.toLocaleString('default', { month: 'short' })}</div>
                                </div>
                                <div>
                                    <div className="event-title">{event.title}</div>
                                    <div className="text-muted text-xs">{event.description}</div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="empty-state">No upcoming events found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsPanel;
