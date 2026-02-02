"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Wrench } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

// --- Schemas ---
const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
});

const registerSchema = z.object({
    name: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone required"),
    password: z.string().min(6, "Min 6 chars"),
    role: z.enum(["CUSTOMER", "MECHANIC"]),
    // Mechanic specific (optional in UI initially, but good to have)
    cnic: z.string().optional(),
});

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();

    // Separate forms might be cleaner, but unified state for simplicity here
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const res = await api.post(endpoint, data);

            if (res.data.success) {
                toast({ title: "Success", description: "Welcome to MechaniXpress!" });
                login(res.data.token, res.data.user);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />

                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription>
                        {isLogin ? 'Login to manage your vehicles or jobs' : 'Join MechaniXpress today'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <AnimatePresence mode="popLayout" initial={false}>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" placeholder="John Doe" {...register('name')} />
                                        {errors.name && <p className="text-xs text-red-500">{(errors.name as any).message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" placeholder="03001234567" {...register('phone')} />
                                        {errors.phone && <p className="text-xs text-red-500">{(errors.phone as any).message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>I am a...</Label>
                                        <div className="flex gap-4">
                                            <label className="flex-1 cursor-pointer">
                                                <input type="radio" value="CUSTOMER" className="peer sr-only" {...register('role')} defaultChecked />
                                                <div className="rounded-md border-2 border-muted p-4 hover:bg-slate-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all text-center">
                                                    <User className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                                                    <span className="text-sm font-medium">Customer</span>
                                                </div>
                                            </label>
                                            <label className="flex-1 cursor-pointer">
                                                <input type="radio" value="MECHANIC" className="peer sr-only" {...register('role')} />
                                                <div className="rounded-md border-2 border-muted p-4 hover:bg-slate-50 peer-checked:border-purple-500 peer-checked:bg-purple-50 transition-all text-center">
                                                    <Wrench className="mx-auto mb-2 h-6 w-6 text-slate-600" />
                                                    <span className="text-sm font-medium">Mechanic</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
                            {errors.email && <p className="text-xs text-red-500">{(errors.email as any).message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-xs text-red-500">{(errors.password as any).message}</p>}
                        </div>

                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t bg-slate-50/50 p-6">
                    <p className="text-sm text-slate-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-blue-600 hover:underline"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
