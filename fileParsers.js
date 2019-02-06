// return data object given a list of vertices
function rangeXYZ(triangles) {
	// object that holds model information
	let range = {
		abs: [0, 0], // min and max values of all vertex coords
		max: [0,0,0], // [max of xs, min of ys, max of zs]
		min: [0,0,0], // [min of xs, min of ys, min of zs]
		center: [0, 0, 0] // center of model
	}
 
	triangles.forEach((el)=>{ // loop through each vertex
		// find max & min of x
		if (el[0] > range.max[0])
			range.max[0] = el[0]
		if (el[0] < range.min[0])
			range.min[0] = el[0]
		// ...y
		if (el[1] > range.max[1])
			range.max[1] = el[1]
		if (el[1] < range.min[1])
			range.min[1] = el[1]
		// ...z
		if (el[2] > range.max[2])
			range.max[2] = el[2]
		if (el[2] < range.min[2])
			range.min[2] = el[2]
	})
	// take an average of min & max to find center
	range.center = [(range.min[0] + range.max[0])/2, 
	                (range.min[1] + range.max[1])/2, 
	                (range.min[2] + range.max[2])/2]
	// loop through each coord to find the min & max coords
	for (var i = 0; i < 3; i++) {
		if (range.min[i] < range.abs[i])
			range.abs[i] = range.min[i]
		if (range.max[i] > range.abs[i])
			range.abs[i] = range.max[i]
	}

	return range
}

function OFFparse(offObj, fileArr) {
	// remove first two lines, js' arrays make them useless
	if (fileArr[0].search("OFF") != -1) {
		fileArr[0] = ""
		fileArr[1] = ""
	}

	let triVerts = [] // stores all verts used in the model

	fileArr.forEach((el)=>{
		el = el.split(" ") // create an array of numbers in the line
		if (el.length == 3) // if there are only 3 numbers, it's just a vert
			triVerts.push([parseFloat(el[0]), parseFloat(el[1]), parseFloat(el[2])])
		if (el.length > 3) { // if there are more than 3, it's a list of vert indices (polygon)
			let verts = parseInt(el[0]) // number of vert indices
			for (let i = 1; i <= verts-2; i++) { // convert polygon to triangles (fan method)
				offObj.Triangles.push(triVerts[parseInt(el[1])].slice())
				for (let j = 1; j < 3; j++) // use first 3 indices then shift to the right by 1
					offObj.Triangles.push(triVerts[parseInt(el[i+j])].slice())
				offObj.BC.push([1,0,0],[0,1,0],[0,0,1]) // bericentric coordinates are constant for each triangle
			}
		}
	})

	offObj.Triangles = standardTransform(offObj.Triangles)

	return offObj
}

function OBJparse(objObj, fileArr) {

	let triVerts = []

	fileArr.forEach((el)=>{
		el = el.split(" ")
		if (el[0] == "v") // if line begins with 'v', it's just a vert
			triVerts.push([parseFloat(el[1]), parseFloat(el[2]), parseFloat(el[3])]) // skip the 'v'
		if (el[0] == "f") { // if  line begins with 'v', it's a list of vert indices (polygon)
			for (let i = 1; i <= el.length-3; i++) { // convert polygon to triangles (fan method), skip the 'f'
				for (let j = 0; j < 3; j++) {
					let vertIdx = parseInt(el[i+j].split("/")[0]) // obj has other values for verts concatinated by '/', we want the first value (the index)
					if (vertIdx < 0) // sometimes indices are negative meaning 'count backwards'
						vertIdx += triVerts.length
					objObj.Triangles.push(triVerts[vertIdx].slice())
				}
				objObj.BC.push([1,0,0],[0,1,0],[0,0,1])
			}
		}
	})

	objObj.Triangles = standardTransform(objObj.Triangles)

	return objObj
}

// takes file name and its content
// returns model object for the modelDisplay constructor
function ParseModelFile(fileName, content) {
	let fileExt = fileName.split(".")[1] // "filename.ext" -> ["filename", "ext"]
	let fileArr = content.split("\n") // make file into an array of lines

	let fileObj = {
		Triangles: [],
		BC: [],
		Normals: []
	}

	// determine file extension
	if (fileExt == "off")
		fileObj = OFFparse(fileObj, fileArr)

	if (fileExt == "obj")
		fileObj = OBJparse(fileObj, fileArr)

	fileObj.Normals = getNormals(fileObj.Triangles)

	return fileObj
}

// scale and center model
function standardTransform(triangles) {
	let range = rangeXYZ(triangles)
	let scaler = Math.abs(range.abs[1] - range.abs[0])
	if (scaler < 1) // if scaler is < 1
		scaler = 1 // don't scale

	for (let v = 0; v < triangles.length; v++) 
		for (let d = 0; d < 3; d++) {
			triangles[v][d] -= range.center[d]
			triangles[v][d] /= scaler
		}

	return triangles
}

function getNormals(triangles) {
	let normals = []

	for (var i = 0; i < triangles.length; i+=3)
		normals.push(cross(triangles[i], triangles[i+1]))

	return normals
}