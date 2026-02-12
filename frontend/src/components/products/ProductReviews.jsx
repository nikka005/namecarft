import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ThumbsUp, Check, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const StarRating = ({ rating, onRatingChange, interactive = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-100 pb-6 last:border-0">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{review.reviewer_name}</span>
            {review.verified_purchase && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
          </div>
          {review.title && (
            <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
          )}
          <p className="text-gray-600 text-sm">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

const ReviewForm = ({ productId, onSubmitSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    reviewer_name: '',
    reviewer_email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim() || !formData.reviewer_name.trim() || !formData.reviewer_email.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/products/${productId}/reviews`, {
        ...formData,
        product_id: productId
      });
      toast.success("Review submitted! It will be published after approval.");
      setFormData({ rating: 5, title: '', comment: '', reviewer_name: '', reviewer_email: '' });
      setIsOpen(false);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        Write a Review
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl space-y-4">
      <h4 className="font-semibold text-gray-900">Write Your Review</h4>
      
      <div>
        <Label className="mb-2 block">Your Rating *</Label>
        <StarRating 
          rating={formData.rating} 
          onRatingChange={(r) => setFormData({ ...formData, rating: r })}
          interactive
          size="lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reviewer_name">Your Name *</Label>
          <Input
            id="reviewer_name"
            value={formData.reviewer_name}
            onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="reviewer_email">Your Email *</Label>
          <Input
            id="reviewer_email"
            type="email"
            value={formData.reviewer_email}
            onChange={(e) => setFormData({ ...formData, reviewer_email: e.target.value })}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="review_title">Review Title (Optional)</Label>
        <Input
          id="review_title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Sum up your experience"
        />
      </div>

      <div>
        <Label htmlFor="review_comment">Your Review *</Label>
        <Textarea
          id="review_comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          placeholder="Share your experience with this product..."
          rows={4}
          required
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting} className="bg-sky-500 hover:bg-sky-600">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/products/${productId}/reviews`);
      setReviews(res.data.reviews || []);
      setStats({
        total: res.data.total || 0,
        average_rating: res.data.average_rating || 0
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8" data-testid="product-reviews">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h3>
      
      {/* Rating Summary */}
      <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{stats.average_rating}</div>
          <StarRating rating={Math.round(stats.average_rating)} size="md" />
          <div className="text-sm text-gray-500 mt-1">{stats.total} {stats.total === 1 ? 'Review' : 'Reviews'}</div>
        </div>
        <div className="flex-1 max-w-xs">
          <ReviewForm productId={productId} onSubmitSuccess={fetchReviews} />
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  );
};

export { ProductReviews, StarRating };
export default ProductReviews;
