import { useEffect, useState } from 'react';
import ShopForm from '../components/ShopForm';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

function AddShopPage() {
  const [userShops, setUserShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserShops = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('user_id', user.id);
        if (!error) setUserShops(data);
      }
    };

    fetchUserShops();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this shop?');
    if (!confirm) return;

    const { error } = await supabase.from('shops').delete().eq('id', id);
    if (!error) {
      setUserShops((prev) => prev.filter((shop) => shop.id !== id));
      if (selectedShop?.id === id) setSelectedShop(null);
    }
  };

  const handleFinish = () => {
    navigate('/add-shop');
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Scrollable Saved Shops */}
        <div className="col-md-4">
          <aside className="bg-light p-3 rounded" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <h5>Saved Shops</h5>
            {userShops.map((shop) => (
              <div key={shop.id} className="d-flex justify-content-between align-items-center mb-2">
                <span
                  role="button"
                  className="text-primary text-decoration-underline"
                  onClick={() => setSelectedShop(shop)}
                >
                  {shop.name}
                </span>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(shop.id)}>Delete</button>
              </div>
            ))}
          </aside>
        </div>

        {/* Form Section */}
        <div className="col-md-8">
          <ShopForm selectedShop={selectedShop} onFinish={handleFinish} />
        </div>
      </div>
    </div>
  );
}

export default AddShopPage;