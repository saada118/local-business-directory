import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', bio: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [selectedReview, setSelectedReview] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(1);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setFormData({
          full_name: user.user_metadata?.full_name || '',
          bio: user.user_metadata?.bio || '',
        });
        fetchReviews(user.id);
      }
    };

    loadProfile();
  }, []);

  const fetchReviews = async (userId) => {
    console.log('📥 Refreshing review list...');
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, shop_id, shops:shop_id(name)')
      .eq('user_id', userId);

    if (!error) {
      console.log('📋 Updated review list:');
      console.log(data);
      setReviews(data);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    let profile_url = user.user_metadata?.avatar_url || '';

    if (profileImage) {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pics')
        .upload(fileName, profileImage, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage
          .from('profile-pics')
          .getPublicUrl(fileName);
        profile_url = data.publicUrl;
      }
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.full_name,
        bio: formData.bio,
        avatar_url: profile_url,
      },
    });

    if (!error) alert('Profile updated!');
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setEditComment(review.comment || '');
    setEditRating(review.rating || 1);
    const modal = new bootstrap.Modal(document.getElementById('editReviewModal'));
    modal.show();
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    const modal = new bootstrap.Modal(document.getElementById('deleteReviewModal'));
    modal.show();
  };

  const handleSaveEditedReview = async () => {
    if (!selectedReview) return;
    console.log('Updating review ID:', selectedReview.id);

    const { error } = await supabase
      .from('reviews')
      .update({
        comment: editComment,
        rating: editRating,
      })
      .eq('id', selectedReview.id);

    if (error) {
      console.error('❌ Error updating review:', error);
      alert('Error updating review!');
    } else {
      console.log('✅ Review updated!');
      fetchReviews(user.id);
      setSelectedReview(null);
      setEditComment('');
      setEditRating(1);
      bootstrap.Modal.getInstance(document.getElementById('editReviewModal'))?.hide();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReview) return;
    console.log('Deleting review ID:', selectedReview.id);

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', selectedReview.id);

    if (error) {
      console.error('❌ Error deleting review:', error);
      alert('Error deleting review!');
    } else {
      console.log('✅ Review deleted!');
      fetchReviews(user.id);
      setSelectedReview(null);
      bootstrap.Modal.getInstance(document.getElementById('deleteReviewModal'))?.hide();
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4">Your Profile</h2>

      <form onSubmit={handleSave}>
        <div className="mb-3 text-center">
          <div className="rounded-circle mx-auto mb-2" style={{ width: '120px', height: '120px', overflow: 'hidden', border: '3px solid #ccc' }}>
            {previewUrl || user?.user_metadata?.avatar_url ? (
              <img src={previewUrl || user.user_metadata.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="d-flex justify-content-center align-items-center bg-secondary text-white" style={{ width: '100%', height: '100%' }}>
                No Image
              </div>
            )}
          </div>
          <input type="file" className="form-control" onChange={handleImageChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Bio</label>
          <textarea className="form-control" name="bio" rows="3" value={formData.bio} onChange={handleChange} />
        </div>

        <button type="submit" className="btn btn-primary w-100">Save Profile</button>
      </form>

      <div className="mt-5">
        <h4 className="mb-3">Your Reviews</h4>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border p-3 rounded mb-2">
              <strong>{review.shops?.name || 'Unknown'}</strong>
              <p className="mb-1">⭐ {review.rating} / 5</p>
              <p className="mb-1">{review.comment || 'No comment'}</p>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditReview(review)}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(review)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted">No reviews yet.</div>
        )}
      </div>

      {/* Edit Modal */}
      <div className="modal fade" id="editReviewModal" tabIndex="-1" aria-labelledby="editReviewModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Review</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Star Rating</label>
              <input type="number" min="1" max="5" className="form-control mb-3" value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} />

              <label className="form-label">Comment</label>
              <textarea className="form-control" rows="3" value={editComment} onChange={(e) => setEditComment(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEditedReview}>Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="deleteReviewModal" tabIndex="-1" aria-labelledby="deleteReviewModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Delete</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedReview && (
                <>
                  <p><strong>Rating:</strong> ⭐ {selectedReview.rating}</p>
                  <p><strong>Comment:</strong> {selectedReview.comment}</p>
                  <p className="text-danger">Are you sure you want to delete this review?</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;


