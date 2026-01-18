import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Conversation from '../models/Conversation.js';
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library';
import Message from '../models/Message.js';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const registerUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        const userExists = await User.findOne({email})
        if(userExists){
            return res.status(400).json({message:'User already existed'})
        };
        const user = new User({name,email,password});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt)
        await user.save()
        res.status(201).json({
            message:'User registred succesfully',
            user:{
                id:user._id,
                name:user.name,
                password:user.password
            }
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({message:'Server error'})
    }
 
}
export const googleAuth = async(req,res) =>{
    try{
        const {token,email,name,picture} = req.body;
        const ticket = await client.verifyIdToken({
            idToken:token,
            audience:process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
        if(payload.email !== email){
            return res.status(400).json({message: 'Email verification failed'})
        }
        let user = await User.findOne({email});
        let isNewUser = false;
        if(!user){
            user = new User({
                name,
                email,
                password:`google_${Math.random().toString(36).slice(-8)}`,
                picture, // Add picture if you want to store it
                isGoogleUser:true
            })
            await user.save();
            isNewUser = true;
        }
        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        res.status(isNewUser ? 201 : 200).json({
            message: isNewUser ? 'User registered successfully' : 'Login successful',
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    }
    catch(err){
       console.error('Google Auth Error:',err);
       res.status(500).json({message:'Google authentication failed'})
    }
} 
export const login = async(req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'Invalid mail or password'})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:'Invalid mail or password'})
        }
        const token = jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'24h'}
        )
        res.status(200).json({
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })
    }
    catch(err){
       console.error('Login error', err);
       res.status(500).json({message:'Server error'})
    }
}
export const verifyToken = async(req,res) =>{
  try{
    const token = req.header('Authorization')?.replace('Bearer ','')
    
    if(!token){
        return res.status(401).json({message:'No token'})
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET)
   
    const user = User.findById(decoded.userId)
    if(!user){
        return res.status(401).json({message:'Invalid token'})
    }
    res.json({ 
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
  }
  catch(err){
    console.error('Token verification error:', err);
    res.status(401).json({message:'Invalid token'})
  }
}
export const list = async(req,res)=>{
    try{
        const token = req.headers.authorization?.split(' ')[1];
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        
        const currentUserId = decoded.userId;
        const users = await User.find({_id:{$ne:currentUserId}})
             .select('-password')
             .sort({createdAt:-1})
        res.status(200).json(users)
        
        
    }
    catch(err){
        
        res.status(500).json({ message: 'Error fetching users' });
    }
}
export const createConversation = async(req,res)=>{
    try{
        const {senderId,receiverId} = req.body;
        console.log(req.body);
        
        const existingConversation = await Conversation.findOne({
            $or:[
                {sender_id:senderId,receiver_id:receiverId},
                {sender_id:receiverId,receiver_id:senderId}
            ]
        });
        if(existingConversation){
            return res.json({conversationId:existingConversation._id})
        }
        const newConversation = await Conversation.create({
            sender_id:senderId,
            receiver_id:receiverId
        });
        res.status(201).json({conversationId:newConversation._id})
    }
    catch(err){
         console.error('Error creating conversation:', err);
        return res.status(500).json({error: err.message || 'Failed to create conversation'});
    }
}
export const getConversations = async(req,res)=>{
      try {
        
        const currentUserId = req.query.userId;
        
        const conversations = await Conversation.find({
        $or:[
            {sender_id:currentUserId},
            {receiver_id:currentUserId}
        ]
      })
      .populate('sender_id receiver_id','name email')
      .populate({
        path:'messages',
        options:{
            sort:{createdAt: -1},
            limit:1
        }
      })
      res.status(200).json(conversations)
      } catch (err) {
          console.error('Error fetching conversations:',err);
          res.status(500).json({message:'Error fetching conversations'})
          
      }
}
export const getConversationById = async (req,res) =>{
   try {
    const {query} = req.query;
    
    const conversation = await Conversation.findById(query)
       .populate('sender_id','name email picture')
       .populate('receiver_id','name email picture');
    if(!conversation){
        return res.status(404).json({message:'Conversation not found'})
    }
    
    res.json(conversation)
} catch (error) {
     console.error('Error fetching conversation');
     res.status(500).json({message:'Error fetching conversation'})  
   }
}
export const createMessage = async (req,res)=>{
    try {
    const {body,sender_id,receiver_id,conversation_id} = req.body;
    const message = await Message.create({
        body,
        sender_id,
        receiver_id,
        conversation_id
    })
    await message.populate('sender_id','name email picture');
    req.app.get('io').to(conversation_id).emit('receive-message', message);
    res.status(201).json(message)
    } catch (error) {
        console.error('Error creating conversation:', err);
        return res.status(500).json({error: err.message || 'Failed to create conversation'});
    }
}
export const getMessages = async(req,res) =>{
    try {
      const {conversationId} = req.params;
      const messages = await Message.find({conversation_id:conversationId})
      .populate('sender_id','name email picture')
      .populate('receiver_id','name email picture') 
      .sort({createdAt:1});
      res.json(messages)
    } 
    catch (error) {
        console.error('Errror fetching messages:',error);
        res.status(500).json({message:'Error fetching messages'})
    }
}
export const markAsRead = async(req,res)=>{
    try {
        const {conversationId} = req.params;
        const {userId} = req.body;
        console.log('Marking messages as read:', { conversationId, userId });
        const messagesToUpdate = await Message.find({
            conversation_id: conversationId,
            receiver_id: userId,
            read_at: null
        });
        console.log('Messages to update:', messagesToUpdate.length);
        const result = await Message.updateMany({
            conversation_id:conversationId,
            receiver_id:userId,
            read_at:null
        },
        {
            $set:{read_at:new Date()}
        }
        );
        console.log('Update result:', result);
        if (result.modifiedCount > 0) {
            res.status(200).json({ 
                success: true, 
                modifiedCount: result.modifiedCount 
            });
        } else {
            res.status(200).json({ 
                success: false, 
                message: 'No messages were updated' 
            });
        }

    } catch (error) {
        console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error updating messages' });
    }
}

