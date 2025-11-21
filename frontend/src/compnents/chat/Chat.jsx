import React, { useState } from "react";
import { useEffect } from "react";
import ChatBox from "./ChatBox";
import ChatList from "./ChatList";
import { useSearchParams } from "react-router-dom";

const Chat = () =>{
    const [searchParams] = useSearchParams();
    const [selectedChat, setSelectedChat] = useState(null);
    useEffect(()=>{
        const conversationId = searchParams.get('query');
        if(conversationId){
            const fetchConversation = async () =>{
            try {
              const response = await fetch(`http://localhost:3000/api/users/conversation?query=${conversationId}`);
              const data = await response.json()
              setSelectedChat(data)
              
            } catch (err) {
               console.error('Error fetching:',err);
            }
        };
        fetchConversation();
    }
    }, [searchParams]) 
    
    return (
        <div className="flex h-[calc(100vh-64px)]  bg-gray-100">
            <div className="w-1/3 border-r bg-white">
              <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat}/>
            </div>
            <div className="w-2/3">
               <ChatBox selectedChat={selectedChat} />
            </div>
        </div>
    )
}

export default Chat