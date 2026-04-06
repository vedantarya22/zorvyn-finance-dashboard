import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <div className="navbar__brand">
          <div className="navbar__brand-dot" />
          FinanceOS
        </div>
        <div className="navbar__links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/records"
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            Records
          </NavLink>
          {hasRole('admin') && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
              }
            >
              Users
            </NavLink>
          )}
        </div>
      </div>

      <div className="navbar__right">
        <div className="navbar__avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="navbar__username">{user?.name}</span>
        <span className="navbar__role-pill">{user?.role}</span>
        <button className="navbar__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;