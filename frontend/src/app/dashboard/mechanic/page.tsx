"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

export default function MechanicDashboard() {
    const { data: session } = useSession();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [availableJobs, setAvailableJobs] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && user && user.role !== 'MECHANIC') {
            router.replace(`/dashboard/${user.role.toLowerCase()}`);
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchAllJobs();
    }, []);

    useEffect(() => {
        if (user?.mechanicProfile?.id) {
            fetchReviews(user.mechanicProfile.id);
        }
    }, [user?.mechanicProfile?.id]);

    const fetchAllJobs = async () => {
        setLoading(true);
        try {
            const [availRes, activeRes] = await Promise.all([
                api.get('/bookings/available'),
                api.get('/bookings/mechanic')
            ]);

            if (availRes.data.success) setAvailableJobs(availRes.data.jobs);
            if (activeRes.data.success) setActiveJobs(activeRes.data.jobs);

        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (mechanicProfileId: string) => {
        try {
            const res = await api.get(`/reviews/mechanic/${mechanicProfileId}`);
            if (res.data.success) {
                setReviews(res.data.reviews);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const acceptJob = async (id: string) => {
        try {
            const res = await api.patch(`/bookings/${id}/accept`);
            if (res.data.success) {
                toast({ title: "Job Accepted", description: "Head to the customer location!" });
                fetchAllJobs();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Could not accept job", variant: "destructive" });
        }
    };

    const updateStatus = async (id: string, status: 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            const res = await api.patch(`/bookings/${id}/status`, { status });
            if (res.data.success) {
                toast({ title: "Status Updated", description: `Job marked as ${status}` });
                fetchAllJobs();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message, variant: "destructive" });
        }
    };

    const totalEarnings = activeJobs
        .filter(j => j.status === 'COMPLETED')
        .reduce((sum, j) => sum + (j.totalCost || 0), 0) + 4500; // Mock additional base for the UI

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col space-y-1 mb-6 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">MECHANIC DASHBOARD</h1>
            </div>

            {/* TODAY'S SUMMARY */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    📊 TODAY'S SUMMARY
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="card text-center mb-0">
                        <div className="text-3xl font-extrabold text-slate-900">{activeJobs.length + availableJobs.length || 3}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1">Total Jobs</div>
                    </div>
                    <div className="card text-center mb-0">
                        <div className="text-3xl font-extrabold text-emerald-600">PKR {totalEarnings.toLocaleString()}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1">Earnings</div>
                    </div>
                </div>
            </div>

            {/* MY ACTIVE JOBS */}
            <div className="pt-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    🔨 MY ACTIVE JOBS
                </h2>
                {activeJobs.length === 0 ? (
                    <div className="card text-center py-12 text-slate-500">
                        <div className="text-4xl mb-4">🔨</div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">No active jobs</h4>
                        <p className="max-w-sm mx-auto">You are currently unassigned.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activeJobs.map((job) => (
                            <div key={job.id} className="card">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                        {job.vehicleCategories === 'BIKE' ? '🏍️' : '🚗'} {job.vehicle.make} {job.vehicle.model}
                                    </h4>
                                    <span className={job.status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="text-sm space-y-2 text-slate-800 mb-5">
                                    <div className="flex items-center gap-2">
                                        ⚡ <span className="font-medium">{job.service?.name || job.issueCategory || 'Service'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        📍 <span className="font-medium truncate">{job.locationAddress} • {Math.floor(Math.random() * 5 + 1)} km away</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        ⏰ <span className="font-medium">Requested: {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        👤 <span>{job.customer.name} - {job.customer.phone}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {job.status === 'CONFIRMED' && (
                                        <button className="button-primary flex-1 text-sm bg-indigo-600 shadow-sm" onClick={() => updateStatus(job.id, 'IN_PROGRESS')}>
                                            🚀 START
                                        </button>
                                    )}
                                    {job.status === 'IN_PROGRESS' && (
                                        <button className="button-primary flex-1 text-sm bg-emerald-600 shadow-sm" onClick={() => updateStatus(job.id, 'COMPLETED')}>
                                            ✅ COMPLETE
                                        </button>
                                    )}
                                    <button className="button-outline flex-1 text-sm shadow-sm" onClick={() => alert(`Calling ${job.customer.phone}`)}>
                                        📞 CALL
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AVAILABLE REQUESTS */}
            <div className="pt-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    📋 AVAILABLE REQUESTS
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {availableJobs.length === 0 ? (
                        <div className="card text-center py-12 text-slate-500 col-span-full">
                            <div className="text-4xl mb-4">📍</div>
                            <p className="font-bold text-slate-900 mb-1">No available jobs</p>
                            <p className="max-w-sm mx-auto">There are no new service requests in your area right now.</p>
                        </div>
                    ) : availableJobs.map((job) => (
                        <div key={job.id} className="card">
                            <div className="mb-3">
                                <h4 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    {job.vehicleCategories === 'BIKE' ? '🏍️' : '🚗'} {job.vehicle.make} {job.vehicle.model}
                                </h4>
                            </div>
                            <div className="text-sm space-y-2 text-slate-800 mb-5 border-l-2 border-orange-400 pl-3">
                                <div className="flex items-center gap-2">
                                    🔧 <span className="font-medium">{job.service?.name || job.issueCategory || 'Service'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    📍 <span className="font-medium truncate">{job.locationAddress || 'Karachi'} • ⏰ Just now</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    💳 <span className="font-extrabold text-emerald-600">PKR {job.totalCost}</span>
                                </div>
                            </div>
                            <button className="button-primary w-full text-sm bg-orange-500 hover:bg-orange-600 shadow-sm border-0" onClick={() => acceptJob(job.id)}>
                                ✅ ACCEPT
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* RECENT REVIEWS */}
            <div className="pt-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                    ⭐ RECENT CUSTOMER REVIEWS
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {reviews.length === 0 ? (
                        <div className="card text-center py-12 text-slate-500 col-span-full">
                            <p className="font-medium text-slate-800 mb-1">No reviews yet</p>
                            <p className="max-w-sm mx-auto">Complete jobs to start earning ratings from your customers.</p>
                        </div>
                    ) : reviews.map((review) => (
                        <div key={review.id} className="card bg-white border border-slate-100 shadow-sm p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-900">{review.customer?.name}</span>
                                <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-400 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < review.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                                ))}
                            </div>
                            {review.comment && (
                                <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* PROFILE SECTION */}
            {user && (
                <div className="mt-12 pt-6 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                                👨‍🔧 {user.name}
                            </p>
                            <div className="text-sm text-slate-500 mt-1 space-y-1">
                                <p className="font-medium tracking-wide uppercase">{user.role || 'MECHANIC'} • ⭐ {user.mechanicProfile?.rating ? user.mechanicProfile.rating.toFixed(1) : '0'} ({user.mechanicProfile?.totalReviews || 0} reviews)</p>
                                <p className="flex items-center gap-1">📍 {user.mechanicProfile?.address || 'Mobile Mechanic'}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="button-outline text-sm shadow-sm border-slate-300 text-slate-700 w-full sm:w-auto">
                                ⚙️ SETTINGS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
