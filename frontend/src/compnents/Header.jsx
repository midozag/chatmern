import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () =>{
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId')
    const handleLogout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login')
    }

    return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Chat App 
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
        </header>
    )

}
export default Header;