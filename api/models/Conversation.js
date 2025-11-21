import mongoose from "mongoose";
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true
  });
  conversationSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'conversation_id'
  });
  conversationSchema.set('toJSON', { virtuals: true });
  const Conversation = mongoose.model('Conversation', conversationSchema);

 export default Conversation;
  