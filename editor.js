/*
0 - empty
1 - start position
2 - exit
3 - brick
4 - black hole
*/
/*
0 - and
1 - or
2 - not
3 - nand
4 - nor
5 - xor
6 - iR
7 - iL
8 - iT
9 - iB
10 - eR
11 - eL
12 - eT
13 - eB
*/
var levels = Array();

var level1 = {
	matrix: [ 
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
	],
	name: 0,
	gates: [],
	title: "Уровень 1",
	summary: "Соединяем провода"
};

var level2 = {
	matrix: [ 
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 0, 1, 0, 0, 0, 0, 2, 3, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4] 	
],
name: 1,
gates: [2],
	title: "Уровень 2",
	summary: "Это не проблема"
};


var level3 = {matrix:[ 
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 0, 0, 0, 0, 0, 0, 3, 0, 4], 
	[4, 0, 1, 0, 0, 0, 0, 2, 4, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 0, 0, 0, 0, 0, 0, 0, 0, 4], 
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4] 	
],
name: 2,
gates: [2],
	title: "Уровень 3",
	summary: "Это не проблема 2"
};

var level4 = {matrix:[ 
	[4, 4, 4, 4, 4, 4, 4, 4, 4], 
	[4, 4, 4, 4, 4, 3, 3, 3, 4], 
	[4, 4, 4, 4, 4, 0, 2, 3, 4], 
	[4, 4, 4, 4, 4, 0, 0, 3, 4], 
	[4, 4, 4, 4, 4, 0, 0, 3, 4], 
	[4, 4, 4, 4, 4, 0, 0, 3, 4], 
	[4, 4, 4, 4, 4, 0, 0, 3, 4], 
	[4, 4, 4, 4, 4, 0, 0, 3, 4], 
	[4, 4, 4, 4, 4, 0, 0, 3, 4], 
	[4, 0, 1, 0, 0, 0, 0, 4, 4], 
	[4, 3, 3, 3, 3, 0, 0, 0, 4], 
	[4, 4, 4, 4, 4, 4, 4, 4, 4] 	
],
name: 3,
gates: [2],
	title: "Уровень 4",
	summary: "Это не проблема 3"
};

var level5 = {matrix:[ 
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4], 
	[4, 3, 3, 3, 3, 3, 3, 3, 3, 4], 
	[4, 1, 0, 0, 0, 0, 0, 2, 4, 4], 
	[4, 3, 3, 3, 3, 3, 3, 0, 3, 4], 
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4] 	
],
name: 4,
gates: [2, 0],
	title: "Уровень 5",
	summary: "И так и сяк"
};


(function(){
	levels[0] = level1;
	levels[1] = level2;
	levels[2] = level3;
	levels[3] = level4;
	levels[4] = level5;
})();

var toolbar_height = 50;
var graphics = [];
var canvas = null;
var mouse = {
	x: 0,
	y: 0,
	pressed: false,
	state: false,
	button: -1
};
var toolbar_btns = [];
var objects = [];
var wires = [];
var obj_ids = 0;
var pin_bb_size = 0;
var elem_height = 50 * 0.7;
var elem_width = 100 * 0.7;
var ST_IDLE = 0, ST_DRAG = 1, ST_SEL_PIN = 2, ST_WIRE = 3, ST_CUT_WIRE = 4;
var editor_state = ST_IDLE;
var selectedWire = -1;
var scissors = null;
var collapse_button = null;
var power_button = null;
var editor_visible = true;
var world_instance = null;
var WORLD_WIDTH = 1280;
var WORLD_HEIGHT = 720;
var current_level = null;

var ed_sensors = [0, 0, 0, 0]; //R L T B
var ed_engines = [0, 0, 0, 0]; //R L T B



function load_level(level_num, reset){
	current_level = levels[level_num];
	world_instance.init_world(current_level, WORLD_WIDTH, WORLD_HEIGHT);
	if(reset) world_instance.reset();
	place_toolbar_buttons(current_level.gates);
}

function editor_reset(){
	ed_sensors = [0, 0, 0, 0]; //R L T B
	ed_engines = [0, 0, 0, 0]; //R L T B
}

function getObjectByName(name){
	for(var i = 0; i < objects.length; i++){
		if(objects[i].name == name) return objects[i];
	}
}

function Sprite(image, x, y, width, height){
	this.x = x;
	this.y = y;
	this.origin_offset = {x: 0, y: 0};
	this.width = width;
	this.height = height;
	this.sprite_angle = 0;
	this.image = image;
	this.draw = function(cx){
		cx.save();
		var origin = {x: this.x + this.width / 2 + this.origin_offset.x, y: this.y + this.height / 2 + this.origin_offset.y};
		cx.translate(origin.x, origin.y);
		cx.rotate(this.sprite_angle);
		cx.translate(-origin.x, -origin.y);
		cx.drawImage(this.image, this.x, this.y, this.width, this.height);
		cx.restore();
	}
	this.rotate = function(angle){
		this.sprite_angle += (angle * Math.PI / 180);
	}
}

function load_image(name, src){
	var img = new Image();
	var load_complete = false;
	img.onload = new function() {
		load_complete = true;
	}
	img.src = src;
	//while(!load_complete);
	graphics[name] = img;
}

function SimpleButton(_name, x, y, width, height, image){
	this.name = _name;
	this.image = image;
	this.rect = createRect(x, y, x + width, y + height);
	this.hit = false;
	this.draw = function(cx){
		cx.drawImage(this.image, this.rect.left, this.rect.top, this.rect.right-this.rect.left, this.rect.bottom-this.rect.top);
		var m = mouse_project(mouse.x, mouse.y);
		this.hit = rectContains(this.rect, m.x, m.y);
		if(this.hit){
			cx.beginPath();
			cx.strokeStyle = mouse.pressed == false ? "green" : "lightgreen";
			cx.moveTo(this.rect.left, this.rect.top);
			cx.lineTo(this.rect.right, this.rect.top);
			cx.lineTo(this.rect.right, this.rect.bottom);
			cx.lineTo(this.rect.left, this.rect.bottom);
			cx.lineTo(this.rect.left, this.rect.top);
			cx.stroke();
			cx.closePath();
		}
	}
}

function StaticObject(_name, x, y, width, height){
	this.name = _name;
	this.rect = createRect(x, y, x + width, y + height);
	this.hover = false;
	this.drag = false;
}

function PinBB(left, top, right, bottom, out, parent){
	this.rect = createRect(left, top, right, bottom);
	this.out = out;
	this.hover = false;
	this.parent = parent;
	this.wire_point = [];
	this.logic_level = -1;
	this.setLogicLevel = function(level){
		if(level == this.logic_level) return;
		this.logic_level = level;
		for(var i = 0; i < this.wire_point.length; i++){
			this.wire_point[i].wire.setLogicLevel(level);
		}
	}
}

function Wire(p1, p2){
	this.id = obj_ids++;
	this.p1 = p1;
	this.p2 = p2;
	this.m1 = {x: 0, y: 0};
	this.m2 = {x: 0, y: 0};
	this.logic_level = -1;
	this.pins = [];
	this.color = "#00bae4";
	this.scissors_hover = false;
	this.update = function(){
		if(this.p1 == null || this.p2 == null) return;
		if(Math.abs(this.p1.x - this.p2.x) > Math.abs(this.p1.y - this.p2.y)){
			var m1x = (this.p1.x + this.p2.x) / 2;
			this.m1.x = m1x;
			this.m1.y = this.p1.y;
			this.m2.x = m1x;
			this.m2.y = this.p2.y;
		} else {
			var m1y = (this.p1.y + this.p2.y) / 2;
			this.m1.x = this.p1.x;
			this.m1.y = m1y;
			this.m2.x = this.p2.x;
			this.m2.y = m1y;
		}
	}
	this.draw = function(cx){
		if(this.p1 == null || this.p2 == null) return;
		cx.beginPath();
		if(this.logic_level == -1) cx.strokeStyle = "#00bae4";
		if(this.logic_level == 1) cx.strokeStyle = "red";
		if(this.logic_level == 0) cx.strokeStyle = "blue";
		cx.lineWidth = this.scissors_hover ? 4 : 2;
		cx.moveTo(this.p1.x, this.p1.y);
		cx.lineTo(this.m1.x, this.m1.y);
		cx.lineTo(this.m2.x, this.m2.y);
		cx.lineTo(this.p2.x, this.p2.y);
		
		/*
		cx.moveTo(p1.x, p1.y);
		if(Math.abs(p1.x - p2.x) > Math.abs(p1.y - p2.y)){
			var m1x = (p1.x + p2.x) / 2;
			cx.lineTo(m1x, p1.y);
			cx.moveTo(m1x, p1.y);
			cx.lineTo(m1x, p2.y);
			cx.moveTo(m1x, p2.y);
			cx.lineTo(p2.x, p2.y);
		} else {
			var m1y = (p1.y + p2.y) / 2;
			cx.lineTo(p1.x, m1y);
			cx.moveTo(p1.x, m1y);
			cx.lineTo(p2.x, m1y);
			cx.moveTo(p2.x, m1y);
			cx.lineTo(p2.x, p2.y);
		}
		*/
		cx.stroke();
	}
	this.setLogicLevel = function(level){ //Ставит логический уровень level на себе и всех подключенных к нему пинах
		if(level == this.logic_level) return;
		this.logic_level = level;
		for(var i = 0; i < this.pins.length; i++){
			this.pins[i].logic_level = this.logic_level;
			//Ставим логический уровень на всех wire'ах которые подключены к этому пину
			for(var j = 0; j < this.pins[i].wire_point.length; j++) this.pins[i].wire_point[j].wire.setLogicLevel(this.logic_level);
		}
	}
}

//<!-- classes

//Класс логического элемента
function LogicObject(name, x, y, width, height){
	this.id = obj_ids++;
	this.type = -1;
	this.name = name;
	this.rect = createRect();
	this.pin_bb = [];
	this.func = null;
	this.drag = false;
	this.hover = false;
	this.can_delete = true;
	this.angle = 0;
	this.sprite_angle = 0;
	this.rect.height = height;
	this.rect.width = width;
	this.aabb_stroke_color = "green";
	this.original_width = width;
	this.original_height = height;
	this.sprite = null;
	this.draggable = true;
	this.angle_acc = 0;
	
	this.getPinBounds = function(pin_id){
		var bb = this.pin_bb[pin_id].rect;
		var rect = {
			left: this.x + bb.left,
			right: this.x + bb.right,
			top: this.y + bb.top,
			bottom: this.y + bb.bottom
		}
		return rect;
	}
	
	this.updateWirePosition = function(){
		//Обновляем координат концов проводов
		for(var j = 0; j < this.pin_bb.length; j++){
			var pin = this.pin_bb[j];
			var rect = this.getPinBounds(j);
			var c = {x: rect.left, y: (rect.top+rect.bottom)/2};
			for(var k = 0; k < pin.wire_point.length; k++){
				pin.wire_point[k].x = c.x;
				pin.wire_point[k].y = c.y;
			}
		}	
	}
	
	this.setPosition = function(x, y){
		//x -= this.rect.width / 2;
		//y -= this.rect.height / 2; //x, y - координаты центра элемента
		this.x = x;
		this.y = y;
		if(this.sprite != null){
			this.sprite.x = x;
			this.sprite.y = y;
		}
		this.updateAABB(x, y);
		this.updateWirePosition();
	}
	
	this.translate = function(x, y) {
		this.x += x;
		this.y += y;
		this.sprite.x += x;
		this.sprite.y += y;
		this.rect.left += x;
		this.rect.top += y;
		this.rect.right += x;
		this.rect.bottom += y;
		this.updateWirePosition();
	}
	
	
	
	this.updateAABB = function(x, y){
		this.rect.left = x;
		this.rect.top = y;
		this.rect.bottom = y + this.rect.height;
		this.rect.right = x + this.rect.width;
	}
	
	this.rotate = function(angle){
		this.angle_acc += angle;
		this.angle = angle;
		this.sprite.rotate(angle);
		var origin = rectCenter(this.rect);
		var rad = Math.PI * this.angle / 180;
		var origin_local = {x: origin.x - this.x, y: origin.y - this.y};
		this.rect = rotateAABBRectangle(this.rect, origin, rad);
		for(var i = 0; i < this.pin_bb.length; i++){
			this.pin_bb[i].rect = rotateAABBRectangle(this.pin_bb[i].rect, origin_local, rad);
		}
		this.updateWirePosition();
	}
	
	this.setPosition(x, y);
	
	if(name == "and" || name == "nand" || name == "or" || name == "xor" || name == "nor"){
		this.pin_bb.push(new PinBB(0, 9  - pin_bb_size/2, pin_bb_size, 9 + pin_bb_size/2, false, this));
		this.pin_bb.push(new PinBB(0, 25  - pin_bb_size/2, pin_bb_size, 25 + pin_bb_size/2, false, this));
		this.pin_bb.push(new PinBB(this.rect.width - pin_bb_size, 17  - pin_bb_size/2, this.rect.width, 17 + pin_bb_size/2, true, this));
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.sprite.origin_offset.x = 5;
	} 
	
	if(name == "not"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.sprite.origin_offset.x = 5;
		this.pin_bb.push(new PinBB(0, 17  - pin_bb_size/2, pin_bb_size, 17 + pin_bb_size/2, false, this));
		this.pin_bb.push(new PinBB(this.rect.width - pin_bb_size, 17  - pin_bb_size/2, this.rect.width, 17 + pin_bb_size/2, true, this));
		this.func = function(){
			this.pin_bb[1].logic_level = (this.pin_bb[0].logic_level == 0 ? 1 : 0);
			//Меняем лог. уровень у всех кто подключен к этому пину
			for(var i = 0; i < this.pin_bb[1].wire_point.length; i++) this.pin_bb[1].wire_point[i].wire.setLogicLevel(this.pin_bb[1].logic_level);
		}
		this.type = 2;
	}
	
	if(name == "r"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[1];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
		this.type = 6;
		this.draggable = false;
		this.rotate(90);
	}
	
	if(name == "l"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[0];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
		this.type = 7;
		this.draggable = false;
		this.rotate(90 * 3);
	}
	
	if(name == "b"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[3];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
		this.type = 9;
		this.draggable = false;
		this.rotate(90 * 2);
	}
	
	if(name == "t"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[2];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
		this.type = 8;
		this.draggable = false;
	}
	
	if(name == "re"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[1] = this.pin_bb[0].logic_level;
		}
		this.type = 10;
		this.draggable = false;
		this.rotate(90);
	}
	
	if(name == "le"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[0] = this.pin_bb[0].logic_level;
		}
		this.type = 11;
		this.draggable = false;
		this.rotate(90 * 3);
	}
	
	if(name == "te"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[2] = this.pin_bb[0].logic_level;
		}
		this.type = 12;
		this.draggable = false;
	}
	
	if(name == "be"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.pin_bb.push(new PinBB(this.rect.width/2 - 10, this.rect.height - 10, this.rect.width/2 + 10, this.rect.height + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[3] = this.pin_bb[0].logic_level;
		}
		this.type = 13;
		this.draggable = false;
		this.rotate(90 * 2);
	}
	
	if(name == "and") {
		this.func = function(){
			this.pin_bb[2].logic_level = this.pin_bb[0].logic_level * this.pin_bb[1].logic_level;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
		this.type = 0;
	} 
	if(name == "nand") {
		this.func = function(){
			this.pin_bb[2].logic_level = this.pin_bb[0].logic_level * this.pin_bb[1].logic_level == 0 ? 1 : 0;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
		this.type = 3;
	}  
	if(name == "or") {
		this.func = function(){
			this.pin_bb[2].logic_level = (this.pin_bb[0].logic_level == 1 || this.pin_bb[1].logic_level == 1) ? 1 : 0;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
		this.type = 1;
	} 
	if(name == "xor") {
		this.func = function(){
			this.pin_bb[2].logic_level =  (this.pin_bb[0].logic_level == this.pin_bb[1].logic_level) ? 0 : 1;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
		this.type = 5;
	}
	if(name == "nor") {
		this.func = function(){
			this.pin_bb[2].logic_level = (this.pin_bb[0].logic_level == 1 || this.pin_bb[1].logic_level == 1) ? 0 : 1;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
		this.type = 4;
	}
	
	this.draw = function(cx){
		this.sprite.draw(cx);
		if(this.hover && this.draggable){
			cx.beginPath();
			cx.strokeStyle = "#00bae4";
			/*
			cx.moveTo(this.rect.left, this.rect.top);
			cx.lineTo(this.rect.right, this.rect.top);
			cx.lineTo(this.rect.right, this.rect.bottom);
			cx.lineTo(this.rect.left, this.rect.bottom);
			cx.lineTo(this.rect.left, this.rect.top);
			*/
			var ln = 5;
			cx.moveTo(this.rect.left, this.rect.top);
			cx.lineTo(this.rect.left - ln, this.rect.top - ln);
			cx.moveTo(this.rect.right, this.rect.top);
			cx.lineTo(this.rect.right + ln, this.rect.top - ln);
			cx.moveTo(this.rect.right, this.rect.bottom);
			cx.lineTo(this.rect.right + ln, this.rect.bottom + ln);
			cx.moveTo(this.rect.left, this.rect.bottom);
			cx.lineTo(this.rect.left - ln, this.rect.bottom + ln);
			
			cx.stroke();
			cx.closePath();
		}
		for(var j = 0; j < this.pin_bb.length; j++){
			var rect = this.getPinBounds(j);
			cx.lineWidth = this.pin_bb[j].hover ? 2 : 1;
			//cx.strokeStyle = this.pin_bb[j].hover ? "red" : "cyan";
			cx.strokeStyle = this.pin_bb[j].hover ? "red" : "cyan";
			if(this.pin_bb[j].logic_level == -1) cx.strokeStyle = "white";
			if(this.pin_bb[j].logic_level == 1) cx.strokeStyle = "red";
			if(this.pin_bb[j].logic_level == 0) cx.strokeStyle = "blue";
			
			/*
			cx.moveTo(rect.left, rect.top);
			cx.lineTo(rect.right, rect.top);
			cx.lineTo(rect.right, rect.bottom);
			cx.lineTo(rect.left, rect.bottom);
			cx.lineTo(rect.left, rect.top);
			*/
			//if(this.pin_bb[j].wire_point.length == 0){
				var c = rectCenter(rect);
				cx.beginPath();
				cx.arc(c.x, c.y, 4, 0, 2 * Math.PI);
				cx.stroke();
				cx.closePath();
			//}
		} 
		cx.lineWidth = 2;
		cx.strokeStyle = "black";
	}
	
	this.setPosition(x, y);
	
	//this.translate(x, y);
	
};
//classes -->


var setCode;
var getCode;
var inputController;

function init_editor(_canvas, _inputController){
	canvas = _canvas;
	//setCode = _setCode;
	//getCode = _getCode;
	
	inputController = _inputController;
	
	inputController.setCode("");
	
	canvas.addEventListener('mousemove', function(evt) {
		var rect = canvas.getBoundingClientRect();
        mouse.x = evt.clientX - rect.left;
		mouse.y = evt.clientY - rect.top;
      }, false);
	  
	canvas.addEventListener('contextmenu', event => event.preventDefault());
	
	canvas.addEventListener('mousedown', function(evt) {
		mouse.pressed = true;
		mouse.button = evt.button;
      }, false);
	canvas.addEventListener('mouseup', function(evt) {
		mouse.pressed = false;
      }, false);
	  
	load_image("and", "images/and_dark.png");
	load_image("or", "images/or_dark.png");
	load_image("not", "images/not_dark.png");
	load_image("nand", "images/nand_dark.png");
	load_image("nor", "images/nor_dark.png");
	load_image("xor", "images/xor_dark.png");
	load_image("scissors", "images/scissors.png");
	
	load_image("sensor", "images/sensor.png");
	load_image("engine", "images/engine.png");
	graphics["l"] = graphics["sensor"];
	graphics["r"] = graphics["sensor"];
	graphics["t"] = graphics["sensor"];
	graphics["b"] = graphics["sensor"];
	graphics["le"] = graphics["engine"];
	graphics["re"] = graphics["engine"];
	graphics["te"] = graphics["engine"];
	graphics["be"] = graphics["engine"];

	load_image("collapse", "images/collapse-button.png");
	load_image("expand", "images/expand-button.png");
	load_image("poweron", "images/poweron_button.png");
	

	place_inputs_outputs();
	
	scissors = new StaticObject("scissors", -100, -100, 50 * 0.7, 50 * 0.7);
	
	pin_bb_size = elem_height / 5;
}

function place_toolbar_buttons(ids){
	var btn_width = 100 * 0.7;
	var btn_height = 50 * 0.7;
	
	/*
	0 - and
	1 - or
	2 - not
	3 - nand
	4 - nor
	5 - xor
	*/
	
	toolbar_btns = Array();
	
	if(ids.indexOf(0) >= 0){
		toolbar_btns.push(new SimpleButton("and", 0, 0, btn_width, btn_height, graphics["and"]));
	}
	if(ids.indexOf(1) >= 0) {
		toolbar_btns.push(new SimpleButton("or", btn_width, 0, btn_width, btn_height, graphics["or"]));
	}
	if(ids.indexOf(2) >= 0) {
		toolbar_btns.push(new SimpleButton("not", btn_width*2, 0, btn_width, btn_height, graphics["not"]));
	}
	if(ids.indexOf(3) >= 0) {
		toolbar_btns.push(new SimpleButton("nand", btn_width*3, 0, btn_width, btn_height, graphics["nand"]));
	}
	if(ids.indexOf(4) >= 0) {
		toolbar_btns.push(new SimpleButton("nor", btn_width*4, 0, btn_width, btn_height, graphics["nor"]));
	}
	if(ids.indexOf(5) >= 0) {
		toolbar_btns.push(new SimpleButton("xor", btn_width*5, 0, btn_width, btn_height, graphics["xor"]));
	}

	toolbar_btns.push(new SimpleButton("scissors", btn_width*6, 0, btn_height, btn_height, graphics["scissors"]));
	collapse_button = new SimpleButton("hide_show_button", WORLD_WIDTH - btn_width, 0, btn_height, btn_height, graphics["collapse"]);
	power_button = new SimpleButton("poweron", WORLD_WIDTH - btn_width * 2, 0, btn_height, btn_height, graphics["poweron"]);
}

function place_inputs_outputs(){
	var width = 50 * 0.7;
	var height = 50 * 0.7;
	
	objects.push(new LogicObject("l", 35, WORLD_HEIGHT/2 - 100, width, height));
	objects.push(new LogicObject("le", 35, WORLD_HEIGHT/2 - 50, width, height));
	
	objects.push(new LogicObject("re", WORLD_WIDTH - 35 - 50, WORLD_HEIGHT/2 - 100, width, height));
	objects.push(new LogicObject("r", WORLD_WIDTH - 35 - 50, WORLD_HEIGHT/2 - 50, width, height));
	
	objects.push(new LogicObject("te", WORLD_WIDTH/2 - 25, 65, width, height));
	objects.push(new LogicObject("t", WORLD_WIDTH/2 + 25, 65, width, height));
	
	objects.push(new LogicObject("be", WORLD_WIDTH/2 - 25, WORLD_HEIGHT-65, width, height));
	objects.push(new LogicObject("b", WORLD_WIDTH/2 + 25, WORLD_HEIGHT-65, width, height));
}

function mouse_clicked(){
	if(mouse.pressed && !mouse.state){
		mouse.state = true;
	}
	if(!mouse.pressed && mouse.state){
		mouse.state = false;
		return mouse.button;
	}
	return -1;
}

var time = 0;

function editor_update(dt){
	var mouse_btn_code = mouse_clicked();
	var clicked = mouse_btn_code == 0;
	var right_click = mouse_btn_code == 2;
	var wheel_click = mouse_btn_code == 1;

	var mousepos = mouse_project(mouse.x, mouse.y);

	
	if(collapse_button.hit && clicked){
		if(editor_visible){
			editor_visible = false;
			collapse_button.image = graphics["expand"];
		} else {
			editor_visible = true;
			collapse_button.image = graphics["collapse"];
		}
		clicked = false;
	}
	
	if(power_button.hit && clicked){
		world_instance.init_world(current_level, WORLD_WIDTH, WORLD_HEIGHT);
		serialize();
		solve();
		clicked = false;
	}
	
	if(!editor_visible) return;
	
	
	//Обработка нажатия на кнопки редактора
	if(editor_state == ST_IDLE)
	{
		for(var i = 0; i < toolbar_btns.length; i++) {
			//var hover = rectContains(toolbar_btns[i].rect, mousepos.x, mousepos.y);
			//toolbar_btns[i].hover = hover;
			var hover = toolbar_btns[i].hit;
			var button = toolbar_btns[i];
			if(hover && clicked && !(editor_state == ST_DRAG)){	
				var name = toolbar_btns[i].name;
				if(name == "scissors"){
					editor_state = ST_CUT_WIRE;
				} else {
					var obj = new LogicObject(toolbar_btns[i].name, 300, 300, elem_width, elem_height);
					obj.drag = true;
					editor_state = ST_DRAG;
					objects.push(obj);
				}
				clicked = false;
			}
		}
	}
	//Взаимодействие объектов с юзером
	if(right_click){
		if(editor_state == ST_WIRE){
			wires.splice(wires.indexOf(selectedWire), 1);
			selectedWire = null;
			editor_state = ST_IDLE;
		}
	}
	
	for(var i = 0; i < objects.length; i++){
		var obj = objects[i];
		if(obj.drag && clicked && (editor_state == ST_DRAG) && mousepos.y > toolbar_height * 1.5){ 
			//заканчиваем перетаскивание, оставляем объект там где юзер кликнул
			objects[i].drag = false;
			editor_state = ST_IDLE;
			continue;
		}
		
		if(editor_state == ST_CUT_WIRE){ //Удаление объекта ножницами
			if(obj.can_delete)
			if(clicked && intersectRect(obj.rect, scissors.rect)){
				//2do: удаляем все wire, точки которых соприкосаются с пинами этого элемента
				for(var j = 0; j < obj.pin_bb.length; j++){
					var pin = obj.pin_bb[j];
					for(var k = 0; k < pin.wire_point.length; k++){
						if(pin.wire_point[k].wire == null) continue;
						wires.splice(wires.indexOf(pin.wire_point[k].wire), 1);
					}
				}
				objects.splice(i, 1);
				editor_state = ST_IDLE;
				scissors.rect.left = -100;
				scissors.rect.top = -100;
				clicked = false;
				break;
			}
		}
		
		if(objects[i].drag){	
			//Обработка перетаскивания объекта - привязываем объект к курсору мыши во время перетаскивания
			obj.translate(mousepos.x - obj.rect.left - obj.rect.width / 2, mousepos.y - obj.rect.top - obj.rect.height / 2);
		} else {	
			var obj_hit =  rectContains(obj.rect, mousepos.x, mousepos.y);
			objects[i].hover = obj_hit;
			
			if(right_click & obj_hit){
				obj.rotate(90);
				right_click = false;
				
			}
		
			if(!(editor_state == ST_IDLE || editor_state == ST_WIRE)) 
				continue;
			
			//коллизии курсора с пинами
		    var pin_selected = false;
			for(var j = 0; j < obj.pin_bb.length; j++){
				var pin = obj.pin_bb[j];
				var rect = obj.getPinBounds(j);
				var hover = rectContains(rect, mousepos.x, mousepos.y);
				if(hover) {
					pin_selected = true;
					if(clicked && (editor_state != ST_WIRE)){
						//Клик по пину
						selectedWire = new Wire(rectCenter(rect), {x: mousepos.x, y: mousepos.y});
						selectedWire.pins[0] = pin;
						selectedWire.p1 = rectCenter(rect);
						var st = selectedWire.p1;
						st.wire = selectedWire;
						pin.wire_point.push(st);
						wires.push(selectedWire);
						editor_state = ST_WIRE;
						clicked = false;
					}
					if(clicked && (editor_state == ST_WIRE)){
						//Соединение вЫхода со входом одинаковых элементов - запрещено
						//Вход со входом и вход с выходом - разрешено
						//Соединение выхода с выходом тоже запрещено
						if( (pin.out || selectedWire.pins[0].out) && (pin.parent == selectedWire.pins[0].parent)) 
							continue; 
						if(pin.out && selectedWire.pins[0].out) 
							continue; 
						selectedWire.pins[1] = pin;
						selectedWire.p2 = rectCenter(rect);
						var st = selectedWire.p2;
						st.wire = selectedWire;
						pin.wire_point.push(st);
						selectedWire = null;
						editor_state = ST_IDLE;
						clicked = false;
					}
				}
				objects[i].pin_bb[j].hover = hover;
			}
			
			objects[i].aabb_stroke_color = (clicked && obj_hit) ? "lightgreen" : "green";
			
			if(!pin_selected && obj_hit && clicked && (editor_state == ST_IDLE) && obj.draggable){
				objects[i].drag = true;
				editor_state = ST_DRAG; //начало перетаскивания объекта
				continue;
			}
		}
	} 
	
	if(editor_state == ST_WIRE){
		selectedWire.p2.x = mousepos.x;
		selectedWire.p2.y = mousepos.y;
	}
	
	if(editor_state == ST_CUT_WIRE){
		scissors.rect.left = mousepos.x - scissors.rect.width/2;
		scissors.rect.top = mousepos.y - scissors.rect.height/2;
		scissors.rect.bottom = scissors.rect.top + scissors.rect.height;
		scissors.rect.right = scissors.rect.left + scissors.rect.width;
		if(right_click){
			editor_state = ST_IDLE;
			scissors.rect.left = -100;
			scissors.rect.top = -100;
			right_click = false;
		}
	}
	
	for(var i = 0; i < wires.length; i++){
		wires[i].scissors_hover = false;
	}
	
	for(var i = 0; i < wires.length; i++){
		wires[i].update();
		if(editor_state == ST_CUT_WIRE){
			wires[i].scissors_hover = lineIntersectsRect(wires[i].p1, wires[i].m1, scissors.rect) | 
				lineIntersectsRect(wires[i].m1, wires[i].m2, scissors.rect) | 
				lineIntersectsRect(wires[i].m2, wires[i].p2, scissors.rect);
				
			if(clicked && wires[i].scissors_hover){ //Юзер навел ножницы на провод и нажал ЛКМ чтобы удалить эту связь
				//2do: у пинов удаляем из списка wire_point все точки, которые относятся к этой связи
				//удаляем из wires выделенную связь, выходим из цикла
				var pins = wires[i].pins;
				for(var j = 0; j < 2; j++){
					var i1 = pins[j].wire_point.indexOf(wires[i].p1);
					var i2 = pins[j].wire_point.indexOf(wires[i].p2);
					if(i1 >= 0) {pins[j].wire_point.splice(i1, 1); }
					if(i2 >= 0) {pins[j].wire_point.splice(i2, 1); }
				}
				wires.splice(i, 1);
				scissors.rect.left = -100;
				scissors.rect.top = -100;
				editor_state = ST_IDLE;
				clicked = false;
				break;
			}
			
			if(wires[i].scissors_hover) break;
		}
	}
}

function editor_draw(cx){
	var width = cx.canvas.clientWidth;
	var height = cx.canvas.clientHeight;
	
	cx.save();
	
	collapse_button.draw(cx);
	power_button.draw(cx);

	if(editor_visible){
		for(var i = 0; i < toolbar_btns.length; i++){ //Кнопки
			toolbar_btns[i].draw(cx);	
		}
		
		for(var i = 0; i < objects.length; i++){ //Логические элементы
			objects[i].draw(cx);
		}
		
		for(var i = 0; i < wires.length; i++){		
			wires[i].draw(cx);
		}
		
		cx.drawImage(graphics[scissors.name], scissors.rect.left, scissors.rect.top, scissors.rect.width, scissors.rect.height);
	}
		
	cx.restore();
}

function solve(){
	if(world_instance == null) return;

	ed_engines = [0, 0, 0, 0];
	
	var iterationsMax = 2000;
	
	for(var i = 0; i < objects.length; i++){
		var obj = objects[i];
		for(var j = 0; j < obj.pin_bb.length; j++){
			obj.pin_bb[j].setLogicLevel(-1);
		}
	}
	
	getObjectByName("r").func();
	getObjectByName("l").func();
	getObjectByName("t").func();
	getObjectByName("b").func();
	
	while(--iterationsMax > 0){
		var hizDetected = false;
		for(var i = 0; i < objects.length; i++){
			var obj = objects[i];
			var hiz = false;
			for(var j = 0; j < obj.pin_bb.length; j++){
				var pin = obj.pin_bb[j];
				if(pin.out) {
					if(pin.logic_level == -1){
						hizDetected = true;
					}
					continue; //Игнорим выходы
				}
				if(!pin.out && pin.logic_level == -1) {
					hiz = true;
					break;
				}
			}
			//На всех входных пинах элемента известен логический уровень - можно рассчитать выходное значение
			if(!hiz){
				obj.func();
			}
		}
		if(!hizDetected) break; //На всех выходах логических элементов известен логический уровень
	}
}

var trX, trY, scaleX, scaleY;

function mouse_project(x, y){
	return {x: (x - trX) * (1/scaleX), y:(y - trY) * (1/scaleY)};
}

var ST_SELECT_LEVEL = 0, ST_WIN = 1, ST_GAMEOVER = 2, ST_HELP = 3, ST_PLAY = 4; 
var game_state = ST_SELECT_LEVEL;

function play_screen(cx, delta){
	world_instance.world_update(delta);
	
	if(world_instance.robot_out){
		game_state = ST_GAMEOVER;
		return;
	}
	
	if(world_instance.robot_finish){
		game_state = ST_WIN;
		return;
	}
	
	if(editor_visible){
		world_instance.alpha = 0.8;
	} else {
		world_instance.alpha = 0;
	}
	
	world_instance.world_draw(cx);	
	
	if(world_instance.sensorsChanged()){
		var sensors = world_instance.world_readSensors();
		for(var i = 0; i < 4; i++) ed_sensors[i] = sensors[i];
		console.log(ed_sensors);
		solve();
		world_instance.world_setEngines(ed_engines);
	}
	
	editor_update(delta); 
	editor_draw(cx);
}

function select_level_screen(cx, delta){
	var columns_count = 6;
	var rows_count = 5;
	var coll_spacing = 20;
	var row_spacing = 20;
	var top_offset = 50;
	var block_width  = (WORLD_WIDTH - coll_spacing * columns_count) / columns_count;
	var block_height = (WORLD_HEIGHT - row_spacing * rows_count - top_offset) / columns_count;
	var title_color = "#ffff00";
	var description_color = "#41c4f4";
	var border_color = "#ffff00";
	
	var mousepos = mouse_project(mouse.x, mouse.y);
	var clicked = mouse_clicked() == 0;
	
	cx.strokeStyle = border_color;
	for(var i = 0; i < columns_count; i++){
		for(var j = 0; j < rows_count; j++){
			var x = i * block_width + coll_spacing * i;
			var y = top_offset + j * block_height + j * row_spacing;
			var level_num = j * columns_count + i;
			
			if(level_num >= levels.length) continue;
			
			cx.beginPath();
			cx.rect(x, y, block_width, block_height);
			cx.stroke();
			
			if(rectContains(createRect(x, y, x + block_width, y + block_height), mousepos.x, mousepos.y)){
				cx.fillStyle = mouse.pressed ? "#065F73" : border_color;
				cx.beginPath();
				cx.rect(x, y, block_width, block_height);
				cx.fill();
				cx.fillStyle = "#021B21";
				if(clicked){
					load_level(level_num, true);
					//world_instance.init_world(level_num, WORLD_WIDTH, WORLD_HEIGHT);
					game_state = ST_PLAY;
				}
			} else {
				cx.fillStyle = title_color;
			}

			cx.textAlign = "center"; 
			cx.font = "30px Arial";
			cx.fillText(levels[level_num].title, x + block_width / 2, y + block_height / 2);
			cx.font = "16px Arial";
			cx.fillStyle = description_color;
			cx.fillText(levels[level_num].summary, x + block_width / 2, y + block_height / 2 + 25);
		}
	}
}

function gameover_screen(cx, delta){
	var button_width = 200;
	var button_height = 50;
	var button_x = WORLD_WIDTH/2 - button_width/2;
	var button_y = WORLD_HEIGHT/2 + button_height/2 + 50;
	
	
	var mousepos = mouse_project(mouse.x, mouse.y);
	var clicked = mouse_clicked() == 0;
	
	cx.fillStyle = "#ffff00";
	cx.textAlign = "center"; 
	cx.font = "30px Arial";
	cx.fillText("Потрачено!", WORLD_WIDTH/2, WORLD_HEIGHT/2);
	cx.font = "16px Arial";
	cx.fillStyle = "#ffffff";
	cx.fillText("Робот вышел за границы поля и упал в черную дыру", WORLD_WIDTH/2, WORLD_HEIGHT/2 + 35);
	
	cx.strokeStyle = "#ffff00";
	cx.beginPath();
	if(rectContains(createRect(button_x, button_y, button_x + button_width, button_y + button_height), mousepos.x, mousepos.y)){
		cx.fillStyle = "#ffff00";
		cx.rect(button_x, button_y, button_width, button_height);
		cx.fill();
		cx.fillStyle = "#021B21";
		if(clicked){
			
			load_level(current_level.name, true);
			game_state = ST_PLAY;
		}
	} else {
		cx.fillStyle = "#ffffff";
	}
	cx.rect(button_x, button_y, button_width, button_height);
	cx.stroke();
	cx.fillText("Попробовать снова", button_x + button_width / 2, button_y + button_height / 2 + 5);
}

function game_win_screen(cx, delta){
	var button_width = 200;
	var button_height = 50;
	var button_x = WORLD_WIDTH/2 - button_width/2;
	var button_y = WORLD_HEIGHT/2 + button_height/2 + 50;
	
	var next_level = current_level.name + 1;
	
	var mousepos = mouse_project(mouse.x, mouse.y);
	var clicked = mouse_clicked() == 0;
	
	cx.fillStyle = "#ffff00";
	cx.textAlign = "center"; 
	cx.font = "30px Arial";
	cx.fillText("Победа!!!", WORLD_WIDTH/2, WORLD_HEIGHT/2);
	cx.font = "16px Arial";
	cx.fillStyle = "#ffffff";
	
	if(next_level >= levels.length){
		cx.fillText("Игра пройдена, уровней больше нет, но скоро будут :)", WORLD_WIDTH/2, WORLD_HEIGHT/2 + 35);
	} else {
		cx.strokeStyle = "#ffff00";
		cx.beginPath();
		if(rectContains(createRect(button_x, button_y, button_x + button_width, button_y + button_height), mousepos.x, mousepos.y)){
			cx.fillStyle = "#ffff00";
			cx.rect(button_x, button_y, button_width, button_height);
			cx.fill();
			cx.fillStyle = "#021B21";
			if(clicked){
				load_level(next_level, true);
				game_state = ST_PLAY;
			}
		} else {
			cx.fillStyle = "#ffffff";
		}
		cx.rect(button_x, button_y, button_width, button_height);
		cx.stroke();
		cx.fillText("Следующий уровень", button_x + button_width / 2, button_y + button_height / 2 + 5);
	}
}

function game_loop(cx, delta, world){
	if(world_instance == null){
		world_instance = world;
		//world_instance.init_world(0, WORLD_WIDTH, WORLD_HEIGHT);
	}
	
	var W = cx.canvas.clientWidth;
	var H = cx.canvas.clientHeight;
	var hn = H;
	wn = H * (WORLD_WIDTH / WORLD_HEIGHT);
	if(W < wn){
		hn = W * (WORLD_HEIGHT / WORLD_WIDTH);
		wn = W;
	}
	
	trX = W / 2 - wn / 2;
	trY = H / 2 - hn / 2;
	scaleX = wn / WORLD_WIDTH;
	scaleY = hn / WORLD_HEIGHT;
	
	cx.save();
	cx.translate(trX, trY);
	cx.scale(scaleX, scaleY);
	
	if(game_state == ST_PLAY) {
		play_screen(cx, delta);
	} else if(game_state == ST_SELECT_LEVEL) {
		select_level_screen(cx, delta);
	} else if(game_state == ST_WIN) {
		game_win_screen(cx, delta);
	} else if(game_state == ST_GAMEOVER) {
		gameover_screen(cx, delta);
	} else if(game_state == ST_HELP) {
		
	}

	cx.restore();
}

// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}

/*
0 - and
1 - or
2 - not
3 - nand
4 - nor
5 - xor
6 - iR
7 - iL
8 - iT
9 - iB
10 - eR
11 - eL
12 - eT
13 - eB
*/
function serialize(){
	var circuit = {
		c: [],
		level: world_instance.level_name
	};
	
	for(var i = 0; i < objects.length; i++){
		var obj = objects[i];
		var wires = [];
		
		for(var j = 0; j < obj.pin_bb.length; j++){
			for(var k = 0; k < obj.pin_bb[j].wire_point.length; k++){
				var wp = obj.pin_bb[j].wire_point[k];
				var conn = {p: j, i: wp.wire.id};
				wires.push(conn);
			}
		}
		
		var element = {
			t: obj.type,
			i: obj.id,
			x: obj.x,
			y: obj.y,
			a: obj.angle_acc,
			w: wires
		};
		
		circuit.c.push(element);
	}
	
	//level_id # obj.type obj.id obj.x obj.y @@ pin wire_id pin wire_id 
	
	var json = JSON.stringify(circuit);

	inputController.setCode(json);
	
	//json = prompt("Код для загрузки:", json);
	
	//deserialize(json);
	//solve();
}

var type2name = ["and", "or", "not", "nand", "nor", "xor", "r", "l", "t", "b", "re", "le", "te", "be"];

function wires_contains(id){
	for(var i = 0; i < wires.length; i++){
		if(wires[i].id == id) {
			
			return wires[i];
		}
	}
	return null;
}

function deserialize(json){
	var json = JSON.parse(json);
	objects.splice(0, objects.length);
	wires.splice(0, wires.length);
	place_inputs_outputs();
	
	for(var j = 0; j < json.c.length; j++){
		var e = json.c[j];
		var obj = null;
		
		if(!(e.t >= 6 && e.t <= 13)){
			obj = new LogicObject(type2name[e.t], e.x, e.y, elem_width, elem_height);
			obj.id = e.i;
			obj.rotate(e.a);
		} else {
			obj = getObjectByName(type2name[e.t]);
		}
		
		for(var i = 0; i < e.w.length; i++){
				var wire = e.w[i];
				
				var currentWire = wires_contains(wire.i);
				if(currentWire == null){
					currentWire = new Wire(null, null);
					currentWire.id = wire.i;
					wires.push(currentWire);
				}
				var pt = rectCenter(obj.getPinBounds(wire.p));
				if(currentWire.p1 == null){
					currentWire.p1 = pt;
					currentWire.pins[0] = (obj.pin_bb[wire.p]);
				} else if(currentWire.p2 == null){
					currentWire.p2 = pt;
					currentWire.pins[1] = (obj.pin_bb[wire.p]);
				} else {
					continue;
				}
				
				pt.wire = currentWire;
				obj.pin_bb[wire.p].wire_point.push(pt);
			}
		}
		objects.push(obj);
		
		load_level(json.level, false);
		game_state = ST_PLAY;
}
