const mongoose = require('mongoose');

const usersPaymentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    package: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})
const payments = mongoose.model('payments', usersPaymentSchema)
module.exports = payments