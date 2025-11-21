import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {MoreVertical} from 'lucide-react'

const ChatList = ({onSelectChat,selectedChat}) =>{
    
    const [conversations, setConversations] = useState([])
    const [loading,setLoading] = useState(true)
    const [filter,setFilter] = useState('All')
    const getLastMessage = (conversation) =>{
      
      if(!conversation.messages || conversation.messages.length === 0){
        return {text:'Start a conversation',isRead: true,createdAt:null}
      }
      const lastMsg = conversation.messages[conversation.messages.length - 1]
      
      return {
        text: lastMsg.body,
        isRead: lastMsg.read_at !== null,
        createdAt : lastMsg.createdAt
      }
    }
    const formatMessageDate = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    useEffect(()=>{
    const fetchConversations = async ()=>{
        try {
            const currentUserId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:3000/api/users/conversations?userId=${currentUserId}`);
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:',error);  
        }
        finally{
            setLoading(false)
        }
    }
    fetchConversations()
    },[]);
    
    const getOtherUser = (conversation) =>{
        const currentUserId = localStorage.getItem('userId');
        return conversation.sender_id._id === currentUserId 
        ? conversation.receiver_id 
        : conversation.sender_id    
    }
    const navigate = useNavigate();

    const handleChatSelect = (conversation) => {
      onSelectChat(conversation);
      navigate(`/chat?query=${conversation._id}`, { replace: true });
    };
return(
    <div className="h-full bg-white">
        <div className="p-4 border-b flex justify-between items-center">
           <h2 className="text-xl font-bold">Chats</h2>
           <button className="p-2 hover:bg-gray-100 rounded-full">
             <MoreVertical size={20} />
           </button>
           <div className="flex gap-2 p-4">
              <button
                onClick={()=> setFilter('All')}
                className={`px-4 py-2 rounded-full text-sm ${
                    filter === 'All' 
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}            
              >
              All
              </button>
              <button
                onClick={()=> setFilter('Deleted')}
                className={`px-4 py-2 rounded-full text-sm ${
                    filter === 'Deleted' 
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}            
              >
              Deleted
              </button>
           </div>
        </div>
        <div className="overflow-y-auto">
           {conversations.map((conversation,index) =>{
              const otherUser = getOtherUser(conversation)
              const isSelected = selectedChat?._id === conversation._id;
              const lastMessage = getLastMessage(conversation)
              
              
              return(
                <div
                  key={conversation._id}
                  onClick={()=> handleChatSelect(conversation)}
                  className={`p-4 mb-1 flex items-start gap-3 hover:bg-gray-100 cursor-pointer relative ${
                    isSelected ? 'bg-gray-200' : 'bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={`https://picsum.photos/id/${index}/100/100`} alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-normal text-gray-700">{otherUser.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                        
                       {formatMessageDate(lastMessage.createdAt)}
                        </span>
                        <button
                          className="p-1 hover:bg-gray-200 rounded-full"
                          onClick={(e)=>{
                            e.stopPropagation();
                          }}
                        >
                           <MoreVertical size={16} className="text-gray-500" />

                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      {lastMessage.isRead && <span className="text-blue-500">✓✓</span>}
                      {!lastMessage.isRead && <span className="text-blue-500">✓</span>}
                      {lastMessage.text}
                    </p>
                  </div>
                </div>
              )
           })}
        </div>
    </div>
)
}
export default ChatList