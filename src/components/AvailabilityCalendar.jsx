import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAvailabilityQuery } from '../hooks/useAvailabilityQuery';

const FALLBACK_RULES = {
  minDaysNotice: 0,
  maxFutureDays: 365,
  minRentalDays: 1,
  maxRentalDays: 30,
  bookingMode: 'daily-with-time'
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const differenceInDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / 86400000) + 1;
};

export function AvailabilityCalendar({
  listingId,
  bookingMode = 'daily-with-time',
  selectedStartDate,
  selectedEndDate,
  onChangeDates
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const monthStart = useMemo(() => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1), [visibleMonth]);
  const availabilityEnd = useMemo(
    () => new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 2, 0),
    [visibleMonth]
  );

  const { unavailableDates, rules, isLoading, isError } = useAvailabilityQuery({
    listingId,
    startDate: formatDate(monthStart),
    endDate: formatDate(availabilityEnd)
  });

  const mergedRules = rules || { ...FALLBACK_RULES, bookingMode }; // use backend if available
  const disabledDates = useMemo(() => new Set(unavailableDates || []), [unavailableDates]);

  const minAllowedDate = addDays(today, mergedRules.minDaysNotice || 0);
  const maxAllowedDate = addDays(today, mergedRules.maxFutureDays || 365);

  const calendarDays = useMemo(() => {
    const startWeekday = monthStart.getDay();
    const gridStart = addDays(monthStart, -startWeekday);
    return Array.from({ length: 42 }, (_, idx) => addDays(gridStart, idx));
  }, [monthStart]);

  const handleMonthChange = (offset) => {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const isDateDisabled = (date) => {
    const iso = formatDate(date);
    if (disabledDates.has(iso)) return true;
    if (date < minAllowedDate) return true;
    if (date > maxAllowedDate) return true;
    return false;
  };

  const rangeViolatesRules = (start, end) => {
    const length = differenceInDays(start, end);
    if (length < (mergedRules.minRentalDays || 1)) return true;
    if (length > (mergedRules.maxRentalDays || 30)) return true;
    // ensure no disabled date in between
    let cursor = new Date(start);
    const last = new Date(end);
    while (cursor <= last) {
      if (isDateDisabled(cursor)) {
        return true;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  };

  const handleDateClick = (date) => {
    if (!onChangeDates || isDateDisabled(date)) {
      return;
    }

    const iso = formatDate(date);

    if (bookingMode === 'hourly') {
      onChangeDates(iso, iso);
      return;
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      onChangeDates(iso, null);
      return;
    }

    if (new Date(iso) <= new Date(selectedStartDate)) {
      onChangeDates(iso, null);
      return;
    }

    if (rangeViolatesRules(selectedStartDate, iso)) {
      onChangeDates(iso, null);
      return;
    }

    onChangeDates(selectedStartDate, iso);
  };

  const isSelected = (date) => {
    if (!selectedStartDate) return false;
    const iso = formatDate(date);
    if (bookingMode === 'hourly') {
      return iso === selectedStartDate;
    }
    if (iso === selectedStartDate || iso === selectedEndDate) {
      return true;
    }
    if (selectedEndDate) {
      return new Date(iso) > new Date(selectedStartDate) && new Date(iso) < new Date(selectedEndDate);
    }
    return false;
  };

  const renderDayButton = (date) => {
    const iso = formatDate(date);
    const outsideMonth = date.getMonth() !== visibleMonth.getMonth();
    const disabled = isDateDisabled(date);
    const selected = isSelected(date);

    let classes = 'flex h-10 w-10 items-center justify-center rounded-full text-sm transition';
    if (outsideMonth) {
      classes += ' text-slate-300';
    } else if (disabled) {
      classes += ' text-slate-300 cursor-not-allowed';
    } else {
      classes += ' text-slate-700 hover:bg-orange-100 hover:text-orange-600';
    }

    if (selected) {
      classes += ' bg-orange-500 text-white font-semibold hover:bg-orange-500 hover:text-white';
    }

    return (
      <button
        key={iso}
        type="button"
        onClick={() => handleDateClick(date)}
        className={classes}
        disabled={disabled}
      >
        {date.getDate()}
      </button>
    );
  };

  const monthLabel = visibleMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          onClick={() => handleMonthChange(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-semibold text-slate-900">{monthLabel}</div>
        <button
          type="button"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          onClick={() => handleMonthChange(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {DAY_NAMES.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((date) => (
          <div key={formatDate(date)} className="flex items-center justify-center py-1">
            {renderDayButton(date)}
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        {isLoading && <p>Checking availability…</p>}
        {isError && <p className="text-red-500">Unable to load availability.</p>}
        <p>
          Min {mergedRules.minRentalDays} day{mergedRules.minRentalDays === 1 ? '' : 's'} • Max {mergedRules.maxRentalDays} day{mergedRules.maxRentalDays === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
