var game = {};

function Init(){
  
  game = new GameBox('canvas');


  var bike = new Bike(game.ctx,vec3.fromValues(10,-10,0));
  game.register(bike);
  game.cameraFollow(bike);

  var o1 = new Obstacle(game.ctx,vec3.fromValues(0,-10,10),vec3.fromValues(8,1,8));
  var o2 = new Obstacle(game.ctx,vec3.fromValues(20,-10,10),vec3.fromValues(4,1,4));
  var o3 = new Obstacle(game.ctx,vec3.fromValues(40,-10,20),vec3.fromValues(2,1,2));
  game.register(o1);
  game.register(o2);
  game.register(o3);


  var field_leftbottom = vec3.fromValues(-50,-10,-50);
  var field_size = 100;

  var fruitGenerator = new FruitGenerator(game.ctx,field_leftbottom,field_size,bike);
  game.register(fruitGenerator);


  var field = new XZPlane(game.ctx,field_leftbottom,field_size);
  field.restrain(bike);
  game.register(field);

  game.gameLoop();

  
}