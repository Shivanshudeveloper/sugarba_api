const express = require('express');
const router = express.Router();

// Getting Module
const Users_Model = require('../models/Users');
const Likes_Model = require('../models/Likes');

// TEST
// @GET TEST
// GET 
router.get('/test', (req, res) => {
    res.send("Working");
});

// Database CRUD Operations
// @POST Request to create a new user
// POST 
router.post('/usersregistration', (req, res) => {
    const { fullName, value, email, username } = req.body;
    Users_Model.countDocuments({'email': email})
        .then((count) => {
            if (count > 0) {
                res.status(201).json('Already Exist')
            } else {
                const newUser = new Users_Model({
                    fullName,
                    type: value,
                    email,
                    username,
                    likes: 0
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
// @POST Request to like a profile
// POST 
router.post('/likeuserprofilepicture', (req, res) => {
    const { currentUserId, email } = req.body;
    Likes_Model.countDocuments({ 'userprofile': currentUserId, 'likedby': email })
    .then((count) => {
        if (count === 0) {
            Users_Model.findOne({ '_id': currentUserId })
                .then(data => {
                    var userLikes = data.likes + 1;
                    Users_Model.findOneAndUpdate({'_id': currentUserId}, { likes: userLikes }, { useFindAndModify: false })
                        .then(() => {
                            const newLike = new Likes_Model({
                                userprofile: currentUserId,
                                likedby: email
                            });
                            newLike.save()
                                .then(() => {
                                    res.status(200).json('Liked')
                                })
                                .catch(err => res.status(500).json(`Server Error is ${err}`))
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => res.status(400).json(`Error: ${err}`))
        } else {
            Likes_Model.findOneAndDelete({ 'userprofile': currentUserId, 'likedby': email })
            .then(data => {
                Users_Model.findOne({ '_id': currentUserId })
                .then(data => {
                    var userLikes = data.likes - 1;
                    Users_Model.findOneAndUpdate({'_id': currentUserId}, { likes: userLikes }, { useFindAndModify: false })
                        .then(() => {
                            res.status(201).json('Un Liked')
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => res.status(400).json(`Error: ${err}`))
            })
            .catch(err => res.status(400).json(`Error: ${err}`))
        }
    })
    .catch(err => res.status(500).json('Server Error'))
});

// Database CRUD Operations
// @POST Request to update a new user
// POST 
router.post('/userprofilecomplete', (req, res) => {
    const { profileDownloadUrl, email, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, yearlyIncome, contactArr, langArr, leisureArr, sportArr } = req.body;
    Users_Model.findOneAndUpdate({'email': email}, { profileDownloadUrl, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, yearlyIncome, contactArr, langArr, leisureArr, sportArr }, { useFindAndModify: false })
        .then(() => {
            res.status(200).json('Updated')
        })
        .catch(err => console.log(err))
});


// Database CRUD Operations
// @POST Request to GET the Contacts
// GET 
router.get('/getallpeople/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Users_Model.findOne({ email }).sort({date: -1})
        .then(data => {
            if (data.type == "Sugar Baby") {
                Users_Model.find({'type': "Sugar Daddy"}).sort({date: -1})
                .then(data => {
                    res.status(200).json(data)
                })
                .catch(err => res.status(400).json(`Error: ${err}`))
            } else {
                Users_Model.find({'type': "Sugar Baby"}).sort({date: -1})
                .then(data => {
                    res.status(200).json(data)
                })
                .catch(err => res.status(400).json(`Error: ${err}`))
            }
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});


// Database CRUD Operations
// @POST Request to GET the People
// GET 
router.get('/userprofiledata/:id', (req, res) => {
    const { id } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Users_Model.findOne({ '_id': id }).sort({date: -1})
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});

module.exports = router;