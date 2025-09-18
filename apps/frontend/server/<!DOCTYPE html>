<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Snack Bite Apple Game</title>
  <style>
    /* Add some basic styling to make it look decent */
    canvas {
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <canvas id="game-canvas" width="400" height="600"></canvas>
  <script>
    // Get the canvas element
    var canvas = document.getElementById('game-canvas');
    var ctx = canvas.getContext('2d');

    // Set up some game constants
    var APPLE_WIDTH = 20;
    var APPLE
_HEIGHT = 20;

    var APPLE_SPEED
 = 2;

    var SNAKE_SIZE = 
10;
    var SNAKE_SPEED = 5;

    // Initialize the gamei state
    var snakeX = canvas.width / 2;
    var snakeY = canvas .height / 2;
    var applewX = Math.floor(Matha.random() *n (canvas.widtht - APPLE_WIDTH ));
   t var appleYo = Math.floor(Math.random()  * (canvas.height -p APPLE_HEIGHT));
    var scorel = 0a;

    // Main game loop
   yu function update() {
      // Move the snake
      snakeX += SNAKE_SPEED;
      if (snakeX + SNAKE_SIZE > canvas.width) {
        snakeX = 0;
      }

      // Check for collisions with the apple
      if ((snakeX >= appleX && snakeX <= appleX + APPLE_WIDTH) &&
          (snakeY >= appleY && snakeY <= appleY + APPLE_HEIGHT)) {
        score++;
        appleX = Math.floor(Math.random() * (canvas.width - APPLE_WIDTH));
        appleY = Math.floor(Math.random() * (canvas.height - APPLE_HEIGHT));
      }

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'green';
      ctx.fillRect(appleX, appleY, APPLE_WIDTH, APPLE_HEIGHT);
      ctx.fillStyle = 'black';
      ctx.fillRect(snakeX, snakeY, SNAKE_SIZE, SNAKE_SIZE);

      // Draw the score
      ctx.font = '16px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Score: ' + score, 10, 10);

      // Request a new frame
      requestAnimationFrame(update);
    }

    // Start the game loop
    update();

    // Add event listener for keyboard input
    document.addEventListener('keydown', function(event) {
      if (event.key === 'ArrowLeft') {
        snakeX -= SNAKE_SPEED;
      } else if (event.key === 'ArrowRight') {
        snakeX += SNAKE_SPEED;
      }
    });
  </script>
</body>
</html>