import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { geocodePlace } from '../lib/mapboxClient';

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onQueryChange,
  label = 'Location',
  placeholder = 'Search by city or region',
  autoFocus = false,
  className = ''
}) {
  const [query, setQuery] = useState(value?.label || value?.placeName || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 320);

  useEffect(() => {
    setQuery(value?.label || value?.placeName || '');
  }, [value?.label, value?.placeName]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    geocodePlace(debouncedQuery, {
      limit: 5,
      signal: controller.signal,
      types: 'place,region,locality'
    })
      .then((places) => {
        if (!isMounted) return;
        setResults(places);
        setIsOpen(true);
      })
      .catch((err) => {
        if (err.name === 'AbortError' || !isMounted) return;
        console.warn('Location autocomplete failed:', err);
        setError('Unable to reach Mapbox. Try again.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (place) => {
    setQuery(place.label);
    setIsOpen(false);
    setResults([]);
    onQueryChange?.(place.label);
    onChange?.(place);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onQueryChange?.('');
    onChange?.(null);
  };

  const dropdownItems = useMemo(() => results.slice(0, 5), [results]);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <label className="block text-sm font-semibold text-charcoal">
        {label}
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-neutralDark/60 bg-white px-4 py-3 text-base text-charcoal shadow-sm focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/30">
          <MapPin className="h-5 w-5 text-orange" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value;
              setQuery(nextValue);
              onQueryChange?.(nextValue);
              setIsOpen(Boolean(nextValue));
              if (!nextValue) {
                onChange?.(null);
              }
            }}
            onFocus={() => {
              if (dropdownItems.length) {
                setIsOpen(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            placeholder={placeholder}
            aria-label={label}
            className="peer flex-1 border-none bg-transparent text-base font-semibold text-charcoal placeholder:text-charcoal/50 focus:outline-none"
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" onClick={handleClear} aria-label="Clear location" className="text-charcoal/60 transition hover:text-orange">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </label>
      <p className="mt-2 text-xs text-charcoal-subtle">
        Powered by Mapbox. We’ll only show city and state publicly—exact addresses stay masked until booking.
      </p>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-neutralMid bg-white shadow-brand-soft">
          {isLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-charcoal-subtle">
              <Loader2 className="h-4 w-4 animate-spin text-orange" />
              Searching locations…
            </div>
          )}
          {!isLoading && error && (
            <p className="px-4 py-3 text-sm text-orange">{error}</p>
          )}
          {!isLoading && !error && dropdownItems.length === 0 && (
            <p className="px-4 py-3 text-sm text-charcoal-subtle">No matches. Try another landmark, city, or ZIP.</p>
          )}
          <ul className="max-h-64 overflow-y-auto">
            {dropdownItems.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(place)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-orange/10"
                >
                  <MapPin className="mt-1 h-4 w-4 text-orange" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{place.label}</p>
                    <p className="text-xs text-charcoal-subtle">{place.placeName}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
