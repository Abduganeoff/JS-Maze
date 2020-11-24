const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

const cellsHorizontal = 14;
const cellsVertical = 10;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;


const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
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
Bodies.rectangle(width/2, 0, width, 2, {isStatic: true}),
Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
Bodies.rectangle(width/2, height, width, 2, { isStatic: true })

];

World.add(world, walls);

// Maze generator

const shuffle = (arr) => {
    let counter = arr.length;

    while ( counter > 0 ) {
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

const horizantal = Array(cellsVertical-1)
.fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const vertical = Array(cellsVertical)
.fill(null)
    .map(() => Array(cellsHorizontal-1).fill(false));


const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {

    // if I have visited the cell at [row, column], then return
    if(grid[row][column]){
        return;
    }

    // Mark this cell as being visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbours
    const neighbours = shuffle([
        [row-1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    // for each neighbour...
    for(let neighbour of neighbours){
        const [nextRow, nextColoumn, direction] = neighbour;

        if (
            nextRow < 0 || 
            nextRow >= cellsVertical || 
            nextColoumn < 0 || 
            nextColoumn >= cellsHorizontal
        )   {
            continue;
        }

        if(grid[nextRow][nextColoumn]){
            continue;
        }
        
        if(direction === 'right'){
            vertical[row][column] = true;
        } else if(direction === 'left'){
            vertical[row][column-1] = true;
        } else if(direction === 'up'){
            horizantal[row-1][column] = true;
        } else if(direction === 'down'){
            horizantal[row][column] = true;
        }

        stepThroughCell(nextRow, nextColoumn);
    }

    // See if that neighbour is out of bounds
};

stepThroughCell(startRow, startColumn);

horizantal.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open){
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
        if(open){
            return;
        }

        const  wall = Bodies.rectangle(
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
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'green'
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



document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.keyCode === 87) Body.setVelocity(ball, { x, y: y - 5 });

    if (event.keyCode === 68) Body.setVelocity(ball, { x: x + 5, y });

    if (event.keyCode === 83) Body.setVelocity(ball, { x, y: y + 5 });

    if (event.keyCode === 65) Body.setVelocity(ball, { x: x - 5, y });

});


// Win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if(
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            })
        }
    });

});

