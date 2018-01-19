GUIImageElement = function(ctx,botLeft,absolute,scale,url) {
    
var cw = ctx.canvas.clientWidth;
var ch = ctx.canvas.clientHeight;

this.ctx = ctx;
var pos = [ (-(cw) + botLeft[0]) / cw ,
  (-(ch) + botLeft[1]) / ch ,
    0.0];

    this.absolute = absolute;
    this.vec3_position = absolute ? botLeft : pos;
    this.scale = scale;


	GameObject.call(this,ctx,new GUIMaterial(ctx,url,this));
}
GUIImageElement.prototype = Object.create(GameObject.prototype);
GUIImageElement.prototype.constructor = GUIImageElement;

GUIImageElement.prototype.initBuffers = function(ctx) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  var x0 = this.vec3_position[0];
  var y0 = this.vec3_position[1];
  var z0 = this.vec3_position[2];
  
  const positions = [
    x0      ,y0     ,z0 ,  
    x0+0.1  ,y0     ,z0 ,
    x0      ,y0+0.1 ,z0 ,
    x0+0.1  ,y0+0.1 ,z0 ,
  ];

  ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

  this.position = positionBuffer;

  

const textureCoordBuffer = ctx.createBuffer();
ctx.bindBuffer(ctx.ARRAY_BUFFER, textureCoordBuffer);

const textureCoordinates = [
  // Front
  0.0,  1.0,
  1.0,  1.0,
  0.0,  0.0,
  1.0,  0.0
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

GUIImageElement.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
	if(this.hidden) return;
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
GUIImageElement.prototype.update = function(elapsed) {

};

GUIImageElement.prototype.onImageLoad = function(ctx,image) {
  const positionBuffer = ctx.createBuffer();
  
    ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);
  
    var x0 = this.vec3_position[0];
    var y0 = this.vec3_position[1];
    var z0 = this.vec3_position[2];

    var scalex = this.scale[0];
    var scaley = this.scale[1];

    var w = image.width * scalex / ctx.canvas.clientWidth;
    var h = image.height * scaley / ctx.canvas.clientHeight;

    var positions = [];
    if(this.absolute){
      positions = [
        x0    ,y0   ,z0 ,  
        x0+scalex  ,y0   ,z0 ,
        x0    ,y0+scaley ,z0 ,
        x0+scalex  ,y0+scaley ,z0 ,
      ];
    } else {
      positions = [
        x0    ,y0   ,z0 ,  
        x0+w  ,y0   ,z0 ,
        x0    ,y0+h ,z0 ,
        x0+w  ,y0+h ,z0 ,
      ];
    }
  
    ctx.bufferData(ctx.ARRAY_BUFFER,
                  new Float32Array(positions),
                  ctx.STATIC_DRAW);
  
    this.position = positionBuffer;
  
};
  


  