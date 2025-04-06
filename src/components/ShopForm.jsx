import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

function ShopForm({ selectedShop = null, onFinish }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: '',
    contact_number: '',
    promotion: null,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [reviews, setReviews] = useState([]);
  const [reportReason, setReportReason] = useState('');
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn('Location permission denied:', err.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (selectedShop) {
      setFormData({
        name: selectedShop.name || '',
        address: selectedShop.address || '',
        category: selectedShop.category || '',
        contact_number: selectedShop.contact_number || '',
        promotion: selectedShop.promotion ?? null,
      });
      fetchReviews(selectedShop.id);
    }
  }, [selectedShop]);

  const fetchReviews = async (shopId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (!error) setReviews(data);
  };

  const handleReportReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !reportingReviewId || !reportReason) return;

    const { error } = await supabase.from('reports').insert([{
      user_id: user.id,
      review_id: reportingReviewId,
      reason: reportReason
    }]);

    if (!error) {
      alert('Review reported.');
      setReportReason('');
      setReportingReviewId(null);
      const modal = window.bootstrap.Modal.getInstance(document.getElementById('reportModal'));
      modal.hide();
    } else {
      alert('Failed to report.');
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    let imageUrls = [];
    for (let file of imageFiles.slice(0, 4)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-images')
        .upload(fileName, file);

      if (uploadError) {
        alert('Image upload failed!');
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      imageUrls.push(publicUrlData.publicUrl);
    }

    const [url1, url2, url3, url4] = imageUrls;

    const dataToSend = {
      ...formData,
      promotion: formData.promotion?.trim() || null,
      picture_url_1: url1 || selectedShop?.picture_url_1 || '',
      picture_url_2: url2 || selectedShop?.picture_url_2 || '',
      picture_url_3: url3 || selectedShop?.picture_url_3 || '',
      picture_url_4: url4 || selectedShop?.picture_url_4 || '',
      user_id: user.id,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    let result;
    if (selectedShop) {
      result = await supabase.from('shops').update(dataToSend).eq('id', selectedShop.id);
    } else {
      result = await supabase.from('shops').insert([dataToSend]);
    }

    if (result.error) {
      alert('Error saving shop');
    } else {
      setFormData({ name: '', address: '', category: '', contact_number: '', promotion: null });
      setImageFiles([]);
      onFinish();
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h5>{selectedShop ? 'Edit Shop' : 'Add a New Shop'}</h5>

        <div className="mb-3">
          <label className="form-label">Shop Name</label>
          <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input type="text" className="form-control" name="category" value={formData.category} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Contact Number</label>
          <input type="tel" className="form-control" name="contact_number" value={formData.contact_number} onChange={handleChange} />
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="promotionCheck"
            checked={formData.promotion !== null}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                promotion: e.target.checked ? '' : null,
              }))
            }
          />
          <label className="form-check-label" htmlFor="promotionCheck">
            Feature this shop as a Promotion
          </label>
        </div>

        {formData.promotion !== null && (
          <div className="mb-3">
            <label className="form-label">Promotion Details</label>
            <input
              type="text"
              className="form-control"
              name="promotion"
              value={formData.promotion}
              onChange={handleChange}
              placeholder="e.g. 20% off all items!"
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Pictures (Max 4)</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            multiple
            onChange={(e) => {
              const selected = Array.from(e.target.files);
              if (selected.length + imageFiles.length > 4) {
                alert('You can upload up to 4 images.');
                return;
              }
              setImageFiles((prev) => [...prev, ...selected]);
            }}
          />
          <div className="d-flex flex-wrap gap-2 mt-3">
            {imageFiles.map((file, index) => (
              <div key={index} className="position-relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                  onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== index))}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          {selectedShop ? 'Update Shop' : 'Add Shop'}
        </button>

        <div className="text-center mt-3">
          <a href="/advertise" className="btn btn-primary w-100">Advertise</a>
        </div>
      </form>

      {/* Reviews and report section */}
      {selectedShop && (
        <div className="mt-4">
          <h5>Reviews for this Shop</h5>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            <ul className="list-group">
              {reviews.map((review) => (
                <li className="list-group-item" key={review.id}>
                  <strong>{'⭐'.repeat(review.rating)}</strong><br />
                  {review.comment}
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">{new Date(review.created_at).toLocaleString()}</small>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setReportingReviewId(review.id);
                        const modal = new window.bootstrap.Modal(document.getElementById('reportModal'));
                        modal.show();
                      }}
                    >
                      Report
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Report Modal */}
      <div className="modal fade" id="reportModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Report Review</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <label className="form-label">Reason for reporting</label>
              <textarea
                className="form-control"
                rows="3"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-danger" onClick={handleReportReview}>Submit Report</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShopForm;
