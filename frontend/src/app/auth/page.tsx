"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Wrench, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

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
    cnic: z.string().optional(),
    vehicleCategories: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
    if (data.role === "MECHANIC") {
        if (!data.cnic || data.cnic.length < 13) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "CNIC is required (13 digits)",
                path: ["cnic"],
            });
        }
    }
});

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();

    // Separate forms might be cleaner, but unified state for simplicity here
    const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
        defaultValues: {
            role: 'CUSTOMER'
        }
    });

    const selectedRole = watch('role');

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
            <Card className="w-full max-w-md overflow-hidden relative shadow-xl border-slate-200/60 transition-all">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-amber-500" />

                <CardHeader className="text-center pt-8">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 mt-2">
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
                                        <Label htmlFor="cnic">CNIC (National ID)</Label>
                                        <Input id="cnic" placeholder="1234567890123" {...register('cnic')} />
                                        {errors.cnic && <p className="text-xs text-red-500">{(errors.cnic as any).message}</p>}
                                    </div>

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

                                    {selectedRole === 'MECHANIC' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Shop Address / Base Location</Label>
                                                <Input id="address" placeholder="e.g. Shop #5, Auto Market, Karachi" {...register('address')} />
                                                <p className="text-[10px] text-slate-400">Customers will see this location</p>
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

                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
                            {errors.email && <p className="text-xs text-red-500">{(errors.email as any).message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {isLogin && (
                                    <Link href="/auth/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} {...register('password')} className="pr-10" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500">{(errors.password as any).message}</p>}
                        </div>

                        <Button type="submit" className="w-full font-bold text-md py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => signIn('google')}
                        >
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Google
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/80 p-6 backdrop-blur-sm">
                    <p className="text-sm font-medium text-slate-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
                        >
                            {isLogin ? 'Register now' : 'Login here'}
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
