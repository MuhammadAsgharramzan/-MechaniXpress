"use client";

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

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
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const token = searchParams.get('token');

    const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetFormValues) => {
        if (!token) {
            toast({
                title: "Invalid Link",
                description: "Password reset token is missing from the URL.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/reset-password', {
                token,
                newPassword: data.password
            });

            if (res.data.success) {
                toast({ title: "Password Reset Successfully!", description: "You can now login with your new password." });
                router.push('/auth');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Could not reset password. The link may have expired.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <KeyRound className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900">Invalid Reset Link</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                        This password reset link is invalid or missing a security token. Please request a new link from the login page.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/auth')} className="mt-4">
                    Return to Login
                </Button>
            </div>
        );
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
        >
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register('password')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register('confirmPassword')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full font-bold text-md py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Reset Password
            </Button>
        </motion.form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md overflow-hidden relative shadow-xl border-slate-200/60 transition-all">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-amber-500" />

                <CardHeader className="text-center pb-4 pt-8">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Create New Password
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 mt-2">
                        Please enter your new secure password below.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 pb-8">
                    <Suspense fallback={
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
