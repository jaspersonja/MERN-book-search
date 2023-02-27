const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {

        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('savedBooks');
                return userData;
            }
            throw new AuthenticationError('Not logged in!');
        }
    },

    Mutation: {

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Credentials!');
            }

            const correctPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user}
        },

        saveBook: async (parent, { userId, bookId, authors, title, description, image }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $addToSet: { savedBooks: {
                            bookId: bookId,
                            authors: authors,
                            title: title,
                            description: description,
                            image: image
                        } }
                    },
                    { new: true }
                ).populate('savedBooks')
            }

            throw new AuthenticationError('Not logged in!');
        },
        
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: {
                        bookId: bookId
                    } } },
                    { new: true }
                );
            }
            throw new AuthenticationError('Not logged in!');
        }

    }
};

module.exports = resolvers;