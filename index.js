document.addEventListener("DOMContentLoaded", () => {
getUsers();
renderGame();
});

// Creating our GET / SHOW

function getUsers() {
  fetch(`http://localhost:3000/api/v1/users`)
  .then(res => res.json())
  .then(data => showUsers(data))
}

function showUsers(data) {
  data.forEach(user => {
    let userTable = document.getElementById('table-body');
    let nameEntry = document.createElement("tr");
    let userName = user.name;
    let userComment = user.comment;
    let userId = user.id;
    nameEntry.innerHTML = `<td>${userId}</td>  <td>${userName}</td> <td class= "this-is-the-comment">${userComment}</td> <td><input class="new-comment-field"></input></td> <td><input class= "comment-btn" data-id="${userId}"  type="submit" value="Submit"></td> <td><input class="delete-btn" data-id="${userId}" type="submit" value="Delete"> </input></td>`
    userTable.prepend(nameEntry)
  })
}

// Creating a POST for a new user
const newUserForm = document.querySelector("#user-form");
newUserForm.addEventListener("submit", nameInputHandler)

function nameInputHandler(event) {
  event.preventDefault();
  let name = newUserForm.elements.namedItem("name").value;
  console.log(name)
  if (name === "") {
    alert("Please fill in a name before hitting submit!")
  } else {
    postName(name)
  }
}

function postName(name) {
  fetch(`http://localhost:3000/api/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type" : "application/json",
      Accept: "application/json"
  },
  body: JSON.stringify({
    name: name,
    comment: "Has not posted a comment yet!"
  })
  })
  .then(res => res.json())
  .then(json => {
    newUserForm.reset();
    showUsers(json);
  })
}




// Creating a PATCH request
let buttonListener = document.querySelector("#table-body");
buttonListener.addEventListener("click", prepareCommentPatch);

function prepareCommentPatch(event) {
  event.preventDefault();
  if (event.target.className === "comment-btn") {
    let currentIdInUse = event.target.getAttribute('data-id');
    let newComment = document.querySelector(".new-comment-field").value;
    if (newComment.innerText === "") {
      alert("Please write a comment before hitting submit!")
    }
    console.log(currentIdInUse);
    console.log(newComment);
    updateComment(currentIdInUse, newComment)
}
}

function updateComment(currentIdInUse, newComment) {
  fetch(`http://localhost:3000/api/v1/users/${currentIdInUse}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      comment: newComment
    })
  })
    .then(res => res.json())
    .then(json => {
    let userDataId = document.querySelector(`[data-id="${currentIdInUse}"]`)
  })
  userDataId.parentNode.querySelector(".this-is-the-comment").innerText = `${newComment}`;
}

// Creating a Delete fetch

buttonListener.addEventListener("click", (event) => {
  if (event.target.className === "delete-btn") {
    let currentDOMElement = event.target
    let currentIdInUse = event.target.dataset.id;
    console.log(currentIdInUse);
    fetch(`http://localhost:3000/api/v1/users/${currentIdInUse}`, {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(currentDOMElement.parentNode.parentNode.remove())
  }
})

// PHYSICS ENGINE / DATA BELOW

let gameContainer = document.querySelector('.game-activate')

function renderGame() {
  var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Events = Matter.Events,
      Constraint = Matter.Constraint,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Bodies = Matter.Bodies;

  // create engine
  var engine = Engine.create(),
      world = engine.world;

  // create renderer
  var render = Render.create({
      element: document.querySelector('.game-activate'),
      engine: engine,
      options: {
          width: 1000,
          height: 500,
          showAngleIndicator: false,
          wireframes: false
      }
  });

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  // add bodies
  var ground = Bodies.rectangle(395, 600, 815, 50, { isStatic: true }),
      rockOptions = { density: 0.004, render: {
         fillStyle: 'red',
         strokeStyle: 'blue',
         lineWidth: 3
    } },
      rock = Bodies.polygon(170, 450, 8, 20, rockOptions),
      anchor = { x: 170, y: 450 },
      elastic = Constraint.create({
          pointA: anchor,
          bodyB: rock,
          stiffness: 0.05
      });

  var pyramid = Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y) {
      return Bodies.rectangle(x, y, 25, 40);
  });

  var ground2 = Bodies.rectangle(610, 250, 200, 20, { isStatic: true });

  var pyramid2 = Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y) {
      return Bodies.rectangle(x, y, 25, 40);
  });

  World.add(engine.world, [ground, pyramid, ground2, pyramid2, rock, elastic]);

  Events.on(engine, 'afterUpdate', function() {
      if (mouseConstraint.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430)) {
          rock = Bodies.polygon(170, 450, 7, 20, rockOptions);
          World.add(engine.world, rock);
          elastic.bodyB = rock;
      }
  });

  // add mouse control
  var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
              stiffness: 0.2,
              render: {
                  visible: false
              }
          }
      });

  World.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: 800, y: 600 }
  });

  // context for MatterTools.Demo
  return {
      engine: engine,
      runner: runner,
      render: render,
      canvas: render.canvas,
      stop: function() {
          Matter.Render.stop(render);
          Matter.Runner.stop(runner);
      }
  };
};




// var Engine = Matter.Engine,
// Render = Matter.Render,
// World = Matter.World,
// Bodies = Matter.Bodies;
//
// // create an engine
// var engine = Engine.create();
//
// // create a renderer
// var render = Render.create({
//   element: document.body,
//   engine: engine
// });
//
// // create two boxes and a ground
// var boxA = Bodies.rectangle(400, 200, 80, 80);
// var boxB = Bodies.rectangle(450, 50, 80, 80);
// var boxC = Bodies.circle(400, 400, 50, 50);
// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
//
// // add all of the bodies to the world
// World.add(engine.world, [boxA, boxB, boxC, ground]);
//
// // run the engine
// Engine.run(engine);
//
// // run the renderer
// Render.run(render);
