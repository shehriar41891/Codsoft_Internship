const mongoose = require('mongoose');
const ProfileSchema = new mongoose.Schema({
    email:{
        type : String,
    },
    fullname : {
        type : String
    },
    cellNumber:{
      type : String
    },
    refrence: [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'CourseModal'
    }],
    Username : {
        type : String,
    },
})

const ProfileModal = mongoose.model('ProfileModal',ProfileSchema);
module.exports = ProfileModal;