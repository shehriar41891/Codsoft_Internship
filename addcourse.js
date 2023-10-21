const express = require('express');
const { storage } = require('./cloudinary');
const Router = express.Router();
const multer = require('multer');
require('dotenv').config();
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const courseModal = require('./modal/coursesModal');
const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4'];

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('File mimetype:', file.mimetype);

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only videos and images are allowed.'));
        }
    },
});


const mongoose = require('mongoose');

Router.get('/addcourse', (req, res) => {
    res.render('addcourse');
});

Router.post('/addcourse', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'folder'}
]), async (req, res) => {
    try {
        const image = req.files['image'][0];
        
        const folderFiles = req.files['folder'] ? req.files['folder'] : [];
        console.log('The uploaded files from the folder are ', folderFiles);
        console.log('The image in the folder is ',folderFiles[0].path);
        console.log('The video in the folder is ',folderFiles.originalname);

        const { instructor, name, Description, price } = req.body;

        const c1 = new courseModal({
            name: name,
            Description: Description,
            image: image.path,
            price: price,
            instructor: instructor,
            folder : folderFiles,
        });

        await c1.save();

        console.log('The data is saved to the DB');
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);

        // Log Cloudinary upload response for more details
        if (error && error.http_code && error.http_code !== 200) {
            console.error('Cloudinary Upload Response:', error);
        }
    }

    res.redirect('/');
});

module.exports = Router;