
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
	  
	load_image("and", "images/and.jpg");
	load_image("or", "images/or.png");
	load_image("not", "images/not.png");
	load_image("nand", "images/nand.png");
	load_image("nor", "images/nor.png");
	load_image("xor", "images/xor.png");
	
	toolbar_btns.push(createObject("and", 0, 0, 100, 50));
	toolbar_btns.push(createObject("or", 0, 0, 100, 50));
	toolbar_btns.push(createObject("not", 0, 0, 100, 50));
	toolbar_btns.push(createObject("nand", 0, 0, 100, 50));
	toolbar_btns.push(createObject("nor", 0, 0, 100, 50));
	toolbar_btns.push(createObject("xor", 0, 0, 100, 50));
	
	var btn_height = toolbar_height;
	var btn_width = toolbar_height * 2;
	for(var i = 0; i < toolbar_btns.length; i++){
		toolbar_btns[i].rect.left = i * btn_width;
		toolbar_btns[i].rect.bottom = btn_height;
		toolbar_btns[i].rect.right = toolbar_btns[i].rect.left + btn_width;
		toolbar_btns[i].rect.top = 0;
	}
}

function createObject(name, x, y, width, height){
	var obj = {
		img: name,
		rect: createRect(),
		bb: createRect(),
		hover: false,
		drag: false
	}
	obj.rect.left = x;
	obj.rect.top = y;
	obj.rect.bottom = y + height;
	obj.rect.right = x + width;
	obj.rect.height = height;
	obj.rect.width = width;
	return obj;
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

var ST_IDLE = 0, ST_DRAG = 1;
var editor_state = ST_IDLE;

function editor_update(dt){
	var clicked = mouse_clicked();
	//toolbar
	for(var i = 0; i < toolbar_btns.length; i++) {
		var hover = rectContains(toolbar_btns[i].rect, mouse.x, mouse.y);
		toolbar_btns[i].hover = hover;
		if(hover && clicked && !(editor_state == ST_DRAG)){
			var obj = createObject(toolbar_btns[i].img, 300, 300, 100, 50);
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
		if(obj.drag && clicked && (editor_state == ST_DRAG) && mouse.y > toolbar_height * 1.5){ //щаканчиваем перетаскивание, оставляем объект там где юзер кликнул
			objects[i].drag = false;
			editor_state = ST_IDLE;
			continue;
		}
		
		if(objects[i].drag){	//привязываем объект к курсору мыши во время перетаскивания
			obj.rect.left = mousepos.x - obj.rect.width/2;
			obj.rect.top = mousepos.y - obj.rect.height/2;
			obj.rect.bottom = obj.rect.top + obj.rect.height;
			obj.rect.right = obj.rect.left + obj.rect.width;
		} else {	//начало перетаскивания объекта
			var hover = rectContains(obj.rect, mousepos.x, mousepos.y);
			objects[i].hover = hover;
			if(hover && clicked && !(editor_state == ST_DRAG)){
				objects[i].drag = true;
				editor_state = ST_DRAG;
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
		cx.drawImage(graphics[btn.img], btn.rect.left, 0, btn.rect.right-btn.rect.left, btn.rect.bottom-btn.rect.top);
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
		cx.drawImage(graphics[obj.img], obj.rect.left, obj.rect.top, obj.rect.right-obj.rect.left, obj.rect.bottom-obj.rect.top);
		if(obj.hover){
			cx.beginPath();
			cx.strokeStyle = mouse.pressed == false ? "green" : "lightgreen";
			cx.rect(obj.rect.left, obj.rect.top, obj.rect.right-obj.rect.left, obj.rect.bottom-obj.rect.top);
			cx.stroke();
			cx.closePath();
		}
	}
}