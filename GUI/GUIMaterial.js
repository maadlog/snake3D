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

      if(gl_FragColor.a < 0.4 )
      {
        discard;
      }
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