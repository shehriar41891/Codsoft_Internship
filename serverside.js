const express = require('express');
const path = require('path');
const { urlencoded } = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const User = require('./modal/user')
const courseModal = require('./modal/coursesModal')
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
app.use(express.static('public'));
const ProfileModal = require('./modal/profile')
const htmlPdf = require('html-pdf')
const fs = require('fs');


//configuring the mongoose here
mongoose.connect('mongodb://127.0.0.1:27017/LearningPlatform')
    .then(() => {
        console.log('Sucessfully connected to the DB')
    })
    .catch((err) => {
        console.log('There is an error in connecting to the DB', err)
    })

app.use(session({
    saveUninitialized: true,
    secret: 'This si the secret to login',
    resave: false
}))

//passport configuration goes here
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use((req,res,next)=>{
    res.locals.isAuth = false;
    if(req.isAuthenticated()){
      res.locals.isAuth = true;
    }
    next();
})


app.get('/', async (req, res) => {
    const data = await courseModal
        .find({})
        .limit(3)
    res.render('fontPage', {
        allData: data,
        key: process.env.STRIPE_PUBLISHABLE_KEY,
        Product: arr[arr.length - 1],
        isAuth : res.locals.isAuth,
    })
})

//A very importent global variable is up here
const arr = new Array();

//config for auth route
const authroute = require('./signup&in');
app.use('/', authroute);

const addcourse = require('./addcourse');
const { profile } = require('console');
const CourseModal = require('./modal/coursesModal');
app.use('/', addcourse)

//stripe payment goes here
app.get('/payment', (req, res) => {
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: "Shehriar",
    })
        .then((customer) => {
            return stripe.charges.create({
                amount: 12,
                description: 'The course is amazing bro',
                currency: 'USD',
                customer: customer.id
            })
        })
        .then((charges) => {
            console.log('The charges is sucessfull bro ', charges);
            res.redirect('/')
        })
})


app.get('/get-enrollment/:id', async (req, res) => {
    const { id } = req.params;
    const data = await courseModal.findById(id);
    arr.push(data);
    console.log('The data is ', data)
    res.json(data)
})

app.get('/enroll-for-the-course', (req, res) => {
    res.render('courseEnroll', {
        data: arr[arr.length - 1]
    })
    console.log('The data is ', arr)
})

app.post('/enroll/:id', async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phone, videoId } = req.body;

    try {
        const course = await courseModal.findById(id);
        const profile = await ProfileModal.findOne({ Username: req.user.username });

        if (!profile.refrence.includes(course._id)) {
            profile.refrence.push(course._id);
            profile.fullname = fullName;
            profile.cellNumber = phone;
            profile.email = email;
            profile.Username = req.user.username;
        }

        await profile.save();

        console.log('The course is enrolled for user:', profile.username);
        res.redirect('/profile');
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', async (req, res) => {
    try {
        const data = await ProfileModal
            .find({ Username: req.user.username })
            .populate('refrence');
        console.log('The data er get is ', data)

        res.render('profile', {
            user: data[0],
        });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/video-of-the-course/:id', async (req, res) => {
    const arr2 = new Array();
    const { id } = req.params;
    console.log('The id is nothing but ', id)
    const data = await courseModal
        .findById(id)
    res.render('video', {
        course: data,
    });
});
app.post('/watched-videos/:id', async (req, res) => {
    const { id } = req.params;
    const { watchedVideosCount } = req.body;

    try {
        const data = await courseModal.findByIdAndUpdate(id, {
            $inc: { VideosWatched: watchedVideosCount }
        });
        console.log('The data is ', data);
        res.status(200).send('Videos marked as watched successfully.');
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/generate-certificate/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseModal.findById(id);
        const userInfo = await ProfileModal.find({ Username: req.user.username });

        console.log('The user and courses are ', course, userInfo)

        // HTML template for the certificate
        const certificateHTML = `
        <html>
            <head>
                <title>Certificate</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        text-align: center;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }
    
                    h1 {
                        color: #333;
                    }
    
                    h2 {
                        color: #007BFF;
                    }
    
                    p {
                        color: #555;
                    }
    
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
    
                    .footer {
                        margin-top: 20px;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Certificate of Completion</h1>
                    <p>This is to certify that ${userInfo.Username} has successfully completed the course:</p>
                    <h2>${course.name}</h2>
                    <p>${course.Description}</p>
                </div>
                <div class="footer">
                    <p>Issued on ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
        </html>
    `;

        const options = { format: 'Letter' };

        htmlPdf.create(certificateHTML, options).toFile((err, filePath) => {
            if (err) {
                return res.status(500).send('Error generating certificate');
            }

            const fileName = `Certificate_${userInfo[0].full_name}_${course.name}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

            const fileStream = fs.createReadStream(filePath.filename);
            fileStream.pipe(res);

            fileStream.on('end', () => {
                fs.unlinkSync(filePath.filename);
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating certificate');
    }
});

//sign out logic
app.get('/signout',(req,res)=>{
    req.session.destroy((err)=>{
      if(err){
        console.log('The session cannot be destroyed',err.message)
      }
      else{
        console.log('Sucessfully destriyed the session')
      }
    })
    res.redirect('/')
})


app.listen(3000, () => {
    console.log('The server is listening at the specified port')
})