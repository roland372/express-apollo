import User from '../../models/User';
import bcrypt from 'bcryptjs';
import {GraphQLError} from 'graphql';
import {ApolloError} from 'apollo-server-errors';

import {IUser, IUserInput} from '../../types/user';

export const usersResolvers = {
    Query: {
        async getUser<T>(parent: T, {id}: IUser) {
            return User.findById(id);
        },
    },
    Mutation: {
        async registerUser<T>(
            parent: T,
            {registerInput: {username, email, password}}: IUserInput
        ) {
            const oldUser = await User.findOne({email});

            if (oldUser) {
                throw new ApolloError(
                    'User with that email already exists: ' + email,
                    'USER_ALREADY_EXISTS'
                );
            }

            try {
                const codedPassword = await bcrypt.hash(password, 10);
                const newUser = new User({username, email, password: codedPassword});

                await newUser.save();

                return newUser;
            } catch (err) {
                throw new ApolloError(`Error: ${err}`);
            }
        },

        async loginUser<T>(
            parent: T,
            {loginInput: {email, password}}: IUserInput,
            context: any, req
        ) {
            try {
                const user = await User.findOne({email});
                // console.log('found user', user);
                if (user && (await bcrypt.compare(password, user.password))) {
                    context.session.username = user.username;
                    context.session.user = user;
                    console.log("<----- CONTEXT ----->", context.session);
                    return user;
                }
                return new ApolloError(
                    'Incorrect email or password',
                    'INCORRECT_CREDENTIALS'
                );
            } catch (err) {
                throw new GraphQLError(`Error: ${err}`);
            }
        },

        async logoutUser(parent: any, args: any, context: any) {
            console.log("before destroy", context.session);
            context.session.destroy();
            console.log("after destroy", context);
        },
    },
};
