// app/auth/components/BookingsCard.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CalendarDays, CalendarRange } from "lucide-react";
import { getBookingsStats } from '../../actions/bookings';
import { showError } from '../../../lib/toast';

const TIME_FRAMES = [
    { id: 'today', label: "Today's", icon: <Clock className="w-4 h-4" /> },
    { id: 'week', label: "This Week's", icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'month', label: "This Month's", icon: <CalendarRange className="w-4 h-4" /> },
    { id: 'all', label: "Total", icon: <Calendar className="w-4 h-4" /> }
];

const BookingsCard = () => {
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllStats = async () => {
            setError(null);
            try {
                const statsPromises = TIME_FRAMES.map(async (timeframe) => {
                    try {
                        const data = await getBookingsStats(timeframe.id);
                        if (!data.success) {
                            showError(`Failed to load ${timeframe.label.toLowerCase()} stats`);
                            return { [timeframe.id]: { count: 0, error: data.error } };
                        }
                        return { [timeframe.id]: { count: data.count } };
                    } catch (error) {
                        console.error(`Error in ${timeframe.id} stats:`, error);
                        showError(`Error loading ${timeframe.label.toLowerCase()} stats`);
                        return { [timeframe.id]: { count: 0, error: error.message } };
                    }
                });

                const results = await Promise.all(statsPromises);
                const mergedStats = Object.assign({}, ...results);
                setStats(mergedStats);
            } catch (error) {
                console.error('Error fetching all stats:', error);
                showError('Failed to load booking statistics');
                setError('Failed to load booking statistics');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TIME_FRAMES.map((timeframe) => (
                    <div
                        key={timeframe.id}
                        className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow shadow-md"
                    >
                        <div className="flex justify-between items-center mb-2 md:mb-3">
                            <p className="text-gray-500 font-medium">{timeframe.label} Bookings</p>
                            <div className="p-2 rounded-full bg-[#E0F5E8] text-[#16a249]">
                                {React.cloneElement(timeframe.icon, { className: 'w-5 h-5' })}
                            </div>
                        </div>
                        {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                            <div>
                                <p className="text-2xl font-bold text-[#16a249]">
                                    {stats[timeframe.id]?.count ?? 0}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingsCard;