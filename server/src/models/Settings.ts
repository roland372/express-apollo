import mongoose, {Schema} from 'mongoose';

// const SettingsSchema: Schema<TSettings> = new Schema ({
//     refreshToken: { type: String, required: true }
// });

const SettingsSchema: Schema<any> = new Schema({
    googleId: String,
    refreshToken: String,
    // refreshToken: {type: String, required: true, unique: true},
});

const Settings = mongoose.model("Settings", SettingsSchema);

module.exports = Settings;