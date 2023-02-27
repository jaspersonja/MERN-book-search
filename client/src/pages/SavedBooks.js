import React, { useState, useEffect, useMemo } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

import { useQuery } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';

import { useMutation } from '@apollo/client';
import { REMOVE_BOOK } from '../utils/mutations';


import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const [userData, setUserData] = useState({});

  const { data } = useQuery(QUERY_ME, {
    update(cache, { data: { removeBook } }) {
      try {
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: removeBook },
        })
      } catch (err) {
        console.error(err);
      }
    }
  });

  const user = useMemo(() => data?.me || {}, [data?.me]);

  //remove book mutation
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const userDataLength = Object.keys(userData).length;

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
          return false;
        }

        if (!user) {
          throw new Error('something went wrong!');
        }

        setUserData(user);
      } catch (err) {
        console.error(err);
      }
    };

    getUserData();

  }, [user]);

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {

      const { data } = await removeBook({
        variables: { bookId: bookId },
      });

      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      {error && (
        <div className="my-3 p-3 bg-danger text-white">{error.message}</div>
      )}
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;