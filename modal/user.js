const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const UserSchema  = new mongoose.Schema({
    email  : {
        Type : String,
    }
})

UserSchema.plugin(passportLocalMongoose);

const UserModal = mongoose.model('UserModal',UserSchema);

module.exports = UserModal;