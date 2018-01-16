
GameBox = function(canvas_id) {
    this.lastFrameTime = Date.now();
    this.currentFrameTime = Date.now();
    this.timeElapsed = 0;

    this.gameObjects = [];
    this.keysPressed = {};

    var htmlCanvas = document.getElementById(canvas_id);
    this.canvas = htmlCanvas;
    this.resize();

    this.ctx = htmlCanvas.getContext("webgl");
    if (!this.ctx) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }
    this.ctx.getExtension('OES_standard_derivatives');

    this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE);
    this.ctx.disable(this.ctx.BLEND);
    this.ctx.enable(this.ctx.DEPTH_TEST);

	document.body.addEventListener("keydown", keyPress(this), true);
	document.body.addEventListener("keyup", keyUp(this), true);

    this.pauseCamera = new GameCamera(this.ctx,htmlCanvas);
    this.camera = new FollowCamera(this.ctx,htmlCanvas);
}

var keyPress = function(box) {
	return function(event) { 
		box.logKey(event);
	};
}

var keyUp = function(box) {
	return function(event) { 
		box.logKey(event);
	};
}

GameBox.prototype.logKey = function(event) {
    this.keysPressed[event.code] = event.type == "keydown";
};

GameBox.prototype.cameraFollow = function(object) {
    object.notifyCamera(this.camera);
};

GameBox.prototype.resize = function(aGameObject) {
   
    var displayWidth = this.canvas.clientWidth;
    var displayHeight = this.canvas.clientHeight;

    if( this.canvas.width != displayWidth ||
        this.canvas.height != displayHeight )
    {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
    }
    
};


GameBox.prototype.gameLoop = function()
{
   window.requestAnimationFrame(this.gameLoop.bind(this));
   this.lastFrameTime = this.currentFrameTime;
   this.currentFrameTime = Date.now();
   this.timeElapsed =  this.currentFrameTime - this.lastFrameTime ;

   this.resize();
   this.ctx.viewport(0,0,this.canvas.width,this.canvas.height);

   this.update(this.timeElapsed); //modify data which is used to render
   this.render();
}

GameBox.prototype.register = function(aGameObject) {
    this.gameObjects.push(aGameObject);
};

GameBox.prototype.update = function(timeElapsed)
{
    if(this.keysPressed["KeyT"]) { 
        
        var aux = this.camera;
        this.camera = this.pauseCamera;
        this.pauseCamera = aux;
       }

    this.camera.update(timeElapsed,this.keysPressed);
    var keys = this.keysPressed;
    this.gameObjects.forEach( function (value,index,array) {
            value.update(timeElapsed,keys);
        });
}

GameBox.prototype.render= function()
{
  this.ctx.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  this.ctx.clearDepth(1.0);                 // Clear everything
  this.ctx.enable(this.ctx.DEPTH_TEST);           // Enable depth testing
  this.ctx.depthFunc(this.ctx.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);

  const projectionMatrix = this.camera.projectionMatrix();
  const viewMatrix = this.camera.viewMatrix();

  for (var i = this.gameObjects.length - 1; i >= 0; i--) {
	  this.gameObjects[i].render(this.ctx,viewMatrix,projectionMatrix);
	}

}

