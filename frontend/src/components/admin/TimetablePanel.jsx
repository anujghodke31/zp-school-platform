import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetablePanel = ({ classes, subjects, teachers }) => {
    const [selectedClass, setSelectedClass] = useState('');
    const [slots, setSlots] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!selectedClass) return;
        setLoading(true);
        api.get(`/data/timetable?classId=${selectedClass}`)
            .then(res => {
                const map = {};
                (res.data.data || []).forEach(s => { map[`${s.day}_${s.period}`] = s; });
                setSlots(map);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedClass]);

    const setSlot = (day, period, field, value) => {
        const key = `${day}_${period}`;
        setSlots(prev => ({ ...prev, [key]: { ...prev[key], classId: selectedClass, day, period, [field]: value } }));
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            await Promise.all(
                Object.values(slots).map(s => api.post('/data/timetable', s))
            );
        } catch (err) {
            console.error('Save timetable error:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="panel slide-in active">
            <div className="panel-card">
                <div className="panel-title-row">
                    <span>Timetable Manager</span>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select className="form-input" style={{ width: '180px' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                            <option value="">Select Class…</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.grade} {c.section}</option>)}
                        </select>
                        <button className="btn btn-saffron" onClick={saveAll} disabled={!selectedClass || saving}>
                            {saving ? 'Saving…' : 'Save Timetable'}
                        </button>
                    </div>
                </div>

                {loading && <div className="empty-state"><i className="fa-solid fa-spinner fa-spin" /> Loading...</div>}

                {!loading && selectedClass && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="th-navy">Period</th>
                                    {DAYS.map(d => <th key={d} className="th-navy">{d}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {PERIODS.map(p => (
                                    <tr key={p} className="table-row">
                                        <td className="td" style={{ fontWeight: 700 }}>P{p}</td>
                                        {DAYS.map(d => {
                                            const key = `${d}_${p}`;
                                            const slot = slots[key] || {};
                                            return (
                                                <td key={d} className="td" style={{ minWidth: '160px' }}>
                                                    <select className="form-input" style={{ fontSize: '.8rem', marginBottom: '.25rem' }} value={slot.subjectId || ''} onChange={e => setSlot(d, p, 'subjectId', e.target.value)}>
                                                        <option value="">— Subject —</option>
                                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                    </select>
                                                    <select className="form-input" style={{ fontSize: '.8rem' }} value={slot.teacherId || ''} onChange={e => setSlot(d, p, 'teacherId', e.target.value)}>
                                                        <option value="">— Teacher —</option>
                                                        {teachers.filter(t => t.role === 'Teacher').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!selectedClass && !loading && (
                    <div className="empty-state">Select a class to manage its timetable.</div>
                )}
            </div>
        </div>
    );
};

export default TimetablePanel;
