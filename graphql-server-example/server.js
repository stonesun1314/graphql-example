// server.js


const Koa = require('koa');
const Body = require('koa-bodyparser');
const router = require('koa-router')();
const {graphiqlKoa} = require('apollo-server-koa');
const {makeExecutableSchema} = require('graphql-tools');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const graphqlKoa = require('apollo-server-koa').graphqlKoa

const app = new Koa();
const PORT = 8090;

// 模拟数据
const users = [
  {
    id: 1,
    name: 'J.K. Rowling',
    date: new Date(2018, 5, 20)
  },
  {
    id: 2,
    name: 'Michael Crichton',
    date: new Date(2018, 5, 21)
  },
];

const typeDefs = `
    scalar Date
    type User{
        id:Int!
        name:String!
        date: Date!
    }
    type Query {
        users(id:Int!): [User]
        user(id:Int!, name: String!):User
    }
    type Mutation {
        addUser(name:String!):User
    }
    schema {
        query: Query
        mutation: Mutation  
    }
`;

const resolvers = {
    Query: {    // 对应到typeDefs中的 type Query
        users(root, args, context) {
            return users;
        },
        user(root, args, context, info) {
          return {id: args.id, name: args.name};
      }
    },
    Mutation: { // 对应到typeDefs中的 Mutation
        addUser(root, args, context) {
            return {id: 2, name: args.name};
        }
    },
    Date: new GraphQLScalarType({ // 自定义标量类型
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
          return new Date(value); // 从客户端来的数据
        },
        serialize(value) {
          return value.getTime(); // 发送给客户端的数据
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10); 
          }
          return null;
        },
    }),
};


const myGraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers
});

app.use(Body());

router.post('/graphql', graphqlKoa({
    schema: myGraphQLSchema,
}));
router.get('/graphql', graphqlKoa({
    schema: myGraphQLSchema,
}));

router.get( // 在浏览器里使用GraphiQL（可以理解成GraphQL领域的postman）
  '/graphiql',
  graphiqlKoa({
    endpointURL: '/graphql',
  }),
);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, ()=>console.log('app run in localhost:' + PORT));
