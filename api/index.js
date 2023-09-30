const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");

mongoose.connect(
    "mongodb+srv://username:password@your-production-database-url/",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB", err);
});

app.listen(port, () => {
    console.log("Server running on port 8000");
})

const User = require("./models/user");
const Message = require("./models/message");

// endpoint for registration user

app.post("/register", (req, res) => {
    const { name, email, password, image } = req.body

    // create a new User object
    const newUser = new User({ name, email, password, image })

    // save user to database
    newUser
        .save()
        .then(() => {
            res.status(200).json({ message: "User registered succesfully" })
        })
        .catch((err) => {
            console.log("Errorr registering user", err);
            res.status(500).json({ message: "Error registering the user!" })
        })
})

// function to create a token for the user
const createToken = (userId) => {
    // set the token payload
    const payload = {
        userId: userId
    }

    // generate the token with a secret key and expiration time
    const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" })

    return token
}

// endpoint for loggin in user
app.post("/login", (req, res) => {
    const {email, password} = req.body;

    // check if email and password are provided
    if (!email || !password) {
        return res
            .status(404)
            .json({ message: "Email and password are required" })
    }

    // check for that user in the database
    User.findOne({ email }).then((user) => {
        if (!user) {
            // user not found
            return res.status(404).json({ message: "User not found" })
        }

        // compare the password with password in the database
        if (user.password !== password) {
            return res.status(404).json({ message: "Invalid password" })
        }

        const token = createToken(user._id)
        res.status(200).json({ token })
    }).catch((error) => {
        console.log("Error finding the user", error);
        res.status(500).json({ message: "Internal server error" })
    })
})

// endpoint to access all the users except the user who's currently logged in
app.get("/users/:userId", (req, res) => {
    const loggedInUserId = req.params.userId

    User.find({ _id: { $ne: loggedInUserId } }).then((users) => {
        res.status(200).json(users)
    }).catch((err) => {
        console.log("Error retrieving users", err);
        res.status(500).json({ message: "Error retrieving users" })
    })
})

// endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
    const { currentUserId, selectedUserId } = req.body

    try {
        // update the recipient's friendRequestArray
        await User.findByIdAndUpdate(selectedUserId, {
            $push: { friendRequests: currentUserId },
        })

        // update the sender's sentFriendRequest array
        await User.findByIdAndUpdate(currentUserId, {
            $push : { sentFriendRequest: selectedUserId },
        })
        
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
    }
})

// endpoint to show all the friend-request of a particular user
app.get("/friend-request/:userId", async (req, res) => {
    try {
        const {userId} = req.params

        // fetch the user document based on the user id
        const user = await User.findById(userId).populate("friendRequests", "name email image").lean()

        const friendRequests = user.friendRequests

        res.json(friendRequests)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

// endpoint to accept a friend-request of a particular person
app.post("/friend-request/accept", async (req, res) => {

    try {
        const {senderId, recipientId} = req.body

        // retrieve the document of sender and the recipient
        const sender = await User.findById(senderId)
        const recipient = await User.findById(recipientId)

        sender.friends.push(recipientId)
        recipient.friends.push(senderId)

        recipient.friendRequests = recipient.friendRequests.filter(
            (request) => request.toString() !== senderId.toString()
        )

        sender.sentFriendRequest = sender.sentFriendRequest.filter(
            (request) => request.toString() !== recipientId.toString()
        )

        await sender.save()
        await recipient.save()

        res.status(200).json({ message: 'Friend request accepted' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' })
    }
})

// endpoint to access all the friends to the logged in user
app.get("/accepted-friends/:userId", async (req, res) => {
    try {
        const {userId} = req.params
        const user = await User.findById(userId).populate(
            "friends",
            "name email image",
        )

        const acceptedFriends = user.friends
        res.json(acceptedFriends)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
})

const multer = require('multer')

// configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files/')  // specify the desired destination folder
    },
    fileName: function (req, file, cb) {
        // generate a unique filename for the uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

// endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
    try {
        const {senderId, recipientId, messageType, messageText} = req.body

        const newMessage = new Message({
            senderId,
            recipientId,
            messageType,
            message: messageText,
            timestamp: new Date(),
            imageUrl: messageType === "image" ? req.file.path : null,
        })
        
        await newMessage.save()
        res.status(200).json({ message: "Message sent successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" })
    }
})

// endpoint to get the userDetails to design the chat room header
app.get("/user/:userId", async (req, res) => {
    try {
        const {userId} = req.params

        // fetch the user data from the user ID
        const recipientId = await User.findById(userId)

        res.json(recipientId)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" })
    }
})


// endpoint to fetch the message between two users in the chatRoom
app.get("/messages/:senderId/:recipientId", async (req, res) => {
    try {
        const {senderId, recipientId} = req.params

        const messages = await Message.find({
            $or: [
                {senderId: senderId, recipientId: recipientId},
                {senderId: recipientId, recipientId: senderId},
            ]
        }).populate("senderId", "_id name")

        res.json(messages)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" })
    }
})

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
    try {
        const {messages} = req.body

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ messages: 'Invalid req body' })
        }

        await Message.deleteMany({ _id: { $in: messages } })

        res.json({ message: 'Message deleted successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server' })
    }
})

app.get("/friend-requests/sent/:userId", async (req, res) => {
    try {
        const {userId} = req.params
        const user = await User.findById(userId).populate("sentFriendRequests", "name email image").lean()

        const sentFriendRequests = user.sentFriendRequests

        res.json(sentFriendRequests)
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ error: 'Internal server' })
    }
})

app.get("/friends/:userId", (req, res) => {
    try {
        const {userId} = req.params

        User.findById(userId).populate("friends").then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }

            const friendIds = user.friends.map((friend) => friend._id)

            res.status(200).json(friendIds)
        })
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: 'Internal server error' })
    }
})