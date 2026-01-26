'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Tag, LogOut, Menu, X, LayoutDashboard, List, Star, Ticket, Settings, Users, BarChart3, Palette, Package } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantModules, setTenantModules] = useState([]);
  const [tenantName, setTenantName] = useState('TurfAdmin');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            if (data.user.role === 'SUPER_ADMIN') {
              router.push('/super-admin/dashboard');
              return;
            }
            setIsAuthenticated(true);
            // Set tenant modules if available
            if (data.tenant) {
              setTenantModules(data.tenant.modules || []);
              setTenantName(data.tenant.name || 'TurfAdmin');
            }
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const allNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, requiredModule: null }, // Always visible
    { name: 'Listings', href: '/admin/listings', icon: List, requiredModule: ['turfs', 'hotels', 'events', 'gym', 'wellness'] }, // Visible if any of these
    { name: 'Products', href: '/admin/products', icon: Package, requiredModule: 'products' },
    { name: 'Slots', href: '/admin/slots', icon: Calendar, requiredModule: ['turfs', 'events'] }, // Mostly for time-slot based
    { name: 'Offers', href: '/admin/offers', icon: Tag, requiredModule: 'coupons' },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket, requiredModule: 'coupons' },
    { name: 'Reviews', href: '/admin/reviews', icon: Star, requiredModule: 'reviews' },
    { name: 'Branding', href: '/admin/branding', icon: Palette, requiredModule: null },
    { name: 'Settings', href: '/admin/settings', icon: Settings, requiredModule: null },
  ];

  const navItems = allNavItems.filter(item => {
    if (!item.requiredModule) return true;
    if (Array.isArray(item.requiredModule)) {
      return item.requiredModule.some(mod => tenantModules.includes(mod));
    }
    return tenantModules.includes(item.requiredModule);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-900">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-500">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center h-20 border-b border-slate-100 px-4">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 truncate w-full text-center">
              {tenantName}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group font-medium ${isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className={`mr-3 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group font-medium"
            >
              <LogOut size={20} className="mr-3 text-slate-400 group-hover:text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
