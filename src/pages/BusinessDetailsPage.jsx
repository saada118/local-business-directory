import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import ReviewForm from '../components/ReviewForm';

function BusinessDetailsPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShop = async () => {
    const { data, error } = await supabase.from('shops').select('*').eq('id', id).single();
    if (error) console.error('Error fetching shop:', error.message);
    else setShop(data);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('shop_id', id)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching reviews:', error.message);
    else setReviews(data);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchShop();
      await fetchReviews();
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleNewReview = async () => {
    await fetchReviews();
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <p className="container mt-4">Loading...</p>;
  if (!shop) return <p className="container mt-4">Shop not found.</p>;

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-5">
          <img
            src={shop.picture_url || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={shop.name}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-7">
          <h2>{shop.name}</h2>
          <p><strong>Category:</strong> {shop.category}</p>
          <p><strong>Address:</strong> {shop.address}</p>
          <p><strong>Contact Number:</strong> {shop.contact_number || 'N/A'}</p>
          <p><strong>Average Rating:</strong> {averageRating ? `${averageRating} ⭐` : 'No ratings yet'}</p>
        </div>
      </div>
        {shop.promotion && (
        <p><strong>Promotion:</strong> {shop.promotion}</p>
         )}

      <div className="mb-4">
        <h5>Reviews</h5>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="list-group">
            {reviews.map((review) => (
              <li key={review.id} className="list-group-item">
                <strong>{'⭐'.repeat(review.rating)}</strong>
                <p className="mb-1">{review.comment}</p>
                <small className="text-muted">
                  {new Date(review.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ReviewForm shopId={id} onReviewSubmitted={handleNewReview} />
    </div>
  );
}

export default BusinessDetailsPage;

