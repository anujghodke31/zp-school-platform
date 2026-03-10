import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import { Users, GraduationCap, Home, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/data/admin/stats');
                if (data.success) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <Sidebar role="Admin" />

            <main className="main-content">
                <TopBar title="Admin Overview" />

                <div className="content-area">
                    <div className="section-header">
                        <h2>District Overview</h2>
                        <div className="header-actions">
                            <button className="primary-btn shrink-btn">Export Report</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="dashboard-grid"><div style={{ color: 'white' }}>Loading metrics...</div></div>
                    ) : (
                        <div className="dashboard-grid">
                            <StatCard
                                title="Total Students"
                                value={stats?.total_students || 0}
                                subtitle="+12% from last year"
                                icon={<GraduationCap size={24} />}
                                colorClass="blue-glow"
                            />
                            <StatCard
                                title="Average Attendance"
                                value={`${stats?.avg_attendance || 0}%`}
                                subtitle="Network wide"
                                icon={<Activity size={24} />}
                                colorClass="green-glow"
                            />
                            <StatCard
                                title="Total Teachers"
                                value={stats?.total_teachers || 0}
                                subtitle="Active personnel"
                                icon={<Users size={24} />}
                                colorClass="purple-glow"
                            />
                            <StatCard
                                title="Schools in Network"
                                value={stats?.schools_in_network || 0}
                                subtitle="Nashik District"
                                icon={<Home size={24} />}
                                colorClass="orange-glow"
                            />
                        </div>
                    )}

                    <div className="panel-grid slide-in" style={{ marginTop: '2rem' }}>
                        <div className="panel data-panel">
                            <div className="panel-header">
                                <h3>Data Tables & More Components</h3>
                            </div>
                            <div className="panel-body" style={{ color: '#ccc' }}>
                                (Next up: Building DataTables, Teacher Panels, and linking SSE EventSources).
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
