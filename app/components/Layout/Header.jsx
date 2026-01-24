"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Images, Users, Phone, LayoutDashboard, LogOut, BadgeIndianRupee, House, ClockPlus } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
          cache: 'no-store'
        });
        const data = await response.json();
        setIsLoggedIn(data.authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Common navigation items
  const commonNavItems = [
    { icon: House, label: "Home", href: "/" },
    { icon: Images, label: "Gallery", href: "/gallery" },
    { icon: Phone, label: "Contact", href: "/contact" },
  ];

  // Private navigation items (only shown when logged in)
  const privateNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/auth/dashboard" },
    { icon: Images, label: "Gallery", href: "/auth/gallery" },
    { icon: ClockPlus, label: "Slots", href: "/auth/slots" },
    { icon: BadgeIndianRupee, label: "Offers", href: "/auth/offers" },
  ];

  // Combine navigation items based on auth state
  const navItems = [
    ...(isLoggedIn ? privateNavItems : commonNavItems),
    {
      icon: isLoggedIn ? LogOut : null,
      label: isLoggedIn ? "Logout" : "",
      href: isLoggedIn ? "#" : "/login",
      onClick: isLoggedIn ? handleLogout : null
    },
  ].filter(item => item.label !== "");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-200 shadow-soft bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-semibold tracking-[0.15em] text-gray-800 flex items-center gap-2">
              <span className="w-2 h-8 bg-emerald-600 rounded-sm"></span>
              MRK TURF
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-14">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className={`transition-smooth flex items-center font-medium ${pathname === item.href ? 'text-primary' : 'hover:text-primary'
                    }`}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="transition-bounce"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card rounded-lg mt-2 shadow-medium flex flex-col md:flex-row gap-4 md:gap-0">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  href={item.href}
                  className="w-full justify-start transition-smooth hover:bg-primary/10 flex items-center cursor-pointer font-medium"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;