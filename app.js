let express = require("express")
let { buildSchema } = require("graphql")
let { graphqlHTTP } = require("express-graphql")
let { Sequelize, DataTypes } = require("sequelize")

let sequelize = new Sequelize("sqlite::memory:", { logging: false })

let Todo = sequelize.define('Todo', {
  title: DataTypes.STRING,
  completed: DataTypes.BOOLEAN
})

sequelize.sync()

let schema = buildSchema(`
  type Todo {
    id: ID
    title: String
    completed: String
    createdAt: String
    updatedAt: String
  }
  type Query {
    findAll: [Todo]
    findById(id: ID): Todo
  }
  type Mutation {
    create(title: String): Todo
    update(id: ID, title: String): Todo
    markComplete(id: ID): Todo
    delete(id: ID): Todo
  }
`)

let resolvers = {
  findAll: async () => {
    return await Todo.findAll()
  },
  findById: async ({ id }) => {
    return await Todo.findByPk(id)
  },
  create: async ({ title }) => {
    return await Todo.create({ title, completed: false })
  },
  update: async ({ id, title }) => {
    let todo = await Todo.findByPk(id)
    await todo.update({ title })
    return todo
  },
  delete: async ({ id }) => {
    let todo = await Todo.findByPk(id)
    await Todo.destroy({ where: { id } })
    return todo
  },
  markComplete: async ({ id }) => {
    let todo = await Todo.findByPk(id)
    await todo.update({ completed: true })
    return todo
  }
}

let app = express()
app.use('/', graphqlHTTP({ schema, rootValue: resolvers, graphiql: true }))
app.listen(4000, () => { console.log('http://localhost:4000') })
