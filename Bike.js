
Bike = function(ctx,vec3_position) {
    this.mesh = new Cube(ctx,vec3_position,1);
    this.mesh.scale([0.5,0.7,1.0]);

    this.bound = this.mesh.bound;
    this.path = new Path(ctx, this.mesh.getMovingCenterXZ(),0);
    
    this.stopped = false;
    this.forceStop = false;
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
    restrains: function(another)
    {
        return another.id == Bike.LEFT.id || another.id == Bike.RIGHT.id;
    },
    clockwiseNext: function() { return Bike.UP; }
};

Bike.prototype.notifyCamera = function(camera) {	
    camera.follow(this.mesh);
};

Bike.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.mesh.render(ctx,viewMatrix,projectionMatrix);
    this.path.render(ctx,viewMatrix,projectionMatrix);
};

Bike.prototype.update = function(elapsed,keysPressed) {
    this.grace -= this.grace > 0 ? elapsed : 0;
    if(keysPressed["KeyY"] && this.grace <= 0) {
        this.stopped = true;
    }
    if(keysPressed["KeyH"] && this.grace <= 0) {
        this.stopped = false;
    }
    
    if((this.stopped)) { 
     //   return; 
    }else {
        this.moveFoward(elapsed);}
        var pos = this.mesh.getMovingCenterXZ();

        if(keysPressed["KeyI"] && this.grace <= 0) {
            
            this.changeDirection(Bike.UP,pos);
        }
        
        if(keysPressed["KeyK"] && this.grace <= 0) {
            
            this.changeDirection(Bike.DOWN,pos);
        }
        
        if(keysPressed["KeyJ"] && this.grace <= 0) {
            this.changeDirection(Bike.LEFT,pos);
        }
        
        if(keysPressed["KeyL"] && this.grace <= 0) {
            this.changeDirection(Bike.RIGHT,pos);
        }

        if( !keysPressed["KeyL"]
         && !keysPressed["KeyK"] 
         && !keysPressed["KeyJ"]
         && !keysPressed["KeyI"])
        {
            this.rotated = false;
        }
        this.mesh.update(elapsed);
        this.path.updatePosition(pos);
        this.path.update(elapsed);
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
    this.path.createLine(center,direction.rotation);
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