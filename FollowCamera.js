FollowCamera = function(ctx,htmlCanvas) {
	this.ctx = ctx;
    
    this.altitude = 10;
    this.distance = 40;

	this.up = vec3.fromValues(0,1.0,0);
	this.eye = vec3.fromValues(0.0,0.0,-10.0);
	this.lookAt = vec3.fromValues(0.0,0.0,1.0);

}

FollowCamera.prototype.follow = function(mesh) {
    this.following = mesh;    
};

FollowCamera.prototype.update = function(timeElapsed,keysPressed) {
    if (!this.following) return;


    
    if(keysPressed["KeyW"]) {
        this.distance -= this.distance > 0.6 ? 0.5 : 0;
     }
    if(keysPressed["KeyS"]) { 
        this.distance += 0.5;
    }
    if(keysPressed["Space"]) { 
        this.altitude += this.altitude < 95 ? 0.5 : 0;
    }
    if(keysPressed["ShiftLeft"]) { 
        this.altitude -= this.altitude > 0.6 ? 0.5 : 0;
    }

    var rot = mat4.create();
    // mat4.rotate(rot,    
    //     rot,
    //     this.following.yrotation,
    //     [0.0,1.0,0.0]);

    var meshPosition = this.following.getMovingCenter();
    this.lookAt = meshPosition;

    var relativePosition = [0.0,this.altitude,-this.distance];
    var delta = [];
    vec3.transformMat4(delta,relativePosition,rot);

    vec3.add(this.eye,meshPosition,delta);
    

};

FollowCamera.prototype.projectionMatrix = function() {

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = this.ctx.canvas.clientWidth / this.ctx.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  return projectionMatrix;
};

FollowCamera.prototype.viewMatrix = function() {
  
  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, this.eye, this.lookAt, this.up);

  return viewMatrix;
};