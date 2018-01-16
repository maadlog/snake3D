BoundRectangle = function(bottom_left,top_right)
{
    this.top_right = top_right;
    this.bottom_left = bottom_left;
}
BoundRectangle.prototype.collides = function(anAABR) { //Axis Aligned rectangles
    return this.touchesSquare( anAABR.bottom_left,anAABR.top_right ) 

};
BoundRectangle.prototype.touchesSquare = function(bottom_left,top_right) { //Axis Aligned rectangles
    return this.top_right[0] > bottom_left[0]
        && this.bottom_left[0] < top_right[0]
        && this.top_right[1] > bottom_left[1]
        && this.bottom_left[1] < top_right[1] 
    }
BoundRectangle.prototype.update = function(bottom_left,top_right)
{
    this.top_right = top_right;
    this.bottom_left = bottom_left;
}