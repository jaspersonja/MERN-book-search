import { gql } from '@apollo/client';

export const QUERY_ME = gql`
    query me {
        me {
            _id
            username
            email
            savedBooks {
                bookId
                authors
                title
                description
                image
            }
        }
    }
`;

export const QUERY_USER = gql`
    query findUser($userId: ID!) {
        user(userId: $userId) {
            _id
            username
            email
            savedBooks {
                bookId
                title
                authors
                description
                image
            }
        }
    }
`;

