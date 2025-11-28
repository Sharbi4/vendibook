import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';

/**
 * Save/Wishlist Button Component
 * Heart icon that toggles listing save status
 * 
 * @example
 * <SaveButton listingId="xxx" size="md" showLabel />
 */
export function SaveButton({ 
  listingId, 
  size = 'md',
  showLabel = false,
  className = '',
  onAuthRequired
}) {
  const { isAuthenticated } = useAuth();
  const { isSaved, isLoading, toggleSave, error } = useWishlist(listingId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    await toggleSave();
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 rounded-full transition-all
        ${isSaved 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-slate-400 hover:text-slate-600'
        }
        ${showLabel ? 'px-3 py-1.5 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow' : buttonSizeClasses[size]}
        ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
      title={error || (isSaved ? 'Remove from saved' : 'Save listing')}
    >
      <Heart
        className={`
          ${sizeClasses[size]}
          ${isSaved ? 'fill-current' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}

/**
 * Save Button with background for overlaying on images
 */
export function SaveButtonOverlay({ listingId, className = '' }) {
  return (
    <div className={`absolute top-3 right-3 ${className}`}>
      <SaveButton
        listingId={listingId}
        size="md"
        className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white"
      />
    </div>
  );
}

export default SaveButton;
