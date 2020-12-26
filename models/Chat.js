const mongoose = require('mongoose');

const usersChatSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    chatwithuserId: {
        type: String,
        required: true
    },
    chat: {
        type: Boolean,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const chats = mongoose.model('chat', usersChatSchema)
module.exports = chats