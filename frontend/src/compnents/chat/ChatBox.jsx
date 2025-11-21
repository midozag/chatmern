import React,{useEffect, useRef, useState} from "react";
import {io} from 'socket.io-client'

const ChatBox = ({selectedChat}) =>{
    const [message,setMessage] = useState('');
    const [messages,setMessages] = useState([]);
    const [loading,setLoading] = useState(false)
    const currentUserId = localStorage.getItem('userId'); 
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef()
    const socketRef = useRef()
    
    
    useEffect(()=>{
      messagesEndRef.current?.scrollIntoView({behavior:"smooth"})  
    },[messages])
    
    useEffect(()=>{
      socketRef.current = io('http://localhost:3000')
      return () =>{
        socketRef.current.disconnect();
      }
    },[])
    useEffect(()=>{
      if(!selectedChat?._id || !socketRef.current) return;
      socketRef.current.emit('join-conversation',selectedChat._id)
      socketRef.current.on('receive-message',(newMessage)=>{
        setMessages((prevMessages) => [...prevMessages,newMessage])
      })
      const fetchMessagesAndMarkRead = async () =>{
        
        try {
          setLoading(true)  
          
          const response = await fetch(`http://localhost:3000/api/users/messages/${selectedChat._id}`)
          const data = await response.json(); 
          setMessages(data)
          const markAsRead =  await fetch(`http://localhost:3000/api/users/conversation/${selectedChat._id}/read`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({userId:currentUserId})
        })
          const markReadData = await markAsRead.json()
        } 
        catch (error) {
            console.error('Errror fetching messages:',error);    
        }
        finally{
            setLoading(false)
        }
      };
      
      fetchMessagesAndMarkRead();
      return () => {
        socketRef.current.off('receive-message');
      };
    },[selectedChat?._id])
    
      
    const handleSend =async () =>{
        if(!message.trim() || !selectedChat) return;
        const tempId = Date.now().toString();
        const messageData = {
          _id: tempId, // Temporary ID
          body: message,
          sender_id: { _id: currentUserId },
          receiver_id: selectedChat.receiver_id._id,
          conversation_id: selectedChat._id,
          createdAt: new Date(),
          isTemp: true // Flag to identify as temporary
        };
        setMessages(prevMessages =>[...prevMessages,messageData])
        setMessage('')
        try {
            const response = await fetch('http://localhost:3000/api/users/createMessage',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    body:message,
                    sender_id:currentUserId,
                    receiver_id:selectedChat.receiver_id._id,
                    conversation_id:selectedChat._id
                })
            });
            if(!response.ok){
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to sand message')
            }
            const savedMessage = await response.json()
            setMessages(prevMessages => prevMessages.map(msg =>
              msg._id === tempId ? savedMessage : msg
            ))
            socketRef.current.emit('send-message', savedMessage);
            

        } catch (error) {
            console.error('Error sending message:',error);
            setMessages(prevMessages => 
              prevMessages.filter(msg => msg._id !== tempId)
            )
        }
        
        
    }
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true // for 12-hour format (AM/PM)
        });
      };
    const renderMessages = (message,index) =>{
        const isSentByMe = message.sender_id._id === currentUserId
        return(
            <div
              key={`${message._id}-${index}`}
              className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {!isSentByMe && (
                <div className="flex flex-start gap-2">
                  <img 
                   src={`https://picsum.photos/id/1/100/100`}
                   alt=""
                   className="w-8 h-8 rounded-full"
                   />
                   <div className="bg-gray-100 p-1 rounded-lg rounded-tl-none max-w-xs">
                     <p className="text-blue-500">{message.body}</p>
                     <span className="text-xs text-gray-500 mt-0">
                        {formatTime(message.createdAt)}
                     </span>
                     <span className="text-xs text-blue-500 ml-1">
                {message.read_at ? '✓✓' : '✓'}
              </span>
                   </div>
                </div>
              )}
              {isSentByMe && (
                <div className="flex flex-end gap-2">
                  <div className="bg-blue-500 p-1 rounded-lg rounded-tr-none max-w-xs">
                      <p className="text-white">{message.body}</p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-blue-100">
                            {formatTime(message.createdAt)}
                        </span>
                        
                      </div>
                  </div>
                
                </div>
              )}
            </div>
        )
    }
    const getOtherUser = () =>{
        if(!selectedChat) return null;
        return selectedChat.sender_id._id === currentUserId 
        ? selectedChat.receiver_id 
        : selectedChat.sender_id    
    }
    const otherUser = getOtherUser()
    
return(
    <div className="flex flex-col h-screen bg-white">
        <div className="p-4 border-b flex items-center">
            <img src={`https://picsum.photos/id/1/100/100`} alt="" className="w-10 h-10 rounded-full mr-3"/>
            <h3 className="font-medium text-lg">{otherUser?.name}</h3>
        </div>
        <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto ">
           {loading ? (
              <div className="flex justify-center items-center h-full">
                Loading messages..
              </div>):(
                <div className="p-4 space-y-4">
                    {messages.map((message,index) => renderMessages(message,index))}
                    <div ref={messagesEndRef} />
                </div>
              )}
        </div>
        <div className="border-t p-4">
           <div className="flex gap-2">
               <input 
               type="text"
               value={message}
               onChange={(e) => setMessage(e.target.value) }
               placeholder="Write your message here"
               className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
           </div>
        </div>
        
    </div>
)
}

export default ChatBox