
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
var elem_height = 50;
var elem_width = 100;
var ST_IDLE = 0, ST_DRAG = 1, ST_SEL_PIN = 2, ST_WIRE = 3, ST_CUT_WIRE = 4;
var editor_state = ST_IDLE;
var selectedWire = -1;
var scissors = null;
var collapse_button = null;
var power_button = null;
var editor_visible = true;
var world_instance = null;

var ed_sensors = [0, 0, 0, 0]; //R L T B
var ed_engines = [0, 0, 0, 0]; //R L T B

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
		this.hit = rectContains(this.rect, mouse.x, mouse.y);
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
	this.p1 = p1;
	this.p2 = p2;
	this.m1 = {x: 0, y: 0};
	this.m2 = {x: 0, y: 0};
	this.logic_level = -1;
	this.pins = [];
	this.color = "black";
	this.scissors_hover = false;
	this.update = function(){
		if(Math.abs(p1.x - p2.x) > Math.abs(p1.y - p2.y)){
			var m1x = (p1.x + p2.x) / 2;
			this.m1.x = m1x;
			this.m1.y = p1.y;
			this.m2.x = m1x;
			this.m2.y = p2.y;
		} else {
			var m1y = (p1.y + p2.y) / 2;
			this.m1.x = p1.x;
			this.m1.y = m1y;
			this.m2.x = p2.x;
			this.m2.y = m1y;
		}
	}
	this.draw = function(cx){
		cx.beginPath();
		if(this.logic_level == -1) cx.strokeStyle = "black";
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
		}
	}
}

//<!-- classes

//Класс логического элемента
function LogicObject(name, x, y, width, height){
	this.id = obj_ids++;
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
			if(pin.wire_point.length == 0) continue;
			var rect = this.getPinBounds(j);
			var c = {x: rect.left, y: (rect.top+rect.bottom)/2};
			for(var k = 0; k < pin.wire_point.length; k++){
				pin.wire_point[k].x = c.x;
				pin.wire_point[k].y = c.y;
			}
		}	
	}
	
	this.setPosition = function(x, y){
		x -= this.rect.width / 2;
		y -= this.rect.height / 2; //x, y - координаты центра элемента
		this.x = x;
		this.y = y;
		this.sprite.x = x;
		this.sprite.y = y;
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
	
	if(name == "and" || name == "nand" || name == "or" || name == "xor" || name == "nor"){
		this.pin_bb.push(new PinBB(0, 15  - pin_bb_size/2, pin_bb_size, 15 + pin_bb_size/2, false, this));
		this.pin_bb.push(new PinBB(0, 36  - pin_bb_size/2, pin_bb_size, 36 + pin_bb_size/2, false, this));
		this.pin_bb.push(new PinBB(this.rect.width - pin_bb_size, 25  - pin_bb_size/2, this.rect.width, 25 + pin_bb_size/2, true, this));
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.sprite.origin_offset.x = 5;
	} 
	
	if(name == "not"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		//this.sprite.origin_offset.x = 5;
		this.pin_bb.push(new PinBB(0, 25  - pin_bb_size/2, pin_bb_size, 25 + pin_bb_size/2, false, this));
		this.pin_bb.push(new PinBB(this.rect.width - pin_bb_size, 25  - pin_bb_size/2, this.rect.width, 25 + pin_bb_size/2, true, this));
		this.func = function(){
			this.pin_bb[1].logic_level = (this.pin_bb[0].logic_level == 0 ? 1 : 0);
			//Меняем лог. уровень у всех кто подключен к этому пину
			for(var i = 0; i < this.pin_bb[1].wire_point.length; i++) this.pin_bb[1].wire_point[i].wire.setLogicLevel(this.pin_bb[1].logic_level);
		}
	}
	
	if(name == "r"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(35, 15, 50, this.rect.height / 2 + 10, true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[1];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "l"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(35, 15, 50, this.rect.height / 2 + 10, true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[0];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "b"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(35, 15, 50, this.rect.height / 2 + 10, true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[3];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "t"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(35, 15, 50, this.rect.height / 2 + 10, true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[2];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "re"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[1] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "le"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[0] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "te"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[2] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "be"){
		this.sprite = new Sprite(graphics[this.name], x, y, width, height);
		this.pin_bb.push(new PinBB(0, 15, 16, this.rect.height / 2 + 10, false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[3] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "and") {
		this.func = function(){
			this.pin_bb[2].logic_level = this.pin_bb[0].logic_level * this.pin_bb[1].logic_level;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
	} 
	if(name == "nand") {
		this.func = function(){
			this.pin_bb[2].logic_level = this.pin_bb[0].logic_level * this.pin_bb[1].logic_level == 0 ? 1 : 0;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
	}  
	if(name == "or") {
		this.func = function(){
			this.pin_bb[2].logic_level = (this.pin_bb[0].logic_level == 1 || this.pin_bb[1].logic_level == 1) ? 1 : 0;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
	} 
	if(name == "xor") {
		this.func = function(){
			this.pin_bb[2].logic_level =  (this.pin_bb[0].logic_level == this.pin_bb[1].logic_level) ? 0 : 1;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
	}
	if(name == "nor") {
		this.func = function(){
			this.pin_bb[2].logic_level = (this.pin_bb[0].logic_level == 1 || this.pin_bb[1].logic_level == 1) ? 0 : 1;
			for(var i = 0; i < this.pin_bb[2].wire_point.length; i++) this.pin_bb[2].wire_point[i].wire.setLogicLevel(this.pin_bb[2].logic_level);
		}
	}
	
	this.draw = function(cx){
		this.sprite.draw(cx);
		if(this.hover){
			cx.beginPath();
			cx.strokeStyle = this.aabb_stroke_color;
			cx.moveTo(this.rect.left, this.rect.top);
			cx.lineTo(this.rect.right, this.rect.top);
			cx.lineTo(this.rect.right, this.rect.bottom);
			cx.lineTo(this.rect.left, this.rect.bottom);
			cx.lineTo(this.rect.left, this.rect.top);
			cx.stroke();
			cx.closePath();
		}
		for(var j = 0; j < this.pin_bb.length; j++){
			var rect = this.getPinBounds(j);
			cx.lineWidth = this.pin_bb[j].hover ? 4 : 2;
			//cx.strokeStyle = this.pin_bb[j].hover ? "red" : "cyan";
			cx.strokeStyle = this.pin_bb[j].hover ? "red" : "cyan";
			if(this.pin_bb[j].logic_level == -1) cx.strokeStyle = "black";
			if(this.pin_bb[j].logic_level == 1) cx.strokeStyle = "red";
			if(this.pin_bb[j].logic_level == 0) cx.strokeStyle = "blue";
			cx.beginPath();
			
			
			cx.moveTo(rect.left, rect.top);
			cx.lineTo(rect.right, rect.top);
			cx.lineTo(rect.right, rect.bottom);
			cx.lineTo(rect.left, rect.bottom);
			cx.lineTo(rect.left, rect.top);
			cx.stroke();
			cx.closePath();
			
		} 
		cx.lineWidth = 2;
		cx.strokeStyle = "black";
	}
	
	this.rotate = function(angle){
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
};
//classes -->

function init_editor(_canvas){
	canvas = _canvas;
	
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
	  
	load_image("and", "images/and.png");
	load_image("or", "images/or.png");
	load_image("not", "images/not.png");
	load_image("nand", "images/nand.png");
	load_image("nor", "images/nor.png");
	load_image("xor", "images/xor.png");
	load_image("scissors", "images/scissors.png");
	load_image("r", "images/r.png");
	load_image("l", "images/l.png");
	load_image("t", "images/t.png");
	load_image("b", "images/b.png");
	load_image("re", "images/re.png");
	load_image("le", "images/le.png");
	load_image("te", "images/te.png");
	load_image("be", "images/be.png");
	load_image("collapse", "images/collapse-button.png");
	load_image("expand", "images/expand-button.png");
	load_image("poweron", "images/poweron_button.png");
	
	toolbar_btns.push(new SimpleButton("and", 0, 0, 100, 50, graphics["and"]));
	toolbar_btns.push(new SimpleButton("or", 100, 0, 100, 50, graphics["or"]));
	toolbar_btns.push(new SimpleButton("not", 200, 0, 100, 50, graphics["not"]));
	toolbar_btns.push(new SimpleButton("nand", 300, 0, 100, 50, graphics["nand"]));
	toolbar_btns.push(new SimpleButton("nor", 400, 0, 100, 50, graphics["nor"]));
	toolbar_btns.push(new SimpleButton("xor", 500, 0, 100, 50, graphics["xor"]));
	toolbar_btns.push(new SimpleButton("scissors", 600, 0, 50, 50, graphics["scissors"]));
	collapse_button = new SimpleButton("hide_show_button", canvas.width - 100, 0, 50, 50, graphics["collapse"]);
	power_button = new SimpleButton("poweron", canvas.width - 170, 0, 50, 50, graphics["poweron"]);
	
	objects.push(new LogicObject("r", 35, canvas.height/2 - 100, 50, 50));
	objects.push(new LogicObject("l", 35, canvas.height/2 - 50, 50, 50));
	objects.push(new LogicObject("t", 35, canvas.height/2 + 50, 50, 50));
	objects.push(new LogicObject("b", 35, canvas.height/2 + 100, 50, 50));
	
	objects.push(new LogicObject("re", canvas.width - 35, canvas.height/2 - 100, 50, 50));
	objects.push(new LogicObject("le", canvas.width - 35, canvas.height/2 - 50, 50, 50));
	objects.push(new LogicObject("te", canvas.width - 35, canvas.height/2 + 50, 50, 50));
	objects.push(new LogicObject("be", canvas.width - 35, canvas.height/2 + 100, 50, 50));
	
	scissors = new StaticObject("scissors", -100, -100, 50, 50);
	
	pin_bb_size = elem_height / 5;
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
		world_instance.reset();
		clicked = false;
	}
	
	if(!editor_visible) return;
	
	//Обработка нажатия на кнопки редактора
	if(editor_state == ST_IDLE)
	{
		for(var i = 0; i < toolbar_btns.length; i++) {
			//var hover = rectContains(toolbar_btns[i].rect, mouse.x, mouse.y);
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
		if(obj.drag && clicked && (editor_state == ST_DRAG) && mouse.y > toolbar_height * 1.5){ 
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
			obj.translate(mouse.x - obj.rect.left - obj.rect.width / 2, mouse.y - obj.rect.top - obj.rect.height / 2);
		} else {	
			var obj_hit =  rectContains(obj.rect, mouse.x, mouse.y);
			objects[i].hover = obj_hit;
			
			if(right_click & obj_hit){
				obj.rotate(90);
				right_click = false;
				console.log("rotate");
			}
		
			if(!(editor_state == ST_IDLE || editor_state == ST_WIRE)) 
				continue;
			
			//коллизии курсора с пинами
		    var pin_selected = false;
			for(var j = 0; j < obj.pin_bb.length; j++){
				var pin = obj.pin_bb[j];
				var rect = obj.getPinBounds(j);
				var hover = rectContains(rect, mouse.x, mouse.y);
				if(hover) {
					pin_selected = true;
					if(clicked && (editor_state != ST_WIRE)){
						//Клик по пину
						selectedWire = new Wire(rectCenter(rect), {x: mouse.x, y: mouse.y});
						selectedWire.pins[0] = pin;
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
			
			if(!pin_selected && obj_hit && clicked && (editor_state == ST_IDLE)){
				objects[i].drag = true;
				editor_state = ST_DRAG; //начало перетаскивания объекта
				continue;
			}
		}
	} 
	
	if(editor_state == ST_WIRE){
		selectedWire.p2.x = mouse.x;
		selectedWire.p2.y = mouse.y;
	}
	
	if(editor_state == ST_CUT_WIRE){
		scissors.rect.left = mouse.x - scissors.rect.width/2;
		scissors.rect.top = mouse.y - scissors.rect.height/2;
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

function game_loop(cx, delta, world){
	world_instance = world;
	
	world.world_update(delta); 
	world.world_draw(cx);	
	if(editor_visible){
		cx.fillStyle = "rgba(255,255,255,0.9)";
		cx.fillRect(0, 0, cx.canvas.clientWidth, cx.canvas.clientHeight);
	}
	if(world.sensorsChanged()){
		var sensors = world.world_readSensors();
		for(var i = 0; i < 4; i++) ed_sensors[i] = sensors[i];
		//console.log(ed_sensors);
		solve();
		world.world_setEngines(ed_engines);
		console.log(ed_engines);
		
	}
	
	editor_update(delta); 
	editor_draw(cx);
}