import { Link } from 'react-router-dom';

function BusinessCard({ shop }) {
  return (
    <div className="col-md-3 mb-4">
      <Link to={`/shop/${shop.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card h-100">
          <img
            src={shop.picture_url || 'https://via.placeholder.com/300x200?text=No+Image'}
            className="card-img-top"
            alt={shop.name}
            style={{ height: '180px', objectFit: 'cover' }}
          />
          <div className="card-body">
            <h5 className="card-title">{shop.name}</h5>
            <p className="mb-1">
              <strong>Rating:</strong>{' '}
              {shop.average_rating ? `${shop.average_rating} ⭐` : 'No ratings yet'}
            </p>
            <p className="card-text">
              <strong>Category:</strong> {shop.category || 'N/A'}<br />
              <strong>Address:</strong> {shop.address}
            </p>
            {shop.distance != null && (
               <p className="text-muted mb-1">📍 {shop.distance} km away</p>
                )}

          </div>
        </div>
      </Link>
    </div>
  );
}

export default BusinessCard;
