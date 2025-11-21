import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isGoogleUser:{
      type: Boolean,
      default: false
    },
    picture:{
      type: String,
      default: null
    }
  }, { 
    timestamps: true 
  });
  userSchema.virtual('conversations', {
    ref: 'Conversation',
    localField: '_id',
    foreignField: 'sender_id',
    match: function() {
      return {
        $or: [
          { sender_id: this._id },
          { receiver_id: this._id }
        ]
      };
    }
  });
  const User = mongoose.model('User',userSchema)

 export default User
