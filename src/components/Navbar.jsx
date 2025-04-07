import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function Navbar({ searchTerm, setSearchTerm }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setSearchTerm('');
    setMenuOpen(false); // Close mobile menu on route change
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid d-flex justify-content-between align-items-center">

        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/favicon.png"
            alt="Logo"
            style={{ width: '32px', height: '32px', marginRight: '8px' }}
          />
          LocalBiz
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Desktop search bar */}
        <div className="d-none d-lg-block mx-auto w-50">
          <input
            type="search"
            className="form-control"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Desktop menu */}
        <ul className="navbar-nav ms-auto d-none d-lg-flex align-items-center">
          {user && (
            <li className="nav-item me-2">
              <Link className="btn btn-success btn-sm" to="/add-shop">+ Add Shop</Link>
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
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="btn btn-outline-light btn-sm" to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-dark d-lg-none p-3 text-center">
          {user && (
            <>
              <Link className="btn btn-success w-100 mb-2" to="/add-shop">+ Add Shop</Link>
              <Link className="btn btn-outline-light w-100 mb-2" to="/profile">
                👤 {user.user_metadata?.full_name || user.email.split('@')[0]}
              </Link>
              <button className="btn btn-outline-light w-100" onClick={handleLogout}>Logout</button>
            </>
          )}
          {!user && (
            <Link className="btn btn-outline-light w-100" to="/login">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;



