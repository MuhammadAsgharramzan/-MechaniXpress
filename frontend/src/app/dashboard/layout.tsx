"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Home, Wrench, User, Menu, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';
import { NotificationsDropdown } from './_components/NotificationsDropdown';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    // Track client-side mount to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // After mount: if auth check is done and no user, redirect to login
    useEffect(() => {
        if (mounted && !isLoading && !user) {
            router.replace('/auth');
        }
    }, [mounted, isLoading, user, router]);

    // Always render the same shell on server and during hydration
    // Show a centered spinner until both mounted + auth resolved
    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // After mount: if still no user (redirect is in flight), show nothing
    if (!user) return null;

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
                <Link href="/" className="flex items-center group">
                    <Wrench className="h-6 w-6 text-indigo-600 mr-2 group-hover:rotate-12 transition-transform" />
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Mechani<span className="text-indigo-600">X</span>press
                    </h1>
                </Link>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {user.role.toLowerCase()} Dashboard
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-2">
                {user.role === 'CUSTOMER' && (
                    <Link href="/dashboard/customer" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium transition-colors">
                        <Home className="h-5 w-5" />
                        Dashboard
                    </Link>
                )}
                {user.role === 'MECHANIC' && (
                    <Link href="/dashboard/mechanic" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium transition-colors">
                        <Wrench className="h-5 w-5" />
                        Job Board
                    </Link>
                )}
                {user.role === 'ADMIN' && (
                    <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium transition-colors">
                        <User className="h-5 w-5" />
                        Admin Control
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between px-4 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</span>
                    <NotificationsDropdown />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold ring-2 ring-white shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium rounded-lg transition-colors" onClick={logout}>
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:block w-64 bg-white border-r shadow-sm">
                <NavContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                    <span className="font-bold text-lg">MX</span>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 bg-white">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <NavContent />
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
