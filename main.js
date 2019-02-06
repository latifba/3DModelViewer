'use strict';
// set up the canvas 
var canvas = new Canvas(1080, 720);

// objects to transform & display
var sceneObjects = [];

// mouse dragging vars
var mouseStart = {x: 0, y: 0};
var mouseEnd = {x: 0, y: 0};
var mousedown = false;

// json output vars
let outJSON = "";
let copyText = document.getElementById('JSON');

// input object file element
let fileInput = document.getElementById('file');

//add a callback for left click down
canvas.disp.addEventListener("mousedown", function(e) {
    mousedown = true;
    // store click location
    mouseStart.x = e.x;
    mouseStart.y = e.y;
});

//add a callback for mouse movement
canvas.disp.addEventListener('mousemove', function(e) {
    if (!mousedown) // if user isn't dragging, do nothing
      return;

    // store location moved to
    mouseEnd.x = e.x;
    mouseEnd.y = e.y;

    // rotate the scene porpotional to the distance dragged
    canvas.yr = mouseEnd.x - mouseStart.x;
    canvas.xr = mouseStart.y - mouseEnd.y;
    DoRedisplay(canvas, sceneObjects); 
});

//add a callback for left click release
canvas.disp.addEventListener("mouseup", function(e) {
    mousedown = false;
});

//add a callback for mouse wheel
canvas.disp.addEventListener("wheel", function(e) {
    //move the camera further or closer to the object depending on scroll direction
    canvas.ez += e.deltaY / (-4*Math.abs(e.deltaY)); // scale scroll value
    canvas.RedoCameraMat();
    DoRedisplay(canvas, sceneObjects); 
});

// when the input file changes, most comonly, from no file to some file
fileInput.addEventListener("change", function(e){
  var reader = new FileReader();

  reader.onload = function() { // when the file is loaded
    let model = ParseModelFile(fileInput.files[0].name, reader.result); // parse file
    var modelObj = new ModelDisplay(canvas, model);
    var sceneObj = new SceneObject(canvas, modelObj);
    sceneObjects = [sceneObj];
    DoRedisplay(canvas, sceneObjects); // display it

    // make model availible to copy
    outJSON = JSON.stringify(model);
    copyText.value = outJSON;

    // make model into a downloadable .json file
    let data = new Blob([outJSON], {type: 'application/json'});
    let downloadJSON = document.getElementById('downloadJSON');
    downloadJSON.href = URL.createObjectURL(data);
  }

  reader.readAsText(fileInput.files[0]);
})

function copyJSON() { // select the text and copy it
  copyText.select();
  document.execCommand("copy"); 
}

// build the scene
MakeScene(sceneObjects);

// redisplay it.
DoRedisplay(canvas, sceneObjects);

// counts on canvas and objects being global.
function DoRedisplay(canvas, objects) {
   var i;
   canvas.Redisplay();
   for (i = 0; i< objects.length; i++) {
      objects[i].Display();
   }
};

function MakeScene(objectList) {
    // a bunny placeholder (just for fun)
    var bunny = new bunnyModel();
    var bunnyModelObj = new ModelDisplay(canvas, bunny);
    var bunnySceneObj = new SceneObject(canvas, bunnyModelObj);
    bunnySceneObj.Push(translate(-0.1,0,0.3));
    bunnySceneObj.Push(rotate(-90, [0,1,0]));  
    objectList.push(bunnySceneObj);
    
    return;
}
