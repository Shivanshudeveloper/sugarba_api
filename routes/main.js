const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51HzRB6FXQdX7lmvWuuR5Vps43XA0nIsZOPv8JF1NrebMQPu8zRpdzl0wRMMH7Rz6nlh3rHhn1k9jKrzQWaL1tJZD00CK2PwLWk')
const { v4: uuidv4 } = require('uuid');
// Getting Module
const Users_Model = require('../models/Users');
const Likes_Model = require('../models/Likes');
const Block_Model = require('../models/Block');
const Questions_Model = require('../models/Questions');
const Favorites_Model = require('../models/Favorite');
const Kiss_Model = require('../models/Kiss');
const Report_Model = require('../models/Report');
const Payment_Model = require('../models/Payment');
const Chats_Model = require('../models/Chat');
const UnlockRequest_Model = require('../models/UnlockRequest');

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
    const { value, email, username } = req.body;
    Users_Model.countDocuments({'email': email})
        .then((count) => {
            if (count > 0) {
                res.status(201).json('Already Exist')
            } else {
                const newUser = new Users_Model({
                    type: value,
                    email,
                    username,
                    likes: 0,
                    credits: 0,
                    vip: false
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
    const { fullName, profileDownloadUrl, email, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, yearlyIncome, contactArr, langArr, leisureArr, sportArr, country, region } = req.body;
    Users_Model.findOneAndUpdate({'email': email}, { fullName, profileDownloadUrl, about, assets, bodyType, dob, eyes, hair, height, kids, place, smoker, yearlyIncome, contactArr, langArr, leisureArr, sportArr, country, region }, { useFindAndModify: false })
        .then(() => {
            res.status(200).json('Updated')
        })
        .catch(err => console.log(err))
});


// Database CRUD Operations
// @POST Request to update a user profile url update
// POST 
router.post('/userprofilecompleteprofile', (req, res) => {
    const { profileDownloadUrl, email } = req.body;
    Users_Model.findOneAndUpdate({'email': email}, { profileDownloadUrl, email }, { useFindAndModify: false })
        .then(() => {
            res.status(200).json('Updated')
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to update a user profile 
// POST 
router.post('/updateuserprofile', (req, res) => {
    const { fullName, email, username, kids, bodyType, eyes, hair } = req.body;
    Users_Model.findOneAndUpdate({'email': email}, { fullName, username, kids, bodyType, eyes, hair }, { useFindAndModify: false })
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

// Database CRUD Operations
// @POST Request to the Payment
// POST 
router.post('/charges', async (req, res) => {
    const {email, amount} = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        receipt_email: email,
    });

    res.json({'client_secret': paymentIntent['client_secret']})
});

// Database CRUD Operations
// @POST Request to send questions
// POST 
router.post('/paymentsuccessfull', (req, res) => {
    const { email, username, amount, package } = req.body;
    var pack = '';
    var credits = 0;
    var vip = false;
    if ( package === "vb" ) {
        pack = '12 Months VIP 35 USD';
        vip = true;
    } else if ( package === "vc" ) {
        pack = '6 Months VIP 45 USD';
        vip = true;
    } else if ( package === "vd" ) {
        pack = '3 Months VIP 55 USD';
        vip = true;
    } else if ( package === "ve" ) {
        pack = '1 Months VIP 66 USD';
        vip = true;
    } else if ( package === "cb" ) {
        pack = '1000 Credits 160 USD';
        credits = 1000;
    } else if ( package === "cc" ) {
        pack = '500 Credits 100 USD';
        credits = 500;
    } else if ( package === "cd" ) {
        pack = '150 Credits 40 USD';
        credits = 150;
    } else if ( package === "ce" ) {
        pack = '50 Credits 18 USD';
        credits = 50;
    }

    Users_Model.findOne({ email })
        .then(data => {
            credits = credits + data.credits;
            Users_Model.findOneAndUpdate({ email }, { credits }, { useFindAndModify: false })
                .then(() => {
                    const newPayment = new Payment_Model({
                        email,
                        username,
                        amount,
                        package: pack
                    });
                    newPayment.save()
                        .then((data) => {
                            if (vip === true) {
                                Users_Model.findOneAndUpdate({ email }, { vip }, { useFindAndModify: false })
                                    .then(() => {
                                        res.status(200).json("Done");
                                    })
                                    .catch(err => console.log(err))
                            } else {
                                res.status(200).json("Done");
                            }
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});



// Database CRUD Operations
// @POST Request to GET the People
// POST 
router.post('/checkforchat', (req, res) => {
    const { email, currentUserId } = req.body;
    res.setHeader('Content-Type', 'application/json');

    Chats_Model.countDocuments({'email': email, 'chatwithuserId': currentUserId})
        .then((count) => {
            if (count === 0) {
                res.status(201).json('Not Exist')
            } else {
                Chats_Model.findOne({ 'email': email, 'chatwithuserId': currentUserId })
                    .then(data => {
                        if (data.chat === true) {
                            res.status(202).json('True');
                        } else {
                            res.status(203).json('False');
                        }
                    })
                    .catch(err => res.status(400).json(`Error: ${err}`))
            }
        })
});


// Database CRUD Operations
// @POST Request to Unlock User
// POST 
router.post('/unlockuser', (req, res) => {
    const { email, currentUserId, costcredits } = req.body;
    res.setHeader('Content-Type', 'application/json');
    Users_Model.findOne({ 'email': email })
        .then(data => {
            if ( data.credits >= costcredits ) {
                credits = data.credits - costcredits;
            Chats_Model.countDocuments({'email': email, 'chatwithuserId': currentUserId})
                .then((count) => {
                    if (count === 0) {
                        Users_Model.findOneAndUpdate({ email }, { credits }, { useFindAndModify: false })
                            .then(() => {
                                const newChats = new Chats_Model({
                                    email,
                                    chatwithuserId: currentUserId,
                                    chat: true,
                                });
                                newChats.save()
                                    .then((data) => {
                                        res.status(200).json("Done");
                                    })
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err))
                    } else {
                        Users_Model.findOneAndUpdate({ email }, { credits }, { useFindAndModify: false })
                            .then(() => {
                                Chats_Model.findOneAndUpdate({ 'email': email, 'chatwithuserId': currentUserId }, { 'chat': true }, { useFindAndModify: false })
                                    .then(() => {
                                        res.status(200).json("Done");
                                    })
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err))
                    }
                })
            } else {
                res.status(201).json("No Credits");
            }
        })
        .catch(err => res.status(400).json(`Error: ${err}`))
});


// Database CRUD Operations
// @POST Request to Send Unlock Request
// POST 
router.post('/unlockrequestuser', (req, res) => {
    const { email, unlockforuserid, unlockforuseremail, senderprofileurl, senderfullname } = req.body;
    res.setHeader('Content-Type', 'application/json');
    const newUnlockRequest = new UnlockRequest_Model({
        email,
        unlockforuserid,
        unlockforuseremail,
        status: 0,
        senderprofileurl,
        senderfullname
    });
    newUnlockRequest.save()
        .then((data) => {
            res.status(200).json("Done");
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to GET Unlock from Me
// GET 
router.get('/unlockrequestforme/:email', (req, res) => {
    const { email } = req.params;
    res.setHeader('Content-Type', 'application/json');
    UnlockRequest_Model.find({ unlockforuseremail: email } ).sort({date: -1})
        .then(data => {
            res.status(200).json(data)
        })
        .catch(err => console.log(err))
});

// Database CRUD Operations
// @POST Request to POST Block User
// POST 
router.post('/rejectuser', (req, res) => {
    const { id } = req.body;
    res.setHeader('Content-Type', 'application/json');
    UnlockRequest_Model.findOneAndUpdate({'_id': id}, { status: 2 }, { useFindAndModify: false })
        .then(() => {
            res.status(200).json('Un Locked')
        })
        .catch(err => console.log(err))
});


// Database CRUD Operations
// @POST Request to POST Accept the User
// POST 
router.post('/acceptuser', (req, res) => {
    const { documentId, email, chatwithuserId, chatforuseremail } = req.body;
    res.setHeader('Content-Type', 'application/json');
    var costcredits = 20
    var chatwithuseremail = '';
    var chatwithuserid2 = '';
    Users_Model.findOne({ '_id': chatwithuserId })
        .then(data => {
            chatwithuseremail = data.email;
            if (data.vip) {
                costcredits = 5
            }
            UnlockRequest_Model.findOneAndUpdate({'_id': documentId}, { status: 1 }, { useFindAndModify: false })
                .then(() => {
                    Users_Model.findOne({ 'email': email })
                        .then(data => {
                            chatwithuserid2 = data._id;
                            if ( data.credits >= costcredits ) {
                                credits = data.credits - costcredits;
                                Chats_Model.countDocuments({'email': email, 'chatwithuserId': chatwithuserId})
                                    .then((count) => {
                                        if (count === 0) {
                                            Users_Model.findOneAndUpdate({ email }, { credits }, { useFindAndModify: false })
                                                .then(() => {
                                                    const newChats = new Chats_Model({
                                                        email: chatforuseremail,
                                                        chatwithuserId: chatwithuserId,
                                                        chat: true,
                                                    });
                                                    newChats.save()
                                                        .then((data) => {
                                                            Users_Model.findOne({ 'email': chatforuseremail })
                                                                .then((data) => {
                                                                    var uid = data._id;
                                                                    const newChats2 = new Chats_Model({
                                                                        email,
                                                                        chatwithuserId: uid,
                                                                        chat: true
                                                                    });
                                                                    newChats2.save()
                                                                        .then((data) => {
                                                                            res.status(200).json("Done");
                                                                        })
                                                                        .catch(err => console.log(err))

                                                                }).catch(err => console.log(err))
                                                        })
                                                        .catch(err => console.log(err))
                                                })
                                                .catch(err => console.log(err))
                                        } else {
                                            console.log("Not");
                                            Users_Model.findOneAndUpdate({ email }, { credits }, { useFindAndModify: false })
                                                .then(() => {
                                                    Chats_Model.findOneAndUpdate({ 'email': email, 'chatwithuserId': chatwithuserId }, { 'chat': true }, { useFindAndModify: false })
                                                        .then(() => {
                                                            res.status(200).json("Done");
                                                        })
                                                        .catch(err => console.log(err))
                                                })
                                                .catch(err => console.log(err))
                                        }
                                    })
                            } else {
                                console.log("No Credits");
                                res.status(201).json("No Credits");
                            }
                        })
                        .catch(err => res.status(400).json(`Error: ${err}`))

                })
                .catch(err => console.log(err))

        }).catch(err => console.log(err))


    
});

// Database CRUD Operations
// @POST Request to Search
// GET 
router.post('/search', (req, res) => {
    const { email, country, fullName, hair, bodyType, smoker, height } = req.body;
    res.setHeader('Content-Type', 'application/json');
    var tempBlockUserArr = [];
    Block_Model.find({ email })
        .then(data => {
            data.map(d => {
                tempBlockUserArr.push(d.blockedUserEmail);
            })
            Users_Model.findOne({ email }).sort({date: -1})
                .then(data => {

                    if ( height !== '' ) {
                        if ( smoker !== '' ) {
                            if ( bodyType !== '' ) {
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, 'smoker': smoker,'bodyType': bodyType, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, 'smoker': smoker,'bodyType': bodyType, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log(bodyType);
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if ( bodyType !== '' ) {
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'height': height, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'height': height, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'height': height, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'height': height, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log(bodyType);
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, 'height': height, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, 'height': height, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, 'height': height, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, 'height': height, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'height': height, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'height': height, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if ( smoker !== '' ) {
                            if ( bodyType !== '' ) {
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker,'bodyType': bodyType, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker,'bodyType': bodyType, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log(bodyType);
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'smoker': smoker, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'smoker': smoker, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if ( bodyType !== '' ) {
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy",'bodyType': bodyType, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby",'bodyType': bodyType, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log(bodyType);
                                if (hair !== '') {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", 'hair': hair, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                } else {
                                    if (fullName !== '') {
                                        if ( country === "Word Wide" ) {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", fullName: {$regex: ".*" + fullName + ".*"}, email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", fullName: {$regex: ".*" + fullName + ".*"}, $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    } else {
                                        if ( country === "Word Wide" ) {
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
                                        } else {
                                            if (data.type == "Sugar Baby") {
                                                Users_Model.find({'type': "Sugar Daddy", $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } } ).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            } else {
                                                Users_Model.find({'type': "Sugar Baby", $or: [ {country: 'India'}, {country: 'London'}, {country: 'Bahrain'}, {country: 'Bangladesh'}, {country: 'France'}, {country: 'Singapore'}, {country: 'Spain'}, {country: 'England'}, {country: 'London'}, {country: 'Swaziland'}, {country: 'Fineland'}, {country: 'China'}, {country: 'Japan'} ], email: { $nin: tempBlockUserArr } }).sort({date: -1})
                                                .then(data => {
                                                    res.status(200).json(data)
                                                })
                                                .catch(err => console.log(err))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
                .catch(err => res.status(400).json(`Error: ${err}`))
        })
        .catch(err => console.log(err))
});

module.exports = router;