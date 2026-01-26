'use client';
import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import { User, Phone, Mail, Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import DatePicker from '../DatePicker';
import { toast, Slide } from 'react-toastify';

const BookingSystem = () => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // Changed to array for multiple slots
  const [originalAmount, setOriginalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [timeSlotError, setTimeSlotError] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // 🔹 Fetch available slots
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch('/api/admin/slots');
      const data = await response.json();
      if (response.ok) {
        setAvailableSlots(data.slots || []);
      } else {
        console.error('Failed to fetch available slots:', data.error);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // 🔹 Fetch available offers
  const fetchAvailableOffers = async () => {
    setLoadingOffers(true);
    try {
      const response = await fetch('/api/admin/offers');
      const data = await response.json();
      if (response.ok) {
        setAvailableOffers(data.offers || []);
      } else {
        console.error('Failed to fetch available offers:', data.error);
        setAvailableOffers([]);
      }
    } catch (error) {
      console.error('Error fetching available offers:', error);
      setAvailableOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  // 🔹 Calculate offer discount
  const calculateOfferDiscount = () => {
    if (selectedTimeSlots.length === 0) {
      setOriginalAmount(0);
      setDiscountAmount(0);
      setFinalAmount(0);
      setAppliedOffer(null);
      return;
    }

    const totalSlots = selectedTimeSlots.length;

    // Get only the latest active offer
    const latestOffer = getLatestActiveOffer();

    // Calculate original amount
    const originalTotal = selectedTimeSlots.reduce((total, slotTimeRange) => {
      const slot = availableSlots.find(s => `${s.startTime} - ${s.endTime}` === slotTimeRange);
      return total + (slot ? slot.price : 0);
    }, 0);

    setOriginalAmount(originalTotal);

    // Apply only the latest offer if it meets the minimum slots requirement
    if (latestOffer && totalSlots >= latestOffer.minSlots) {
      let discount = 0;
      if (latestOffer.discountType === 'percentage') {
        discount = (latestOffer.discountValue / 100) * originalTotal;
      } else {
        discount = Math.min(latestOffer.discountValue, originalTotal);
      }

      setDiscountAmount(discount);
      setFinalAmount(originalTotal - discount);
      setAppliedOffer(latestOffer);
    } else {
      setDiscountAmount(0);
      setFinalAmount(originalTotal);
      setAppliedOffer(null);
    }
  };

  // 🔹 Get the latest active offer
  const getLatestActiveOffer = () => {
    const currentDate = new Date();
    const activeOffers = availableOffers.filter(offer => {
      const offerStartDate = new Date(offer.validFrom);
      const offerEndDate = new Date(offer.validUntil);
      return (
        offer.isActive &&
        currentDate >= offerStartDate &&
        currentDate <= offerEndDate
      );
    });

    return activeOffers.sort((a, b) => new Date(b.validFrom) - new Date(a.validFrom))[0] || null;
  };

  const toggleSlotSelection = (slotTimeRange, slotPrice) => {
    setSelectedTimeSlots(prev => {
      const isSelected = prev.includes(slotTimeRange);
      if (isSelected) {
        return prev.filter(slot => slot !== slotTimeRange);
      } else {
        return [...prev, slotTimeRange];
      }
    });
  };

  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`/api/user?date=${date}`);
        const data = await response.json();
        if (response.ok) {
          setBookedSlots(data.bookedSlots);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      }
    };
    if (date) fetchBookedSlots();
  }, [date]);

  useEffect(() => {
    fetchAvailableSlots();
    fetchAvailableOffers();
  }, []);

  useEffect(() => {
    calculateOfferDiscount();
  }, [selectedTimeSlots, availableSlots, availableOffers]);

  // 🔹 Check if slot is expired
  const isSlotExpired = (slot) => {
    const timeZone = 'Asia/Kolkata';
    const now = moment.tz(timeZone);
    const selectedDate = moment.tz(date, 'YYYY-MM-DD', timeZone);
    const today = moment.tz(timeZone);

    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    const todayStr = today.format('YYYY-MM-DD');

    if (selectedDateStr !== todayStr) return false;

    const endTime = slot.split(" - ")[1];
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Fix: Ensure we correctly parse the end time regardless of format, assuming HH:mm is 24h format
    const slotEnd = selectedDate.clone().hour(endHour).minute(endMinute).second(0).millisecond(0);
    return now.isAfter(slotEnd);
  };

  // 🔹 Handle booking form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    setNameError('');
    setMobileError('');
    setEmailError('');
    setTimeSlotError('');

    let hasError = false;
    if (!name) { setNameError('Name is required'); hasError = true; }
    if (!mobile) { setMobileError('Mobile is required'); hasError = true; }
    if (!email) { setEmailError('Email is required'); hasError = true; }
    if (!selectedTimeSlots.length) { setTimeSlotError('Please select at least one time slot'); hasError = true; }

    if (hasError) {
      setIsBooking(false);
      toast.error('Please fix the errors to proceed.', { theme: "colored" });
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mobile,
          email,
          date,
          timeSlots: selectedTimeSlots,
          originalAmount,
          discountAmount,
          finalAmount,
          appliedOffer: appliedOffer ? {
            id: appliedOffer._id,
            name: appliedOffer.name,
            discountType: appliedOffer.discountType,
            discountValue: appliedOffer.discountValue
          } : null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.error || 'Failed to create booking', { theme: "colored" });
        return;
      }

      if (response.ok) {
        setBookedSlots(prev => [...prev, ...selectedTimeSlots]);
        setName('');
        setMobile('');
        setEmail('');
        setSelectedTimeSlots([]);
        setOriginalAmount(0);
        setDiscountAmount(0);
        setFinalAmount(0);
        setAppliedOffer(null);

        toast.success(`Booking Confirmed! ID: ${data.bookingId}. Check your email.`, {
          position: "top-center",
          autoClose: 8000,
          theme: "colored"
        });

        const refreshResponse = await fetch(`/api/user?date=${date}`);
        if (refreshResponse.ok) {
          const rData = await refreshResponse.json();
          setBookedSlots(rData.bookedSlots || []);
        }
      }
    } catch (error) {
      console.error('Booking error', error);
      toast.error('Something went wrong. Please try again!', { theme: "colored" });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <section className='relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16' id="booking">

      {/* Container */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

        {/* Header Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 sm:p-8 text-center">
          <h2 className='text-3xl font-bold text-slate-900 mb-2'>Book Your Slot</h2>
          <p className="text-slate-500">Select your preferred date and time to get started.</p>
        </div>

        {/* Dynamic Offer Banner */}
        {getLatestActiveOffer() && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-3 px-6 text-white text-center font-medium shadow-inner flex items-center justify-center gap-2 animate-pulse">
            <div className="p-1 bg-white/20 rounded-full"><Clock size={16} /></div>
            Special Offer: {getLatestActiveOffer().description || getLatestActiveOffer().name}
          </div>
        )}

        <div className="p-4 sm:p-6 md:p-10">
          <form className='flex flex-col gap-10' onSubmit={handleSubmit}>

            {/* 1. Pick Date */}
            <div className="space-y-4">
              <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 text-sm">1</span>
                Choose Date
              </h3>
              <div className='max-w-md ml-10'>
                <DatePicker value={date} onChange={(d) => setDate(d)} />
              </div>
            </div>

            {/* 2. Select Slots */}
            <div className="space-y-4">
              <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 text-sm">2</span>
                Select Time Slots
              </h3>

              <div className="ml-0 md:ml-10">
                {loadingSlots ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {availableSlots
                      .filter(slot => slot.isActive)
                      .map((slot) => {
                        const slotTimeRange = `${slot.startTime} - ${slot.endTime}`;
                        const isBooked = bookedSlots.includes(slotTimeRange);
                        const expired = isSlotExpired(slotTimeRange);
                        const isSelected = selectedTimeSlots.includes(slotTimeRange);
                        const disabled = isBooked || expired;

                        return (
                          <button
                            key={slot._id}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleSlotSelection(slotTimeRange, slot.price)}
                            className={`
                                        relative group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border
                                        ${disabled
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                : isSelected
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-[1.02]"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:shadow-sm"
                              }
                                    `}
                          >
                            <span className="font-semibold text-sm">
                              {moment(slot.startTime, 'HH:mm').format('h:mm A')}
                            </span>
                            <span className={`text-xs mt-1 ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                              ₹{slot.price}
                            </span>

                            {isBooked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-xl backdrop-blur-[1px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Booked</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                    <AlertCircle className="mx-auto mb-2 opacity-50" />
                    No slots available for this date
                  </div>
                )}
                {timeSlotError && <p className='text-red-500 text-sm mt-2 ml-1'>{timeSlotError}</p>}
              </div>
            </div>

            {/* 3. Personal Details */}
            <div className="space-y-4">
              <h3 className='text-lg font-semibold text-slate-800 flex items-center gap-2'>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 text-sm">3</span>
                Your Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-0 md:ml-10">
                <div className="space-y-1">
                  <label className='text-sm font-medium text-slate-700 ml-1'>Full Name</label>
                  <div className='relative'>
                    <input
                      type='text'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    />
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  </div>
                  {nameError && <p className='text-red-500 text-xs ml-1'>{nameError}</p>}
                </div>

                <div className="space-y-1">
                  <label className='text-sm font-medium text-slate-700 ml-1'>Mobile Number</label>
                  <div className='relative'>
                    <input
                      type='tel'
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    />
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  </div>
                  {mobileError && <p className='text-red-500 text-xs ml-1'>{mobileError}</p>}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className='text-sm font-medium text-slate-700 ml-1'>Email Address</label>
                  <div className='relative'>
                    <input
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    />
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  </div>
                  {emailError && <p className='text-red-500 text-xs ml-1'>{emailError}</p>}
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 sm:p-6 md:p-8 mt-4">
              <h4 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Date</span>
                  <span className="font-medium text-slate-900">{date}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Slots ({selectedTimeSlots.length})</span>
                  <div className="text-right">
                    {selectedTimeSlots.length > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        {selectedTimeSlots.map((s, i) => (
                          <span key={i} className="text-slate-900 font-medium">
                            {s.split(' - ')[0]} - {s.split(' - ')[1].split(':')[0]}:{s.split(' - ')[1].split(':')[1]}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-slate-200 my-4"></div>

                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₹{originalAmount}</span>
                </div>

                {appliedOffer && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle size={14} /> {appliedOffer.name}
                    </span>
                    <span className="font-medium">- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="h-px bg-slate-200 my-4"></div>

                <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-xl">₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isBooking}
                className={`
                            w-full mt-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/20 transition-all transform active:scale-[0.98]
                            ${isBooking ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/30"}
                        `}
              >
                {isBooking ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> Processing...
                  </div>
                ) : (
                  `Confirm Booking • ₹${finalAmount.toFixed(2)}`
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">Safe & Secure Payment</p>
            </div>

          </form>
        </div>

        {/* Loading Overlay */}
        {isBooking && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 text-center max-w-sm mx-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Booking</h3>
              <p className="text-slate-500">Please wait while we confirm your slot...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingSystem;
