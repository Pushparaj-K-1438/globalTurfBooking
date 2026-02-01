'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Tag, LogOut, Menu, X, LayoutDashboard, List, Star, Ticket, Settings, Users, BarChart3, Palette, Package, ShoppingCart, CalendarCheck, Hotel, Dumbbell, Heart, PartyPopper, Boxes, CalendarDays, PieChart } from 'lucide-react';

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
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, requiredModule: null },
    { name: 'Listings', href: '/admin/listings', icon: List, requiredModule: ['turfs'] },
    { name: 'Hotels', href: '/admin/hotels', icon: Hotel, requiredModule: 'hotels' },
    { name: 'Events', href: '/admin/events', icon: PartyPopper, requiredModule: 'events' },
    { name: 'Gym', href: '/admin/gym', icon: Dumbbell, requiredModule: 'gym' },
    { name: 'Wellness', href: '/admin/wellness', icon: Heart, requiredModule: 'wellness' },
    { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck, requiredModule: 'bookings' },
    { name: 'Calendar', href: '/admin/calendar', icon: CalendarDays, requiredModule: 'bookings' },
    { name: 'Reports', href: '/admin/reports', icon: PieChart, requiredModule: null },
    { name: 'Products', href: '/admin/products', icon: Package, requiredModule: 'products' },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, requiredModule: 'products' },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes, requiredModule: 'products' },
    { name: 'Slots', href: '/admin/slots', icon: Calendar, requiredModule: ['turfs', 'events'] },
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
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900 hidden md:block">
              {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                {tenantName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">{tenantName}</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            </div>
          </div>
        </header>
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
