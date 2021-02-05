const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

      let cellsHorizontal = 6;
      let cellsVertical = 9;
      let timer = 0;

    const initialPlayer = JSON.parse(window.localStorage.getItem('players') || '[]');

      const width = window.innerWidth;
      const height = window.innerHeight;

      const unitLengthX = width / cellsHorizontal - 50;
      const unitLengthY = height / cellsVertical;


      const engine = Engine.create();
      engine.world.gravity.y = 0;
      const { world } = engine;
      const render = Render.create({
          element: document.body,
          engine: engine,
          options: {
              wireframes: false,
              width,
              height
          }
      });

      Render.run(render);
      Runner.run(Runner.create(), engine);

      const walls = [
          Bodies.rectangle(width / 2, 0, width, 8, { isStatic: true }),
          Bodies.rectangle(0, height / 2, 8, height, { isStatic: true }),
          Bodies.rectangle(width -296, height / 2, 8, height, {
              isStatic: true, render: {
                  fillStyle: 'yellow'
              } }),
          Bodies.rectangle(width / 2, height, width, 8, { isStatic: true })

      ];

      World.add(world, walls);

      // shuffle cells

      const shuffle = (arr) => {
          let counter = arr.length;

          while (counter > 0) {
              const index = Math.floor(Math.random() * counter);

              counter--;

              const temp = arr[counter];
              arr[counter] = arr[index];
              arr[index] = temp;
          }

          return arr;
      };

      const grid = Array(cellsVertical)
          .fill(null)
          .map(() => Array(cellsHorizontal).fill(false));

      const horizantal = Array(cellsVertical - 1)
          .fill(null)
          .map(() => Array(cellsHorizontal).fill(false));

      const vertical = Array(cellsVertical)
          .fill(null)
          .map(() => Array(cellsHorizontal - 1).fill(false));


      const startRow = Math.floor(Math.random() * cellsVertical);
      const startColumn = Math.floor(Math.random() * cellsHorizontal);


      //visiting cells
      const stepThroughCell = (row, column) => {

          // if I have visited the cell at [row, column], then return
          if (grid[row][column]) {
              return;
          }

          // Mark this cell as being visited
          grid[row][column] = true;

          // Assemble randomly-ordered list of neighbours
          const neighbours = shuffle([
              [row - 1, column, 'up'],
              [row, column + 1, 'right'],
              [row + 1, column, 'down'],
              [row, column - 1, 'left']
          ]);

          // for each neighbour...
          for (let neighbour of neighbours) {
              const [nextRow, nextColoumn, direction] = neighbour;

              //See if the neigbour cell is out of bound
              if (
                  nextRow < 0 ||
                  nextRow >= cellsVertical ||
                  nextColoumn < 0 ||
                  nextColoumn >= cellsHorizontal
              ) {
                  continue;
              }

              // If we have visited that neighbour, continue to next neighbour

              if (grid[nextRow][nextColoumn]) {
                  continue;
              }

              if (direction === 'right') {
                  vertical[row][column] = true;
              } else if (direction === 'left') {
                  vertical[row][column - 1] = true;
              } else if (direction === 'up') {
                  horizantal[row - 1][column] = true;
              } else if (direction === 'down') {
                  horizantal[row][column] = true;
              }

              stepThroughCell(nextRow, nextColoumn);
          }

          // See if that neighbour is out of bounds
      };


      stepThroughCell(startRow, startColumn);

      horizantal.forEach((row, rowIndex) => {
          row.forEach((open, columnIndex) => {
              if (open) {
                  return;
              }

              const wall = Bodies.rectangle(
                  columnIndex * unitLengthX + unitLengthX / 2,
                  rowIndex * unitLengthY + unitLengthY,
                  unitLengthX,
                  5,
                  {
                      label: 'wall',
                      isStatic: true,
                      render: {
                          fillStyle: 'red'
                      }
                  }
              );

              World.add(world, wall);

          });
      });

      vertical.forEach((row, rowIndex) => {
          row.forEach((open, columnIndex) => {
              if (open) {
                  return;
              }

              const wall = Bodies.rectangle(
                  columnIndex * unitLengthX + unitLengthX,
                  rowIndex * unitLengthY + unitLengthY / 2,
                  5,
                  unitLengthY,
                  {
                      label: 'wall',
                      isStatic: true,
                      render: {
                          fillStyle: 'red'
                      }
                  }

              );

              World.add(world, wall);
          });
      });



      // Finish rectangle

      const goal = Bodies.rectangle(
          width - (unitLengthX + 450) / 2,
          height - unitLengthY / 2,
          unitLengthX - 250 * .7,
          unitLengthY * .7,
          {
              label: 'goal',
              isStatic: true,
              render: {
                  fillStyle: 'purple'
              }
          }
      );

      World.add(world, goal);


      // Ball
      const radius = Math.min(unitLengthX, unitLengthY) / 4;
      const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, radius,
          {
              label: 'ball',
              render: {
                  fillStyle: '#ffd5cd'
              }
          }
      );

      World.add(world, ball);

    //background music message
    setTimeout(() => {
        document.querySelector('#backgroundMusic-text').classList.add('hidden');
    }, 3000)

    const musicState = document.getElementById('music-state');
    const backgroundSound = document.getElementById('background-music'); 
    backgroundSound.loop = true;
    let flagMusic = true;
    backgroundSound.play();


      // Moving the ball
      document.addEventListener('keydown', event => {
          const { x, y } = ball.velocity;

          if (event.keyCode === 87 || event.keyCode === 38) Body.setVelocity(ball, { x, y: y - 5 });

          if (event.keyCode === 68 || event.keyCode === 39) Body.setVelocity(ball, { x: x + 5, y });

          if (event.keyCode === 83 || event.keyCode === 40) Body.setVelocity(ball, { x, y: y + 5 });

          if (event.keyCode === 65 || event.keyCode === 37) Body.setVelocity(ball, { x: x - 5, y });
          if (event.keyCode === 77 ) {
              if(flagMusic) {
                  musicState.innerHTML = 'On';
                  backgroundSound.play();
                  flagMusic = false;
              } else {
                  musicState.innerHTML = 'Off';
                  backgroundSound.pause();
                  flagMusic = true;

              }
          }


      });

        const htmlTimer = document.getElementById("timer");

      //timer for scoring

      let timerInterval = setInterval(() => {
            timer++;
            htmlTimer.innerHTML = timer;
      }, 1000)


      // Win condition

      Events.on(engine, 'collisionStart', event => {
          event.pairs.forEach(collision => {
              const labels = ['ball', 'goal'];
              const htmlScore = document.getElementById("score");
              if (
                  labels.includes(collision.bodyA.label) &&
                  labels.includes(collision.bodyB.label)
              ) {
                  clearInterval(timerInterval);
                  document.querySelector('.winner').classList.remove('hidden');
                  document.querySelector('.timer').classList.add('hidden');
                  htmlScore.innerHTML = timer;
                  world.gravity.y = 1;
                  world.bodies.forEach(body => {
                      if (body.label === 'wall') {
                          Body.setStatic(body, false);
                      }
                  });
                }


          });

      });

      //next level
const restart = document.querySelector('.next-level');
const nameHtml = document.querySelector('#name');

restart.addEventListener('click', (evt) => {
    const playerName = nameHtml.value;
    const player = {
        name: playerName,
        score: timer
    }
    
    window.localStorage.setItem('players', JSON.stringify([...initialPlayer, player]));
    location.reload();

});

// score board
const ul = document.getElementById('top-players');
initialPlayer.sort((a, b) => a.score - b.score);

initialPlayer.slice(0, 5).map(p => {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(`${p.name}: ${p.score}`));
    ul.appendChild(li);

})








