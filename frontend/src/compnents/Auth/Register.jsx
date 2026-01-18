import React, {useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {GoogleLogin} from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

const Register = ()=>{
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [erreur,setErreur] = useState('')
  const handleChange = (e) =>{
    setFormData({...formData,
      [e.target.name] : e.target.value
  })
  }
  const handleSubmit =async (e) =>{
    e.preventDefault()
    setErreur('')
    if(formData.password !== formData.confirmPassword){
      setErreur('password do not matching');
      return;
    }  
    try{
      const response = await fetch('http://localhost:3000/api/users/register',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          name:formData.name,
          email:formData.email,
          password:formData.password,
        })
      })
      const data = await response.json()
      if(!response.ok){
        throw new Error(data.message || 'Registration failed')
      }
      navigate('/login')
    }
    catch(err){
        setErreur(err.message)
    }

  }
  const handleGoogleSucces = async(credentialResponse) =>{
     try{
      const decoded = jwtDecode(credentialResponse.credential)
      const response = await fetch('http://localhost:3000/api/users/google-auth',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          token: credentialResponse.credential,
          email: decoded.email,
          name:decoded.name,
          picture: decoded.picture
        })
      });
      const data = await response.json()
      if(!response.ok){
        throw new Error(data.message || 'Google authentication failed')
      }
      localStorage.setItem('token', data.token);  
      // Optionally store user info
      if(data.user && data.user.id) {
          localStorage.setItem('userId',data.user.id)
          localStorage.setItem('user', JSON.stringify(data.user));
      }
      navigate('/users')
     }
     catch(err){
       setErreur(err.message)
     }
  }
 
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        {erreur && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {erreur}
            </div>
          </div>
        )}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Continue with
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
          <GoogleLogin
              onSuccess={handleGoogleSucces}
              shape="pill"
              theme="filled_black"
            />
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          
          <div className="rounded-md shadow-sm -space-y-px">
          <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
  
}
export default Register