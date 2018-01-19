
PathPiece = function(ctx,vec3_position,direction,max_length,secondary) {
  this.vec3_position = vec3_position;
  this.secondary = secondary;
  this.max_length = max_length;
  this.length = 1.0;
  
  this.direction = direction;
  this.yrotation = direction.rotation;
  
  this.wire = new Wireframe(ctx);

  this.turnt = false;
  if(direction.id == "UP" || direction.id == "DOWN") {
    this.vec3_position[0] -= 0.1;
  }

  this.bound = new BoundRectangle([vec3_position[0],vec3_position[2]],[vec3_position[0]+1.0,vec3_position[2]+1.0]);

  this.bound.notifyError(this);

  GameObject.call(this,ctx);
  
  this.ready = false;
}

PathPiece.prototype = Object.create(GameObject.prototype);
PathPiece.prototype.constructor = PathPiece;

PathPiece.prototype.initBuffers = function(ctx) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  var sidex = 0.2;
  var sidey = 1.0;
  var sidez = 1.0;
  
  const positions = [
    0.0      ,0.0     ,0.0     ,  
    0.0+sidex ,0.0     ,0.0     ,
    0.0      ,0.0+sidey,0.0     ,
    0.0+sidex ,0.0+sidey,0.0     , //Front
    
    0.0      ,0.0     ,0.0+sidez,  
    0.0+sidex ,0.0     ,0.0+sidez,
    0.0      ,0.0+sidey,0.0+sidez,
    0.0+sidex ,0.0+sidey,0.0+sidez, //Back
    
    0.0      ,0.0     ,0.0     ,  
    0.0+sidex ,0.0     ,0.0     ,
    0.0      ,0.0     ,0.0+sidez,  
    0.0+sidex ,0.0     ,0.0+sidez, //Top

    0.0      ,0.0+sidey ,0.0     ,  
    0.0+sidex,0.0+sidey ,0.0     ,
    0.0      ,0.0+sidey ,0.0+sidez,  
    0.0+sidex,0.0+sidey ,0.0+sidez, //Bottom

    0.0+sidex,0.0     ,0.0     ,  
    0.0+sidex,0.0+sidey,0.0     ,
    0.0+sidex,0.0     ,0.0+sidez,  
    0.0+sidex,0.0+sidey,0.0+sidez, //Right

    0.0      ,0.0     ,0.0     ,  
    0.0      ,0.0+sidey,0.0     ,
    0.0      ,0.0     ,0.0+sidez,  
    0.0      ,0.0+sidey,0.0+sidez, //Left
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

  for (var j = 0; j < faceColors.length; ++j) {
    const c =  this.secondary ? [0.8,  0.1,  0.1,  1.0] : [0.0,  1.0,  0.0,  1.0];

    // Repeat each color four times for the four vertices of the face
    colorsArray = colorsArray.concat(c, c, c, c);
  }

  const colorBuffer = ctx.createBuffer();
  
  ctx.bindBuffer(ctx.ARRAY_BUFFER, colorBuffer);

  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(colorsArray), ctx.STATIC_DRAW);
  
  this.colors = colorBuffer;




  var colors2Array = [];
  
    for (var j = 0; j < faceColors.length; ++j) {
      const c =   [0.1,  0.1,  0.8,  1.0];
  
      // Repeat each color four times for the four vertices of the face
      colors2Array = colors2Array.concat(c, c, c, c);
    }
  
    const color2Buffer = ctx.createBuffer();
    
    ctx.bindBuffer(ctx.ARRAY_BUFFER, color2Buffer);
  
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(colors2Array), ctx.STATIC_DRAW);
    
    this.colors2 = color2Buffer;




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

  this.wire.customInitBuffers(ctx,positions,indicesArray)
};

PathPiece.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
  if(!this.ready) return;

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
	 
		ctx.bindBuffer(ctx.ARRAY_BUFFER, this.hit?this.colors2 : this.colors);
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
  
      this.wire.render(ctx,viewMatrix,projectionMatrix);

};



PathPiece.prototype.update = function(time,pressingV,idx) {

    var vstep =  vec3.fromValues(0.1,0.0,0.0);
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
    
  if (this.length > this.max_length) 
  {

    mat4.translate(this.transformMatrix,
      this.transformMatrix, 
      [0.0,0.0,this.length - this.max_length ]
      );

    mat4.scale(this.transformMatrix,
      this.transformMatrix, 
      [1.0,0.5, this.max_length]
    );
      
  } else 
  {
    mat4.scale(this.transformMatrix,
      this.transformMatrix, 
      [1.0,0.5, this.length]
    );
  }

  this.updateBound(time,pressingV,idx);
  this.wire.updateMatrix(this.transformMatrix);
};

PathPiece.prototype.updateBound = function(elapsed,pressingV,idx) {

  this.time = (this.time?this.time : 0) + elapsed;

  var vbot = [0.0 , 0.0, 0.0];
  var vtop = [0.2 , 1.0, 1.0];
  vec3.transformMat4(vbot,vbot,this.transformMatrix);
  vec3.transformMat4(vtop,vtop,this.transformMatrix);

  var bot = {
    x: vbot[0],
    y: vbot[2]
  };

  var top = {
    x: vtop[0],
    y: vtop[2]
  };

  // UP + Turn -> Switch top for bot
  // DOWN NO turn -> Switch top for bot
  // LEFT NO turn    -> [bot.x,top.y], [top.x,bot.y]
  // LEFT +  turn    -> [top.x,bot.y], [bot.x,top.y]
  // RIGHT NO turn    -> [top.x,bot.y], [bot.x,top.y]
  // RIGHT +  turn    -> [bot.x,top.y], [top.x,bot.y]

  var fbot;
  var ftop;
    switch (this.direction.id) {
      case "UP":
        fbot = this.turnt? [top.x,top.y] : [bot.x,bot.y];
        ftop = this.turnt? [bot.x,bot.y] : [top.x,top.y];
        break;
      case "DOWN":
        fbot = this.turnt? [bot.x,bot.y] : [top.x,top.y];
        ftop = this.turnt? [top.x,top.y] : [bot.x,bot.y];
        break;
      case "LEFT":
        fbot = this.turnt? [top.x,bot.y] : [bot.x,top.y];
        ftop = this.turnt? [bot.x,top.y] : [top.x,bot.y];
        break;
      case "RIGHT":
        fbot = this.turnt? [bot.x,top.y]: [top.x,bot.y];
        ftop = this.turnt? [top.x,bot.y]: [bot.x,top.y];
        break;
      default:
        return;
    }

    this.bound.update(fbot,ftop);

      if(this.time > 2000 && pressingV)
      {
        console.log( 
        ` not colliding, idx: `+idx+` bike:`+(this.secondary?"RED":"GREEN")+`
         Length/max: `+this.length+`/`+this.max_length+`  Rot: `+this.direction.id+` turnt:`+this.turnt+`

         bot: (`+bot[0]+", "+bot[2]+`);
         top: (`+top[0]+", "+top[2]+`);

         Estado: `+ ((bot[0]<top[0] && bot[2] <top[2]) ?"CORRECTO":"MAL") + `

        `);
        
        this.time = 0;
      }

    
  
}


PathPiece.prototype.updatePosition = function(newPosition) {
  var dif = []
  vec3.subtract(dif,this.vec3_position,newPosition);
  this.length = vec3.length(dif); 
  this.lastPosition = newPosition;

  this.ready = true;
};

PathPiece.prototype.turn = function() {
  if(this.already_turned) return;
  this.already_turned = true;
  var aux = this.vec3_position;
  this.vec3_position = this.lastPosition;
  this.lastPosition = aux;
  this.yrotation = this.direction.opositeAngle;
  this.turnt = true;
};


PathPiece.prototype.setLength = function(newLength) {
  this.length = newLength >= 0? newLength : 0; 
};

