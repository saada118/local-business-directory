import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { deleteShop } from '../services/shopService';

function SavedShopsList({ onEdit }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
  
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('user_id', user.id) // 👈 Only fetch this user’s shops
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error loading saved shops:', error.message);
    } else {
      setShops(data);
    }
  
    setLoading(false);
  };
  

  useEffect(() => {
    fetchShops();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this shop?");
    if (!confirmDelete) return;

    const result = await deleteShop(id);
    if (result.success) {
      setShops((prevShops) => prevShops.filter((shop) => shop.id !== id));
    }
  };

  return (
    <div>
      <h6 className="text-muted">Saved Shops</h6>
      {loading ? (
        <p>Loading...</p>
      ) : shops.length === 0 ? (
        <p>No saved shops yet.</p>
      ) : (
        <ul className="list-group">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="list-group-item d-flex justify-content-between align-items-start"
              style={{ cursor: 'pointer' }}
              onClick={() => onEdit(shop)}
            >
              <div>
                <strong>{shop.name}</strong><br />
                <small className="text-muted">{shop.category}</small>
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => {
                  e.stopPropagation(); // prevent triggering edit
                  handleDelete(shop.id);
                }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavedShopsList;


  