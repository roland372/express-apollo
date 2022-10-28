import mongoose, {Schema} from 'mongoose';

const UserSchema: Schema<any> = new Schema({
    username: String,
    googleId: String,
    refreshToken: String
});

const GoogleUser = mongoose.model("GoogleUser", UserSchema);

// export default mongoose.model('GoogleUser', UserSchema);
module.exports = GoogleUser;