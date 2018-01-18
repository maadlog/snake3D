GUIMaterial = function (ctx,texture_url,game_object) {
	var vsSource = `
	attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

	uniform mat4 uModelMatrix;
	uniform mat4 uViewMatrix;
	uniform mat4 uProjectionMatrix;

	varying highp vec2 vTextureCoord;

  uniform lowp float canvasWidth;
  uniform lowp float canvasHeight;

	void main() {
        gl_Position =
        uModelMatrix * 
        aVertexPosition;

	  vTextureCoord = aTextureCoord;
	}
	`;
	var fsSource = `
	varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;


    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  this.texture = this.loadTexture(ctx,texture_url,game_object);
  
  GameMaterial.call(this,ctx,vsSource,fsSource);
}
GUIMaterial.prototype = Object.create(GameMaterial.prototype);
GUIMaterial.prototype.constructor = GUIMaterial;

GUIMaterial.prototype.getAttribLocations = function(ctx,shaderProgram) { 
  return {
    vertexPosition: ctx.getAttribLocation(shaderProgram, 'aVertexPosition'),
    textureCoord: ctx.getAttribLocation(shaderProgram, 'aTextureCoord'),
  };
}

GUIMaterial.prototype.getUniformLocations = function(ctx,shaderProgram) {
  return {
    modelMatrix: ctx.getUniformLocation(shaderProgram, 'uModelMatrix'),
    viewMatrix: ctx.getUniformLocation(shaderProgram, 'uViewMatrix'),
    projectionMatrix: ctx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    
    uSampler: ctx.getUniformLocation(shaderProgram, 'uSampler'),
    
    canvasWidth: ctx.getUniformLocation(shaderProgram, 'canvasWidth'),
    canvasHeight: ctx.getUniformLocation(shaderProgram, 'canvasHeight'),
  };
} 


function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
GUIMaterial.prototype.loadTexture = function(ctx,url,game_object) {
	const texture = ctx.createTexture();
  ctx.bindTexture(ctx.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = ctx.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = ctx.RGBA;
  const srcType = ctx.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  ctx.texImage2D(ctx.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.texImage2D(ctx.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       ctx.generateMipmap(ctx.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
       ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
       ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    }
    game_object.onImageLoad(ctx,image);
  };
  //Allow CORS locally, must disable on deploy
  image.crossOrigin = "anonymous";
  image.src = url;

  return texture;
};


GUIMaterial.prototype.renderBind = function(ctx,transformMatrix,viewMatrix,projectionMatrix) {
	ctx.useProgram(this.programInfo.program);

	// Set the shader uniforms
	ctx.uniformMatrix4fv(
		this.programInfo.uniformLocations.modelMatrix,
		false,
		transformMatrix);
	ctx.uniformMatrix4fv(
		this.programInfo.uniformLocations.viewMatrix,
		false,
        viewMatrix);
        
	ctx.uniformMatrix4fv(
		this.programInfo.uniformLocations.projectionMatrix,
		false,
    projectionMatrix);
    ctx.uniform1f(
      this.programInfo.uniformLocations.canvasWidth,
      ctx.canvas.clientWidth);
    ctx.uniform1f(
      this.programInfo.uniformLocations.canvasHeight,
      ctx.canvas.clientHeight);

};



GUIElement = function(ctx,botLeft,absolute,url) {
    
var cw = ctx.canvas.clientWidth;
var ch = ctx.canvas.clientHeight;

this.ctx = ctx;
var pos = [ (-(cw) + botLeft[0]) / cw ,
  (-(ch) + botLeft[1]) / ch ,
    0.0];

    this.vec3_position =  pos;


	GameObject.call(this,ctx,new GUIMaterial(ctx,url,this));
}
GUIElement.prototype = Object.create(GameObject.prototype);
GUIElement.prototype.constructor = GUIElement;

GUIElement.prototype.initBuffers = function(ctx) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  var x0 = this.vec3_position[0];
  var y0 = this.vec3_position[1];
  var z0 = this.vec3_position[2];
  
  const positions = [
    x0            ,y0             ,z0 ,  
    x0+0.1 ,y0             ,z0 ,
    x0            ,y0+0.1 ,z0 ,
    x0+0.1 ,y0+0.1 ,z0 ,
  ];

  ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

  this.position = positionBuffer;

  

const textureCoordBuffer = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER, textureCoordBuffer);

const textureCoordinates = [
  // Front
  1.0,  1.0,
  0.0,  1.0,
  1.0,  0.0,
  0.0,  0.0
];

ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(textureCoordinates),
              ctx.STATIC_DRAW);


this.textureCoord = textureCoordBuffer;

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

GUIElement.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
	
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
         
            const numTexture = 2; // every coordinate composed of 2 values
    
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this.textureCoord);
            ctx.vertexAttribPointer(this.material.programInfo.attribLocations.textureCoord, numTexture, type, normalize, stride, offset);
            ctx.enableVertexAttribArray(this.material.programInfo.attribLocations.textureCoord);
    
            // Tell WebGL we want to affect texture unit 0
            ctx.activeTexture(ctx.TEXTURE0);
    
            // Bind the texture to texture unit 0
            ctx.bindTexture(ctx.TEXTURE_2D, this.material.texture);
    
            // Tell the shader we bound the texture to texture unit 0
            ctx.uniform1i(this.material.programInfo.uniformLocations.uSampler, 0);


		ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, this.indices);

		    const vertexCount = this.indices_count;
		    const type2 = ctx.UNSIGNED_SHORT;
		    ctx.drawElements(ctx.TRIANGLES, vertexCount, type2, offset);
  
};
GUIElement.prototype.update = function(elapsed) {

};

GUIElement.prototype.onImageLoad = function(ctx,image) {
  const positionBuffer = ctx.createBuffer();
  
    ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
  
    var x0 = this.vec3_position[0];
    var y0 = this.vec3_position[1];
    var z0 = this.vec3_position[2];
    
    var w = image.width / ctx.canvas.clientWidth;
    var h = image.height / ctx.canvas.clientHeight;

    const positions = [
      x0    ,y0   ,z0 ,  
      x0+w  ,y0   ,z0 ,
      x0    ,y0+h ,z0 ,
      x0+w  ,y0+h ,z0 ,
    ];
  
    ctx.bufferData(ctx.ARRAY_BUFFER,
                  new Float32Array(positions),
                  ctx.STATIC_DRAW);
  
    this.position = positionBuffer;
  
};
  


  