import mongoose, {Schema} from 'mongoose';

const SettingsSchema: Schema<any> = new Schema({
    googleId: String,
    refreshToken: String
});

const Settings = mongoose.model("Settings", SettingsSchema);

module.exports = Settings;