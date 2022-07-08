let express = require('express')
let { buildSchema } = require('graphql')
let { graphqlHTTP } = require('express-graphql')
let { Sequelize, DataTypes } = require('sequelize')
let { readFileSync } = require('fs')

let sequelize = new Sequelize('sqlite:db.sqlite', { logging: false })

let Todo = sequelize.define('Todo', {
    title: DataTypes.STRING,
    completed: DataTypes.BOOLEAN
})

const PORT = process.env.PORT || 4000

sequelize.sync()

let schema = buildSchema(readFileSync(__dirname + '/schema.gql').toString('utf-8'))

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
app.listen(PORT, () => console.log('http://localhost:' + PORT))
