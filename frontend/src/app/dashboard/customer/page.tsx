"use client";

import { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin, Loader2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, Cardtitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/api';
// We'll import the Booking Wizard Dialog later
import NewBookingDialog from './_components/NewBookingDialog';

export default function CustomerDashboard() {
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
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Bookings</h2>
                    <p className="text-slate-500">Manage your vehicle repairs and history</p>
                </div>
                <NewBookingDialog onBookingCreated={fetchBookings} />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : bookings.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">No bookings yet</h3>
                        <p className="mb-4">Schedule your first service to get started.</p>
                        <div className="mt-2">
                            <NewBookingDialog onBookingCreated={fetchBookings} />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                        >
                            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                                <div className={`h-1 w-full ${getStatusColor(booking.status).replace('text-', 'bg-').split(' ')[0].replace('100', '500')}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold">{booking.service.name}</h4>
                                            <p className="text-sm text-muted-foreground">{booking.vehicle.make} {booking.vehicle.model}</p>
                                        </div>
                                        <Badge variant="secondary" className={getStatusColor(booking.status)}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex items-center text-slate-500">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                                    </div>
                                    <div className="flex items-center text-slate-500">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <span className="truncate">{booking.locationAddress}</span>
                                    </div>

                                    {booking.mechanic && (
                                        <div className="mt-4 pt-4 border-t flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                {booking.mechanic.user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-xs">{booking.mechanic.user.name}</p>
                                                <div className="flex items-center text-yellow-500 text-xs">
                                                    <Star className="h-3 w-3 fill-current mr-1" />
                                                    {booking.mechanic.rating.toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === 'COMPLETED' && (
                                        <div className="mt-4 flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                                                Pay Now
                                            </Button>
                                            <Button size="sm" className="flex-1 text-xs bg-slate-900">
                                                Write Review
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
