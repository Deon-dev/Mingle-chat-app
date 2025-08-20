import { useState } from 'react';
import api from '../utils/api';
import { useStore } from '../stores/useStore';
import toast from 'react-hot-toast';

export default function CreateGroupModal({ open, onClose }) {
  const { setChats } = useStore();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;
    try {
      const { data } = await api.get('/users/search?q=' + encodeURIComponent(query));
      setResults(data);
    } catch {
      toast.error('Search failed');
    }
  }

  function toggle(u) {
    setSelected(sel =>
      sel.some(s => s._id === u._id)
        ? sel.filter(s => s._id !== u._id)
        : [...sel, u]
    );
  }

  async function create() {
    if (!name.trim() || selected.length < 2) {
      toast.error('Group name and at least 2 members required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/chats/group', {
        name,
        members: selected.map(u => u._id)
      });
      setChats(chats => [data, ...chats]);
      onClose();
    } catch {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
        <h2 className="font-bold text-lg mb-2">Create Group</h2>
        <input
          type="text"
          placeholder="Group name"
          className="input input-bordered w-full mb-2"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Search users"
            className="input input-bordered flex-1"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn btn-sm btn-primary" onClick={search}>Search</button>
        </div>
        <div className="max-h-32 overflow-y-auto mb-2">
          {results.map(u => (
            <button
              key={u._id}
              className={`block w-full text-left px-2 py-1 rounded ${selected.some(s => s._id === u._id) ? 'bg-blue-100' : ''}`}
              onClick={() => toggle(u)}
            >
              {u.name} <span className="text-xs text-gray-500">{u.email}</span>
            </button>
          ))}
        </div>
        <div className="mb-2">
          Selected: {selected.map(u => u.name).join(', ')}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={create} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button className="btn flex-1" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
