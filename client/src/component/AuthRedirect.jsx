import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  }, []);

  return null;
}

export default AuthRedirect;
