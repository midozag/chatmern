import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        console.log('no token');
        return;
      }

      try {
        const response = await fetch('/api/users/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        setIsLoading(false);
          
      } catch (error) {
        console.error("Verification error:", error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    verifyAccess();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return children;
};

export default ProtectedRoute;