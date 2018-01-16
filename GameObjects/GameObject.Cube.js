Cube = function(ctx,vec3_position,side,color) {
	this.vec3_position = vec3_position;
	this.side = side;

  this.color_override = color;

  this.vtranslation = [0.0,0.0,0.0];
  this.vscale = [1.0,1.0,1.0];
  this.yrotation = 0.0;

  this.bound = new BoundRectangle([vec3_position[0],vec3_position[2]],[vec3_position[0]+side,vec3_position[2]+side])

	GameObject.call(this,ctx);
}

Cube.prototype = Object.create(GameObject.prototype);
Cube.prototype.constructor = Cube;

Cube.prototype.initBuffers = function(ctx) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  var side = this.side;
  
  const positions = [
    0.0      ,0.0     ,0.0     ,  
    0.0+side ,0.0     ,0.0     ,
    0.0      ,0.0+side,0.0     ,
    0.0+side ,0.0+side,0.0     , //Front
    
    0.0      ,0.0     ,0.0+side,  
    0.0+side ,0.0     ,0.0+side,
    0.0      ,0.0+side,0.0+side,
    0.0+side ,0.0+side,0.0+side, //Back
    
    0.0      ,0.0     ,0.0     ,  
    0.0+side ,0.0     ,0.0     ,
    0.0      ,0.0     ,0.0+side,  
    0.0+side ,0.0     ,0.0+side, //Top

    0.0      ,0.0+side ,0.0     ,  
    0.0+side ,0.0+side ,0.0     ,
    0.0      ,0.0+side ,0.0+side,  
    0.0+side ,0.0+side ,0.0+side, //Bottom

    0.0+side ,0.0     ,0.0     ,  
    0.0+side ,0.0+side,0.0     ,
    0.0+side ,0.0     ,0.0+side,  
    0.0+side ,0.0+side,0.0+side, //Right

    0.0      ,0.0     ,0.0     ,  
    0.0      ,0.0+side,0.0     ,
    0.0      ,0.0     ,0.0+side,  
    0.0      ,0.0+side,0.0+side, //Left
  ];

  ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

  this.position = positionBuffer;

const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.

  var colorsArray = [];

  if(this.color_override)
  {
    for (var j = 0; j < faceColors.length; ++j) {
      const c = this.color_override;
  
      colorsArray = colorsArray.concat(c, c, c, c)
    }
  
  } else {
    for (var j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];
  
      // Repeat each color four times for the four vertices of the face
      colorsArray = colorsArray.concat(c, c, c, c);
    }
  
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
    0,  1,  2,      1,  2,  3,    // front
    4,  5,  6,      5,  6,  7,    // back
    8,  9,  10,     9,  10, 11,   // top
    12, 13, 14,     13, 14, 15,   // bottom
    16, 17, 18,     17, 18, 19,   // right
    20, 21, 22,     21, 22, 23,   // left
  ];

  // Now send the element array to GL

  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesArray), ctx.STATIC_DRAW);
  this.indices_count = indicesArray.length;
  this.indices = indexBuffer;
};

Cube.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
	
    this.material.renderBind(ctx,this.transformMatrix,viewMatrix,projectionMatrix);


    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE);
    ctx.disable(ctx.BLEND);
    ctx.enable(ctx.DEPTH_TEST);


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

Cube.prototype.getMovingCenter = function(){
  var vector = vec3.create();
  vec3.add(vector,
  this.vec3_position,
  this.vtranslation
  );
  var step = this.side /2;
  var vstep = vec3.fromValues(step * this.vscale[0],step * this.vscale[1],step * this.vscale[2]);
  vec3.add(vector,
    vector,
    vstep
    );
  return vector;
}

Cube.prototype.getMovingCenterXZ = function(){
  var vector = vec3.create();
  vec3.add(vector,
  this.vec3_position,
  this.vtranslation
  );
  var step = this.side /2;
  var vstep = vec3.fromValues(step * this.vscale[0],0.0,step * this.vscale[2]);
  vec3.add(vector,
    vector,
    vstep
    );
  return vector;
}



Cube.prototype.update = function(time) {
  var step = this.side /2;
  var vstep = vec3.fromValues(step * this.vscale[0],step * this.vscale[1],step * this.vscale[2]);
  var minusvstep = vec3.create();
  vec3.scale(minusvstep,vstep,-1);
  
  mat4.translate(this.transformMatrix,
    mat4.create(),    
    this.vec3_position
  );

  mat4.translate(this.transformMatrix,
    this.transformMatrix, 
    vstep
  );

  mat4.rotate(this.transformMatrix,    
    this.transformMatrix,
    this.yrotation,
    [0.0,1.0,0.0]);
  
    mat4.translate(this.transformMatrix,
      this.transformMatrix, 
      minusvstep
    );
    
  mat4.scale(this.transformMatrix,
    this.transformMatrix, 
    this.vscale
  );

  this.bound.update(
    [this.vec3_position[0],this.vec3_position[2]],
    [this.vec3_position[0]+this.side*this.vscale[0] ,this.vec3_position[2]+this.side*this.vscale[2]]);
  
};
Cube.prototype.translate = function(vec3_trans) {
  vec3.add(this.vec3_position,this.vec3_position,vec3_trans);
};

Cube.prototype.scale = function(vec3_scale) {
 this.vscale = vec3_scale;
};

Cube.prototype.rotateY = function(angle) {
  this.yrotation += angle;
  };
    
  Cube.prototype.setYrotation = function(angle) {
    this.yrotation = angle;
    };
  
  
