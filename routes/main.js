const express = require('express');
const router = express.Router();

// Getting Module
const Users_Model = require('../models/Users');
const Likes_Model = require('../models/Likes');
const Block_Model = require('../models/Block');
const Questions_Model = require('../models/Questions');
const Favorites_Model = require('../models/Favorite');
const Kiss_Model = require('../models/Kiss');
const Report_Model = require('../models/Report');

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
                    likes: 0,
                    credits: 0
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
    const { profileDownloadUrl, email, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, yearlyIncome, contactArr, langArr, leisureArr, sportArr, country, region } = req.body;
    Users_Model.findOneAndUpdate({'email': email}, { profileDownloadUrl, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, yearlyIncome, contactArr, langArr, leisureArr, sportArr, country, region }, { useFindAndModify: false })
        .then(() => {
            res.status(200).json('Updated')
        })
        .catch(err => console.log(err))
});


// Database CRUD Operations
// @POST Request to GET the
// GET 
router.get('/getallpeople/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    var tempBlockUserArr = [];

    Block_Model.find({ email })
        .then(data => {
            data.map(d => {
                tempBlockUserArr.push(d.blockedUserEmail);
            })
            Users_Model.findOne({ email }).sort({date: -1})
                .then(data => {
                    if (data.type == "Sugar Baby") {
                        Users_Model.find({'type': "Sugar Daddy", email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                        .then(data => {
                            res.status(200).json(data)
                        })
                        .catch(err => console.log(err))
                    } else {
                        Users_Model.find({'type': "Sugar Baby", email: { $nin: tempBlockUserArr } }).sort({date: -1})
                        .then(data => {
                            res.status(200).json(data)
                        })
                        .catch(err => console.log(err))
                    }
                })
                .catch(err => res.status(400).json(`Error: ${err}`))
        })
        .catch(err => console.log(err))
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

// Database CRUD Operations
// @POST Request to GET the People
// GET 
router.get('/userprofiledata2/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Users_Model.findOne({ email }).sort({date: -1})
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});


// Database CRUD Operations
// @POST Request to GET the People
// GET 
router.get('/getusercredits/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Users_Model.findOne({ email })
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});

// Database CRUD Operations
// @POST Request to block a user
// POST 
router.post('/blockuser', (req, res) => {
    const { email, currentUserId, currentUserEmail, blockedUserName, blockedUserProfile } = req.body;
    Block_Model.countDocuments({'email': email, 'blockedUserEmail': currentUserEmail})
        .then((count) => {
            if (count > 0) {
                res.status(201).json('Already Exist')
            } else {
                const newUser = new Block_Model({
                    email,
                    blockedUserId: currentUserId,
                    blockedUserEmail: currentUserEmail,
                    blockedUserName,
                    blockedUserProfile
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
// @POST Request to GET the Users Blocked
// GET 
router.get('/getallpeopleblocked/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Block_Model.find({ email } ).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to unblock a user
// POST 
router.post('/unblockuser', (req, res) => {
    const { email, unblockUser } = req.body;
    Block_Model.findOneAndDelete({ 'email': email, 'blockedUserEmail': unblockUser })
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});

// Database CRUD Operations
// @POST Request to send questions
// POST 
router.post('/sendquestions', (req, res) => {
    const { email, sendToEmail, question, profilePic, username, profileId, senderprofilePic, senderusername, senderuserid } = req.body;
    const newQuestion = new Questions_Model({
        email,
        sendToEmail,
        question,
        profilePic,
        username,
        profileId,
        senderprofilePic,
        senderusername,
        senderuserid
    });
    newQuestion.save()
        .then((data) => {
            res.status(200)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to GET Question for Me
// GET 
router.get('/questionforme/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Questions_Model.find({ sendToEmail: email } ).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to GET Question from Me
// GET 
router.get('/questionfromme/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Questions_Model.find({ email } ).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to send questions
// POST 
router.post('/responsequestion', (req, res) => {
    const { questionId, response } = req.body;
    Questions_Model.findOneAndUpdate({'_id': questionId}, { reply: response }, { useFindAndModify: false })
        .then(() => {
            res.status(200)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to add user to favorite
// POST 
router.post('/addtofavoritelist', (req, res) => {
    const { email, currentUserId, currentUserEmail, blockedUserName, blockedUserProfile } = req.body;
    Favorites_Model.countDocuments({'email': email, 'favoriteUserEmail': currentUserEmail})
        .then((count) => {
            if (count > 0) {
                res.status(201).json('Already Exist')
            } else {
                const newUserFavorite = new Favorites_Model({
                    email,
                    favoriteUserId: currentUserId,
                    favoriteUserEmail: currentUserEmail,
                    favoriteUserName: blockedUserName,
                    favoriteUserProfile: blockedUserProfile
                });
                newUserFavorite.save()
                    .then((data) => {
                        res.status(200)
                    })
                    .catch(err => console.log(err))
            }
        })
});

// Database CRUD Operations
// @POST Request to GET the Favories Users
// GET 
router.get('/allfavorites/:email', (req, res) => {
    const { email } = req.params;
    Favorites_Model.find({ email }).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to send questions
// POST 
router.post('/sendkissuser', (req, res) => {
    const { email, sendToEmail, kiss, profilePic, username, profileId, senderprofilePic, senderusername, senderuserid } = req.body;
    Kiss_Model.countDocuments({'email': email, 'sendToEmail': sendToEmail})
        .then((count) => {
            if (count > 0) {
                res.status(201).json('Already Exist')
            } else {
                const newKiss = new Kiss_Model({
                    email,
                    sendToEmail,
                    kiss,
                    profilePic,
                    username,
                    profileId,
                    senderprofilePic,
                    senderusername,
                    senderuserid
                });
                newKiss.save()
                    .then((data) => {
                        res.status(200)
                    })
                    .catch(err => console.log(err))
            }
        })
});

// Database CRUD Operations
// @POST Request to GET Question for Me
// GET 
router.get('/kissesforme/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Kiss_Model.find({ sendToEmail: email } ).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to GET Question from Me
// GET 
router.get('/kissesfromme/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    Kiss_Model.find({ email } ).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to send questions
// POST 
router.post('/responsequestionkiss', (req, res) => {
    const { questionId } = req.body;
    Kiss_Model.findOneAndUpdate({'_id': questionId}, { reply: '1' }, { useFindAndModify: false })
        .then(() => {
            res.status(200)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to send questions
// POST 
router.post('/reportuser', (req, res) => {
    const { email, sendToEmail, profilePic, username, profileId, senderprofilePic, senderusername, senderuserid, report, comments } = req.body;
    const newReport = new Report_Model({
        email,
        sendToEmail,
        profilePic,
        username,
        profileId,
        senderprofilePic,
        senderusername,
        senderuserid,
        report,
        comments
    });
    newReport.save()
        .then((data) => {
            res.status(200)
        })
        .catch(err => console.log(err))
});

module.exports = router;