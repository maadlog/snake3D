var game = {};
function EndGame(message) {
  var cw = game.ctx.canvas.clientWidth;
  var ch = game.ctx.canvas.clientHeight;
  var bottom_left_position = [cw/3,ch/3,0.0]
  var scale = 8;
  var guimarker = new GUITextElement(game.ctx,bottom_left_position,true,scale,
    Glyph.DEFAULT_FONT,
    message);
  game.register(guimarker);

  game.stop();
}
function Init(){
  
  game = new GameBox('canvas');

  var cw = game.ctx.canvas.clientWidth;
  var ch = game.ctx.canvas.clientHeight;

  var bottom_left_position = [cw/4,cw/8,0]
  var scale = [2,2];
  var guimarker = new GUIImageElement(game.ctx,bottom_left_position,false,scale,
    "https://maadlog.github.io/snake3D/GUI/snake.png");

  var bottom_left_position = [-1,-1,0.5]
  var scale = [2,2];
  var guiback = new GUIImageElement(game.ctx,bottom_left_position,true,scale,
    "https://maadlog.github.io/snake3D/GUI/black.png");

  var bottom_left_position = [cw,ch,0.0]
  var scale = 8;
  var guitext = new GUITextElement(game.ctx,bottom_left_position,true,scale,
    Glyph.DEFAULT_FONT,
    "loading!!");

  var bottom_left_position = [cw,ch*2/3,0.0]
  var guitext2 = new GUITextElement(game.ctx,bottom_left_position,true,scale,
      Glyph.DEFAULT_FONT,
      "press");

  var bottom_left_position = [cw* 4/3,ch*2/3,0.0]
  var guitext3 = new GUITextElement(game.ctx,bottom_left_position,true,scale,
      Glyph.DEFAULT_FONT,
      "-y-");

  var bottom_left_position = [cw,ch*3/6,0.0]
  var guitext4 = new GUITextElement(game.ctx,bottom_left_position,true,scale,
      Glyph.DEFAULT_FONT,
      "tostart");


  guitext2.waitUser = true;
  guitext3.waitUser = true;
  guitext4.waitUser = true;

  game.register(guiback);
  game.register(guimarker);
  game.register(guitext);
  game.register(guitext2);
  game.register(guitext3);
  game.register(guitext4);
  
  game.ui([guiback,guimarker,guitext,guitext2,guitext3,guitext4]);



  var bike = new Bike(game.ctx,vec3.fromValues(5,-10,0),false);
  var rival = new Bike(game.ctx,vec3.fromValues(-5,-10,0),true);

  bike.stopped = true;
  rival.stopped = true;

  game.register(bike);
  game.register(rival);

  game.cameraFollow(new BikeComposite([bike,rival]));

 
  bike.path.collide(rival);
  rival.path.collide(bike);


  var field_leftbottom = vec3.fromValues(-50,-10,-50);
  var field_size = 100;

  var fruitGenerator = new FruitGenerator(game.ctx,field_leftbottom,field_size,[bike,rival],game);
  game.register(fruitGenerator);


  var field = new XZPlane(game.ctx,field_leftbottom,field_size);
  field.restrain(bike);
  field.restrain(rival);
  game.register(field); 

  var o1 = new Obstacle(game.ctx,vec3.fromValues(-51,-10,-51),vec3.fromValues(field_size+2,-2,1));
  var o2 = new Obstacle(game.ctx,vec3.fromValues(-51,-10,-51),vec3.fromValues(1,-2,field_size+2));
  var o3 = new Obstacle(game.ctx,vec3.fromValues(50,-10,-51),vec3.fromValues(1,-2,field_size+2));
  var o4 = new Obstacle(game.ctx,vec3.fromValues(-51,-10,50),vec3.fromValues(field_size+2,-2,1));
  game.register(o1);
  game.register(o2);
  game.register(o3);
  game.register(o4);

  
  

  // var bottom_left_position = [100,100,0.0]
  // var scale = 8;
  // var guimarker = new GUITextElement(game.ctx,bottom_left_position,true,scale,
  //   Glyph.DEFAULT_FONT,
  //   "tron");


  // var bottom_left_position = [100,100,0.0]
  // var scale = [1,1];
  // var guimarker = new GUIImageElement(game.ctx,bottom_left_position,true,scale,
  //   "https://maadlog.github.io/snake3D/GUI/snake.png");
  
  //game.register(guimarker);
  
  game.gameLoop();

  
}