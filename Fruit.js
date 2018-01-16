Fruit = function(ctx,vec3_position,generator) {
    this.generator = generator;

    var pos = [
        vec3_position[0],
        vec3_position[1]+ 0.5,
        vec3_position[2],
        ]

    this.mesh = new Sphere(ctx,pos,0.5);

    var bot_left = [pos[0]-0.25,pos[2]-0.25];
    var top_right = [pos[0]+0.25,pos[2]+0.25];

    this.bound = new BoundRectangle(bot_left,top_right);
}

Fruit.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.mesh.render(ctx,viewMatrix,projectionMatrix);
};

Fruit.prototype.update = function(elapsed,keysPressed) {
   this.mesh.update(elapsed,keysPressed);
};

