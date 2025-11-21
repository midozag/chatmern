import { GoogleOAuthProvider } from '@react-oauth/google'
import { useState } from 'react'
import { BrowserRouter,Route,Routes,Navigate } from 'react-router-dom'
import Login from './compnents/Auth/Login'
import Register from './compnents/Auth/Register'
import UserList from './compnents/Users/UsersList'
import Chat from './compnents/chat/Chat';
import Header from './compnents/Header'
import ProtectedRoute from './compnents/ProtectedRoute'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
   <BrowserRouter>
     <div className='h-screen'>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register />} />
        <Route path='/users' element={
          <ProtectedRoute>
            <div className='h-screen'>
              <Header />
              <div className='h-[calc(100vh-64px)]'>
                <UserList/>
              </div>
            </div>
          </ProtectedRoute>
        } />
        <Route path='/chat' element={
              <ProtectedRoute>
                <div className='h-screen'>
                  <Header />
                  <div className='h-[calc(100vh-64px)]'>
                    <Chat/>
                  </div>
                </div>
              </ProtectedRoute>
            } />
        <Route path='/' element={<Navigate to="/login" replace />} />
      </Routes>
     </div>
   </BrowserRouter>
   </GoogleOAuthProvider>
  )
}

export default App
