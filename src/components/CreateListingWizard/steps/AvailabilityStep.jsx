import { useState } from 'react';
import { Calendar, Clock, Plus, X, Info } from 'lucide-react';

/**
 * Step 3: Availability
 * Calendar, blackout dates, booking windows, hours
 */
export function AvailabilityStep({ formData, updateFormData }) {
  const { listingMode } = formData;
  const isForSale = listingMode === 'for_sale';
  const isEventPro = listingMode === 'event_pro';

  const [newBlackoutDate, setNewBlackoutDate] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  // For sale listings don't need availability
  if (isForSale) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Availability</h2>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <Info className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Always Available
          </h3>
          <p className="text-slate-600">
            Items listed for sale are always available for purchase. 
            No calendar setup is required.
          </p>
        </div>

        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.alwaysAvailable}
            onChange={(e) => updateFormData({ alwaysAvailable: e.target.checked })}
            className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
          />
          <div>
            <span className="font-medium text-slate-900">Mark as always available</span>
            <p className="text-sm text-slate-500">This item is ready for immediate sale</p>
          </div>
        </label>
      </div>
    );
  }

  const addBlackoutDate = () => {
    if (newBlackoutDate && !formData.blackoutDates.includes(newBlackoutDate)) {
      updateFormData({
        blackoutDates: [...formData.blackoutDates, newBlackoutDate]
      });
      setNewBlackoutDate('');
    }
  };

  const removeBlackoutDate = (date) => {
    updateFormData({
      blackoutDates: formData.blackoutDates.filter(d => d !== date)
    });
  };

  const addBlackoutRange = () => {
    if (rangeStart && rangeEnd && new Date(rangeEnd) >= new Date(rangeStart)) {
      updateFormData({
        blackoutRanges: [...formData.blackoutRanges, { start: rangeStart, end: rangeEnd }]
      });
      setRangeStart('');
      setRangeEnd('');
    }
  };

  const removeBlackoutRange = (index) => {
    updateFormData({
      blackoutRanges: formData.blackoutRanges.filter((_, i) => i !== index)
    });
  };

  const toggleWeekday = (day) => {
    updateFormData({
      weekdayAvailability: {
        ...formData.weekdayAvailability,
        [day]: !formData.weekdayAvailability[day]
      }
    });
  };

  const weekdays = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Availability</h2>
        <p className="mt-2 text-slate-600">
          Set your available days and booking windows
        </p>
      </div>

      {/* Weekday Availability */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Calendar className="h-5 w-5 text-orange-500" />
          Available Days
        </h3>
        <p className="text-sm text-slate-600">
          Select which days of the week you're available
        </p>

        <div className="flex flex-wrap gap-2">
          {weekdays.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleWeekday(key)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${formData.weekdayAvailability[key]
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Event Hours */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Clock className="h-5 w-5 text-orange-500" />
          {isEventPro ? 'Service Hours' : 'Operating Hours'}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.eventHours?.start || '09:00'}
              onChange={(e) => updateFormData({
                eventHours: { ...formData.eventHours, start: e.target.value }
              })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.eventHours?.end || '22:00'}
              onChange={(e) => updateFormData({
                eventHours: { ...formData.eventHours, end: e.target.value }
              })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
      </section>

      {/* Rental Duration */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Booking Duration</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {isEventPro ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum Hours
                </label>
                <input
                  type="number"
                  value={formData.minimumRentalHours || ''}
                  onChange={(e) => updateFormData({ minimumRentalHours: parseInt(e.target.value) || 1 })}
                  placeholder="2"
                  min={1}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maximum Hours
                </label>
                <input
                  type="number"
                  value={formData.maximumRentalHours || ''}
                  onChange={(e) => updateFormData({ maximumRentalHours: parseInt(e.target.value) || null })}
                  placeholder="12"
                  min={1}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum Days
                </label>
                <input
                  type="number"
                  value={formData.minimumRentalDays || ''}
                  onChange={(e) => updateFormData({ minimumRentalDays: parseInt(e.target.value) || 1 })}
                  placeholder="1"
                  min={1}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maximum Days
                </label>
                <input
                  type="number"
                  value={formData.maximumRentalDays || ''}
                  onChange={(e) => updateFormData({ maximumRentalDays: parseInt(e.target.value) || null })}
                  placeholder="30"
                  min={1}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Lead Time (days notice required)
          </label>
          <input
            type="number"
            value={formData.leadTimeDays || ''}
            onChange={(e) => updateFormData({ leadTimeDays: parseInt(e.target.value) || 1 })}
            placeholder="1"
            min={0}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </section>

      {/* Blackout Dates */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Blackout Dates</h3>
        <p className="text-sm text-slate-600">
          Add specific dates or date ranges when you're not available
        </p>

        {/* Single Dates */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="date"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              onClick={addBlackoutDate}
              disabled={!newBlackoutDate}
              className="rounded-xl bg-slate-100 px-4 py-3 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {formData.blackoutDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.blackoutDates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                >
                  {new Date(date).toLocaleDateString()}
                  <button
                    onClick={() => removeBlackoutDate(date)}
                    className="hover:text-red-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Date Ranges */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Add blackout range</p>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              min={rangeStart || new Date().toISOString().split('T')[0]}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              onClick={addBlackoutRange}
              disabled={!rangeStart || !rangeEnd}
              className="rounded-xl bg-slate-100 px-4 py-3 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {formData.blackoutRanges.length > 0 && (
            <div className="space-y-2">
              {formData.blackoutRanges.map((range, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2"
                >
                  <span className="text-sm text-red-700">
                    {new Date(range.start).toLocaleDateString()} — {new Date(range.end).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => removeBlackoutRange(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instant Book */}
      <section className="space-y-4">
        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.instantBookEnabled}
            onChange={(e) => updateFormData({ instantBookEnabled: e.target.checked })}
            className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
          />
          <div>
            <span className="font-medium text-slate-900">Enable Instant Book</span>
            <p className="text-sm text-slate-500">
              Allow renters to book immediately without approval
            </p>
          </div>
        </label>
      </section>
    </div>
  );
}

export default AvailabilityStep;
