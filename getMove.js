/*
  Object Shapes:

  game: {
    food: { data: [FoodPiece] },
    height: number,
    snakes: { data: [Snake] },
    width: number,
    you: Snake,
  }

  Snake: {
    body: { data: [Point] },
    health: number,
    id: string,
    length: 3,
  }

  FoodPiece: { data: Point }

  Point: {
    x: number,
    y: number,
  }

  My conventions:
   ee: empty square
   ff: food piece
   h${id}: snake head
   b${id}: snake body
   t${id}: snake tail
 */



const fillFood = (board, food) => {
  for (const piece of food) {
    board[piece.y][piece.x] = 'ff';
  }
};

const aliveSnakesById = {};

const fillSnakes = (board, snakes, meId) => {
  let i = 0;
  for (const snake of snakes) {
    let j = 0;

    if (snake.health === 0) {
      continue;
    }

    aliveSnakesById[snake.id] = snake;

    for (const piece of snake.body.data) {
      let partOfSnake = 'b';
      if (j === 0) {
        partOfSnake = 'h';
      } else if (j === snake.length - 1) {
        partOfSnake = 't';
      }

      board[piece.y][piece.x] = `${partOfSnake}${snake.id}`;

      j += 1;
    }

    i += 1;
  }
};

const getBoard = (game) => {
  const board = [];

  for (let i = 0; i < game.height; i++) {
    board.push([]);
    for (let j = 0; j < game.width; j++) {
      board[i].push('ee');
    }
  }

  fillFood(board, game.food.data);

  fillSnakes(board, game.snakes.data, game.you.id);

  return board;
};

// reset this before alterRatingsField call
let ratedMap = {};

const alterRatingsField = (ratings, point, value, falloff, done) => {
  const firstPoint = { x: point.x, y: point.y, depth: 0, visited: false };
  const pointQueue = [firstPoint];

  let oldPoint = firstPoint;

  while (true) {
    const point = pointQueue.shift();

    if (!point) { return; }

    const ratedKey = `x:${point.x},y:${point.y}`;
    if (ratedMap[ratedKey]) { continue; }
    ratedMap[ratedKey] = true;

    if (oldPoint.depth !== point.depth) {
      value = falloff(value, point.depth);
      if (done(value)) { continue; }
    }

    ratings[point.y][point.x] += value;

    if (point.x - 1 >= 0) {
      pointQueue.push({
        x: point.x - 1,
        y: point.y,
        depth: point.depth + 1,
      });
    }

    if (point.x + 1 < ratings[0].length) {
      pointQueue.push({
        x: point.x + 1,
        y: point.y,
        depth: point.depth + 1,
      });
    }

    if (point.y - 1 >= 0) {
      pointQueue.push({
        x: point.x,
        y: point.y - 1,
        depth: point.depth + 1,
      });
    }

    if (point.y + 1 < ratings.length) {
      pointQueue.push({
        x: point.x,
        y: point.y + 1,
        depth: point.depth + 1,
      });
    }

    oldPoint = point;
  }
}

const getRatings = (board, game) => {
  const ratings = [];
  for (let i = 0; i < board.length; i++) {
    ratings.push([]);
    for (let j = 0; j < board[0].length; j++) {
      ratings[i].push(0);
    }
  }

  const me = game.you;
  const currentHead = me.body.data[0];

  ratedMap = {};
  alterRatingsField(
    ratings,
    currentHead,
    Math.max(board.length, board[0].length),
    (value) => value - 1,
    (value) => value <= 0
  );

  // boost ratings for food

  const currentHealth = game.you.health;

  for (const piece of game.food.data) {
    ratedMap = {};
    alterRatingsField(
      ratings,
      piece,
      200 - currentHealth,
      (value) => value * 0.5 - 10,
      (value) => value <= 0
    );
  }

  // unboost ratings for larger/same size snakes (exp)

  for (const snake of Object.values(aliveSnakesById)) {
    for (const piece of snake.body.data) {
      const type = board[piece.y][piece.x][0];

      // tail piece
      if (type === 't') {
        // TODO: check if snake can eat food to expand or if space is "free"
      }

      ratings[piece.y][piece.x] = -Infinity;
    }

    if (snake.length >= me.length && snake.id !== me.id) {
      const head = snake.body.data[0];
      alterRatingsField(
        ratings,
        head,
        -100,
        (value) => value * 0.5 + 10,
        (value) => value >= 0
      );
    }
  }

  return ratings;
}

const chooseDirection = (ratings, game) => {
  const currentHead = game.you.body.data[0];

  const options = {}

  if (currentHead.x - 1 >= 0) {
    options.left = ratings[currentHead.y][currentHead.x - 1];
  }

  if (currentHead.x + 1 < ratings[0].length) {
    options.right = ratings[currentHead.y][currentHead.x + 1];
  }

  if (currentHead.y - 1 >= 0) {
    options.up = ratings[currentHead.y - 1][currentHead.x];
  }

  if (currentHead.y + 1 < ratings.length) {
    options.down = ratings[currentHead.y + 1][currentHead.x];
  }

  const sortedOptions = Object.keys(options).sort((a, b) => options[a] > options[b])

  console.log(ratings);
  console.log(sortedOptions);

  return sortedOptions[0];
}

const getMove = (game) => {
  const board = getBoard(game);

  const ratings = getRatings(board, game);

  return chooseDirection(ratings, game);
};

module.exports = {
  getMove,

  // For testing
  fillFood,
  fillSnakes,
  getBoard,
  getRatings,
};
