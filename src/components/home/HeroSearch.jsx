import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, MapPin, Search } from 'lucide-react';
import { CATEGORY_OPTIONS, CATEGORY_MAP, DEFAULT_CATEGORY } from '../../config/categories.js';

function HeroSearch({ initialValues = {}, onSubmit }) {
  const [form, setForm] = useState(() => ({
    location: initialValues.location || '',
    startDate: initialValues.startDate || '',
    endDate: initialValues.endDate || '',
    category: initialValues.category || DEFAULT_CATEGORY.value,
  }));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [highlightField, setHighlightField] = useState(null);

  const containerRef = useRef(null);
  const locationInputRef = useRef(null);

  const activeCategory = CATEGORY_MAP[form.category] || DEFAULT_CATEGORY;
  const hasCompleteDates = Boolean(form.startDate && form.endDate);
  const hasAnyInput = Boolean(form.location.trim() || form.category !== DEFAULT_CATEGORY.value || hasCompleteDates);
  const allFieldsReady = Boolean(
    form.location.trim() &&
    hasCompleteDates &&
    form.category !== DEFAULT_CATEGORY.value
  );

  useEffect(() => {
    setForm({
      location: initialValues.location || '',
      startDate: initialValues.startDate || '',
      endDate: initialValues.endDate || '',
      category: initialValues.category || DEFAULT_CATEGORY.value,
    });
  }, [initialValues.location, initialValues.startDate, initialValues.endDate, initialValues.category]);

  useEffect(() => {
    if (hasCompleteDates && !form.location.trim()) {
      setHighlightField('location');
      return;
    }

    if ((form.location.trim() || hasCompleteDates) && form.category === DEFAULT_CATEGORY.value) {
      setHighlightField('category');
      return;
    }

    setHighlightField(null);
  }, [form, hasCompleteDates]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsExpanded(false);
        setIsDatePickerOpen(false);
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (event) => {
    event?.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit({
        ...form,
        listingIntent: activeCategory.listingIntent,
        listingType: activeCategory.listingType,
      });
    }
  };

  const handleCategorySelect = (value) => {
    setForm((prev) => ({ ...prev, category: value }));
    setIsCategoryOpen(false);
    if (!form.location.trim()) {
      requestAnimationFrame(() => {
        locationInputRef.current?.focus();
      });
    }
  };

  const dateSummary = useMemo(() => {
    if (form.startDate && form.endDate) {
      return `${form.startDate} → ${form.endDate}`;
    }
    if (form.startDate) {
      return `${form.startDate} (choose end)`;
    }
    return 'Add dates';
  }, [form.startDate, form.endDate]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA' && allFieldsReady) {
      handleSubmit(event);
    }
  };

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      onFocusCapture={() => setIsExpanded(true)}
      className={`relative w-full rounded-[32px] border border-white/20 bg-white/95 p-2 shadow-[0_25px_80px_rgba(0,0,0,0.25)] backdrop-blur transition-all ${
        isExpanded ? 'ring-2 ring-orange-100' : 'hover:shadow-[0_30px_90px_rgba(0,0,0,0.3)]'
      }`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <label
          className={`flex flex-1 cursor-text flex-col rounded-2xl px-4 py-3 transition hover:bg-gray-50 md:px-6 ${
            highlightField === 'location' ? 'ring-2 ring-orange-200' : ''
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Where</span>
          <div className="mt-1 flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-400" aria-hidden />
            <input
              ref={locationInputRef}
              type="text"
              name="location"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              placeholder="City or ZIP"
              className="flex-1 border-none bg-transparent text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
              aria-label="Search by city or ZIP"
            />
          </div>
        </label>

        <div
          className="relative flex flex-1 flex-col rounded-2xl px-4 py-3 transition hover:bg-gray-50 md:px-6"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">When</span>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen((prev) => !prev)}
            className="mt-1 flex items-center justify-between gap-3 text-left text-base font-medium text-gray-900"
            aria-haspopup="dialog"
            aria-expanded={isDatePickerOpen}
          >
            <span className={form.startDate ? 'text-gray-900' : 'text-gray-400'}>{dateSummary}</span>
            <Calendar className="h-4 w-4 text-gray-400" aria-hidden />
          </button>

          {isDatePickerOpen && (
            <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-full rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start date
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-base text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End date
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-base text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    min={form.startDate || undefined}
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, startDate: '', endDate: '' }));
                    setIsDatePickerOpen(false);
                  }}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`relative flex flex-1 flex-col rounded-2xl px-4 py-3 transition hover:bg-gray-50 md:px-6 ${
            highlightField === 'category' ? 'ring-2 ring-orange-200' : ''
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">What</span>
          <button
            type="button"
            onClick={() => setIsCategoryOpen((prev) => !prev)}
            className="mt-1 flex items-center justify-between gap-3 text-left"
            aria-haspopup="listbox"
            aria-expanded={isCategoryOpen}
          >
            <span className="flex items-center gap-3 text-base font-medium text-gray-900">
              {activeCategory.icon && <activeCategory.icon className="h-4 w-4 text-gray-500" aria-hidden />}
              {activeCategory.label}
            </span>
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-full min-w-[260px] rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
              <div className="grid gap-2 sm:grid-cols-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCategorySelect(option.value)}
                    className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      form.category === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-transparent text-gray-900 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option.icon && <option.icon className="mt-0.5 h-5 w-5 text-gray-700" aria-hidden />}
                    <div>
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center px-2 py-3 md:px-4">
          <button
            type="submit"
            data-has-input={hasAnyInput}
            className={`${
              hasAnyInput ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-900/80 hover:bg-gray-900'
            } inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500`}
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

export default HeroSearch;
