const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    // instructor: {
    //     type: String,
    //     required: true,
    // },
    folder: [{
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        path: String,
        size: Number,
        filename: String,
    }],
    VideosWatched : {
        type : Number,
        default : 0
    }
});

const CourseModal = mongoose.model('CourseModal', CourseSchema);

module.exports = CourseModal;
