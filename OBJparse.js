function OFFparse(off) {
	let offArr = off.split("\n")
	let offObj = {
		Triangles: [],
		BC: []
	}
	let triVerts = []

	if (offArr[0].search("OFF") != -1) {
		offArr[0] = ""
		offArr[1] = ""
	}

	offArr.forEach((el)=>{
		el = el.split(" ")
		if (el.length == 3)
			triVerts.push([parseFloat(el[0]), parseFloat(el[1]), parseFloat(el[2])])
		if (el.length > 3) {
			let verts = parseInt(el[0])
			for (let i = 1; i <= verts-2; i++) {
				offObj.Triangles.push(triVerts[parseInt(el[1])].slice(), 
					                  triVerts[parseInt(el[i+1])].slice(), 
					                  triVerts[parseInt(el[i+2])].slice())
				offObj.BC.push([1,0,0],[0,1,0],[0,0,1])
			}
		}
	})

	let range = rangeXYZ(offObj.Triangles)
	let scaler = Math.abs(range.abs[1] - range.abs[0])
	if (scaler < 1)
		scaler = 1

	for (let v = 0; v < offObj.Triangles.length; v++) 
		for (let d = 0; d < 3; d++) {
			offObj.Triangles[v][d] -= range.center[d]
			offObj.Triangles[v][d] /= scaler
		}

	return offObj
}