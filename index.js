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
var matrix
const moves = ['up', 'down', 'left', 'right']

function getPosition (board) {
  snake = board.snakes[0]
  head = snake.body[0]
  return head
}

function makeMatrix (height, width) {
   return Array(height).fill(0).map(x => Array(width).fill(0))
}

function mapFood (board, matrix) {
  //console.log("food: "+board.food)
  food = board.food
  console.log("food length: "+food.length)
  for (var i = 0; i<food.length; i++) {
    var foodx = food[i].x
    var foody = food[i].y
    //console.log("food item: "+foodx+", "+foody)
    matrix[foody][foodx] = 1
    //console.log("change: "+foody+","+foodx)
  }

}

function mapSnakes (board, matrix) {
  var snakes = board.snakes
  //console.log("num snakes: "+snakes.length)
  for (var i=0; i<snakes.length; i++) {
    //console.log(snakes[i])
    var snake = snakes[i].body
    for(var j=0; j< snake.length; j++) {
      segment = snake[j]
      //console.log("segment: "+snake[j])
      snakex = snake[j].x
      snakey = snake[j].y
      matrix[snakey][snakex] = 2
    }
  }
}

function decideMove (board) {
  position = getPosition(board)
  var data
  var safeMoves = [1,1,1,1]
  switch (position.y) {
    case 0:
      console.log("wall up!")
      safeMoves[0] = 0
      break;
    case height-1:
      console.log("wall down!")
      safeMoves[1] = 0
      break;
  }
  switch (position.x) {
    case 0:
      console.log("wall left!")
      safeMoves[2] = 0
      break;
    case width-1:
      console.log("wall right!")
      safeMoves[3] = 0
      break; 
  }
  if (previous%2==0)
    safeMoves[previous+1] = 0
  else
    safeMoves[previous-1] = 0  
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
  board = request.body.board
  height = board.height
  width = board.width
  matrix = makeMatrix(height, width)
  //console.log(matrix)
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
  //console.log(board.snakes[0].body)
  console.log("head: ")
  console.log(board.snakes[0].body[0]/*.x +", "+board.snakes[0].body[0].y*/)
  matrix = makeMatrix(height, width)
  //console.log("number of snakes: " + board.snakes.length)
  mapFood(board, matrix)
  mapSnakes(board, matrix)
  console.log(matrix)
  // Response data
  const data = decideMove(board)
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
