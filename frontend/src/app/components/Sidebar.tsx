'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import * as bootstrap from 'bootstrap';
import {
    IconDashboard,
    IconPackage,
    IconBox,
    IconUsers,
    IconLock,
    IconBuildingWarehouse
} from '@tabler/icons-react';


interface SidebarProps {
    user: { name: string; role: 'admin' | 'manager' | 'user' } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <IconDashboard size={24} />, roles: ['admin', 'manager', 'user'] },
        { href: '/products', label: 'Products', icon: <IconPackage size={24} />, roles: ['admin', 'manager', 'user'] },
        { href: '/inventory', label: 'Inventory', icon: <IconBuildingWarehouse size={24} />, roles: ['admin', 'manager', 'user'] },
        { href: '/admin/users', label: 'User Management', icon: <IconUsers size={24} />, roles: ['admin'] },
        { href: '/manager/users', label: 'Manage Permissions', icon: <IconLock size={24} />, roles: ['manager'] },
    ];

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
        }
    }, [isCollapsed]);

    return (
        <aside className={`navbar navbar-vertical navbar-expand-lg bg-dark d-flex flex-column ${isCollapsed ? 'navbar-collapsed' : ''}`} style={{ minHeight: '100vh', transition: 'width 0.3s' }}>
            <div className="navbar-nav w-100 p-3">
                <button
                    className="navbar-toggler p-2 text-white"
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle Navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <h1 className="navbar-brand text-white d-flex align-items-center py-3">
                    <span className="me-2 ti ti-layout-grid"></span>
                    {!isCollapsed && <span><b><i>ERP-Sys</i></b></span>}
                </h1>
                <div className="navbar-nav flex-column mt-5">
                    {menuItems
                        .filter((item) => user && item.roles.includes(user.role))
                        .map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="nav-link text-white d-flex align-items-start py-2 px-3"
                                data-bs-toggle={isCollapsed ? 'tooltip' : ''}
                                data-bs-placement="right"
                                data-bs-title={isCollapsed ? item.label : ''}
                            >
                                <span className="nav-link-icon">{item.icon}</span>
                                {!isCollapsed && <span className="ms-2">{item.label}</span>}
                            </Link>
                        ))}
                </div>
                <div className="mt-auto border-top pt-3 w-100">
                    <div className="nav-item">
                        <a href="#" className="nav-link text-white d-flex align-items-start py-2 px-3">
                            <span className="nav-link-icon ti ti-user"></span>
                            {!isCollapsed && <span className="ms-2">{user?.name || 'User'}</span>}
                        </a>
                    </div>
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;