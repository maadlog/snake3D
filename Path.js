Path = function(ctx,vec3_position,initial_rot,max_length) {
    this.lines = [];
    this.ctx = ctx;
    this.actual_rot = initial_rot;
    
    this.max_length = max_length ? max_length : Path.MAX_LENGTH

    this.createLine(vec3_position,initial_rot,initial_rot);
    
}
Path.MAX_LENGTH = 25;

Path.prototype.createLine = function(mesh_centerXZ,rotation) {	


    var position = vec3.create();
    vec3.add(position,
        mesh_centerXZ,
        [-0.0001,0.0,+0.00001]) // minus Half X scale

    var mesh = new PathPiece(this.ctx,position,rotation,this.max_length);

    if( this.lines.length > 0) this.lines[this.lines.length - 1].updatePosition(mesh_centerXZ);   
    this.lines.push(mesh);

   
};

Path.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.lines.forEach(element => {
        element.render(ctx,viewMatrix,projectionMatrix);
    });
};

Path.prototype.update = function(elapsed,keysPressed) {
    this.lines.forEach(element => {
        element.update(elapsed);
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

