"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showSuccess, showError } from '../../lib/toast';
import { User, Lock, EyeOff, Eye } from "lucide-react";

const Login = () => {
    const router = useRouter();
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mobile, password })
            });
            const data = await response.json();
            console.log('API Response:', data);
            if (!response) {
                showError('Invalid credentials. Please try again.');
                setIsLoading(false);
                return;
            }
            if(data.success === true){
                showSuccess(data.message);
                router.push('/auth/dashboard');
            }else{
                // showError(data.error);
                setError(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Something went wrong. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
                        <p className="text-gray-600">Access your turf management dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Mobile
                            </label>
                            <div className="relative flex items-center">
                                <User className="absolute left-[10px] flex items-center pointer-events-none text-black w-5 h-5" />
                                <input
                                    id="mobile"
                                    name="mobile"
                                    type="number"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="block w-full px-10 py-2 border border-gray-300 rounded-lg focus:border-transparent placeholder-gray-400 text-black"
                                    placeholder="Enter your mobile number"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-[10px] flex items-center pointer-events-none text-black w-5 h-5" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-10 py-2 border border-gray-300 rounded-lg  focus:border-transparent placeholder-gray-400 text-black"
                                    placeholder="Enter your password"
                                />
                                {showPassword ? (
                                    <Eye
                                        type="button"
                                        onClick={() => setShowPassword(false)}
                                        className="absolute right-4 flex items-center text-black w-5 h-5 cursor-pointer"
                                    />
                                ) : (
                                    <EyeOff
                                        type="button"
                                        onClick={() => setShowPassword(true)}
                                        className="absolute right-4 flex items-center text-black w-5 h-5 cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-10 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#16a249] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;