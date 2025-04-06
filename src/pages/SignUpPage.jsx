import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert('Sign up successful! Please log in.');
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center align-items-center">
        <div className="col-md-8 d-flex shadow rounded overflow-hidden">

          {/* Logo Area */}
          <div className="col-md-6 p-4 bg-light d-flex align-items-center justify-content-center">
            <img
              src="/logo.png"
              alt="Logo"
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
          </div>

          {/* Signup Form */}
          <div className="col-md-6 p-4">
            <h3 className="mb-4">Sign Up</h3>

            <form onSubmit={handleSignUp}>
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button type="submit" className="btn btn-success w-100" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>

            <div className="text-center mt-3">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-primary text-decoration-underline">
                  Login
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SignUpPage;


