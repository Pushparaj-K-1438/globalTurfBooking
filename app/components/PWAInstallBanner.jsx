"use client";

import { useState, useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Download, X, Smartphone, Bell, WifiOff } from 'lucide-react';

export default function PWAInstallBanner() {
    const { canInstall, isOnline, installApp, subscribeToPush } = usePWA();
    const [showBanner, setShowBanner] = useState(false);
    const [showOfflineNotice, setShowOfflineNotice] = useState(false);

    useEffect(() => {
        // Show install banner after 30 seconds if not installed
        const timer = setTimeout(() => {
            if (canInstall) {
                setShowBanner(true);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [canInstall]);

    useEffect(() => {
        setShowOfflineNotice(!isOnline);
    }, [isOnline]);

    const handleInstall = async () => {
        const installed = await installApp();
        if (installed) {
            setShowBanner(false);
            // Ask for push notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await subscribeToPush();
                }
            }
        }
    };

    const dismissBanner = () => {
        setShowBanner(false);
        // Don't show again for 7 days
        localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
    };

    // Check if banner was recently dismissed
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-banner-dismissed');
        if (dismissed) {
            const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) {
                setShowBanner(false);
            }
        }
    }, []);

    return (
        <>
            {/* Offline Notice */}
            {showOfflineNotice && (
                <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
                    <WifiOff size={16} />
                    You're offline. Some features may be limited.
                    <button onClick={() => setShowOfflineNotice(false)} className="ml-4 hover:underline">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Install Banner */}
            {showBanner && (
                <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-10">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 shadow-2xl text-white">
                        <button
                            onClick={dismissBanner}
                            className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Smartphone size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">Install BookIt App</h3>
                                <p className="text-sm text-slate-300 mb-4">
                                    Add to your home screen for quick access and offline support.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleInstall}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors"
                                    >
                                        <Download size={16} /> Install
                                    </button>
                                    <button
                                        onClick={dismissBanner}
                                        className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        Not now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
