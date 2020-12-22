const mongoose = require('mongoose');

const usersReportSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    sendToEmail: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profileId: {
        type: String,
        required: false
    },
    senderprofilePic: {
        type: String,
        required: true
    },
    senderusername: {
        type: String,
        required: true
    },
    senderuserid: {
        type: String,
        required: true
    },
    report: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const reports = mongoose.model('report', usersReportSchema)
module.exports = reports