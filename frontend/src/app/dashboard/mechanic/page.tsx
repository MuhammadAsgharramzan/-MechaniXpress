"use client";

import { useEffect, useState } from 'react';
import { Wrench, MapPin, Clock, DollarSign, Check, X, User, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

export default function MechanicDashboard() {
    const [availableJobs, setAvailableJobs] = useState<any[]>([]);
    const [activeJobs, setActiveJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAllJobs();
    }, []);

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

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mechanic Dashboard</h2>
                    <p className="text-slate-500">Manage your jobs and earnings</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-green-50 text-green-700 border-green-200">
                    Online & Ready
                </Badge>
            </div>

            {/* MY ACTIVE JOBS */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-blue-600" />
                    My Active Jobs
                </h3>
                {activeJobs.length === 0 ? (
                    <Card className="bg-slate-50 border-dashed">
                        <CardContent className="p-6 text-center text-slate-500">
                            No active jobs. Accept a request from the board below!
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeJobs.map((job) => (
                            <Card key={job.id} className="overflow-hidden border-l-4 border-l-blue-500 shadow-md">
                                <CardHeader className="pb-3 bg-blue-50/30">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{job.service.name}</CardTitle>
                                            <CardDescription>{job.vehicle.make} {job.vehicle.model}</CardDescription>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800">{job.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-slate-900 font-medium">
                                            <User className="h-4 w-4 mr-2 text-slate-500" />
                                            {job.customer.name}
                                        </div>
                                        <div className="flex items-center text-slate-900 font-medium">
                                            <Phone className="h-4 w-4 mr-2 text-slate-500" />
                                            {job.customer.phone}
                                        </div>
                                        <div className="flex items-start text-slate-600">
                                            <MapPin className="h-4 w-4 mr-2 text-slate-400 mt-1" />
                                            <span>{job.locationAddress}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        {job.status === 'CONFIRMED' && (
                                            <Button className="w-full bg-blue-600" onClick={() => updateStatus(job.id, 'IN_PROGRESS')}>
                                                Start Job
                                            </Button>
                                        )}
                                        {job.status === 'IN_PROGRESS' && (
                                            <Button className="w-full bg-green-600" onClick={() => updateStatus(job.id, 'COMPLETED')}>
                                                Complete Job
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* JOB BOARD */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-orange-600" />
                    Available Job Requests
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableJobs.length === 0 ? (
                        <Card className="col-span-full border-dashed bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                <p className="text-slate-500 font-medium">No available jobs in your area right now.</p>
                            </CardContent>
                        </Card>
                    ) : availableJobs.map((job) => (
                        <Card key={job.id} className="overflow-hidden border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 bg-orange-50/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{job.service.name}</CardTitle>
                                        <CardDescription>{job.vehicle.make} {job.vehicle.model}</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">PENDING</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-slate-600">
                                        <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                                        <span className="truncate">{job.locationAddress || 'Karachi, Roberts Road'}</span>
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                                        <span>{job.service.estimatedDuration}</span>
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <DollarSign className="h-4 w-4 mr-2 text-slate-400" />
                                        <span className="font-semibold text-slate-900">PKR {job.totalCost}</span>
                                    </div>
                                </div>

                                <Button className="w-full bg-slate-900" onClick={() => acceptJob(job.id)}>
                                    Accept Job
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
