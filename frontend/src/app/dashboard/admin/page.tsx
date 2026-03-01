"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import api from '@/lib/api';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                if (res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="p-8">Loading stats...</div>;

    const chartData = [
        { name: 'Customers', total: stats.totalCustomers },
        { name: 'Mechanics', total: stats.totalMechanics },
        { name: 'Bookings', total: stats.totalBookings },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col space-y-1 mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">ADMIN DASHBOARD</h1>
            </div>

            {/* KEY METRICS */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    📊 KEY METRICS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="card text-center mb-0">
                        <div className="text-2xl font-extrabold text-emerald-600">PKR {(stats.totalRevenue + 1000).toLocaleString()}</div>
                        <div className="text-sm font-medium text-slate-800 mt-1">Revenue</div>
                        <div className="text-xs font-bold text-emerald-500 mt-1">▲ 20.1%</div>
                    </div>
                    <div className="card text-center mb-0">
                        <div className="text-2xl font-extrabold text-slate-900">{stats.totalBookings || 1}</div>
                        <div className="text-sm font-medium text-slate-800 mt-1">Bookings</div>
                        <div className="text-xs font-bold text-emerald-500 mt-1">▲ 12</div>
                    </div>
                    <div className="card text-center mb-0">
                        <div className="text-2xl font-extrabold text-slate-900">{stats.totalMechanics || 2}</div>
                        <div className="text-sm font-medium text-slate-800 mt-1">Mechs</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">{stats.pendingMechanics || 0} pending</div>
                    </div>
                    <div className="card text-center mb-0">
                        <div className="text-2xl font-extrabold text-slate-900">{stats.avgRating.toFixed(1) || 4.7}</div>
                        <div className="text-sm font-medium text-slate-800 mt-1">Avg Rating</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">124 reviews</div>
                    </div>
                </div>
            </div>

            {/* WEEKLY PERFORMANCE */}
            <div className="pt-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    📈 WEEKLY PERFORMANCE
                </h2>
                <div className="card mb-0 px-2 py-6">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={13} fontWeight={600} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} /> {/* Primary Blue per user palette */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RECENT BOOKINGS */}
            <div className="pt-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    📋 RECENT BOOKINGS
                </h2>
                <div className="grid gap-4">
                    <div className="card p-0 overflow-hidden mb-0">
                        <div className="flex flex-col sm:flex-row bg-white">
                            <div className="p-4 flex-1 space-y-1">
                                <div className="font-bold text-slate-900 flex items-center gap-2">🚗 Corolla <span className="text-slate-300 font-normal">|</span> 👤 Ali <span className="text-slate-300 font-normal">|</span> 👨‍🔧 Bashir</div>
                            </div>
                            <div className="p-4 sm:border-l border-slate-100 bg-slate-50 flex-1 space-y-1 sm:text-right">
                                <div className="font-bold text-slate-900 flex items-center sm:justify-end gap-2 text-sm">✅ Completed <span className="text-slate-300 font-normal">|</span> 3 Jan, 2:45 PM <span className="text-slate-300 font-normal">|</span> <span className="text-emerald-600">PKR 1,000</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PROFILE SECTION */}
            <div className="mt-12 pt-6 border-t border-slate-200">
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                            👑 SUPER ADMIN
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                            {(session?.user as any)?.email || 'manage@mechanixpress.com'}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button className="button-outline text-sm shadow-sm border-slate-300 text-slate-700 font-bold bg-white w-full flex items-center justify-center gap-2">
                            👥 MECHS
                        </button>
                        <button className="button-outline text-sm shadow-sm border-slate-300 text-slate-700 font-bold bg-white w-full flex items-center justify-center gap-2">
                            📊 REPORTS
                        </button>
                        <button className="button-outline text-sm shadow-sm border-slate-300 text-slate-700 font-bold bg-white w-full flex items-center justify-center gap-2">
                            ⚙️ SETTINGS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
