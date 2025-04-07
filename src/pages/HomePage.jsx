import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

function HomePage({ searchTerm }) {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRadius, setSelectedRadius] = useState('All');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
      }
    );
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      const { data, error } = await supabase.from('shops').select('*');
      if (!error) {
        setShops(data);
        const uniqueCategories = ['All', ...new Set(data.map(shop => shop.category).filter(Boolean))];
        setCategories(uniqueCategories);
        filterShops(selectedRadius, data, selectedCategory);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    filterShops(selectedRadius, shops, selectedCategory);
  }, [searchTerm]);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRadiusChange = (e) => {
    const radius = e.target.value;
    setSelectedRadius(radius);
    filterShops(radius, shops, selectedCategory);
  };

  const filterShops = (radius, shopsData = shops, category = selectedCategory) => {
    let filtered = [...shopsData];

    filtered = filtered.filter((shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (category !== 'All') {
      filtered = filtered.filter((shop) => shop.category === category);
    }

    if (userLocation && radius !== 'All') {
      filtered = filtered.filter((shop) => {
        if (!shop.latitude || !shop.longitude) return false;
        const distance = getDistanceFromLatLonInKm(
          userLocation.latitude,
          userLocation.longitude,
          shop.latitude,
          shop.longitude
        );
        return distance <= parseFloat(radius);
      });
    }

    setFilteredShops(filtered);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Top Local Businesses</h2>

      {/* FILTERS */}
      <div className="row justify-content-center mb-3">
        <div className="col-12 col-md-5 mb-2">
          <label className="form-label">Filter by Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              filterShops(selectedRadius, shops, e.target.value);
            }}
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-5">
          <label className="form-label">Filter within Radius</label>
          <select
            className="form-select"
            value={selectedRadius}
            onChange={handleRadiusChange}
          >
            <option value="All">All</option>
            <option value="1">1 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
          </select>
        </div>
      </div>

      {/* MAP */}
      <div className="my-4">
        <h4 className="text-center mb-3">Map of Nearby Shops</h4>
        <MapContainer
          center={[userLocation?.latitude || 33.6844, userLocation?.longitude || 73.0479]}
          zoom={12}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredShops.map(shop => (
            shop.latitude && shop.longitude && (
              <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
                <Popup>
                  <strong>{shop.name}</strong><br />
                  {shop.address}
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* CARDS */}
      <div className="row">
        {filteredShops.slice(0, 32).map((shop) => {
          const distance = userLocation && shop.latitude && shop.longitude
            ? getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                shop.latitude,
                shop.longitude
              ).toFixed(1)
            : null;

          return (
            <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={shop.id}>
              <Link to={`/business/${shop.id}`} className="text-decoration-none text-dark">
                <div className="card h-100">
                  <img
                    src={shop.picture_url_1 || shop.picture_url || '/placeholder.png'}
                    className="card-img-top"
                    alt={shop.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{shop.name}</h5>
                    <p className="card-text">{shop.category}</p>
                    <p className="card-text">
                      📍 {shop.address}<br />
                      📞 {shop.contact_number || 'N/A'}<br />
                      {distance && <span>📏 {distance} km away</span>}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <footer className="bg-dark text-white text-center py-5 mt-5">
        <div className="container d-flex flex-column align-items-center">
          <div className="d-flex align-items-center">
            <img src="/logo.png" alt="Logo" style={{ height: '50px', marginRight: '10px' }} />
            <h3 className="mb-0">LOCAL BIZ</h3>
          </div>
          <small className="mt-2">For Locals To Meet Locals</small>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
