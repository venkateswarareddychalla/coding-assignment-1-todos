const express = require('express')
const path = require('path')
var format = require('date-fns/format')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/todos/', async (request, response) => {
  const {status, priority, search_q, category} = request.query
  const scenario1 = status !== undefined
  const scenario2 = priority !== undefined
  const scenario3 = priority !== undefined && status !== undefined
  const scenario4 = search_q !== undefined
  const scenario5 = category !== undefined && status !== undefined
  const scenario6 = category !== undefined
  const scenario7 = category !== undefined && priority !== undefined

  function todosResult(getTodos) {
    if (getTodos.length === 0) {
      response.status(400)
      response.send('Invalid Todo Status')
    } else {
      response.send(getTodos)
    }
  }

  switch (true) {
    case scenario1:
      const getTodosQueryStatus = `SELECT * FROM todo WHERE status = '${status}'`
      const getTodosStatus = await db.all(getTodosQueryStatus)
      todosResult(getTodosStatus)
      break

    case scenario2:
      const getTodosQueryPriority = `SELECT * FROM todo WHERE priority = '${priority}'`
      const getTodosPriority = await db.all(getTodosQueryPriority)
      todosResult(getTodosPriority)
      break

    case scenario3:
      const getTodosQueryPriorityStatus = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}'`
      const getTodosPriorityStatus = await db.all(getTodosQueryPriorityStatus)
      todosResult(getTodosPriorityStatus)
      break

    case scenario4:
      const getTodosQuerySearch_q = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`
      const getTodosSearch_q = await db.all(getTodosQuerySearch_q)
      todosResult(getTodosSearch_q)
      break

    case scenario5:
      const getTodosQueryCategoryStatus = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}'`
      const getTodosCategoryStatus = await db.all(getTodosQueryCategoryStatus)
      todosResult(getTodosCategoryStatus)
      break

    case scenario6:
      const getTodosQueryCategory = `SELECT * FROM todo WHERE category = '${category}'`
      const getTodosCategory = await db.all(getTodosQueryCategory)
      todosResult(getTodosCategory)
      break

    case scenario7:
      const getTodosQueryCategoryPriority = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}'`
      const getTodosCategoryPriority = await db.all(
        getTodosQueryCategoryPriority,
      )
      todosResult(getTodosCategoryPriority)
      break
  }
})

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`
  const getTodo = await db.get(getTodoQuery)
  response.send(getTodo)
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const getTodosQuery = `SELECT * FROM todo WHERE due_date = '${date}'`
  const getTodos = await db.all(getTodosQuery)
  response.send(getTodos)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  const addTodoQUery = `INSERT INTO todo(id, todo, priority, status, category, due_date)
  VALUES(${id}, '${todo}', '${priority}', '${status}', '${category}', '${dueDate}')`
  await db.run(addTodoQUery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const {status, priority, todo, category, dueDate} = request.body
  const scenario1 = status !== undefined
  const scenario2 = priority !== undefined
  const scenario3 = todo !== undefined
  const scenario4 = category !== undefined
  const scenario5 = dueDate !== undefined

  switch (true) {
    case scenario1:
      const upadteStatusQuery = `UPDATE todo
          SET status = '${status}' WHERE id = ${todoId}`
      await db.run(upadteStatusQuery)
      response.send('Status Updated')
      break

    case scenario2:
      const updatePriorityQuery = `UPDATE todo
          SET priority = '${priority}' WHERE id = ${todoId}`
      await db.run(updatePriorityQuery)
      response.send('Priority Updated')
      break

    case scenario3:
      const upadteTodoQuery = `UPDATE todo
          SET todo = '${todo}' WHERE id = ${todoId}`
      await db.run(upadteTodoQuery)
      response.send('Todo Updated')
      break

    case scenario4:
      const upadteCategoryQuery = `UPDATE todo
          SET category = '${category}' WHERE id = ${todoId}`
      await db.run(upadteCategoryQuery)
      response.send('Category Updated')
      break

    case scenario5:
      const upadteDueDateQuery = `UPDATE todo
          SET due_date = '${dueDate}' WHERE id = ${todoId}`
      await db.run(upadteDueDateQuery)
      response.send('Due Date Updated')
      break
  }
})

app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId}`
  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})
