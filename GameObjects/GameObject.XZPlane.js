XZPlane = function(ctx,vec3_position,side) {
	this.vec3_position = vec3_position;
	this.side = side;

    this.bound = new BoundRectangle([vec3_position[0],vec3_position[2]],[vec3_position[0]+side,vec3_position[2]+side])

	GameObject.call(this,ctx);
}
XZPlane.prototype = Object.create(GameObject.prototype);
XZPlane.prototype.constructor = XZPlane;

XZPlane.prototype.initBuffers = function(ctx) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  var x0 = this.vec3_position[0];
  var y0 = this.vec3_position[1];
  var z0 = this.vec3_position[2];
  var side = this.side;
  
  const positions = [
    x0      ,y0     ,z0     ,  
    x0+side ,y0     ,z0     ,
    x0      ,y0     ,z0+side,
    x0+side ,y0     ,z0+side,
  ];

  ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

  this.position = positionBuffer;

const faceColors = [
    [0.0,  0.3921,  0.0,  1.0]
  ];

  // Convert the array of colors into a table for all the vertices.

  var colorsArray = [];

  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colorsArray = colorsArray.concat(c, c, c, c);
  }

  const colorBuffer = ctx.createBuffer();
  
  ctx.bindBuffer(ctx.ARRAY_BUFFER, colorBuffer);

  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(colorsArray), ctx.STATIC_DRAW);
  
  this.colors = colorBuffer;

  const indexBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indicesArray = [
    0,  1,  2,      1,  2,  3,
  ];

  // Now send the element array to GL

  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesArray), ctx.STATIC_DRAW);
  this.indices_count = indicesArray.length;
  this.indices = indexBuffer;
};

XZPlane.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
	
    this.material.renderBind(ctx,this.transformMatrix,viewMatrix,projectionMatrix);


	    const numComponents = 3;  // pull out 2 values per iteration
	    const type = ctx.FLOAT;    // the data in the buffer is 32bit floats
	    const normalize = false;  // don't normalize
	    const stride = 0;         // how many bytes to get from one set of values to the next
	                 				// 0 = use type and numComponents above
	    const offset = 0;         // how many bytes inside the buffer to start from

		ctx.bindBuffer(ctx.ARRAY_BUFFER, this.position);
	    ctx.vertexAttribPointer(
	        this.material.programInfo.attribLocations.vertexPosition,
	        numComponents,
	        type,
	        normalize,
	        stride,
	        offset);

	    ctx.enableVertexAttribArray(
	        this.material.programInfo.attribLocations.vertexPosition);
	     
	    const numComponentsColor = 4;  // pull out 2 values per iteration
	 
		ctx.bindBuffer(ctx.ARRAY_BUFFER, this.colors);
	    ctx.vertexAttribPointer(
	        this.material.programInfo.attribLocations.vertexColor,
	        numComponentsColor,
	        type,
	        normalize,
	        stride,
	        offset);		

	    ctx.enableVertexAttribArray(
        	this.material.programInfo.attribLocations.vertexColor);
	     
		
		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indices);

		    const vertexCount = this.indices_count;
		    const type2 = ctx.UNSIGNED_SHORT;
		    ctx.drawElements(ctx.TRIANGLES, vertexCount, type2, offset);
  
};
XZPlane.prototype.update = function(time) {
    if(this.restrainedObject && !this.bound.collides(this.restrainedObject.bound))
    {
        this.restrainedObject.restrain();
    }
};
XZPlane.prototype.restrain = function(anObject) {
    this.restrainedObject = anObject;
};

