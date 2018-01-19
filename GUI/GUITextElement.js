GUITextElement = function(ctx,botLeft,absolute,scale,font,value) {
    
var cw = ctx.canvas.clientWidth;
var ch = ctx.canvas.clientHeight;

this.ctx = ctx;
var pos = [ (-(cw) + botLeft[0]) / cw ,
  (-(ch) + botLeft[1]) / ch ,
    0.0];

    this.vec3_position =  pos;
    this.scale = scale;
    this.fontInfo = font;
    this.value = value;

	GameObject.call(this,ctx,new GUIMaterial(ctx,font.url,this));
}
GUITextElement.prototype = Object.create(GameObject.prototype);
GUITextElement.prototype.constructor = GUITextElement;

GUITextElement.prototype.initBuffers = function(ctx) {
	const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  var x0 = this.vec3_position[0];
  var y0 = this.vec3_position[1];
  var z0 = this.vec3_position[2];
  
  const positions = [
    x0      ,y0     ,
    x0+0.1  ,y0     ,
    x0      ,y0+0.1 ,
    x0+0.1  ,y0+0.1 ,
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

GUITextElement.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
	if(this.hidden) return;
    this.material.renderBind(ctx,this.transformMatrix,viewMatrix,projectionMatrix);


	    const numComponents = 2;  // pull out 2 values per iteration
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
GUITextElement.prototype.update = function(elapsed) {

};

GUITextElement.prototype.onImageLoad = function(ctx,image) {
  
    
    var cw = ctx.canvas.clientWidth;
    var ch = ctx.canvas.clientHeight;
    var sc = this.scale;


    var s = this.value;
    var len = s.length;
    var numVertices = len * 6;
    var positions = new Float32Array(numVertices * 2);
    var texcoords = new Float32Array(numVertices * 2);
    var offset = 0;
    var x = this.vec3_position[0];
    var y = this.vec3_position[1];
    var maxX = this.fontInfo.textureWidth;
    var maxY = this.fontInfo.textureHeight;
    for (var ii = 0; ii < len; ++ii) {
      var letter = s[ii];
      var glyphInfo = this.fontInfo.glyphInfos[letter];
      if (glyphInfo) {
        var x2 = x + glyphInfo.width * sc / cw;
        var u1 = glyphInfo.x / maxX;
        var v1 = (glyphInfo.y + this.fontInfo.letterHeight - 1) / maxY;
        var u2 = (glyphInfo.x + glyphInfo.width - 1) / maxX;
        var v2 = glyphInfo.y / maxY;
  
        // 6 vertices per letter
        positions[offset + 0] = x;
        positions[offset + 1] = y;
        texcoords[offset + 0] = u1;
        texcoords[offset + 1] = v1;
  
        positions[offset + 2] = x2;
        positions[offset + 3] = y;
        texcoords[offset + 2] = u2;
        texcoords[offset + 3] = v1;
  
        positions[offset + 4] = x;
        positions[offset + 5] = y+(this.fontInfo.letterHeight * sc  / ch);
        texcoords[offset + 4] = u1;
        texcoords[offset + 5] = v2;
  
        positions[offset + 6] = x ;
        positions[offset + 7] = y+(this.fontInfo.letterHeight *sc / ch);
        texcoords[offset + 6] = u1;
        texcoords[offset + 7] = v2;
  
        positions[offset + 8] = x2 ;
        positions[offset + 9] = y ;
        texcoords[offset + 8] = u2;
        texcoords[offset + 9] = v1;
  
        positions[offset + 10] = x2 ;
        positions[offset + 11] = y+(this.fontInfo.letterHeight *sc / ch);
        texcoords[offset + 10] = u2;
        texcoords[offset + 11] = v2;
  
        x += (glyphInfo.width + this.fontInfo.spacing) *sc/cw;
        offset += 12;
      } else {
        // we don't have this character so just advance
        x += this.fontInfo.spaceWidth;
      }
    }

    const positionBuffer = ctx.createBuffer();
    
    ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

    ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

    this.position = positionBuffer;

    const textureCoordBuffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, textureCoordBuffer);

    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texcoords),
                  ctx.STATIC_DRAW);
    
    this.textureCoord = textureCoordBuffer;
    

      
      const indexBuffer = ctx.createBuffer();
      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
      
      var indicesArray = [];
      var myoffset = 0;
      for (let index = 0; index < s.length; index++) {
          var idxes = [myoffset,myoffset+1,myoffset+2,myoffset+3,myoffset+4,myoffset+5]
          myoffset = myoffset + 6;
          indicesArray = indicesArray.concat(idxes); 
      }
    
      ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(indicesArray), ctx.STATIC_DRAW);
      this.indices_count = indicesArray.length;
      this.indices = indexBuffer;

};
  


  