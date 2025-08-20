import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Only send name if registering
      const payload = mode === 'register'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const url = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(url, payload);
      localStorage.setItem('token', data.token);
      setAuth({ user: data.user, token: data.token });
      navigate('/');
    } catch (err) {
      console.error('Authentication error:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold mb-2">{mode === 'login' ? 'Login' : 'Register'}</h2>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
        </button>
        <div className="text-center">
          {mode === 'login' ? (
            <span>
              No account?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => setMode('register')}>
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" className="text-blue-600 underline" onClick={() => setMode('login')}>
                Login
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
