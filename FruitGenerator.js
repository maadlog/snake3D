FruitGenerator = function(ctx,areaStart,size,bike) {

    this.fruits = [];
    this.ctx = ctx;
    this.bike = bike;
    var areaEnd = [];
    vec3.add(areaEnd,areaStart,[size,0.0,size]);
    this.generator = new RandomPoint(areaStart,areaEnd);
    this.time = 0;
    this.createFruit();
}
FruitGenerator.TIME_TO_CREATE = 100;
FruitGenerator.MAX_FRUITS = 50;

FruitGenerator.prototype.createFruit = function() {	
    var position = this.generator.getNewPoint();
    var fruit = new Fruit(this.ctx,position,this);
    this.fruits.push(fruit);
};

FruitGenerator.prototype.render = function(ctx,viewMatrix,projectionMatrix) {	
    this.fruits.forEach(element => {
        element.render(ctx,viewMatrix,projectionMatrix);
    });
};

FruitGenerator.prototype.update = function(elapsed,keysPressed) {
    this.time += elapsed;
    if(this.time >= FruitGenerator.TIME_TO_CREATE && this.fruits.length < FruitGenerator.MAX_FRUITS) { this.createFruit(); this.time = 0; }
    var self = this;
    this.fruits.forEach( function (element,index){
        element.update(elapsed,keysPressed);
        if (self.checkCollision(element,self.bike.bound))
        {
            self.deleteAt(index);
            self.bike.reward();
        }
    });
};

FruitGenerator.prototype.checkCollision = function(fruit,bound) {	
    return fruit.bound.collides(bound);
};
FruitGenerator.prototype.deleteAt = function(index) {	
    this.fruits.splice(index,1);
};


RandomPoint = function(areaStart,areaEnd) {    
    this.areaStart = areaStart;
    this.areaEnd = areaEnd;
}

RandomPoint.prototype.getRandomInt = function(min,max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max-min) + min);
  }


RandomPoint.prototype.getNewPoint = function() {
    return vec3.fromValues(
        this.getRandomInt(this.areaStart[0],this.areaEnd[0]),
        this.areaStart[1],
        this.getRandomInt(this.areaStart[2],this.areaEnd[2])
    );
}
    

