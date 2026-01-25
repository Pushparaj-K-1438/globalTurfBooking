"use client";

import { useState } from "react";
import { Save, Globe, Settings as SettingsIcon, Shield } from "lucide-react";

export default function SuperAdminSettings() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-10">
                <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
                <p className="text-slate-500 mt-1">Global configuration for the entire platform</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe size={20} /></div>
                        <h2 className="font-bold text-lg">General Settings</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Platform Name</label>
                            <input type="text" defaultValue="TurfBooking" className="w-full border border-slate-200 rounded-lg px-4 py-2" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Support Email</label>
                            <input type="email" defaultValue="support@bookit.com" className="w-full border border-slate-200 rounded-lg px-4 py-2" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield size={20} /></div>
                        <h2 className="font-bold text-lg">Global Module Control</h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Disable modules here to hide them from ALL tenants.</p>
                    <div className="space-y-2">
                        {['Turfs', 'Hotels', 'Events', 'Payments', 'SMS Gateway'].map(m => (
                            <label key={m} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <span className="font-medium text-slate-700">{m}</span>
                                <input type="checkbox" defaultChecked className="toggle checkbox-emerald" />
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
