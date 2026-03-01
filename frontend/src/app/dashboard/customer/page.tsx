"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import api from '@/lib/api';
// We'll import the Booking Wizard Dialog later
import NewBookingDialog from './_components/NewBookingDialog';

export default function CustomerDashboard() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/customer');
            if (res.data.success) {
                setBookings(res.data.bookings);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'CONFIRMED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CANCELLED': return 'bg-rose-100 text-rose-800 border-rose-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col space-y-1 mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">CUSTOMER DASHBOARD</h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    📋 MY BOOKINGS
                </h2>
                <NewBookingDialog onBookingCreated={fetchBookings} />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="text-slate-500 font-medium">Loading...</span>
                </div>
            ) : bookings.length === 0 ? (
                <div className="card text-center py-16 text-slate-500">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No active bookings</h3>
                    <p className="mb-6 max-w-sm mx-auto leading-relaxed">Schedule your first service and let our expert mechanics get you back on the road safely.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {bookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                        >
                            <div className="card">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                            🔧 {booking.service?.name || booking.issueCategory || 'Vehicle Service'}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2 mt-1">
                                            {booking.vehicle.make === 'Honda CD-125' || booking.vehicleCategories === 'BIKE' ? '🏍️' : '🚗'} {booking.vehicle.make} {booking.vehicle.model}
                                        </p>
                                    </div>
                                    <span className={booking.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}>
                                        {booking.status === 'COMPLETED' ? '✅ COMPLETED' : '⏳ PENDING'}
                                    </span>
                                </div>

                                <div className="text-sm space-y-2 text-slate-800 mb-4">
                                    <div className="flex items-center gap-2">
                                        📅 <span className="font-medium">{new Date(booking.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {booking.scheduledTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        📍 <span className="font-medium truncate">{booking.locationAddress}</span>
                                    </div>
                                </div>

                                {booking.mechanic && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-800">
                                        <div className="flex items-center gap-2">
                                            👨‍🔧 <span className="font-bold">{booking.mechanic.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            ⭐ <span className="font-medium">{booking.mechanic.rating.toFixed(1)} (124 reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            📍 <span className="font-medium truncate">{booking.mechanic.address || 'Sadar, Karachi'}</span>
                                        </div>
                                    </div>
                                )}

                                {booking.status === 'COMPLETED' && (
                                    <div className="mt-5">
                                        <button className="button-outline text-sm py-2 px-4 shadow-sm w-auto">
                                            ✍️ WRITE REVIEW
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {session?.user && (
                <div className="mt-12 pt-6 border-t border-slate-200 text-slate-600">
                    <p className="font-bold text-slate-800 text-lg">👋 Welcome back, {(session?.user as any)?.name?.split(' ')[0] || 'Guest'}!</p>
                    <p className="font-medium tracking-wide text-sm text-slate-500 uppercase">{(session?.user as any)?.role || 'CUSTOMER'}</p>
                </div>
            )}
        </div>
    );
}
