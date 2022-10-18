import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
export const usersResolvers = {
    Query: {
        async getUser(parent, args) {
            return User.findById(args.id);
        },
    },
    Mutation: {
        async registerUser(parent, args) {
            try {
                const { userName, email, password } = args;
                if (!email ||
                    !email
                        .toLowerCase()
                        .match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i) ||
                    !password ||
                    password.length < 6) {
                    return new GraphQLError('Invalid email or password');
                }
                const codedPassword = await bcrypt.hash(password, 10);
                const newUser = new User({ userName, email, password: codedPassword });
                await newUser.save();
                return newUser;
            }
            catch (err) {
                throw new GraphQLError(`Error: ${err}`);
            }
        },
        async loginUser(parent, args, context) {
            try {
                const { email, password } = args;
                const user = await User.findOne({ email });
                console.log('found user', user);
                if (user && (await bcrypt.compare(password, user.password))) {
                    context.session.userName = user.userName;
                    console.log(context);
                    return user;
                }
                return new GraphQLError('Incorrect email or password!');
            }
            catch (err) {
                throw new GraphQLError(`Error: ${err}`);
            }
        },
        async editUser(parent, args) {
            try {
                const { id, userName } = args;
                await User.updateOne({ _id: id }, { $set: { userName } });
                return User.findById(id);
            }
            catch (err) {
                throw new GraphQLError(`Error: ${err}`);
            }
        },
        async logout(parent, args, context) {
            context.session.destroy();
            console.log(context);
        },
    },
};
