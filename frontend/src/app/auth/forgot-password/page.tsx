"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
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
import { useToast } from "@/hooks/use-toast";
import api from '@/lib/api';

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: { email: string }) => {
        setIsLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', data);

            if (res.data.success) {
                setIsSubmitted(true);
                toast({ title: "Email Sent!", description: "Check your inbox for the reset link." });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Could not process request",
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

                <CardHeader className="text-center pb-4 pt-8">
                    <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-slate-500 mt-2">
                        {isSubmitted
                            ? "We've sent you a secure recovery link."
                            : "Enter your email to receive a password reset link."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                    {!isSubmitted ? (
                        <motion.form
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register('email')}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>

                            <Button type="submit" className="w-full font-bold text-md py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Send Reset Link
                            </Button>
                        </motion.form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center space-y-4 py-6"
                        >
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                <MailCheck className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-center text-sm text-slate-600">
                                If an account exists for that email, we have sent password reset instructions.
                            </p>
                        </motion.div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/80 p-6 backdrop-blur-sm">
                    <Link href="/auth" className="flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
