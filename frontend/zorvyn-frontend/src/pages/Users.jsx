import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Users.css';

const ROLES    = ['viewer', 'analyst', 'admin'];
const STATUSES = ['active', 'inactive'];

const Users = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const status = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${userId}/status`, { status });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getRolePillClass = (role) => {
    if (role === 'admin')   return 'users__role-pill users__role-pill--admin';
    if (role === 'analyst') return 'users__role-pill users__role-pill--analyst';
    return 'users__role-pill users__role-pill--viewer';
  };

  return (
    <>
      <Navbar />
      <div className="users__page">

        <div className="users__header">
          <div>
            <h1 className="users__title">Users</h1>
            <p className="users__subtitle">{users.length} total accounts</p>
          </div>
        </div>

        {error && <div className="users__error">{error}</div>}

        <div className="users__table-wrap">
          <table className="users__table">
            <thead>
              <tr>
                <th className="users__th">User</th>
                <th className="users__th">Role</th>
                <th className="users__th">Status</th>
                <th className="users__th">Joined</th>
                <th className="users__th">Change role</th>
                <th className="users__th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="users__empty">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="users__empty">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="users__tr">

                    {/* Avatar + name + email */}
                    <td className="users__td">
                      <div className="users__user-cell">
                        <div className="users__avatar">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="users__name">{u.name}</div>
                          <div className="users__email">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role pill */}
                    <td className="users__td">
                      <span className={getRolePillClass(u.role)}>{u.role}</span>
                    </td>

                    {/* Status pill */}
                    <td className="users__td">
                      <span className={`users__status-pill users__status-pill--${u.status}`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Joined date */}
                    <td className="users__td users__td--muted">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>

                    {/* Role dropdown */}
                    <td className="users__td">
                      <select
                        className="users__select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>

                    {/* Activate / deactivate */}
                    <td className="users__td">
                      <button
                        className={`users__toggle-btn users__toggle-btn--${u.status === 'active' ? 'deactivate' : 'activate'}`}
                        onClick={() => handleStatusToggle(u._id, u.status)}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};

export default Users;