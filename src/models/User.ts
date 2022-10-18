import mongoose, { Schema } from 'mongoose';
import { TUser } from '../types/types';

const UserSchema: Schema<TUser> = new Schema({
	username: { type: String, required: true, unique: true, min: 6, max: 30 },
	email: { type: String, required: true, unique: true, max: 255 },
	password: { type: String, required: true, min: 6, max: 30 },
	role: { type: String, default: 'user' },
});

export default mongoose.model('User', UserSchema);
