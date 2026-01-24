// app/auth/components/AdminBookingsCount.jsx
import React from 'react';
import BookingsCard from './BookingsCard';
import UserBookings from './UserBookings';

const AdminBookings = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Turf Admin Panel</h1>
                        <p className="mt-2 text-gray-600">
                            Manage your turf bookings, slots, and operations
                        </p>
                    </div>

                    <div className="flex flex-col gap-10">
                        <BookingsCard />
                        <UserBookings />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;