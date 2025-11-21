import React, { useEffect, useState } from "react";
import UserList from "./UsersList";

const usersPage = () =>{
    const [users,setUsers] = useState([]);
    const [loading,setLoading] = useState(true);
    const [erreur,setErreur] = useState(null);
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
    return <UserList users={users} />
    
}

export default usersPage