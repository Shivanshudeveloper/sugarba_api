const express = require('express');
const router = express.Router();

// Getting Module
const Users_Model = require('../models/Users');


// Database CRUD Operations
// @POST Request to create a new user
// POST 
router.post('/usersregistration', (req, res) => {
    const { fullName, value, email } = req.body;

    Users_Model.countDocuments({'email': email})
        .then((count) => {
            if (count > 0) {
                res.status(201).json('Already Exist')
            } else {
                const newUser = new Users_Model({
                    fullName,
                    type: value,
                    email
                });
                newUser.save()
                    .then((data) => {
                        res.status(200)
                    })
                    .catch(err => console.log(err))
            }
        })
});


// Database CRUD Operations
// @POST Request to update a new user
// POST 
router.post('/userprofilecomplete', (req, res) => {
    const { profileDownloadUrl, email, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, username, yearlyIncome, contactArr, langArr, leisureArr, sportArr } = req.body;
    Users_Model.findOneAndUpdate({'email': email}, { profileDownloadUrl, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, username, yearlyIncome, contactArr, langArr, leisureArr, sportArr }, { useFindAndModify: false })
        .then(() => {
            res.status(200).json('Updated')
        })
        .catch(err => console.log(err))
});

module.exports = router;