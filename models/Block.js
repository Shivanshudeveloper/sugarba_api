const mongoose = require('mongoose');

const usersBlockSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    blockedUserId: {
        type: String,
        required: true
    },
    blockedUserEmail: {
        type: String,
        required: true
    },
    blockedUserName: {
        type: String,
        required: true
    },
    blockedUserProfile: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const blocks = mongoose.model('blocks', usersBlockSchema)
module.exports = blocks