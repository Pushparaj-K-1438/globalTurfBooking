"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, LogOut, Home, Phone, User, LogIn, ChevronRight, Search } from "lucide-react";
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Hide header on admin, super-admin, and tenant site routes
  const isExcludedRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin') || pathname?.startsWith('/v/');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, tenantRes] = await Promise.all([
          fetch('/api/auth/verify', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/tenants/me')
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          setUserData(authData.authenticated ? authData.user : null);
        }

        if (tenantRes.ok) {
          const tenantData = await tenantRes.json();
          setTenantInfo(tenantData);
        }
      } catch (error) {
        console.error('Data fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUserData(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isExcludedRoute) return null;

  // Determine brand name - use tenant name if available, otherwise use platform name
  const brandName = tenantInfo?.name || "BookIt";
  const brandInitial = brandName[0] || "B";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
              {brandInitial}
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent hidden sm:block">
              {brandName}
            </span>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
            >
              Home
            </Link>

            {/* Browse Dropdown */}
            <div className="relative group">
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${pathname?.startsWith('/browse') || pathname?.startsWith('/hotels') || pathname?.startsWith('/events') || pathname?.startsWith('/gyms') || pathname?.startsWith('/wellness') ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}>
                Browse
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 min-w-[180px]">
                  <Link href="/browse" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-medium">
                    <Search size={16} /> All Venues
                  </Link>
                  <Link href="/hotels" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-medium">
                    🏨 Hotels
                  </Link>
                  <Link href="/events" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-medium">
                    🎉 Events
                  </Link>
                  <Link href="/gyms" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-medium">
                    💪 Gyms
                  </Link>
                  <Link href="/wellness" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-medium">
                    🧘 Wellness
                  </Link>
                  <Link href="/shop" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 text-sm font-medium">
                    🛒 Shop
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${pathname === '/pricing' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${pathname === '/contact' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
            >
              Contact
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!userData ? (
              <>
                <Link href="/login" className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors">
                  Log in
                </Link>
                <Link href="/register-tenant" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 flex items-center gap-2">
                  Get Started <ChevronRight size={16} />
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Role Based Dashboard Link */}
                {(userData.role === 'TENANT_OWNER' || userData.role === 'TENANT_ADMIN') && (
                  <Link
                    href="/admin/dashboard"
                    className="text-slate-600 hover:text-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                )}
                {(userData.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/super-admin/dashboard"
                    className="text-slate-600 hover:text-emerald-600 font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    <LayoutDashboard size={18} /> Global Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
                >
                  <LogOut size={16} /> Logout
                </button>

                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm ring-1 ring-emerald-500/10">
                  {userData.email?.[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 bg-white absolute left-0 right-0 shadow-xl rounded-b-2xl border-b border-slate-100 px-4 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={20} /> Home
              </Link>
              <Link
                href="/browse"
                className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search size={20} /> Browse
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone size={20} /> Contact
              </Link>
              {!userData ? (
                <div className="pt-4 flex flex-col gap-3">
                  <Link href="/login" className="w-full py-3 text-center rounded-xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 transition-colors">
                    Log in
                  </Link>
                  <Link href="/register-tenant" className="w-full py-3 text-center rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
                    Get Started
                  </Link>
                </div>
              ) : (
                <>
                  {(userData.role === 'TENANT_OWNER' || userData.role === 'TENANT_ADMIN') && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-left mt-2"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;