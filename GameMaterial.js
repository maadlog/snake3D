GameMaterial = function (ctx,vsSource,fsSource) {
	this.vsSource = vsSource ? vsSource : `
	attribute vec4 aVertexPosition;
	attribute vec4 aVertexColor;

	uniform mat4 uModelMatrix;
	uniform mat4 uViewMatrix;
	uniform mat4 uProjectionMatrix;

	varying lowp vec4 vColor;

	void main() {
	  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
	  vColor = aVertexColor;
	}
	`;
	this.fsSource = fsSource ? fsSource : `
	varying lowp vec4 vColor;

	void main() {	
	  	gl_FragColor = vColor;
	}
	`;

    var shaderProgram = this.initShaderProgram(ctx);
    this.programInfo = {
      program: shaderProgram,
      attribLocations: this.getAttribLocations(ctx,shaderProgram),
      uniformLocations: this.getUniformLocations(ctx,shaderProgram),
    };

}

GameMaterial.prototype.initShaderProgram = function(ctx)
{
  const vertexShader = this.loadShader(ctx, ctx.VERTEX_SHADER, this.vsSource);
  const fragmentShader = this.loadShader(ctx, ctx.FRAGMENT_SHADER, this.fsSource);

  // Create the shader program

  const shaderProgram = ctx.createProgram();
  ctx.attachShader(shaderProgram, vertexShader);
  ctx.attachShader(shaderProgram, fragmentShader);
  ctx.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + ctx.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

GameMaterial.prototype.loadShader = function(ctx ,type, source) {
  const shader = ctx.createShader(type);
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);

  if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + ctx.getShaderInfoLog(shader));
    ctx.deleteShader(shader);
    return null;
  }
  return shader;
}

//OVERRIDEABLES

GameMaterial.prototype.getAttribLocations = function(ctx,shaderProgram)
{
   return {
		vertexPosition: ctx.getAttribLocation(shaderProgram, 'aVertexPosition'),
		vertexColor: ctx.getAttribLocation(shaderProgram, 'aVertexColor'),
	};
}

GameMaterial.prototype.getUniformLocations = function(ctx,shaderProgram)
{
   return  {
		modelMatrix: ctx.getUniformLocation(shaderProgram, 'uModelMatrix'),
		viewMatrix: ctx.getUniformLocation(shaderProgram, 'uViewMatrix'),
		projectionMatrix: ctx.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
	};
}

GameMaterial.prototype.renderBind = function(ctx,transformMatrix,viewMatrix,projectionMatrix) {
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

};

GameMaterial.prototype.update = function() {
	
}

/*
 * For new game materials:
 * MyNewMaterial = function(ctx) {
 * 	
 * 
 * 	// Logic Here //
 * 
 * 	GameMaterial.call(this,ctx,vsSource,fsSource);
 * 
 * }
 * MyNewMaterial.prototype = Object.create(GameMaterial.prototype);
 * MyNewMaterial.prototype.constructor = MyNewMaterial;
 * 
 * GameMaterial.prototype.getAttribLocations = function(ctx,shaderProgram) { [...] }
 * 
 * GameMaterial.prototype.getUniformLocations = function(ctx,shaderProgram) { [...] }
 * 
 * GameMaterial.prototype.renderBind = function(ctx,transformMatrix,viewMatrix,projectionMatrix) { [...] }
 */