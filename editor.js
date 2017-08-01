
var toolbar_height = 50;
var graphics = [];
var canvas = null;
var mouse = {
	x: 0,
	y: 0,
	pressed: false,
	state: false
};
var toolbar_btns = [];
var objects = [];
var obj_ids = 0;
var pin_bb_size = 0;
var original_width = 200;
var original_height = 100;
var elem_height = 50;
var elem_width = 100;
var hk = elem_height / original_height;
var wk = elem_width / original_width;

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

function init_editor(_canvas){
	canvas = _canvas;
	
	canvas.addEventListener('mousemove', function(evt) {
		var rect = canvas.getBoundingClientRect();
        mouse.x = evt.clientX - rect.left;
		mouse.y = evt.clientY - rect.top;
      }, false);
	  
	canvas.addEventListener('mousedown', function(evt) {
		mouse.pressed = true;
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
	
	toolbar_btns.push(new GameObject("and", 0, 0, 100, 50));
	toolbar_btns.push(new GameObject("or", 0, 0, 100, 50));
	toolbar_btns.push(new GameObject("not", 0, 0, 100, 50));
	toolbar_btns.push(new GameObject("nand", 0, 0, 100, 50));
	toolbar_btns.push(new GameObject("nor", 0, 0, 100, 50));
	toolbar_btns.push(new GameObject("xor", 0, 0, 100, 50));
	
	pin_bb_size = elem_height / 5;
	var btn_height = toolbar_height;
	var btn_width = toolbar_height * 2;
	for(var i = 0; i < toolbar_btns.length; i++){
		toolbar_btns[i].rect.left = i * btn_width;
		toolbar_btns[i].rect.bottom = btn_height;
		toolbar_btns[i].rect.right = toolbar_btns[i].rect.left + btn_width;
		toolbar_btns[i].rect.top = 0;
	}
}

function PinBB(rect, out){
	this.rect = rect;
	this.out = out;
	this.hover = false;
	this.wire_id = 0;
}

function LogicObject(name, x, y, width, height){
	this.id = obj_ids++;
	this.name = name;
	this.rect = createRect();
	this.pin_bb = [];
	this.func = null;
	this.drag = false;
	this.hover = false;
	
	this.rect.height = height;
	this.rect.width = width + pin_bb_size;
	
	this.rect.left = x;
	this.rect.top = y;
	this.rect.bottom = y + this.rect.height;
	this.rect.right = x + this.rect.width;

	
	if(name == "and"){
		this.pin_bb.push(new PinBB(createRect(0, 28 * hk - pin_bb_size/2, pin_bb_size, 28* hk + pin_bb_size/2), false));
		this.pin_bb.push(new PinBB(createRect(0, 70 * hk - pin_bb_size/2, pin_bb_size, 70* hk + pin_bb_size/2), false));
		this.pin_bb.push(new PinBB(createRect(this.rect.width - pin_bb_size, 48 * hk - pin_bb_size/2, this.rect.width, 48* hk + pin_bb_size/2), false));
	}
	if(name == "nand"){
		
	}
	if(name == "or"){
		
	}
	if(name == "xor"){
		
	}
	if(name == "not"){
		
	}
	if(name == "nor"){
	
	}
};

function GameObject(_name, x, y, width, height){
	this.name = _name;
	this.rect = createRect(x, y, x + width, y + height);
	this.hover = false;
	this.drag = false;
}

function mouse_clicked(){
	if(mouse.pressed && !mouse.state){
		mouse.state = true;
	}
	if(!mouse.pressed && mouse.state){
		mouse.state = false;
		return true;
	}
	return false;
}

function _translate(x, y, xx, yy){
	return {x: x + xx, y: y + yy};
}

var ST_IDLE = 0, ST_DRAG = 1, ST_SEL_PIN = 2;
var editor_state = ST_IDLE;

function editor_update(dt){
	var clicked = mouse_clicked();
	//toolbar
	for(var i = 0; i < toolbar_btns.length; i++) {
		var hover = rectContains(toolbar_btns[i].rect, mouse.x, mouse.y);
		toolbar_btns[i].hover = hover;
		if(hover && clicked && !(editor_state == ST_DRAG)){
			var obj = new LogicObject(toolbar_btns[i].name, 300, 300, elem_width, elem_height);
			obj.drag = true;
			editor_state = ST_DRAG;
			objects.push(obj);
			clicked = false;
		}
	}
	//objects
	var mousepos = _translate(mouse.x, mouse.y, 0, -toolbar_height);
	for(var i = 0; i < objects.length; i++){
		var obj = objects[i];
		if(obj.drag && clicked && (editor_state == ST_DRAG) && mouse.y > toolbar_height * 1.5){ //заканчиваем перетаскивание, оставляем объект там где юзер кликнул
			objects[i].drag = false;
			editor_state = ST_IDLE;
			continue;
		}
		
		if(objects[i].drag){	//привязываем объект к курсору мыши во время перетаскивания
			obj.rect.left = mousepos.x - obj.rect.width/2;
			obj.rect.top = mousepos.y - obj.rect.height/2;
			obj.rect.bottom = obj.rect.top + obj.rect.height;
			obj.rect.right = obj.rect.left + obj.rect.width;
		} else {	
			//коллизии курсора с пинами
		    var pin_selected = false;
			for(var j = 0; j < obj.pin_bb.length; j++){
				var bb = obj.pin_bb[j].rect;
				var rect = {
					left: obj.rect.left + bb.left,
					right: obj.rect.left + bb.right,
					top: obj.rect.top + bb.top,
					bottom: obj.rect.top + bb.bottom
				}
				var hover = rectContains(rect, mousepos.x, mousepos.y);
				if(hover) {
					pin_selected = true;
				}
				objects[i].pin_bb[j].hover = hover;
			}
			
			var hover = rectContains(obj.rect, mousepos.x, mousepos.y);
			objects[i].hover = hover;
			if(!pin_selected && hover && clicked && (editor_state == ST_IDLE)){
				objects[i].drag = true;
				editor_state = ST_DRAG; //начало перетаскивания объекта
				continue;
			}
		}
	} 
}

function editor_draw(cx){
	var width = cx.canvas.clientWidth;
	var height = cx.canvas.clientHeight;
	
	cx.clearRect(0, 0, width, width);
	cx.save();
	
	draw_toolbar(cx, toolbar_height);
	cx.translate(0, toolbar_height);
	draw_objects(cx);
	
	
	cx.restore();
}

function draw_toolbar(cx){
	for(var i = 0; i < toolbar_btns.length; i++){
		var btn = toolbar_btns[i];
		cx.drawImage(graphics[btn.name], btn.rect.left, 0, btn.rect.right-btn.rect.left, btn.rect.bottom-btn.rect.top);
		if(btn.hover){
			cx.beginPath();
			cx.strokeStyle = mouse.pressed == false ? "green" : "lightgreen";
			cx.rect(btn.rect.left, 0, btn.rect.right-btn.rect.left, btn.rect.bottom-btn.rect.top);
			cx.stroke();
			cx.closePath();
		}
	}
}

function draw_objects(cx){
	for(var i = 0; i < objects.length; i++){
		var obj = objects[i];
		cx.drawImage(graphics[obj.name], obj.rect.left, obj.rect.top, obj.rect.right-obj.rect.left, obj.rect.bottom-obj.rect.top);
		
		if(obj.hover){
			cx.beginPath();
			cx.strokeStyle = mouse.pressed == false ? "green" : "lightgreen";
			cx.rect(obj.rect.left, obj.rect.top, obj.rect.right-obj.rect.left, obj.rect.bottom-obj.rect.top);
			cx.stroke();
			cx.closePath();
		}
		
		for(var j = 0; j < obj.pin_bb.length; j++){
			var bb = obj.pin_bb[j].rect;
			var rect = {
						left: obj.rect.left + bb.left,
						right: obj.rect.left + bb.right,
						top: obj.rect.top + bb.top,
						bottom: obj.rect.top + bb.bottom
					}
			cx.beginPath();
			cx.strokeStyle = obj.pin_bb[j].hover ? "red" : "cyan";
			cx.rect(rect.left, rect.top, rect.right-rect.left, rect.bottom-rect.top);
			//cx.rect(obj.rect.left + bb.left, obj.rect.top + bb.top, bb.width, bb.height);
			cx.stroke();
			cx.closePath();
		} 
	}
}

function draw_wire(cx, startPoint, endPoint){
	cx.beginPath();
	cx.strokeStyle = "black";
	var p1, p2;
	
	if(Math.abs(startPoint.x - endPoint.x) > Math.abs(startPoint.y - endPoint.y)){
		p1 = {x: (startPoint.x + endPoint.x) / 2, y: startPoint.y};
		p2 = {x: p1.x, y: endPoint.y};
	} else {
		p1 = {x: startPoint.x, y: (startPoint.y + endPoint.y) / 2};
		p2 = {x: endPoint.x, y: p1.y};
	}

	cx.moveTo(startPoint.x, startPoint.y);
	cx.lineTo(p1.x, p1.y);
	cx.moveTo(p1.x, p1.y);
	cx.lineTo(p2.x, p2.y);
	cx.moveTo(p2.x, p2.y);
	cx.lineTo(endPoint.x, endPoint.y);

	cx.stroke();
	cx.closePath();
}