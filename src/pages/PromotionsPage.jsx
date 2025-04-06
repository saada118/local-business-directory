import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

function PromotionsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .not('promotion', 'is', null)
      .neq('promotion', ''); // Only shops with promotion

    if (error) {
      console.error('Error fetching promotions:', error.message);
    } else {
      setShops(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Current Promotions</h2>

      {loading ? (
        <p>Loading promotions...</p>
      ) : shops.length === 0 ? (
        <p>No promotions available right now.</p>
      ) : (
        <div className="row">
          {shops.map((shop) => (
            <div className="col-md-4 mb-4" key={shop.id}>
              <div className="card h-100">
                <img
                  src={shop.picture_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                  className="card-img-top"
                  alt={shop.name}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{shop.name}</h5>
                  <p className="card-text">
                    <strong>Promotion:</strong><br />{shop.promotion}
                  </p>
                  <Link to={`/shop/${shop.id}`} className="btn btn-primary btn-sm">
                    View Business
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PromotionsPage;
