import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, AlertCircle } from 'lucide-react';
import { login, register } from '../utils/auth';

function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }

      // Check if there's a redirect URL stored
      const redirectUrl = sessionStorage.getItem('vendibook_redirect_after_login');
      if (redirectUrl) {
        sessionStorage.removeItem('vendibook_redirect_after_login');
        navigate(redirectUrl);
      } else {
        navigate('/host/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await login('demo@vendibook.com', 'demo123');

      const redirectUrl = sessionStorage.getItem('vendibook_redirect_after_login');
      if (redirectUrl) {
        sessionStorage.removeItem('vendibook_redirect_after_login');
        navigate(redirectUrl);
      } else {
        navigate('/host/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #EBEBEB' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: '#FF5124',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#FF5124' }}>
                vendibook
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 40px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #EBEBEB'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px', color: '#343434', textAlign: 'center' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ fontSize: '16px', color: '#717171', marginBottom: '32px', textAlign: 'center' }}>
            {isLogin ? 'Log in to manage your listings' : 'Sign up to start hosting'}
          </p>

          {error && (
            <div style={{
              padding: '12px',
              background: '#FEE',
              border: '1px solid #ECC',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle style={{ width: '18px', height: '18px', color: '#C33' }} />
              <span style={{ fontSize: '14px', color: '#C33' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #EBEBEB',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #EBEBEB',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#343434' }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #EBEBEB',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#CCC' : '#FF5124',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>

            {isLogin && (
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'white',
                  color: '#FF5124',
                  border: '1px solid #FF5124',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '16px'
                }}
              >
                Quick Login (Demo Account)
              </button>
            )}
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF5124',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
            </button>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#FFF3F0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#717171',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#FF5124' }}>Demo credentials:</strong><br />
            Email: demo@vendibook.com<br />
            Password: demo123
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
