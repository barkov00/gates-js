/*'use strict'; */

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
	var EMPTY = 0, BRICK = 3, BLACK_HOLE = 4, ESCAPE = 2;
	var LFT = 0, RGT = 1, TOP = 2, BTM = 3;
	this.width = 0;
	this.height = 0;
	this.time_delay = 0;
	this.sensorsLast = [-1, -1, -1, -1];
	this.draw_sensors = true;
	this.colliders = [];
	this.matrix_width = 0;
	this.matrix_height = 0;
	this.level = null;
	this.level_name = 0;
	this.cell_colors = ["white", "white", "green", "brown", "black"];
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
	this.sens = Array();
	/*[ 		//left, right, top, bottom
		{ left:   0, top:    0, right:  0, bottom: 0},
		{ left:   0, top:    0, right:  0, bottom: 0},
		{ left:   0, top:    0, right:  0, bottom: 0},
		{ left:   0, top:    0, right:  0, bottom: 0}
	];*/	
	this.player_bb = {left: 0, top: 0, right: 0, bottom: 0, intersects: 0};
	this.alpha = 0;
	this.robot_out = false;
	this.robot_finish = false;
	
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
	
	this.init_world = function(level_object, width, height){
		//this.cell_size = width / this.matrix_size;
		this.sensorsLast[0] = -1;
		this.engines[0] = 0;
		this.engines[1] = 0;
		this.engines[2] = 0;
		this.engines[3] = 0;
		this.robot_out = false;
		this.robot_finish = false;
		this.colliders = Array();
		this.level_name = level_object.name;
		this.level = level_object.matrix;
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
					this.player_pos.x = 0 + j * this.cell_size + (this.cell_size - this.robot_size) / 2;
					this.player_pos.y = 0 + i * this.cell_size + (this.cell_size - this.robot_size) / 2;
					this.update_player_bb();
				}
				if(cell_type == BRICK || cell_type == BLACK_HOLE || cell_type == ESCAPE){
					this.colliders.push({
							rect: getCellBB(i, j, this.cell_size),
							type: cell_type
					});
				}
			}
		}
	};
	
	this.reset = function(){
		for(var i = 0; i < 4; i++) {
			this.sensorsLast[i] = 0;
			this.sensors[i] = 0;
			this.engines[i] = false;
		}
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
		
		var sens_len = this.robot_size / 3.5;
		
		/*
		Новый перспективный вариант: по 2 датчика с каждй стороны по краям, срабатывание засчитывается, когда сработали оба датчика
		*/
		//createRect(lft, tp, rgt, btm)
		
		//left
		this.sens[0] = {
			rects: [
				//left
				{c: 0, r: createRect(this.player_pos.x - this.sensor_width, this.player_pos.y + this.robot_size/2 - sens_len/2, this.player_pos.x, this.player_pos.y + this.robot_size/2 + sens_len/2)},
				//{c: 0, r: createRect(this.player_pos.x - this.sensor_width, this.player_pos.y + 3, this.player_pos.x, this.player_pos.y + sens_len)},
				//{c: 0, r: createRect(this.player_pos.x - this.sensor_width, this.player_pos.y + this.robot_size - sens_len, this.player_pos.x, this.player_pos.y + this.robot_size - 3)}
			]
		};
		this.sens[1] = {
			rects: [
				//right
				{c: 0, r: createRect(this.player_pos.x + this.robot_size, this.player_pos.y + this.robot_size/2 - sens_len/2, this.player_pos.x + this.robot_size + this.sensor_width, this.player_pos.y + this.robot_size/2 + sens_len/2)},
				//{c: 0, r: createRect(this.player_pos.x + this.robot_size, this.player_pos.y + 3, this.player_pos.x + this.robot_size + this.sensor_width, this.player_pos.y + sens_len)},
				//{c: 0, r: createRect(this.player_pos.x + this.robot_size, this.player_pos.y + this.robot_size - sens_len, this.player_pos.x + this.robot_size + this.sensor_width, this.player_pos.y + this.robot_size - 3)}
			]
		};
		this.sens[2] = {
			rects: [
				//top
				//{c: 0, r: createRect(this.player_pos.x + 1, this.player_pos.y - this.sensor_width, this.player_pos.x + sens_len, this.player_pos.y)},
				{c: 0, r: createRect(this.player_pos.x + this.robot_size/2 - sens_len/2, this.player_pos.y - this.sensor_width, this.player_pos.x + this.robot_size/2 + sens_len/2, this.player_pos.y)},
				//{c: 0, r: createRect(this.player_pos.x + 3, this.player_pos.y - this.sensor_width, this.player_pos.x + sens_len, this.player_pos.y)},
				//{c: 0, r: createRect(this.player_pos.x + this.robot_size - sens_len, this.player_pos.y - this.sensor_width, this.player_pos.x + this.robot_size - 3, this.player_pos.y)}
			]
		};
		this.sens[3] = {
			rects: [
				//bottom
				//{c: 0, r: createRect(this.player_pos.x + this.robot_size - sens_len, this.player_pos.y + this.robot_size, this.player_pos.x + this.robot_size, this.player_pos.y + this.robot_size + this.sensor_width)},
				{c: 0, r: createRect(this.player_pos.x + this.robot_size/2 - sens_len/2, this.player_pos.y + this.robot_size, this.player_pos.x + this.robot_size/2 + sens_len/2, this.player_pos.y + this.robot_size + this.sensor_width)},
				//{c: 0, r: createRect(this.player_pos.x + 3, this.player_pos.y + this.robot_size, this.player_pos.x + sens_len, this.player_pos.y + this.robot_size + this.sensor_width)},
				//{c: 0, r: createRect(this.player_pos.x + this.robot_size - sens_len, this.player_pos.y + this.robot_size, this.player_pos.x + this.robot_size - 3, this.player_pos.y + this.robot_size + this.sensor_width)}
			]
		};
		/*
		this.sens[0].left = this.player_pos.x - this.sensor_width;//sens_offs;
		this.sens[0].right = this.player_pos.x + this.sens_offs * 0;
		this.sens[0].top = this.player_pos.y + this.robot_size / 2 - sens_len / 2;
		this.sens[0].bottom = this.player_pos.y + this.robot_size / 2 + sens_len / 2;
				
		//right
		this.sens[1].left = this.player_pos.x + this.robot_size - this.sens_offs * 0;
		this.sens[1].right = this.player_pos.x + this.robot_size + this.sensor_width;//sens_offs;
		this.sens[1].top = this.player_pos.y + this.robot_size / 2 - sens_len / 2;
		this.sens[1].bottom = this.player_pos.y + this.robot_size / 2 + sens_len / 2;
				
		//top
		this.sens[2].left = this.player_pos.x + this.robot_size / 2 - sens_len / 2;
		this.sens[2].right = this.player_pos.x + this.robot_size / 2 + sens_len / 2;
		this.sens[2].top = this.player_pos.y - this.sensor_width;//sens_offs;
		this.sens[2].bottom = this.player_pos.y + this.sens_offs * 0;
				
		//bottom
		this.sens[3].left = this.player_pos.x + this.robot_size / 2 - sens_len / 2;
		this.sens[3].right = this.player_pos.x + this.robot_size / 2 + sens_len / 2;
		this.sens[3].top = this.player_pos.y + this.robot_size;
		this.sens[3].bottom = this.player_pos.y + this.robot_size + this.sensor_width;//sens_offs;
		*/
		/*
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
		*/
				
		//sensors collisions	
		
			
		
		
		var colliders_count = this.colliders.length;
		
		
		
		/*
		for(var i = 0; i < 4; i++) this.sensors[i] = 0;
		for(var i = 0; i < this.sens.length; i++){
				var count = 0;
				for(var j = 0; j < this.sens[i].rects.length; j++){
					for(var h = 0; h < colliders_count; h++)
					{
						var cell = this.colliders[h];
						if(cell.type == BRICK){
							if(this.sens[i].rects[j].c == 0)
							if(intersectRect(this.sens[i].rects[j].r, cell.rect)) 
							{
								this.sens[i].rects[j].c = 1;
								count++;
							}
						}
					}
				}
				if(count == 1) this.sensors[i] = 1;
			}
			*/
		var mx = (this.player_bb.left + this.player_bb.right) / 2;
		var my = (this.player_bb.top + this.player_bb.bottom) / 2;
		mx = Math.floor(mx / this.cell_size);
		my = Math.floor(my / this.cell_size);
		
		//L R T B
		var left = mx - 1;
		var right = mx + 1;
		var top = my - 1;
		var bottom = my + 1;
		
		this.time_delay+= dt;
		if(this.time_delay > 0.15){
			
			for(var i = 0; i < 4; i++) this.sensors[i] = 0;
		if( !(mx >= this.matrix_width || my >= this.matrix_height)){
			if(this.level[my][left] == BRICK){
				this.sensors[0] = 1;
			}
			if(this.level[my][right]== BRICK){
				this.sensors[1] = 1;
			}
			if(this.level[top][mx]== BRICK){
				this.sensors[2] = 1;
			}
			if(this.level[bottom][mx]== BRICK){
				this.sensors[3] = 1;
			}
		}
		this.time_delay = 0;
		}
		
		//console.log(this.player_pos);
		
		for(var i = 0; i < colliders_count; i++)
		{
			var cell = this.colliders[i];
			/*
			if(cell.type == BRICK){
				for(var k = 0; k < this.sens.length; k++) {
					var count = 0;
					for(var g = 0; g < this.sens[k].rects.length; g++){
						if(intersectRect(this.sens[k].rects[g], cell.rect)) {
							//this.sensors[k] = 1;
							count++;
						}
					}
					if(count == 2){
						this.sensors[k] = 1;
					}
				}
			} else */if(cell.type == BLACK_HOLE){
				var count = 0;
				for(var k = 0; k < this.sens.length; k++) {
					for(var g = 0; g < this.sens[k].rects.length; g++){
					if(intersectRect(this.sens[k].rects[g].r, cell.rect)) {
						count++;
					}
					}
				}
				if(count > 2) {
					this.robot_out = true;
				}
			} else if(cell.type == ESCAPE){
				/*
				var count = 0;
				for(var k = 0; k < this.sens.length; k++) {
					for(var g = 0; g < this.sens[k].rects.length; g++){
						if(intersectRect(this.sens[k].rects[g].r, cell.rect)) {
							count++;
						}
					}
				}
				if(count > 2) {
					this.robot_finish = true;
				}
				*/
				var c = rectCenter(this.player_bb);
				if(rectContains(cell.rect, c.x, c.y)){
					this.robot_finish = true;
				}
			}
		}
		
		
	}
	
	this.world_draw = function(cx){
		var width = this.width;
		var height = this.height;
			
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
		
		//cx.strokeStyle = "cyan"
		
		if(this.draw_sensors){
			for(var i = 0; i < this.sens.length; i++){
				for(var j = 0; j < this.sens[i].rects.length; j++){
					var r = this.sens[i].rects[j].r;
					var color = this.sensors[i] == 1 ? 'red' : 'cyan';
					cx.beginPath();
					cx.strokeStyle = color;//this.sensors[i] == 1) ? 'red' : 'cyan';
					cx.rect(r.left, r.bottom, r.right - r.left, r.top - r.bottom);
					cx.stroke();
					cx.closePath();
				}
			}	
		}
		
		
		cx.fillStyle = "rgba(0,0,0," + this.alpha + ")";
		cx.fillRect(0, 0, this.matrix_width * this.cell_size, this.matrix_height * this.cell_size);
		
		cx.restore();
	}
	
}
