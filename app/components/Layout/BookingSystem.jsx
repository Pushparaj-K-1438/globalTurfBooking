'use client';
import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';
import { User, Phone, Mail } from "lucide-react";
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
      console.log(data);
      if (response.ok) {
        setAvailableSlots(data.slots || []);
      } else {
        console.error('Failed to fetch available slots:', data.error);
        // Fallback to static slots if API fails
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback to static slots if API fails
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
    const currentDate = new Date();

    // Get only the latest active offer (not all applicable offers)
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
        discount = Math.min(latestOffer.discountValue, originalTotal); // Don't exceed original amount
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

    // Sort by validFrom date (most recent first) and return the latest one
    return activeOffers.sort((a, b) => new Date(b.validFrom) - new Date(a.validFrom))[0] || null;
  };
  const toggleSlotSelection = (slotTimeRange, slotPrice) => {
    setSelectedTimeSlots(prev => {
      const isSelected = prev.includes(slotTimeRange);
      if (isSelected) {
        // Remove slot
        return prev.filter(slot => slot !== slotTimeRange);
      } else {
        // Add slot
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

  // Initialize available slots and offers on mount
  useEffect(() => {
    fetchAvailableSlots();
    fetchAvailableOffers();
  }, []);

  // Calculate discounts whenever slots or offers change
  useEffect(() => {
    calculateOfferDiscount();
  }, [selectedTimeSlots, availableSlots, availableOffers]);

  // 🔹 Check if slot is expired
  const isSlotExpired = (slot) => {
    // Always use Asia/Kolkata timezone
    const timeZone = 'Asia/Kolkata';
    // Get current time in IST
    const now = moment.tz(timeZone);
    // Get selected date in IST
    const selectedDate = moment.tz(date, 'YYYY-MM-DD', timeZone);
    const today = moment.tz(timeZone);

    const selectedDateStr = selectedDate.format('YYYY-MM-DD');
    const todayStr = today.format('YYYY-MM-DD');

    if (selectedDateStr !== todayStr) return false; // Only check for today

    const endTime = slot.split(" - ")[1];
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Set slot end time in IST
    const slotEnd = selectedDate.clone().hour(endHour).minute(endMinute).second(0).millisecond(0);

    // Debug: Log slot expiration calculation
    console.log(`[BookingSystem][IST] Slot: ${slot}, Now: ${now.format()}, SlotEnd: ${slotEnd.format()}, Expired:`, now.isAfter(slotEnd));

    return now.isAfter(slotEnd);
  };

  // 🔹 Handle booking form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBooking(true);

    // Reset errors
    setNameError('');
    setMobileError('');
    setEmailError('');
    setTimeSlotError('');

    let hasError = false;
    if (!name) {
      setNameError('Name is required');
      hasError = true;
    }
    if (!mobile) {
      setMobileError('Mobile is required');
      hasError = true;
    }
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    }
    if (!selectedTimeSlots.length) {
      setTimeSlotError('At least one time slot must be selected');
      hasError = true;
    }

    if (hasError) {
      setIsBooking(false);
      toast.error('Please fill all the fields!', {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
        transition: Slide,
      });
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
        const msg = data?.error || 'Failed to create booking';
        toast.error(msg, {
          position: "top-center",
          autoClose: 5000,
          theme: "colored",
          transition: Slide,
        });
        return;
      }

      // Success handling
      if (response.ok) {
        // Update the local state immediately
        setBookedSlots(prev => [...prev, ...selectedTimeSlots]);

        // Clear the form
        setName('');
        setMobile('');
        setEmail('');
        setSelectedTimeSlots([]);
        setOriginalAmount(0);
        setDiscountAmount(0);
        setFinalAmount(0);
        setAppliedOffer(null);

        // Show success message
        toast.success(`Your booking for ${selectedTimeSlots.length} slot(s) has been confirmed successfully with booking ID: ${data.bookingId}, Check your email for confirmation.`, {
          position: "top-center",
          autoClose: 8000,
          theme: "colored",
          transition: Slide,
        });

        // Optional: Refresh the booked slots from the server to ensure consistency
        const refreshResponse = await fetch(`/api/user?date=${date}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setBookedSlots(data.bookedSlots || []);
        }
      }
    } catch (error) {
      console.error('Network or parsing error', error);
      toast.error('Something went wrong. Please try again!', {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
        transition: Slide,
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <section className='bg-white flex justify-start py-20 flex-col gap-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8' id="booking">
      <div className='flex flex-col items-center justify-center'>
        <h2 className='text-2xl font-bold mb-4 text-black capitalize'>Book your slot now</h2>
      </div>
      <form className='relative flex flex-col p-6 border rounded-lg shadow-md gap-6' onSubmit={handleSubmit}>
        {/* Booking Loading Backdrop */}
        {isBooking && (
              <div className="absolute inset-0 w-full h-full bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-5 rounded-lg text-center shadow-lg">
                <div className="text-green-700 text-2xl mb-2.5">⏳</div>
                <p className="text-gray-700 text-base mb-0">Processing your booking...</p>
                <p className="text-gray-500 text-sm mt-2.5">Please wait while we confirm your slot and send confirmation emails.</p>
              </div>
            </div>
        )}

        {/* Dynamic Offer Banner - Show only if there's an active offer */}
        {getLatestActiveOffer() && (
          <div className="w-full bg-gradient-to-r from-[#2E7D32]/80 via-[#2E7D32]/60 to-[#FBC02D]/70 py-3 overflow-hidden relative rounded-sm text-white font-bold text-lg flex items-center justify-center px-6">
            🎉 Exclusive Deal of the Day - {getLatestActiveOffer().description || getLatestActiveOffer().name} 🎉
          </div>
        )}

        <h3 className='text-2xl font-medium text-black flex items-center gap-2 mb-2'>
          <User /> Personal Information
        </h3>

        {/* Name */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="name" className='text-black font-medium'>Full Name *</label>
          <div className='relative'>
            <input
              type='text'
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#f6f8f6] text-sm border border-slate-200 rounded-md px-12 py-2 focus:outline-none focus:border-slate-400 text-black"
            />
            <span className="absolute inset-y-0 flex w-12 items-center justify-center text-black"><User /></span>
          </div>
          <p className='text-red-500'>{nameError}</p>
        </div>

        {/* Mobile */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="mobile" className='text-black font-medium'>Mobile Number *</label>
          <div className="relative">
            <input
              type="number"
              id="mobile"
              name="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter your mobile number"
              className="w-full bg-[#f6f8f6] text-sm border border-slate-200 rounded-md px-12 py-2 focus:outline-none focus:border-slate-400 text-black"
            />
            <span className="absolute inset-y-0 flex w-12 items-center justify-center text-black"><Phone /></span>
          </div>
          <p className='text-red-500'>{mobileError}</p>
        </div>

        {/* Email */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="email" className='text-black font-medium'>Email Address *</label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-[#f6f8f6] text-sm border border-slate-200 rounded-md px-12 py-2 focus:outline-none focus:border-slate-400 text-black"
            />
            <span className="absolute inset-y-0 flex w-12 items-center justify-center text-black"><Mail /></span>
          </div>
          <p className='text-red-500'>{emailError}</p>
        </div>

        {/* Date */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor="date" className='text-black font-medium'>Pick Date *</label>
          <div className='relative'>
            <DatePicker value={date} onChange={(d) => setDate(d)} />
          </div>
        </div>

        {/* Time Slots */}
        <div className="w-full flex flex-col gap-1">
          <label className="text-black font-medium">Select Time Slot *</label>

          {loadingSlots ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
              {availableSlots
                .filter(slot => slot.isActive)
                .map((slot) => {
                  const slotTimeRange = `${slot.startTime} - ${slot.endTime}`;
                  const isBooked = bookedSlots.includes(slotTimeRange);
                  const expired = isSlotExpired(slotTimeRange);
                  const disabled = isBooked || expired;

                  let bgColor = "bg-white border-gray-200";
                  let textColor = "text-black";
                  let borderColor = "border-gray-200";

                  if (expired) {
                    bgColor = "bg-gray-200";
                    textColor = "text-gray-500";
                    borderColor = "border-gray-200";
                  } else if (isBooked) {
                    bgColor = "bg-green-50";
                    textColor = "text-green-700";
                    borderColor = "border-green-200";
                  } else if (selectedTimeSlots.includes(slotTimeRange)) {
                    bgColor = "bg-green-600";
                    textColor = "text-white";
                    borderColor = "border-green-600";
                  }

                  // Only add hover classes when not disabled
                  const hoverClass = !disabled
                    ? (selectedTimeSlots.includes(slotTimeRange) ? "hover:bg-green-700" : "hover:bg-green-50")
                    : "";

                  return (
                    <button
                      key={slot._id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (!disabled) {
                          toggleSlotSelection(slotTimeRange, slot.price);
                        }
                      }}
                      className={`relative p-4 rounded-lg border-2 text-sm font-medium min-h-[60px] flex items-center justify-center transition-all ${bgColor} ${textColor} ${borderColor} ${disabled ? "cursor-not-allowed pointer-events-none" : "cursor-pointer"} ${hoverClass}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{moment(slot.startTime, 'HH:mm').format('h:mm A')} - {moment(slot.endTime, 'HH:mm').format('h:mm A')}</span>
                        <span className="text-xs opacity-60 mt-1">₹{slot.price}</span>
                      </div>
                      {isBooked && (
                        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-md">Booked</span>
                      )}
                    </button>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center text-black">
              <p>No Slots available for this date</p>
            </div>
          )}
          <p className='text-red-500'>{timeSlotError}</p>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-[#eaf0ea80] text-black flex flex-col gap-3">
          <p className="text-xl font-medium">Booking Summary</p>
          <div className='flex flex-col gap-1'>
            <p className='text-sm flex justify-between'><span>Full Name: </span><span>{name || '-'}</span></p>
            <p className='text-sm flex justify-between'><span>Mobile Number: </span><span>{mobile || '-'}</span></p>
            <p className='text-sm flex justify-between'><span>Email Address: </span><span>{email || '-'}</span></p>
            <p className='text-sm flex justify-between'><span>Pick Date: </span><span>{date || '-'}</span></p>
            <div className='text-sm flex flex-col gap-1'>
              <span>Selected Time Slots: </span>
              {selectedTimeSlots.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedTimeSlots.map((slot, index) => {
                    const [startTime, endTime] = slot.split(' - ');
                    return (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {moment(startTime, 'HH:mm').format('h:mm A')} - {moment(endTime, 'HH:mm').format('h:mm A')}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span>-</span>
              )}
            </div>

            {/* Original Amount */}
            <p className='text-sm flex justify-between'>
              <span>Subtotal: </span><span>₹{originalAmount}</span>
            </p>

            {/* Discount Information */}
            {appliedOffer && (
              <div className='text-sm flex flex-col gap-1 border-t pt-2 mt-2 border-[#E0F5E8]'>
                <p className='text-green-600 font-medium flex items-center gap-1'>
                  <span>🎉 {appliedOffer.name}</span>
                </p>
                <p className='text-sm flex justify-between'>
                  <span>Discount ({appliedOffer.discountType === 'percentage' ? `${appliedOffer.discountValue}%` : `₹${appliedOffer.discountValue}`}): </span>
                  <span className='text-green-600'>-₹{discountAmount.toFixed(2)}</span>
                </p>
              </div>
            )}

            {/* Final Amount */}
            <p className='text-sm font-medium flex justify-between border-t pt-2 mt-2 border-[#E0F5E8]'>
              <span>Total: </span><span>₹{finalAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isBooking}
          className={`py-2 px-4 rounded-md transition cursor-pointer ${isBooking
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-[#16a249] text-white hover:bg-primary/90'
            }`}
        >
          {isBooking ? (
            <div className="flex items-center gap-2 justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </form>
    </section>
  );
};

export default BookingSystem;
