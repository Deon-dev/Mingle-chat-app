import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatsPage from './pages/ChatsPage';
import { useStore } from './stores/useStore';

function PrivateRoute({ children }) {
  const { token } = useStore();
  return token ? children : <Navigate to="/auth" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

