Sphere = function(ctx,vec3_position,radius) {
  this.vec3_position = vec3_position;
  this.radius = radius;
  this.longitude_stripes = 45;
  this.latitude_stripes = 45;

  this.rotation = 0.0;
 
    GameObject.call(this,ctx);     
  

}
Sphere.prototype = Object.create(GameObject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.initBuffers = function(ctx) {
    var positions = [];
    var colorsArray = [];

    for (var latNumber = 0; latNumber <= this.latitude_stripes; latNumber++) {
      var theta = latNumber * Math.PI / this.latitude_stripes;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber = 0; longNumber <= this.longitude_stripes; longNumber++) {
        var phi = longNumber * 2 * Math.PI / this.longitude_stripes;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / this.longitude_stripes);
        var v = 1 - (latNumber / this.latitude_stripes);

        colorsArray.push((0.5 * Math.sin(u * 2* Math.PI)) + 1.0); //R
        colorsArray.push((0.5 * Math.sin(v * 2* Math.PI)) + 1.0); //G
        colorsArray.push((0.5 * Math.sin(v * 2* Math.PI)) + 1.0); //B
        colorsArray.push(1.0); // Alpha
        positions.push(this.radius * x);
        positions.push(this.radius * y);
        positions.push(this.radius * z);
      }
    }
  
  const positionBuffer = ctx.createBuffer();

  ctx.bindBuffer(ctx.ARRAY_BUFFER, positionBuffer);

  ctx.bufferData(ctx.ARRAY_BUFFER,
                new Float32Array(positions),
                ctx.STATIC_DRAW);

  this.position = positionBuffer;


  const colorBuffer = ctx.createBuffer();
  
  ctx.bindBuffer(ctx.ARRAY_BUFFER, colorBuffer);

  ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(colorsArray), ctx.STATIC_DRAW);
  
  this.colors = colorBuffer;





var indicesArray = [];
    for (var latNumber = 0; latNumber < this.latitude_stripes; latNumber++) {
      for (var longNumber = 0; longNumber < this.longitude_stripes; longNumber++) {
        var first = (latNumber * (this.longitude_stripes + 1)) + longNumber;
        var second = first + this.longitude_stripes + 1;
        indicesArray.push(first);
        indicesArray.push(second);
        indicesArray.push(first + 1);

        indicesArray.push(second);
        indicesArray.push(second + 1);
        indicesArray.push(first + 1);
      }
    }


  const indexBuffer = ctx.createBuffer();
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, indexBuffer);

  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indicesArray), ctx.STATIC_DRAW);
  this.indices_count = indicesArray.length;
  this.indices = indexBuffer;
};

Sphere.prototype.render = function(ctx,viewMatrix,projectionMatrix) {
  
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
       
      const numComponentsColor = 4;  
   
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


Sphere.prototype.update = function(time) {
  this.material.update(time);

  this.rotation += time * 0.001;  
  
  var x0 = this.vec3_position[0];
  var y0 = this.vec3_position[1];
  var z0 = this.vec3_position[2];

  this.transformMatrix = mat4.create();

  mat4.translate(this.transformMatrix,
    this.transformMatrix,
    [x0, y0, z0]);

  mat4.rotate(this.transformMatrix,
    this.transformMatrix,
    this.rotation,
    vec3.fromValues(0.0,1.0,0.0));
};


