"use client";

import { useEffect, useState } from 'react';
import { Wrench, MapPin, Clock, DollarSign, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

export default function MechanicDashboard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/bookings/available');
            if (res.data.success) {
                setJobs(res.data.jobs);
            }
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
                fetchJobs(); // Refresh list
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Could not accept job",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Job Board</h2>
                <Badge variant="outline" className="px-3 py-1 text-sm bg-green-50 text-green-700 border-green-200">
                    Online & Ready
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.length === 0 ? (
                    <Card className="col-span-full border-dashed bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <Wrench className="h-10 w-10 text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">No available jobs in your area right now.</p>
                        </CardContent>
                    </Card>
                ) : jobs.map((job) => (
                    <Card key={job.id} className="overflow-hidden border-l-4 border-l-orange-500 shadow-md">
                        <CardHeader className="pb-3 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{job.service.name}</CardTitle>
                                    <CardDescription>{job.vehicle.make} {job.vehicle.model}</CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                    PENDING
                                </Badge>
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

                            <div className="flex gap-2 pt-2">
                                <Button className="flex-1 bg-slate-900" onClick={() => acceptJob(job.id)}>
                                    Accept Job
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
