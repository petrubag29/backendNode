const router = require('express').Router();
const { graphqlExpress } = require('apollo-server-express');
const bodyParser = require('body-parser');
const schema = require('../graphql');
const authenticate = require('../customMiddleware/auth');
// const usersRouter = require('./users');
// const sessionRouter = require('./session');

const myGraphQLSchema = schema;

const graphQLOptionsFunc = (req, res) => ({
  schema: myGraphQLSchema,
  context: {
    currentUser: req.user,
    req,
    res,
  },
  tracing: true,
  cacheControl: true,
});

router.post(
  '/graphql',
  authenticate,
  bodyParser.json(),
  graphqlExpress(graphQLOptionsFunc)
);

/*
// graphiql
if (process.env.NODE_ENV !== 'production') {
  router.get('/graphiql', graphiqlExpress({ endpointURL: '/api/graphql' }));
}
*/

router.use('/', (req, res) => {
  res.status(200).send('<h1 style="text-align: center">Nothing Here...</h1>');
});

module.exports = router;
