GameCamera = function(ctx,htmlCanvas) {
	this.ctx = ctx;
	
	this.up = vec3.fromValues(0,1.0,0);
	this.eye = vec3.fromValues(0.0,0.0,-10.0);
	this.direction = vec3.fromValues(0.0,0.0,1.0);
  	this.speed = 0.2;
  	this.rotSpeed = 0.02;

	keysPressed = {};

	this.rotationMatrix = mat4.create();

	this.yaw = 0;
	this.pitch = 0;
  this.fix_pitch = 0;
  this.var_pitch = 0;
	this.roll = 0;
  this.fix_roll = 0;
  this.var_roll = 0;

  this.mouseDown = false;
  this.lastMouseX = null;
  this.lastMouseY = null;
  this.deltaX = null;
  this.deltaY = null;


	/*
	htmlCanvas.addEventListener("touchstart", touchDown, false);
	htmlCanvas.addEventListener("touchmove", touchXY, true);
	htmlCanvas.addEventListener("touchend", touchUp, false);
	document.body.addEventListener("touchcancel", touchUp, false);
	*/



  htmlCanvas.addEventListener("mousedown", handleMouseDown(this), true);  
  htmlCanvas.addEventListener("mousemove", handleMouseMove(this), true);
  document.body.addEventListener("mouseup", handleMouseUp(this), false);
	
}

function handleMouseDown(camera) {
  return function(event) {
    camera.mouseDown = true;
    var height = event.currentTarget.clientHeight;
    var width = event.currentTarget.clientWidth;
    camera.lastMouseX = event.clientX - width / 2;
    camera.lastMouseY = event.clientY - height / 2;
  };
}

  function handleMouseUp(camera) {
  return function(event) {
    camera.mouseDown = false;
     camera.fix_pitch = camera.fix_pitch + camera.var_pitch;
     camera.var_pitch = 0;

     camera.fix_roll = camera.fix_roll + camera.var_roll;
     camera.var_roll = 0;
  }
}


  function handleMouseMove(camera) {
  return function(event) {
    if (!camera.mouseDown) {
      return;
    }

    var height = event.currentTarget.clientHeight;
    var width = event.currentTarget.clientWidth;
    var newX = event.clientX - width / 2;
    var newY = event.clientY - height / 2;

//    camera.lastMouseX = newX;
//    camera.lastMouseY = newY;
    
    camera.deltaX = newX - camera.lastMouseX;
    camera.deltaY = newY - camera.lastMouseY;
  }
}

GameCamera.prototype.follow = function() {}
GameCamera.prototype.update = function(timeElapsed,keysPressed) {
	var rotationMatrix = mat4.create();
	
	mat4.rotate(rotationMatrix, rotationMatrix, this.pitch, vec3.fromValues(0.0,1.0,0.0));
  	mat4.rotate(rotationMatrix, rotationMatrix, this.yaw, vec3.fromValues(0.0,0.0,1.0));
  	mat4.rotate(rotationMatrix, rotationMatrix, this.roll, vec3.fromValues(1.0,0.0,0.0));

  	this.rotationMatrix = rotationMatrix;


  	var direction = vec3.create();
		var up = vec3.create();
		var cross = vec3.create();
		vec3.transformMat4(direction,this.direction,this.rotationMatrix);
		vec3.transformMat4(up,this.up,this.rotationMatrix);
		vec3.cross(cross,direction,up);

		vec3.scale(cross,cross,this.speed);
		vec3.scale(direction,direction,this.speed);
		vec3.scale(up,up,this.speed);
		
    if(keysPressed["KeyW"]) {
    	 vec3.add(this.eye,this.eye,direction);
      }
    if(keysPressed["KeyQ"]) {
        vec3.subtract(this.eye,this.eye,cross);			  			
      }
    if(keysPressed["KeyS"]) { 
    	 vec3.subtract(this.eye,this.eye,direction);
    	}
    if(keysPressed["KeyE"]) { 
    	 vec3.add(this.eye,this.eye,cross);
    	}
    if(keysPressed["Space"]) { 
    	 vec3.add(this.eye,this.eye,up);
    	}
    if(keysPressed["ShiftLeft"]) { 
    	 vec3.subtract(this.eye,this.eye,up);
    	}
    if(keysPressed["KeyA"]) { 
    	 this.fix_pitch += this.rotSpeed;
    	}
    if(keysPressed["KeyD"]) { 
    	 this.fix_pitch -= this.rotSpeed;
    	}

      if (this.mouseDown) {
          this.var_pitch = -this.deltaX /500;    
          this.var_roll = this.deltaY /500;    
      }
    	
      this.pitch = this.fix_pitch + this.var_pitch;
      this.roll = this.fix_roll + this.var_roll;


};

GameCamera.prototype.projectionMatrix = function() {

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

GameCamera.prototype.viewMatrix = function() {
  
  var lookAt = vec3.create();
  var rotationMatrix = mat4.create();

  var direction = vec3.create();
  var up = vec3.create();

  vec3.transformMat4(direction,this.direction,this.rotationMatrix);
  vec3.transformMat4(up,this.up,this.rotationMatrix);
  vec3.add(lookAt,this.eye,direction)
  
  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, this.eye, lookAt, up);

  return viewMatrix;
};