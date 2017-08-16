/*'use strict'; */

/*
0 - empty
1 - start position
2 - exit
3 - brick
*/

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

function getCellBB(i, j, cell_size){
	var bb = {
		left: j * cell_size,
		top: i * cell_size,
		right: j * cell_size + cell_size,
		bottom: i * cell_size + cell_size
	};
	return bb;
}

function World(){
	var EMPTY = 0, BRICK = 3;
	var LFT = 0, RGT = 1, TOP = 2, BTM = 3;
	this.width = 0;
	this.height = 0;
	this.sensorsLast = [-1, -1, -1, -1];
	this.draw_sensors = true;
	this.colliders = [];
	this.matrix_width = 0;
	this.matrix_height = 0;
	this.level = level1;
	this.cell_colors = ["white", "gray", "green", "brown"];
	this.cell_size = 32;
	this.speed_x = 120;
	this.speed_y = 120;
	this.dx = 0;
	this.dy = 0;
	this.level_rects = null;
	this.sens_offs;
	this.sensor_width;
	this.robot_size;
	this.player_pos = { x: 0, y: 0};
	this.sensors = [0, 0, 0, 0];
	this.engines = [0, 0, 0, 0];
	this.sens = [ 		//left, right, top, bottom
		{ left:   0, top:    0, right:  0, bottom: 0},
		{ left:   0, top:    0, right:  0, bottom: 0},
		{ left:   0, top:    0, right:  0, bottom: 0},
		{ left:   0, top:    0, right:  0, bottom: 0}
	];	
	this.player_bb = {left: 0, top: 0, right: 0, bottom: 0, intersects: 0};
	
	this.world_readSensors = function(){
		return this.sensors;
	};
	
	this.sensorsChanged = function(){
		for(var i = 0; i < 4; i++){ 
			if(this.sensorsLast[i] != this.sensors[i]) {
				this.sensorsLast[0] = this.sensors[0]; 
				this.sensorsLast[1] = this.sensors[1]; 
				this.sensorsLast[2] = this.sensors[2]; 
				this.sensorsLast[3] = this.sensors[3];
				return true;
			}
		}
		return false;
	}
	
	this.world_setEngines = function(e){
		this.engines[0] = e[0];
		this.engines[1] = e[1];
		this.engines[2] = e[2];
		this.engines[3] = e[3];
	};
	
	this.update_player_bb = function(){
		this.player_bb.left = this.player_pos.x + 1;
		this.player_bb.top = this.player_pos.y + 1;
		this.player_bb.right = this.player_pos.x + this.robot_size - 1;
		this.player_bb.bottom = this.player_pos.y + this.robot_size - 1;
	}
	
	this.collisions = function(dx, dy){
		var iterations = 0, MAX_ITER_COUNT = 1000;
		var colliders_count = this.colliders.length;
		for(var i = 0; i < colliders_count; i++)
		{
			var cell = this.colliders[i];
			if(cell.type == BRICK){	
				while(intersectRect(this.player_bb, cell.rect) && (++iterations < MAX_ITER_COUNT)){
					this.player_bb.intersects = 1;
					this.player_pos.x -= dx;
					this.player_pos.y -= dy;
					this.update_player_bb();
				}
			}
		}
	}
	
	this.init_world = function(width, height){
		//this.cell_size = width / this.matrix_size;
		this.width = width;
		this.height = height;
		this.sensorsLast = [-1, -1, -1, -1];
		this.sens_offs = this.cell_size / 9;
		this.robot_size = this.cell_size / 1.2;
		this.sensor_width = this.robot_size / 5;
		this.matrix_width = this.level[0].length;
		this.matrix_height = this.level.length;
		//ищем старовую позицию
		for(var i = 0; i < this.matrix_height; i++){
			for(var j = 0; j < this.matrix_width; j++){
				var cell_type = this.level[i][j];
				if(cell_type == 1){
					this.player_pos.x = j * this.cell_size + (this.cell_size - this.robot_size) / 2;
					this.player_pos.y = i * this.cell_size + (this.cell_size - this.robot_size) / 2;
					this.update_player_bb();
				}
				if(cell_type == BRICK){
					this.colliders.push({
							rect: getCellBB(i, j, this.cell_size),
							type: cell_type
					});
				}
			}
		}
	};
	
	this.reset = function(){
		this.sensorsLast[0] = -1;
		this.init_world(this.width, this.height);
	}

	this.world_update = function(dt){
		this.dx = 0;
		this.dy = 0;
		
		if(this.engines[0]) this.dx = 1;
		if(this.engines[1]) this.dx = -1;
		if(this.engines[2]) this.dy = 1;
		if(this.engines[3]) this.dy = -1;
		
		this.player_bb.intersects = 0;
		
		this.player_pos.x += this.dx * this.speed_x * dt;
		this.player_pos.x = Math.floor(this.player_pos.x);
		this.update_player_bb();
		
		this.collisions(this.dx, 0);
		
		this.player_bb.intersects = 0;

		this.player_pos.y += this.dy * this.speed_y * dt;
		this.player_pos.y = Math.floor(this.player_pos.y);
		this.update_player_bb();
		
		this.collisions(0, this.dy);
			
		//left
		this.sens[0].left = this.player_pos.x - this.sensor_width;//sens_offs;
		this.sens[0].right = this.player_pos.x + this.sens_offs * 0;
		this.sens[0].top = this.player_pos.y + 1;
		this.sens[0].bottom = this.player_pos.y + this.robot_size - 1;
				
		//right
		this.sens[1].left = this.player_pos.x + this.robot_size - this.sens_offs * 0;
		this.sens[1].right = this.player_pos.x + this.robot_size + this.sensor_width;//sens_offs;
		this.sens[1].top = this.player_pos.y + 1
		this.sens[1].bottom = this.player_pos.y + this.robot_size - 1;
				
		//top
		this.sens[2].left = this.player_pos.x + 1;
		this.sens[2].right = this.player_pos.x + this.robot_size - 1;
		this.sens[2].top = this.player_pos.y - this.sensor_width;//sens_offs;
		this.sens[2].bottom = this.player_pos.y + this.sens_offs * 0;
				
		//bottom
		this.sens[3].left = this.player_pos.x + 1;
		this.sens[3].right = this.player_pos.x + this.robot_size - 1;
		this.sens[3].top = this.player_pos.y + this.robot_size;
		this.sens[3].bottom = this.player_pos.y + this.robot_size + this.sensor_width;//sens_offs;
				
		//sensors collisions	
		for(var i = 0; i < 4; i++) this.sensors[i] = 0;
			
		var colliders_count = this.colliders.length;
		for(var i = 0; i < colliders_count; i++)
		{
			var cell = this.colliders[i];
			if(cell.type == BRICK){
				for(var k = 0; k < 4; k++) {
					if(intersectRect(this.sens[k], cell.rect)) {
						this.sensors[k] = 1;
					}
				}
			}
		}
		
		
	}
	
	this.world_draw = function(cx){
		var width = cx.canvas.clientWidth;
		var height = cx.canvas.clientHeight;
			
	    cx.save();
		cx.translate(width/2 - this.matrix_width*this.cell_size/2, height/2 - this.matrix_height*this.cell_size/2);
		cx.clearRect(0, 0, width, width);
			
		for(var i = 0; i < this.matrix_height; i++){
			for(var j = 0; j < this.matrix_width; j++){
					
				var cell_bb = getCellBB(i, j, this.cell_size);
					
				var cell_type = this.level[i][j];
				
				cx.beginPath();
				cx.fillStyle = this.cell_colors[cell_type];
				cx.rect(j * this.cell_size, i * this.cell_size, this.cell_size, this.cell_size);
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
		cx.fillStyle = this.player_bb.intersects == 0 ? 'black' : 'red';
		cx.rect(this.player_bb.left - 1, this.player_bb.top - 1, this.robot_size, this.robot_size);
		cx.fill();
		cx.closePath();
			
		if(this.draw_sensors){
			for(var i = 0; i < 4; i++){
				var r = this.sens[i];
				cx.beginPath();
				cx.strokeStyle = (this.sensors[i] == 1) ? 'red' : 'cyan';
				cx.rect(r.left, r.bottom, r.right - r.left, r.top - r.bottom);
				cx.stroke();
				cx.closePath();
			}	
		}
		
		cx.restore();
	}
	
}
