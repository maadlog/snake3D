Obstacle = function(ctx,vec3_position,vec3_scale) {
    this.mesh = new Cube(ctx,vec3_position,1,[0.1,0.1,0.1,0.5]);

    this.mesh.scale(vec3_scale);
}

Obstacle.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.mesh.render(ctx,viewMatrix,projectionMatrix);
};

Obstacle.prototype.update = function(elapsed,keysPressed) {
    this.mesh.update(elapsed);
};
