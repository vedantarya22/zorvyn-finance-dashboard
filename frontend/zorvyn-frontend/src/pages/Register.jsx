import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Register.css';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      login(res.data);       // store token + user in context immediately
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="register__page">
      <div className="register__card">

        <div className="register__logo">
          <div className="register__logo-dot" />
          FinanceOS
        </div>

        <div className="register__header">
          <p className="register__title">Create your account</p>
          <p className="register__subtitle">Start managing your finances</p>
        </div>

        {error && <div className="register__error">{error}</div>}

        <form className="register__form" onSubmit={handleSubmit}>
          <div className="register__field">
            <label className="register__label">Full name</label>
            <input
              className="register__input"
              type="text"
              placeholder="Vedant Arya"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label">Email</label>
            <input
              className="register__input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label">Password</label>
            <input
              className="register__input"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange('password')}
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label">Confirm password</label>
            <input
              className={`register__input ${
                form.confirmPassword && form.confirmPassword !== form.password
                  ? 'register__input--error'
                  : ''
              }`}
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
            />
            {form.confirmPassword && form.confirmPassword !== form.password && (
              <span className="register__field-error">Passwords don't match</span>
            )}
          </div>

          <button
            type="submit"
            className="register__btn"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="register__hint">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>

        <div className="register__note">
          <span className="register__note-icon">ℹ</span>
          New accounts are assigned the viewer role by default. <br/>Contact an admin to upgrade access.
        </div>

      </div>
    </div>
  );
};

export default Register;