"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function NewBookingDialog({ onBookingCreated }: { onBookingCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const [services, setServices] = useState<any[]>([]);
    // We use user?.vehicles from context if available, else we might need to fetch profile again or rely on what we have
    const [vehicles, setVehicles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        vehicleId: '',
        serviceId: '',
        scheduledDate: '',
        scheduledTime: '',
        locationAddress: '',
        locationLat: 24.8607, // Default Karachi
        locationLng: 67.0011,
        problemDescription: '',
    });

    useEffect(() => {
        if (open) {
            fetchServices();
            if (user && (user as any).vehicles) {
                setVehicles((user as any).vehicles);
            } else {
                // Fallback fetch if vehicles not in context user object (it should be)
                api.get('/auth/me').then(res => {
                    if (res.data.success) setVehicles(res.data.user.vehicles);
                });
            }
        }
    }, [open, user]);

    const fetchServices = async () => {
        try {
            const res = await api.get('/services');
            if (res.data.success) setServices(res.data.services);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async () => {
        if (!formData.vehicleId || !formData.serviceId || !formData.scheduledDate || !formData.scheduledTime || !formData.locationAddress) {
            toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                scheduledDate: new Date(formData.scheduledDate).toISOString(),
                // Mock map coords handling if address is typed manually
            };

            const res = await api.post('/bookings', payload);
            if (res.data.success) {
                toast({ title: "Success", description: "Booking created successfully!" });
                setOpen(false);
                setStep(1);
                onBookingCreated();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to create booking", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    New Booking
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Service (Step {step}/2)</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label>Select Vehicle</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, vehicleId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your vehicle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select Service</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, serviceId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                <div className="flex justify-between w-full gap-4">
                                                    <span>{s.name}</span>
                                                    <span className="text-muted-foreground font-mono">PKR {s.basePrice}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Describe the issue (optional)"
                                    value={formData.problemDescription}
                                    onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input
                                    placeholder="Home Address / Landmark"
                                    value={formData.locationAddress}
                                    onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Coordinates will be mocked for this test.</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-between">
                    {step === 2 ? (
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    ) : (
                        <div />
                    )}

                    {step === 1 ? (
                        <Button onClick={() => setStep(2)}>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Booking
                        </Button>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
