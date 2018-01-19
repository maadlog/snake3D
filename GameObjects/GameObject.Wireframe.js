Wireframe = function(ctx) {
	GameObject.call(this,ctx);
}
Wireframe.prototype = Object.create(GameObject.prototype);
Wireframe.prototype.constructor = Wireframe;


Wireframe.prototype.initBuffers = function(ctx) {
  // override to custom;
}


Wireframe.prototype.customInitBuffers = function(ctx,vertices,indices) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  const positions = vertices;

  ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

  this.position = positionBuffer;

  // Convert the array of colors into a table for all the vertices.

  var colorsArray = [];

  for (var j = 0; j < vertices.length; ++j) {
    colorsArray = colorsArray.concat([0.0,0.0,0.0,0.1]);
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

  var indicesArray = [];


  for (var i = 0; i < indices.length; (i = i+3)) {
    var line1 = [indices[i]  , indices[i+1]];
    var line2 = [indices[i+1], indices[i+2]];
    var line3 = [indices[i+2], indices[i]  ];

    indicesArray = indicesArray.concat(line1);
    indicesArray = indicesArray.concat(line2);
    indicesArray = indicesArray.concat(line3);
  }



  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesArray), ctx.STATIC_DRAW);
  this.indices_count = indicesArray.length;
  this.indices = indexBuffer;
};

Wireframe.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
	
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
		    ctx.drawElements(ctx.LINES, vertexCount, type2, offset);
  
};
Wireframe.prototype.updateMatrix = function(transform) {
  this.transformMatrix = transform;
};
