import React, { useState } from 'react';
import { MapPin, Lock, Eye, Loader2 } from 'lucide-react';
import { useBookingLocation } from '../hooks/useBookingLocation';

/**
 * BookingAddress Component
 * 
 * Displays booking location with proper address masking enforcement.
 * Shows masked location until payment is confirmed, then reveals precise address.
 * 
 * @param {Object} props
 * @param {Object} props.booking - Booking object with listing and state/status
 * @param {boolean} props.showRevealButton - Whether to show "Reveal Address" button
 * @param {string} props.className - Additional CSS classes
 */
export function BookingAddress({ booking, showRevealButton = true, className = '' }) {
  const { 
    getAddressInfo, 
    revealAddress, 
    isLoading, 
    error 
  } = useBookingLocation();
  
  const [revealedAddress, setRevealedAddress] = useState(null);

  const addressInfo = getAddressInfo(booking);

  const handleRevealAddress = async () => {
    if (!booking?.id) return;
    
    const location = await revealAddress(booking.id);
    if (location?.preciseAddress) {
      setRevealedAddress(location.preciseAddress);
    }
  };

  // Use revealed address if available
  const displayAddress = revealedAddress || addressInfo.displayText;
  const showLockIcon = addressInfo.isMasked;
  const canReveal = !addressInfo.isMasked && addressInfo.needsFetch && showRevealButton;

  return (
    <div className={`booking-address ${className}`}>
      <div className="flex items-start gap-2">
        {showLockIcon ? (
          <Lock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
        ) : (
          <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${showLockIcon ? 'text-slate-500' : 'text-slate-900 font-medium'}`}>
            {displayAddress}
          </p>
          
          {showLockIcon && addressInfo.reason && (
            <p className="text-xs text-slate-400 mt-0.5">
              {addressInfo.reason}
            </p>
          )}

          {error && (
            <p className="text-xs text-rose-600 mt-1">{error}</p>
          )}
        </div>

        {canReveal && (
          <button
            onClick={handleRevealAddress}
            disabled={isLoading}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                View Address
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * AddressMaskBadge Component
 * 
 * Shows a visual indicator of address masking status
 */
export function AddressMaskBadge({ booking, size = 'sm' }) {
  const { isAddressMasked } = useBookingLocation();
  
  const isMasked = isAddressMasked(booking);
  
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  if (isMasked) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 ${sizeClasses[size]}`}>
        <Lock className="h-3 w-3" />
        Address masked
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 ${sizeClasses[size]}`}>
      <MapPin className="h-3 w-3" />
      Address available
    </span>
  );
}

/**
 * AddressMaskNotice Component
 * 
 * Informational notice explaining address masking policy
 */
export function AddressMaskNotice({ className = '' }) {
  return (
    <div className={`rounded-xl bg-slate-50 border border-slate-200 p-4 ${className}`}>
      <div className="flex gap-3">
        <Lock className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-900">
            Address Protection
          </p>
          <p className="text-sm text-slate-600 mt-1">
            For your security, exact addresses are only revealed after payment is confirmed. 
            You'll see the general area until then.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookingAddress;
