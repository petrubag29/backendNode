const { makeExecutableSchema } = require('graphql-tools');
const { GraphQLDateTime } = require('graphql-iso-date');
const typeDefs = require('./schema.graphql');
const mutations = require('./resolvers/mutations');
const queries = require('./resolvers/queries');
const {
  customer,
  admin,
  agent,
  superAdmin,
} = require('../constants/userTypes');

const resolvers = {
  Query: {
    ...queries,
  },
  Mutation: { ...mutations },
  User: {
    __resolveType(obj) {
      if (obj.role === customer) {
        return 'Customer';
      }

      if (obj.role === agent) {
        return 'Agent';
      }

      if (obj.role === admin) {
        return 'Admin';
      }

      if (obj.role === superAdmin) {
        return 'Admin';
      }

      return null;
    },
  },
  DateTime: GraphQLDateTime,
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
