
Bike = function(ctx,vec3_position,secondary) {
    this.mesh = new Cube(ctx,vec3_position,1);
    this.mesh.scale([0.5,0.7,1.0]);

    this.bound = this.mesh.bound;
    this.path = new Path(ctx,this, this.mesh.getMovingCenterXZ(),Bike.UP,undefined,secondary);
    this.secondary = secondary;
    this.controls = secondary? Controls.SECONDARY_CONTROLS : Controls.DEFAULT_CONTROLS

    this.stopped = false;
    this.finished = false;
    this.bike_direction = Bike.UP;
    this.speed = 10; // u por seg
    this.time = 0;

    this.grace = Bike.DEFAULT_GRACE;
}
Bike.DEFAULT_GRACE = 300;

Bike.UP = {
    id: "UP",
    vector: [0.0,0.0,1.0],
    rotation: 0.0,
    opositeAngle: Math.PI,
    restrains: function(another)
    {
        return another.id == Bike.UP.id || another.id == Bike.DOWN.id;
    },
    clockwiseNext: function() { return Bike.LEFT; }
};
Bike.DOWN = {
    id: "DOWN",
    vector: [0.0,0.0,-1.0],
    rotation: Math.PI,
    opositeAngle: 0.0,
    restrains: function(another)
    {
        return another.id == Bike.UP.id || another.id == Bike.DOWN.id;
    },
    clockwiseNext: function() { return Bike.RIGHT; }
};
Bike.LEFT = {
    id: "LEFT",
    vector: [1.0,0.0,0.0],
    rotation: Math.PI/2,
    opositeAngle: -Math.PI/2,
    restrains: function(another)
    {
        return another.id == Bike.LEFT.id || another.id == Bike.RIGHT.id;
    },
    clockwiseNext: function() { return Bike.DOWN; }
};
Bike.RIGHT = {
    id: "RIGHT",
    vector: [-1.0,0.0,0.0],
    rotation: -Math.PI/2,
    opositeAngle: Math.PI/2,
    restrains: function(another)
    {
        return another.id == Bike.LEFT.id || another.id == Bike.RIGHT.id;
    },
    clockwiseNext: function() { return Bike.UP; }
};

Bike.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.mesh.render(ctx,viewMatrix,projectionMatrix);
    this.path.render(ctx,viewMatrix,projectionMatrix);
};

Bike.prototype.update = function(elapsed,keysPressed) {
    this.grace = this.grace >0 ? this.grace - elapsed : -1;
    if(keysPressed[Controls.PAUSE] && this.grace <= 0) {
        this.stopped = true;
    }
    if(keysPressed[Controls.UNPAUSE] && this.grace <= 0) {
        this.stopped = false;
    }
    
    if(this.stopped || this.finished) { 
     //   return; 
    }else {
        this.moveFoward(elapsed);}
        var pos = this.mesh.getMovingCenterXZ();

        if(keysPressed[this.controls.up] && this.grace <= 0) {
            
            this.changeDirection(Bike.UP,pos);
        }
        
        if(keysPressed[this.controls.down] && this.grace <= 0) {
            
            this.changeDirection(Bike.DOWN,pos);
        }
        
        if(keysPressed[this.controls.left] && this.grace <= 0) {
            this.changeDirection(Bike.LEFT,pos);
        }
        
        if(keysPressed[this.controls.right] && this.grace <= 0) {
            this.changeDirection(Bike.RIGHT,pos);
        }

        if( !keysPressed[this.controls.up]
         && !keysPressed[this.controls.down] 
         && !keysPressed[this.controls.left]
         && !keysPressed[this.controls.right]
         )
        {
            this.rotated = false;
        }
        this.mesh.update(elapsed);
        this.path.updatePosition(pos);
        this.path.update(elapsed,keysPressed);
};

Bike.prototype.moveFoward = function(elapsed) {
    var desp = elapsed * this.speed / 1000;
    var vector = vec3.create();
    vec3.scale(vector,this.bike_direction.vector,desp);
    this.mesh.translate(vector);
};

Bike.prototype.changeDirection = function(direction,center) {
    if (this.rotated || this.bike_direction.restrains(direction)) return;
    
    this.bike_direction = direction;
    this.mesh.setYrotation(direction.rotation);
    this.path.createLine(center,direction);
    this.rotated = true;
};
Bike.prototype.restrain = function() {
    if(this.grace > 0) return;
    this.changeDirection(this.bike_direction.clockwiseNext(),this.mesh.getMovingCenterXZ())
    this.grace = Bike.DEFAULT_GRACE;
}

Bike.prototype.reward = function() {
    this.path.extend(5);
}

Bike.prototype.die = function() {
    EndGame((this.secondary?"green":"red")+"wins!");
}

Bike.prototype.stop = function() {
    this.finished = true;
}






BikeComposite = function(bikes)
{
    this.bikes = bikes;
}

BikeComposite.prototype.notifyCamera = function(camera) {	
    camera.follow(this);
};

BikeComposite.prototype.getMovingCenter = function(refDistance) {

    var posA = this.bikes[0].mesh.getMovingCenter();
    var posB = this.bikes[1].mesh.getMovingCenter();
       
    var x = posA[0] + posB[0];
    var y = posA[1] + posB[1];
    var z = posA[2] + posB[2];

  
    return [x/2 ,y/2,z/2];
}