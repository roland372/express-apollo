import { model, Schema } from 'mongoose';

const userSchema = new Schema({
	username: { type: String, default: null, min: 6, max: 30 },
	email: { type: String, unique: true, required: true, max: 255 },
	password: { type: String, min: 6, max: 30 },
	token: { type: String },
});

module.exports = model('User', userSchema);
