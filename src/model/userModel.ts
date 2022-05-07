import mongoose from 'mongoose'

const UserModel = new mongoose.Schema({
    username: {type: String, index: true},
    email: {type: String, unique: true, index: true},
    password: String,
    phone: {type: String, default:""},
    transaction_pin: { type: String, default: "" },
    account_no: {type:String, default: ""},
    token_hash: String,
    isVerified: {type: Boolean, default: false}
}, {timestamps: true})


const User = mongoose.model('user', UserModel);

export default User

