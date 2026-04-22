import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

// User schema stores credentials + profile basics used by auth and ownership checks.
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 80,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
			select: false,
		},
	},
	{ timestamps: true },
)

// Hash password before save only when it has changed.

userSchema.pre('save', async function hashPassword() {
	if (!this.isModified('password')) return
	this.password = await bcrypt.hash(this.password, 10)
})

// Instance helper used by login flow.
userSchema.methods.comparePassword = async function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password)
}

const User = mongoose.model('User', userSchema)

export default User