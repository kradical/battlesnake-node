const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

const {
  getMove,

  // For testing
  fillFood,
  fillSnakes,
  getBoard,
  getRatings,
} = require('./getMove')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

app.post('/start', (request, response) => {
  const data = {
    color: '#FFFFFF',
    taunt: 'snek',
    head_type: 'regular',
    tail_type: 'regular',
    head_url: 'brokenLink',
  }

  return response.json(data)
})

app.post('/move', (request, response) =>
  response.json({
    move: getMove(request.body),
    taunt: 'null',
  })
)

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})

// TESTING
// const requestData = {
//   height: 5,
//   width: 8,
//   food: {
//     data: [
//       { x: 1, y: 2 },
//       { x: 0, y: 0 },
//       { x: 4, y: 4 },
//     ],
//   },
//   snakes: {
//     data: [
//       {
//         body: {
//           data: [
//             { x: 0, y: 1 },
//             { x: 0, y: 2 },
//             { x: 0, y: 3 },
//           ],
//         },
//         health: 100,
//         id: 'a',
//         length: 3,
//       },
//       {
//         body: {
//           data: [
//             { x: 3, y: 1 },
//             { x: 3, y: 2 },
//             { x: 3, y: 3 },
//           ],
//         },
//         health: 100,
//         id: 'b',
//         length: 3,
//       },
//       {
//         body: {
//           data: [
//             { x: 4, y: 1 },
//             { x: 4, y: 2 },
//             { x: 4, y: 3 },
//           ],
//         },
//         health: 100,
//         id: 'c',
//         length: 3,
//       },
//       {
//         body: {
//           data: [
//             { x: 1, y: 0 },
//             { x: 1, y: 1 },
//             { x: 2, y: 1 },
//           ],
//         },
//         health: 0,
//         id: 'd',
//         length: 3,
//       }
//     ],
//   },
//   you: {
//     body: {
//       data: [
//         { x: 3, y: 1 },
//         { x: 3, y: 2 },
//         { x: 3, y: 3 },
//       ],
//     },
//     health: 100,
//     id: 'b',
//     length: 3,
//   }
// };

// const move = getMove(requestData);

// console.log(move);
