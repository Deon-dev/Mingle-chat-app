import { useStore } from '../stores/useStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-white">
      <div className="font-bold text-xl">Mingle Chat</div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <img src={user.avatarUrl || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
            <span className="text-sm">{user.name}</span>
          </>
        )}
        <button
          onClick={() => { logout(); navigate('/auth'); }}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
