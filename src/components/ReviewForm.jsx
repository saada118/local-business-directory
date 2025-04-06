import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

function ReviewForm({ shopId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to submit a review.');
      return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        shop_id: shopId,
        user_id: user.id,
        rating,
        comment,
      },
    ]);

    if (error) {
      console.error('Error submitting review:', error.message);
      alert('Failed to submit review.');
    } else {
      alert('Review submitted!');
      setRating(0);
      setComment('');
      onReviewSubmitted(); // optional callback
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 rounded mt-4">
      <h6>Leave a Review</h6>

      <div className="mb-2">
        <label className="form-label me-2">Rating:</label>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: rating >= star ? '#ffc107' : '#ccc',
            }}
          >
            ★
          </span>
        ))}
      </div>

      <div className="mb-2">
        <textarea
          className="form-control"
          rows="2"
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" type="submit" disabled={submitting || rating === 0}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default ReviewForm;
