/*'use strict'; */

/*
0 - empty
1 - start position
2 - exit
3 - brick
*/

var draw_sensors = true;

var EMPTY = 0, BRICK = 3;
var LFT = 0, RGT = 1, TOP = 2, BTM = 3;

var level1 = [ 
	[3, 3, 3, 3, 3, 3, 3, 3, 3, 3], 
	[3, 1, 0, 0, 0, 3, 3, 3, 3, 3], 
	[3, 0, 0, 0, 0, 3, 0, 0, 0, 3], 
	[3, 0, 0, 0, 0, 3, 0, 0, 0, 3], 
	[3, 0, 0, 0, 0, 3, 0, 0, 0, 3], 
	[3, 0, 0, 0, 0, 3, 0, 2, 0, 3], 
	[3, 0, 0, 0, 0, 3, 3, 3, 0, 3], 
	[3, 0, 0, 0, 0, 0, 0, 0, 0, 3], 
	[3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
	[3, 3, 3, 3, 3, 3, 3, 3, 3, 3] 	
];

var colliders = [];

var matrix_size = 10;
var level = level1;
var cell_colors = ["white", "gray", "green", "brown"];
var cell_size;
var speed_x = 120;
var speed_y = 120;
var dx = 0;
var dy = 0;
var level_rects = null;
var sens_offs;
var sensor_width;
var robot_size;

var player_pos = {
	x: 0,
	y: 0
}

var sensors = [0, 0, 0, 0];
var engines = [0, 0, 0, 0];

function world_setEngines(e){
	engines[0] = e[0];
	engines[1] = e[1];
	engines[2] = e[2];
	engines[3] = e[3];
}

function world_readSensors(){
	return sensors;
}

var sens = [ 		//left, right, top, bottom
	{
	  left:   0,
	  top:    0,
	  right:  0,
	  bottom: 0
	},
	{
	  left:   0,
	  top:    0,
	  right:  0,
	  bottom: 0
	},
	{
	  left:   0,
	  top:    0,
	  right:  0,
	  bottom: 0
	},
	{
	  left:   0,
	  top:    0,
	  right:  0,
	  bottom: 0
	}
];	
		
var player_bb = {
	left: 0,
	top: 0,
	right: 0,
	bottom: 0,
	intersects: 0
};
	
	
function getCellBB(i, j){
	var bb = {
		left: j * cell_size,
		top: i * cell_size,
		right: j * cell_size + cell_size,
		bottom: i * cell_size + cell_size
	};
	return bb;
}
	
function init_world(width, height){
	cell_size = width / matrix_size;
	sens_offs = cell_size / 9;
	robot_size = cell_size / 1.2;
	sensor_width = robot_size / 5;
	//ищем старовую позицию
	for(var i = 0; i < matrix_size; i++){
		for(var j = 0; j < matrix_size; j++){
			var cell_type = level[i][j];
			if(cell_type == 1){
				player_pos.x = j * cell_size + (cell_size - robot_size) / 2;
				player_pos.y = i * cell_size + (cell_size - robot_size) / 2;
				update_player_bb();
			}
			if(cell_type == BRICK){
				colliders.push(
					{
						rect: getCellBB(i, j),
						type: cell_type
					}
				);
			}
		}
	}
}
	
function update_player_bb(){
	player_bb.left = player_pos.x + 1;
	player_bb.top = player_pos.y + 1;
	player_bb.right = player_pos.x + robot_size - 1;
	player_bb.bottom = player_pos.y + robot_size - 1;
}

function collisions(dx, dy){
	var iterations = 0, MAX_ITER_COUNT = 1000;
	var colliders_count = colliders.length;
	for(var i = 0; i < colliders_count; i++)
	{
		var cell = colliders[i];
		if(cell.type == BRICK){	
			while(intersectRect(player_bb, cell.rect) && (++iterations < MAX_ITER_COUNT)){
				player_bb.intersects = 1;
				player_pos.x -= dx;
				player_pos.y -= dy;
				update_player_bb();
			}
		}
	}
}

	
function world_update(dt)	{
	//engines[TOP] = sensors[LFT];
	//engines[LFT] = sensors[TOP];
	//engines[BTM] = sensors[RGT];
	//engines[RGT] = sensors[TOP];
	
	//if( (sensors[0] + sensors[1] + sensors[2] + sensors[3]) == 0){
	//	engines[TOP] = 1;
	//}
	
	
	
	dx = 0;
	dy = 0;
	
	if(engines[0]) dx = 1;
	if(engines[1]) dx = -1;
	if(engines[2]) dy = 1;
	if(engines[3]) dy = -1;
	
	player_bb.intersects = 0;
	
	player_pos.x += dx * speed_x * dt;
	player_pos.x = Math.floor(player_pos.x);
	update_player_bb();
	
	collisions(dx, 0);
	
	player_bb.intersects = 0;

	player_pos.y += dy * speed_y * dt;
	player_pos.y = Math.floor(player_pos.y);
	update_player_bb();
	
	collisions(0, dy);
		
	//left
	sens[0].left = player_pos.x - sensor_width;//sens_offs;
	sens[0].right = player_pos.x + sens_offs * 0;
	sens[0].top = player_pos.y + 1;
	sens[0].bottom = player_pos.y + robot_size - 1;
			
	//right
	sens[1].left = player_pos.x + robot_size - sens_offs * 0;
	sens[1].right = player_pos.x + robot_size + sensor_width;//sens_offs;
	sens[1].top = player_pos.y + 1
	sens[1].bottom = player_pos.y + robot_size - 1;
			
	//top
	sens[2].left = player_pos.x + 1;
	sens[2].right = player_pos.x + robot_size - 1;
	sens[2].top = player_pos.y - sensor_width;//sens_offs;
	sens[2].bottom = player_pos.y + sens_offs * 0;
			
	//bottom
	sens[3].left = player_pos.x + 1;
	sens[3].right = player_pos.x + robot_size - 1;
	sens[3].top = player_pos.y + robot_size;
	sens[3].bottom = player_pos.y + robot_size + sensor_width;//sens_offs;
			
	//sensors collisions	
	for(var i = 0; i < 4; i++) sensors[i] = 0;
		
	var colliders_count = colliders.length;
	for(var i = 0; i < colliders_count; i++)
	{
		var cell = colliders[i];
		if(cell.type == BRICK){
			for(var k = 0; k < 4; k++) {
				if(intersectRect(sens[k], cell.rect)) {
					sensors[k] = 1;
				}
			}
		}
	}
	
	
	
	
}

function world_draw(cx)
{
	var width = cx.canvas.clientWidth;
	var height = cx.canvas.clientHeight;
		
	cx.clearRect(0, 0, width, width);
		
	for(var i = 0; i < matrix_size; i++){
		for(var j = 0; j < matrix_size; j++){
				
			var cell_bb = getCellBB(i, j);
				
			var cell_type = level[i][j];
			
			cx.beginPath();
			cx.fillStyle = cell_colors[cell_type];
			cx.rect(j * cell_size, i * cell_size, cell_size, cell_size);
			cx.fill();
			cx.closePath();
				
			/*
			//grid
			cx.beginPath();
			cx.strokeStyle = 'cyan';
			cx.rect(bb.left, bb.top, bb.right - bb.left, bb.bottom - bb.top);
			cx.stroke();
			cx.closePath();
			*/
		}
	}
		
	cx.beginPath();
	cx.fillStyle = player_bb.intersects == 0 ? 'black' : 'red';
	cx.rect(player_bb.left - 1, player_bb.top - 1, robot_size, robot_size);
	cx.fill();
	cx.closePath();
		
	if(draw_sensors){
		for(var i = 0; i < 4; i++){
			var r = sens[i];
			cx.beginPath();
			cx.strokeStyle = (sensors[i] == 1) ? 'red' : 'cyan';
			cx.rect(r.left, r.bottom, r.right - r.left, r.top - r.bottom);
			cx.stroke();
			cx.closePath();
		}	
	}
}
