Path = function(ctx,bike,vec3_position,initial_direction,max_length,secondary) {
    this.lines = [];
    this.ctx = ctx;
    this.secondary = secondary;
    this.max_length = max_length ? max_length : Path.MAX_LENGTH

    this.bike = bike;
    this.createLine(vec3_position,initial_direction);
    
}
Path.MAX_LENGTH = 25;

Path.prototype.createLine = function(mesh_centerXZ,direction) {	


    var position = vec3.create();
    vec3.add(position,
        mesh_centerXZ,
        [-0.0001,0.0,+0.00001]) // minus Half X scale

        var self = this;
    var mesh = new PathPiece(this.ctx,position,direction,this.max_length,this.secondary);

        if( self.lines.length > 0) self.lines[self.lines.length - 1].updatePosition(mesh_centerXZ);   
        self.lines.push(mesh);
    

   
};

Path.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.lines.forEach(element => {
        element.render(ctx,viewMatrix,projectionMatrix);
    });
};

Path.prototype.checkCollision = function(piece,bound) {	
    return piece.bound.collides(bound);
};
Path.prototype.update = function(elapsed,keysPressed) {
    var self = this;
    this.lines.forEach((element,index) => {
        element.update(elapsed,keysPressed["KeyV"],index);

        if (self.colliding && self.checkCollision(element,self.colliding.bound))
        {
            element.hit = true;
            self.colliding.die();
        }

        //Auto colision
        if (index < self.lines.length - 2 && self.bike && self.checkCollision(element,self.bike.bound))
        {
            element.hit = true;
            self.bike.die();
        }
    });
    
    var len = this.length();
    if(len > this.max_length)
    {
        var negativeDif = this.max_length - len;
        if (this.lines.length > 1) this.lines[0].turn();
        this.lines[0].setLength(this.lines[0].length + negativeDif)
    }
    this.lines = this.lines.filter( function(line,index) {
        return line.length > 0 });
};
Path.prototype.updatePosition = function(newPostion) {
    this.lines[this.lines.length - 1].updatePosition(newPostion);   
};

Path.prototype.length = function() {

    var len = 0;
    for (let index = 0; index < this.lines.length; index++) {
        len += this.lines[index].length;
    }
    return len;

}
Path.prototype.extend = function(value) {
    
    this.max_length +=value; 
    }


    Path.prototype.collide = function(abike) {
        
        this.colliding = abike; 
        }
