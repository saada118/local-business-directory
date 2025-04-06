import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function Navbar({ searchTerm, setSearchTerm }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setSearchTerm('');
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid align-items-center justify-content-between">
        {/* Left: Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/favicon.png"
            alt="Logo"
            style={{ width: '32px', height: '32px', marginRight: '8px' }}
          />
          LocalBiz
        </Link>

        {/* Center: Search */}
        <div className="mx-auto w-50">
          <input
            type="search"
            className="form-control"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Right: Add Shop, Profile, Logout/Login */}
        <ul className="navbar-nav ms-auto d-flex align-items-center">
          {user && (
            <li className="nav-item me-2">
              <Link className="btn btn-success btn-sm" to="/add-shop">
                + Add Shop
              </Link>
            </li>
          )}
          {user ? (
            <>
              <li className="nav-item me-2">
                <Link to="/profile" className="text-white text-decoration-none">
                  👤 {user.user_metadata?.full_name || user.email.split('@')[0]}
                </Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="btn btn-outline-light btn-sm" to="/login">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;



