"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
    const pathname = usePathname();

    // Hide footer on admin, auth, and super-admin routes
    const isExcludedRoute = pathname?.startsWith('/admin') ||
        pathname?.startsWith('/auth') ||
        pathname?.startsWith('/super-admin') ||
        pathname === '/login' ||
        pathname === '/register';

    if (isExcludedRoute) return null;

    return (
        <footer className="bg-emerald-950 text-emerald-100 pt-16 pb-8 border-t border-emerald-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-lg">
                                B
                            </span>
                            BookIt
                        </h2>
                        <p className="text-emerald-200/70 text-sm leading-relaxed mb-6">
                            The premium platform for booking venues, turfs, and spaces. Experience hassle-free booking and instant confirmations.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-emerald-900/50 rounded-full hover:bg-emerald-800 transition-colors text-emerald-300">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2 bg-emerald-900/50 rounded-full hover:bg-emerald-800 transition-colors text-emerald-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="p-2 bg-emerald-900/50 rounded-full hover:bg-emerald-800 transition-colors text-emerald-300">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="text-emerald-200/70 hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse" className="text-emerald-200/70 hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    Browse Venues
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-emerald-200/70 hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/register-tenant" className="text-emerald-200/70 hover:text-emerald-400 transition-colors flex items-center gap-2">
                                    For Business
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/terms" className="text-emerald-200/70 hover:text-emerald-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-emerald-200/70 hover:text-emerald-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/refunds" className="text-emerald-200/70 hover:text-emerald-400 transition-colors">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-emerald-200/70">
                                <MapPin className="shrink-0 text-emerald-500 mt-0.5" size={18} />
                                <span>123 Sports Avenue, Green City, Tech Park, 500081</span>
                            </li>
                            <li className="flex items-center gap-3 text-emerald-200/70">
                                <Phone className="shrink-0 text-emerald-500" size={18} />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-emerald-200/70">
                                <Mail className="shrink-0 text-emerald-500" size={18} />
                                <span>support@turfbooking.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-emerald-400/60">
                    <p>© {new Date().getFullYear()} BookIt. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <span className="text-red-500">♥</span> by SelfCraft Solutions
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;