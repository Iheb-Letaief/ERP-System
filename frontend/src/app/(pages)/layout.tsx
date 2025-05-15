'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import '../globals.css';
import LogoutButton from "@/app/components/LogoutButton";

interface LayoutProps {
    children: React.ReactNode;
}

export default function PagesLayout({ children }: LayoutProps) {
    return (
        <SessionProvider>
            <ProtectedRoute>
                {children}
            </ProtectedRoute>
        </SessionProvider>
    );
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/login');
        }
    }, [session, status, router]);

    if (status === 'loading' || !session) {
        return (
            <div className="page page-center">
                <div className="container container-tight py-4">
                    <div className="text-center">
                        <span className="spinner-border spinner-border-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Sidebar
                user={session?.user ?
                    {
                        name: session.user.name,
                        role: (["admin", "manager", "user"].includes(session.user.role)
                            ? session.user.role as "admin" | "manager" | "user"
                            : "user")
                    } : null
                }
            />
            <main className="content">
                <div className="container-fluid p-0">{children}</div>
            </main>
            <LogoutButton />

        </div>
    );
};