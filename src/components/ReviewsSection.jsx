import { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, User, MessageCircle } from 'lucide-react';

/**
 * Reviews Section Component
 * Displays reviews for a listing with rating summary and individual reviews
 */
export function ReviewsSection({ listingId, className = '' }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchReviews = useCallback(async (pageNum = 1, append = false) => {
    if (!listingId) return;

    try {
      setIsLoading(true);
      const offset = (pageNum - 1) * 10;
      const response = await fetch(
        `/api/reviews?listingId=${listingId}&offset=${offset}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        const reviewList = data.data || [];
        
        if (append) {
          setReviews(prev => [...prev, ...reviewList]);
        } else {
          setReviews(reviewList);
          // Build summary from response
          setSummary({
            averageRating: data.averageRating || 0,
            reviewCount: data.total || 0,
            distribution: buildDistribution(reviewList)
          });
        }
        setHasMore(data.hasMore || false);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  // Helper to build rating distribution
  const buildDistribution = (reviewList) => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewList.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating]++;
      }
    });
    return dist;
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Rating Summary */}
      {summary && summary.reviewCount > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              <span className="text-3xl font-bold text-slate-900">
                {summary.averageRating.toFixed(1)}
              </span>
            </div>
            <div className="text-slate-500">
              {summary.reviewCount} review{summary.reviewCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = summary.distribution[rating] || 0;
              const percentage = summary.reviewCount > 0 
                ? (count / summary.reviewCount) * 100 
                : 0;

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm text-slate-600">{rating}</span>
                    <Star className="h-3 w-3 text-slate-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="w-full py-3 text-sm font-semibold text-orange-500 hover:text-orange-600 transition"
            >
              {isLoading ? 'Loading...' : 'Load more reviews'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No reviews yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Be the first to review after your booking
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Review Card
 */
function ReviewCard({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reviewText = review.comment || review.body || '';
  const maxLength = 200;
  const isLong = reviewText.length > maxLength;
  const reviewerName = review.user?.name || review.reviewerName || 'Guest';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="border-b border-slate-100 pb-6 last:border-0">
      {/* Reviewer Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
          {review.user?.avatarUrl ? (
            <img 
              src={review.user.avatarUrl} 
              alt={reviewerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {reviewerName}
            </span>
          </div>
          <div className="text-sm text-slate-500">
            {formatDate(review.createdAt)}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= review.rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-slate-900 mb-2">{review.title}</h4>
      )}

      {/* Body */}
      {reviewText && (
        <div className="text-slate-600">
          <p>
            {isExpanded || !isLong
              ? reviewText
              : `${reviewText.slice(0, maxLength)}...`}
          </p>
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 mt-2"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Host Response */}
      {review.hostResponse && (
        <div className="mt-4 pl-4 border-l-2 border-orange-200 bg-orange-50/50 rounded-r-lg py-3 pr-3">
          <p className="text-sm font-medium text-slate-900 mb-1">Host response:</p>
          <p className="text-sm text-slate-600">{review.hostResponse}</p>
          {review.hostResponseAt && (
            <p className="text-xs text-slate-400 mt-2">
              Responded {formatDate(review.hostResponseAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Star Rating Input Component
 */
export function StarRatingInput({ value = 0, onChange, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(0);
  
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverValue || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export default ReviewsSection;
