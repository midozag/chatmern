import React,{useState,useEffect} from "react";
import {Link,useNavigate} from 'react-router-dom'


const UserList = () =>{
    const navigate = useNavigate();
    const [users,setUsers] = useState([]);
    const [loading,setLoading] = useState(true);
    const [erreur,setErreur] = useState(null);
    const handleMessage = async (userId) =>{
        try{
                const token = localStorage.getItem('token')
                
                const response = await fetch('http://localhost:3000/api/users/createconversation',{
                   method:'POST',
                   headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                   },
                   body:JSON.stringify({
                    senderId: localStorage.getItem('userId'),
                    receiverId: userId
                   })
                });
                const data = await response.json();
                navigate(`/chat?query=${data.conversationId}`)        
                if(!response.ok){
                  throw new Error(data.message)
                }               
            }
            catch(err){
              console.error('Error:',err);             
            }
        }
        useEffect(()=>{
            const fetchUsers = async () =>{
                try{
                    const token = localStorage.getItem('token')
                    const response = await fetch('http://localhost:3000/api/users/list',{
                        headers:{
                            'Authorization':`Bearer ${token}`
                        }
                    })
                    if(!response.ok){
                        throw new Error('Failed to fetch users')
                    }
                    const data = await response.json()
                    setUsers(data)                 
                }
                catch(err){
                    setErreur(err.message)
                }
                finally{
                    setLoading(false)
                }
            };
            fetchUsers()
        },[])
        if(loading) return <div>Loading...</div>
        if(erreur) return <div>Erreur:{erreur}</div>
     return(
    <div className="max-w-6xl mx-auto my-16">
       <h5 className="text-center text-5xl font-bold py-3">Users</h5>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2">
          {users.map((user,index)=>(
            <div key={user._id} className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow">
              <div className="flex flex-col items-center pb-10">
              <img 
                src={`https://picsum.photos/id/${index}/100/100`} 
                className="w-24 h-24 mb-2 rounded-full shadow-lg" 
                alt={user.name}
              />
                <h5 className="mb-1 text-xl font-medium text-gray-900">
                  {user.name}
                </h5>
                <span className="text-sm text-gray-500">{user.email}</span>
                <div className="flex gap-2 mt-4 space-x-3 md:mt-6">
                <button 
                  onClick={() => handleAddFriend(user._id)}
                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200"
                >
                  Add Friend
                </button>
                <button 
                  onClick={() => handleMessage(user._id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200"
                >
                  Message
                </button>
              </div>
              </div>
            </div>
          ))}
       </div>
    </div>
   )
}
export default UserList