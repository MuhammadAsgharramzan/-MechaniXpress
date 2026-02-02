"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Home, Wrench, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';

import { NotificationsDropdown } from './_components/NotificationsDropdown';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) {
        // Basic protection, though middleware would be better
        return <div className="p-8 text-center">Loading or Unauthorized...</div>;
    }

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MechaniXpress
                </h1>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {user.role.toLowerCase()} Dashboard
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {user.role === 'CUSTOMER' && (
                    <Link href="/dashboard/customer" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-slate-100 text-slate-700">
                        <Home className="h-5 w-5" />
                        Home
                    </Link>
                )}
                {user.role === 'MECHANIC' && (
                    <Link href="/dashboard/mechanic" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-slate-100 text-slate-700">
                        <Wrench className="h-5 w-5" />
                        Jobs
                    </Link>
                )}
                {user.role === 'ADMIN' && (
                    <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-slate-100 text-slate-700">
                        <User className="h-5 w-5" />
                        Admin
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center justify-between px-4 pb-2">
                    <NotificationsDropdown />
                </div>
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                    </div>
                </div>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
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
