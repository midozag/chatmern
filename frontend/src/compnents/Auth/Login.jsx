import React, {useState,useEffect} from 'react'
import {Link,useNavigate} from 'react-router-dom'


const Login = ()=>{
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [erreur,setErreur] = useState('')
  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(token){
      fetch('http://localhost:3000/api/users/verify',{
        headers:{
          'Authorization':`Bearer ${token}`
        }
      })
      .then(response => {
        if(response.ok){
          navigate('/users')
        } else{
          localStorage.removeItem('token')
        }
      })
      .catch(()=>{
        localStorage.removeItem('token')
      })
    }
  },[navigate])
    const handleChange = (e) =>{
      setFormData({...formData,
        [e.target.name] : e.target.value
    })
    }
    const handleSubmit = async (e) =>{
      e.preventDefault();
      try{
        const response = await fetch('http://localhost:3000/api/users/login',{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify(formData)
        })
        const data = await response.json()
        if(!response.ok){
          throw new Error(data.message || 'Login Failed')
        }
        localStorage.setItem('token',data.token);
        console.log("Stored token: from login",data.token);
        localStorage.setItem('userId',data.user.id);
        console.log("authenticated user: from login",data.user.name);
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
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
export default Login
