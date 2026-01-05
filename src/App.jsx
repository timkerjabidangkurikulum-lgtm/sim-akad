import React, { useEffect, useState } from 'react';
import SimAkadDashboard from './SimAkadDashboard.jsx';
import { apiLogin, apiLogout, apiMe } from './apiClient.js';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => {
    // cek session user jika sudah login
    apiMe()
      .then((res) => {
        setUser(res?.user || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('simakad:unauthorized', onUnauthorized);
    return () => window.removeEventListener('simakad:unauthorized', onUnauthorized);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiLogin(form.username, form.password);
      setUser(res.user);
      setForm({ username: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-sm">Memuat SIM-AKAD...</div>
      </div>
    );
  }

  if (!user) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const loginBgPng = `${baseUrl}login-bg.png`;
    const loginBgJpg = `${baseUrl}login-bg.jpg`;
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loginBgPng}), url(${loginBgJpg})` }}
      >
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />

        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-8 w-full max-w-md relative z-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">SIM-AKAD MAN Banggai</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Login untuk mengakses Sistem Informasi Akademik berbasis KMA 1503/2025.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <SimAkadDashboard user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
};

export default App;
