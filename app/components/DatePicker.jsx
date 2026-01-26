import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";

const DatePicker = ({ value, onChange, format = "YYYY-MM-DD" }) => {
  const today = new Date(); // Ensure current date is used at runtime
  const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

  // Internal state (defaults to today or controlled value)
  const [internalSelectedDate, setInternalSelectedDate] = useState(value || todayStr);
  const [currentDate, setCurrentDate] = useState(today);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const isControlled = value !== undefined;
  const selectedDate = isControlled ? (value || todayStr) : internalSelectedDate;

  useEffect(() => {
    if (isControlled && value) {
      setInternalSelectedDate(value);
    } else {
      setInternalSelectedDate(todayStr); // Reset to current date if uncontrolled
    }
  }, [value, isControlled, todayStr]); // Added todayStr as dependency

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Fill empty slots before month starts
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(null);
    }
    // Fill actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDaySelect = (dateObj) => {
    if (!dateObj) return;

    // Emit as en-CA YYYY-MM-DD for consistency with consumers
    const dateStr = dateObj.toLocaleDateString("en-CA");

    if (!isControlled) {
      setInternalSelectedDate(dateStr);
    }
    if (typeof onChange === "function") {
      onChange(dateStr);
    }
    setIsCalendarOpen(false);
  };

  const handleCancel = () => {
    if (!isControlled) {
      setInternalSelectedDate(todayStr);
    }
    if (typeof onChange === "function") {
      onChange(todayStr);
    }
    setIsCalendarOpen(false);
  };

  const handleApply = () => {
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  // Parse selected date for comparison
  const getDateObjectFromStr = (dateStr) => {
    if (!dateStr) return null;
    // Support both en-CA (YYYY-MM-DD) and legacy DD/MM/YYYY just in case
    if (dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-').map((s) => parseInt(s, 10));
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m - 1, d);
      return null;
    }
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/').map((s) => parseInt(s, 10));
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m - 1, d);
      return null;
    }
    return null;
  };

  return (
    <section>
      <div className="relative">
        <input
          id="datepicker"
          type="text"
          placeholder="Pick a date"
          className="w-full bg-[#f6f8f6] placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-12 pr-4 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          value={selectedDate || ""}
          readOnly
          onClick={handleToggleCalendar}
          name="booking_date"
        />
        <span
          id="toggleDatepicker"
          onClick={handleToggleCalendar}
          className="absolute inset-y-0 flex w-12 items-center justify-center text-black cursor-pointer"
        >
          <Calendar />
        </span>
      </div>

      {isCalendarOpen && (
        <div className="flex w-full flex-col rounded-xl p-4 shadow-four sm:p-[30px] text-black bg-white mt-2">
          <div className="flex items-center justify-between pb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border border-gray-300 hover:bg-primary hover:text-white"
            >
              {"<"}
            </button>

            <span className="text-xl font-medium capitalize">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border border-gray-300 hover:bg-primary hover:text-white"
            >
              {">"}
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center pb-2 pt-4 text-sm font-medium capitalize">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <span key={d} className="flex h-[38px] w-[38px] items-center justify-center">
                {d}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 text-center text-sm font-medium">
            {getCalendarDays().map((dateObj, idx) => {
              if (!dateObj) return <div key={idx}></div>; // empty slot

              const selectedDateObj = getDateObjectFromStr(selectedDate);
              const isSelected = selectedDateObj && (dateObj.toDateString() === selectedDateObj.toDateString());
              const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
              const isPastDate = dateObj.getTime() < midnight.getTime();

              return (
                <div
                  key={idx}
                  onClick={() => !isPastDate && handleDaySelect(dateObj)}
                  className={`flex h-[38px] w-[38px] items-center justify-center rounded-lg
                  ${isPastDate ? "text-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-green-100"}
                  ${isSelected ? "bg-primary text-white" : ""}`}
                >
                  {dateObj.getDate()}
                </div>
              );
            })}
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              className="flex h-[50px] w-full items-center justify-center rounded-md bg-gray-600 text-base font-medium text-white hover:bg-gray-700"
              onClick={handleCancel}
            >
              Remove
            </button>
            <button
              className="flex h-[50px] w-full items-center justify-center rounded-md bg-primary text-base font-medium text-white hover:bg-blue-700"
              onClick={handleApply}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DatePicker;