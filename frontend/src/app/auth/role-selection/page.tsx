"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Wrench } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

const roleSelectionSchema = z.object({
    role: z.enum(["CUSTOMER", "MECHANIC"]),
    address: z.string().optional(),
    experienceYears: z.string().optional(),
    vehicleCategories: z.array(z.string()).optional(),
});

function RoleSelectionForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const googleId = searchParams.get('googleId');
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();

    // If somehow landed here without Google context, boot them back to login
    useEffect(() => {
        if (!email || !googleId) {
            router.push('/auth');
        }
    }, [email, googleId, router]);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
        resolver: zodResolver(roleSelectionSchema),
        defaultValues: {
            role: 'CUSTOMER'
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Append the Google payload parameters hidden from the URL
            const payload = {
                ...data,
                email,
                name: name || 'Google User',
                googleId,
            };

            const res = await api.post('/auth/google-register', payload);

            if (res.data.success) {
                // 1. Establish NextAuth Server Session
                await signIn('role-selection', {
                    token: res.data.token,
                    userStr: JSON.stringify(res.data.user),
                    redirect: false,
                });

                // 2. Establish our own Frontend Context & perform the redirect
                toast({ title: "Success", description: "Welcome to MechaniXpress!" });
                login(res.data.token, res.data.user);
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            const errorReason = error.response?.data?.message || error.message || "Failed to finalize registration";
            toast({
                title: "Error",
                description: errorReason,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !googleId) return null;

    return (
        <Card className="w-full max-w-md overflow-hidden relative shadow-xl border-slate-200/60 transition-all">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-amber-500" />

            <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Almost Done!
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 mt-2">
                    Before we finish signing you in, tell us how you want to use MechaniXpress.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-slate-700">I am a...</Label>
                        <div className="flex gap-4">
                            <label className="flex-1 cursor-pointer group">
                                <input type="radio" value="CUSTOMER" className="peer sr-only" {...register('role')} defaultChecked />
                                <div className="rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:shadow-sm transition-all text-center">
                                    <User className="mx-auto mb-2 h-7 w-7 text-slate-400 peer-checked:group-[]:text-indigo-600 transition-colors" />
                                    <span className="text-sm font-bold text-slate-600 peer-checked:group-[]:text-indigo-700">Customer</span>
                                </div>
                            </label>
                            <label className="flex-1 cursor-pointer group">
                                <input type="radio" value="MECHANIC" className="peer sr-only" {...register('role')} />
                                <div className="rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:shadow-sm transition-all text-center">
                                    <Wrench className="mx-auto mb-2 h-7 w-7 text-slate-400 peer-checked:group-[]:text-amber-600 transition-colors" />
                                    <span className="text-sm font-bold text-slate-600 peer-checked:group-[]:text-amber-700">Mechanic</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout" initial={false}>
                        {selectedRole === 'MECHANIC' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="address">Shop Address / Base Location</Label>
                                    <Input id="address" placeholder="e.g. Shop #5, Auto Market, Karachi" {...register('address')} />
                                    <p className="text-[10px] text-slate-400">Customers will see this location</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experienceYears">Years of Experience</Label>
                                    <Input id="experienceYears" type="number" placeholder="e.g. 5" {...register('experienceYears')} />
                                </div>

                                <div className="space-y-3">
                                    <Label className="font-bold text-slate-700">I repair...</Label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 cursor-pointer group">
                                            <input type="checkbox" value="CAR" className="peer sr-only" {...register('vehicleCategories')} />
                                            <div className="rounded-xl border-2 border-slate-200 p-3 hover:bg-slate-50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all text-center font-bold text-slate-600 peer-checked:group-[]:text-indigo-700">
                                                🚗 Cars
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer group">
                                            <input type="checkbox" value="BIKE" className="peer sr-only" {...register('vehicleCategories')} />
                                            <div className="rounded-xl border-2 border-slate-200 p-3 hover:bg-slate-50 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition-all text-center font-bold text-slate-600 peer-checked:group-[]:text-indigo-700">
                                                🏍️ Bikes
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" className="w-full font-bold text-md py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all mt-4" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Complete Registration
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function RoleSelectionPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
                <RoleSelectionForm />
            </Suspense>
        </div>
    );
}
