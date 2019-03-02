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

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---
var height, width
var previous
function getPosition (board) {
  snake = board.snakes[0]
  head = snake.body[0]
  return head
}

function makeMatrix (board) {
  var matrix = []
  for (var i = 0; i<height; i++) {
    for (var j = 0; j<width; j++) {
      matrix[i][j] = 0
    }
  }
  return matrix
}

function decideMove (board) {
  position = getPosition(board)
  var data
  const moves = ['up', 'down', 'left', 'right']
  var safeMoves = [1,1,1,1]
  switch (position.y) {
    case 0:
      console.log("not up!")
      safeMoves[0] = 0
      break;
    case height-1:
      console.log("not down!")
      safeMoves[1] = 0
      break;
  }
  switch (position.x) {
    case 0:
      console.log("not left!")
      safeMoves[2] = 0
      break;
    case width-1:
      console.log("not right!")
      safeMoves[3] = 0
      break; 
  }
  if (previous%2==0)
    safeMoves[previous+1] = 0
  else
    safeMoves[previous-1] = 0  
  console.log(moves)
  for (var i = 3; i >= 0; i--){
    if (safeMoves[i] == 1) {
      data = { move: moves[i] }
      previous = i
    }
  }
  return data
}

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game
  height = request.body.board.height
  width = request.body.board.width
  // Response data
  const data = {
    color: '#DFFF00',
    headType: 'bendr',
    tailType: 'small-rattle'    
  }

  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  const board = request.body.board
  //matrix = makeMatrix(board)
  console.log(board.snakes[0].body)
  console.log(board.snakes[0].body[0])
  // Response data
  const data = decideMove(board)/*{
    move: 'up' // one of: ['up','down','left','right']
  }*/
  console.log(data)
  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
