'use strict';
// set up the canvas
let canvas = new Canvas(1080, 720);

// objects to transform & display
let sceneObjects = [];
let lineObjects = [];

// mouse dragging vars
let mouseStart = {x: 0, y: 0};
let mouseEnd = {x: 0, y: 0};
let mousedown = false;

let showNormals = false

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
    DoRedisplay(canvas, lineObjects, "LINES");
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
    DoRedisplay(canvas, lineObjects, "LINES");
});

function DisplayModel(model) {
    let modelObj = new ModelDisplay(canvas, model)
    let sceneObj = new SceneObject(canvas, modelObj)
    sceneObjects = [sceneObj]
    DoRedisplay(canvas, sceneObjects) // display it
    DrawNormals(model);

    // make model availible to copy
    outJSON = JSON.stringify(model)
    copyText.value = outJSON

    // make model into a downloadable .json file
    let data = new Blob([outJSON], {type: 'application/json'})
    let downloadJSON = document.getElementById('downloadJSON')
    downloadJSON.href = URL.createObjectURL(data)
    downloadJSON.download = model.name // name the downloadable file
}

// when the input file changes, most comonly, from no file to some file
fileInput.addEventListener("change", function(e){
  let reader = new FileReader();

  reader.onload = function() { // when the file is loaded
    let fileName = fileInput.files[0].name; // file name w/ extension
    let model = LoadModelFile(fileName, reader.result); // parse file
    DisplayModel(model);
  }

  reader.readAsText(fileInput.files[0]);
})

function copyJSON() { // select the text and copy it
  copyText.select();
  document.execCommand("copy");
}

// draw normal line segments
function DrawNormals(obj) {
    let vertNormals = obj.vertNormals; // model's vertices
    let modelNormals = {
        Triangles: [], // [[vertex1], [normal1] ... [vertexn], [normaln]]
        BC: []
    }

    // fill object with line segments and dummy BCs to keep the fragment shader happy
    for (let i = 0; i < vertNormals.verts.length; i++) {
        modelNormals.Triangles.push(vertNormals.verts[i], vertNormals.normals[i]);
        modelNormals.BC.push([1,0,0],[0,1,0],[0,0,1]);
    }

    // create SceneObject from model
    let normalsModelObj = new ModelDisplay(canvas, modelNormals);
    let normalsSceneObj = new SceneObject(canvas, normalsModelObj);
    normalsSceneObj.Color([1,0,0,0.33]); // red transparent color
    lineObjects = [normalsSceneObj];

    DoRedisplay(canvas, sceneObjects);
    DoRedisplay(canvas, lineObjects, "LINES");
}

// build the scene
MakeScene(sceneObjects);

// redisplay it.
DoRedisplay(canvas, sceneObjects);

// displays an array of scene objects onto the canvas
function DoRedisplay(canvas, objects, type) {
   type = type ? type : "TRIANGLES"; // if type is null, type = TRIANGLES
   canvas.Redisplay(); // clear canvas

   if (type == "LINES") { // if we want to display lines
        for (let i = 0; i < sceneObjects.length; i++) // display sceneObjects first
            sceneObjects[i].Display()
        if (!showNormals) // check if user wants to show normals
            return
    }

   for (let i = 0; i< objects.length; i++) // display object array
        objects[i].Display(type);
};

function MakeScene(objectList) {
    // a dragon placeholder (just for fun)
    let dragon = LoadModelFile("dragon.json"); // parse file
    DisplayModel(dragon);

    return;
}
