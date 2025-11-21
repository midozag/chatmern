import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    body: {
      type: String,
      required: true
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    conversation_id: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    read_at: {
      type: Date,
      default: null
    },
    receiver_deleted_at: {
      type: Date,
      default: null
    },
    sender_deleted_at: {
      type: Date,
      default: null
    }
  }, {
    timestamps: true
  });
// Method equivalent to isRead()
messageSchema.methods.isRead = function() {
    return this.read_at !== null;
  };

  messageSchema.virtual('conversation', {
    ref: 'Conversation',
    localField: 'conversation_id',
    foreignField: '_id',
    justOne: true
  });

const Message = mongoose.model('Message', messageSchema);


export default Message;