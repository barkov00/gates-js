
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
var original_width = 200;
var original_height = 100;
var elem_height = 50;
var elem_width = 100;
var hk = elem_height / original_height;
var wk = elem_width / original_width;
var ST_IDLE = 0, ST_DRAG = 1, ST_SEL_PIN = 2, ST_WIRE = 3, ST_CUT_WIRE = 4;
var editor_state = ST_IDLE;
var selectedWire = -1;
var scissors = null;

var ed_sensors = [0, 1, 0, 0]; //R L T B
var ed_engines = [0, 0, 0, 0]; //R L T B

function editor_reset(){
	ed_sensors = [0, 1, 0, 0]; //R L T B
	ed_engines = [0, 0, 0, 0]; //R L T B
}

function editor_setSensors(sens){
	ed_sensors[0] = sens[1];
	ed_sensors[1] = sens[0];
	ed_sensors[2] = sens[3];
	ed_sensors[3] = sens[2];
}

function editor_getEngines(){
	return ed_engines;
}

function getObjectByName(name){
	for(var i = 0; i < objects.length; i++){
		if(objects[i].name == name) return objects[i];
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

function StaticObject(_name, x, y, width, height){
	this.name = _name;
	this.rect = createRect(x, y, x + width, y + height);
	this.hover = false;
	this.drag = false;
}

function PinBB(rect, out, parent){
	this.rect = rect;
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
		//cx.moveTo(this.m1.x, this.m1.y);
		cx.lineTo(this.m2.x, this.m2.y);
		//cx.moveTo(this.m2.x, this.m2.y);
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
	
	this.rect.height = height;
	this.rect.width = width + pin_bb_size;
	
	this.rect.left = x;
	this.rect.top = y;
	this.rect.bottom = y + this.rect.height;
	this.rect.right = x + this.rect.width;
	
	if(name == "and" || name == "nand" || name == "or" || name == "xor" || name == "nor"){
		this.pin_bb.push(new PinBB(createRect(0, 28 * hk - pin_bb_size/2, pin_bb_size, 28* hk + pin_bb_size/2), false, this));
		this.pin_bb.push(new PinBB(createRect(0, 70 * hk - pin_bb_size/2, pin_bb_size, 70* hk + pin_bb_size/2), false, this));
		this.pin_bb.push(new PinBB(createRect(this.rect.width - pin_bb_size, 48 * hk - pin_bb_size/2, this.rect.width, 48* hk + pin_bb_size/2), true, this));
	} 
	
	if(name == "not"){
		this.pin_bb.push(new PinBB(createRect(0, 48 * hk - pin_bb_size/2, pin_bb_size, 48* hk + pin_bb_size/2), false, this));
		this.pin_bb.push(new PinBB(createRect(this.rect.width - pin_bb_size, 48 * hk - pin_bb_size/2, this.rect.width, 48* hk + pin_bb_size/2), true, this));
		this.func = function(){
			this.pin_bb[1].logic_level = (this.pin_bb[0].logic_level == 0 ? 1 : 0);
			//Меняем лог. уровень у всех кто подключен к этому пину
			for(var i = 0; i < this.pin_bb[1].wire_point.length; i++) this.pin_bb[1].wire_point[i].wire.setLogicLevel(this.pin_bb[1].logic_level);
		}
	}
	
	if(name == "r"){
		this.pin_bb.push(new PinBB(createRect(35, 15, 50, this.rect.height / 2 + 10), true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[0];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "l"){
		this.pin_bb.push(new PinBB(createRect(35, 15, 50, this.rect.height / 2 + 10), true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[1];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "b"){
		this.pin_bb.push(new PinBB(createRect(35, 15, 50, this.rect.height / 2 + 10), true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[2];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "t"){
		this.pin_bb.push(new PinBB(createRect(35, 15, 50, this.rect.height / 2 + 10), true, this));
		this.can_delete = false;
		this.func = function(){
			this.pin_bb[0].logic_level = ed_sensors[3];
			for(var i = 0; i < this.pin_bb[0].wire_point.length; i++) this.pin_bb[0].wire_point[i].wire.setLogicLevel(this.pin_bb[0].logic_level);
		}
	}
	
	if(name == "re"){
		this.pin_bb.push(new PinBB(createRect(0, 15, 16, this.rect.height / 2 + 10), false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[1] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "le"){
		this.pin_bb.push(new PinBB(createRect(0, 15, 16, this.rect.height / 2 + 10), false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[0] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "te"){
		this.pin_bb.push(new PinBB(createRect(0, 15, 16, this.rect.height / 2 + 10), false, this));
		this.can_delete = false;
		this.func = function(){
			ed_engines[2] = this.pin_bb[0].logic_level;
		}
	}
	
	if(name == "be"){
		this.pin_bb.push(new PinBB(createRect(0, 15, 16, this.rect.height / 2 + 10), false, this));
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
	
	toolbar_btns.push(new StaticObject("and", 0, 0, 100, 50));
	toolbar_btns.push(new StaticObject("or", 0, 0, 100, 50));
	toolbar_btns.push(new StaticObject("not", 0, 0, 100, 50));
	toolbar_btns.push(new StaticObject("nand", 0, 0, 100, 50));
	toolbar_btns.push(new StaticObject("nor", 0, 0, 100, 50));
	toolbar_btns.push(new StaticObject("xor", 0, 0, 100, 50));
	toolbar_btns.push(new StaticObject("scissors", 100, 0, 50, 50));
	
	objects.push(new LogicObject("r", 0, canvas.height/2 - 100, 50, 50));
	objects.push(new LogicObject("l", 0, canvas.height/2 - 50, 50, 50));
	objects.push(new LogicObject("t", 0, canvas.height/2 + 50, 50, 50));
	objects.push(new LogicObject("b", 0, canvas.height/2 + 100, 50, 50));
	
	objects.push(new LogicObject("re", canvas.width - 55, canvas.height/2 - 100, 50, 50));
	objects.push(new LogicObject("le", canvas.width - 55, canvas.height/2 - 50, 50, 50));
	objects.push(new LogicObject("te", canvas.width - 55, canvas.height/2 + 50, 50, 50));
	objects.push(new LogicObject("be", canvas.width - 55, canvas.height/2 + 100, 50, 50));

	
	
	scissors = new StaticObject("scissors", -100, -100, 50, 50);
	
	pin_bb_size = elem_height / 5;
	//Рассчет координат кнопок
	var offset = 0;
	for(var i = 0; i < toolbar_btns.length; i++){
		toolbar_btns[i].rect.left += offset;
		toolbar_btns[i].rect.bottom = toolbar_btns[i].rect.height;
		toolbar_btns[i].rect.right = toolbar_btns[i].rect.left + toolbar_btns[i].rect.width;
		toolbar_btns[i].rect.top = 0;
		offset += toolbar_btns[i].rect.width;
	}
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

function editor_update(dt){
	var mouse_btn_code = mouse_clicked();
	var clicked = mouse_btn_code == 0;
	var right_click = mouse_btn_code == 2;

	//Обработка нажатия на кнопки редактора
	if(editor_state == ST_IDLE)
	{
		for(var i = 0; i < toolbar_btns.length; i++) {
			var hover = rectContains(toolbar_btns[i].rect, mouse.x, mouse.y);
			toolbar_btns[i].hover = hover;
			if(hover && clicked && !(editor_state == ST_DRAG)){
				if(toolbar_btns[i].name != "scissors"){
					var obj = new LogicObject(toolbar_btns[i].name, 300, 300, elem_width, elem_height);
					obj.drag = true;
					editor_state = ST_DRAG;
					objects.push(obj);
				} else {
					editor_state = ST_CUT_WIRE;
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
		
	var mousepos = _translate(mouse.x, mouse.y, 0, -toolbar_height);
	
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
			obj.rect.left = mousepos.x - obj.rect.width/2;
			obj.rect.top = mousepos.y - obj.rect.height/2;
			obj.rect.bottom = obj.rect.top + obj.rect.height;
			obj.rect.right = obj.rect.left + obj.rect.width;
			//Обновляем координат концов проводов
			for(var j = 0; j < obj.pin_bb.length; j++){
				var pin = obj.pin_bb[j];
				if(pin.wire_point.length == 0) continue;
				var bb = pin.rect;
				var rect = {
					left: obj.rect.left + bb.left,
					right: obj.rect.left + bb.right,
					top: obj.rect.top + bb.top,
					bottom: obj.rect.top + bb.bottom
				}
				var c = rectCenter(rect);
				for(var k = 0; k < pin.wire_point.length; k++){
					pin.wire_point[k].x = c.x;
					pin.wire_point[k].y = c.y;
				}
			}
		} else {	
			var obj_hover =  rectContains(obj.rect, mousepos.x, mousepos.y);
			objects[i].hover = obj_hover;
		
			if(!(editor_state == ST_IDLE || editor_state == ST_WIRE)) 
				continue;
			
			//коллизии курсора с пинами
		    var pin_selected = false;
			for(var j = 0; j < obj.pin_bb.length; j++){
				var pin = obj.pin_bb[j];
				var bb = pin.rect;
				var rect = {
					left: obj.rect.left + bb.left,
					right: obj.rect.left + bb.right,
					top: obj.rect.top + bb.top,
					bottom: obj.rect.top + bb.bottom
				}
				var hover = rectContains(rect, mousepos.x, mousepos.y);
				if(hover) {
					pin_selected = true;
					if(clicked && (editor_state != ST_WIRE)){
						//Клик по пину
						selectedWire = new Wire(rectCenter(rect), mousepos);
						selectedWire.pins[0] = pin;
						var st = selectedWire.p1;
						st.wire = selectedWire;
						console.log(st);
						pin.wire_point.push(st /*{x: selectedWire.p1.x, y: selectedWire.p1.y, wire: selectedWire}*/ );
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
						pin.wire_point.push(st /*{x: selectedWire.p2.x, y: selectedWire.p2.y, wire: selectedWire}*/ );
						selectedWire = null;
						editor_state = ST_IDLE;
						clicked = false;
					}
				}
				objects[i].pin_bb[j].hover = hover;
			}
			
	
			
			if(!pin_selected && obj_hover && clicked && (editor_state == ST_IDLE)){
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
	
	cx.clearRect(0, 0, width, width);
	cx.save();
	
	//Отрисовка панели с кнопками
	for(var i = 0; i < toolbar_btns.length; i++){
		var btn = toolbar_btns[i];
		cx.drawImage(graphics[btn.name], btn.rect.left, btn.rect.top, btn.rect.right-btn.rect.left, btn.rect.bottom-btn.rect.top);
		if(btn.hover){
			cx.beginPath();
			cx.strokeStyle = mouse.pressed == false ? "green" : "lightgreen";
			cx.rect(btn.rect.left, 0, btn.rect.right-btn.rect.left, btn.rect.bottom-btn.rect.top);
			cx.stroke();
			cx.closePath();
		}
	}
	
	cx.translate(0, toolbar_height);
	
	
	
	//Отрисовка объектов:
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
	
	//if(wires.length > 0)
	//console.log("s = " + scissors.rect.left + " " + scissors.rect.top + " " + scissors.rect.bottom + " " + scissors.rect.right + " l " + wires[0].p1.x + " " + wires[0].p1.y + " " + wires[0].m1.x + " " + wires[0].m1.y);

	for(var i = 0; i < wires.length; i++){		
		wires[i].draw(cx);
	}
	
	//Отрисовка ножниц
	cx.drawImage(graphics[scissors.name], scissors.rect.left, scissors.rect.top, scissors.rect.width, scissors.rect.height);
	//cx.beginPath();
	//cx.strokeStyle = "green";
	//cx.rect(scissors.rect.left, scissors.rect.top, scissors.rect.right-scissors.rect.left, scissors.rect.bottom-scissors.rect.top);
	//cx.stroke();
	//cx.closePath();
	
	cx.restore();
}

function solve(){
	var iterationsMax = 2000;
	
	for(var i = 0; i < objects.length; i++){
		var obj = objects[i];
		for(var j = 0; j < obj.pin_bb.length; j++){
			obj.pin_bb[j].setLogicLevel(-1);
		}
	}
	
	getObjectByName("r").pin_bb[0].setLogicLevel(ed_sensors[0]);
	getObjectByName("l").pin_bb[0].setLogicLevel(ed_sensors[1]);
	getObjectByName("b").pin_bb[0].setLogicLevel(ed_sensors[2]);
	getObjectByName("t").pin_bb[0].setLogicLevel(ed_sensors[3]);
	
	while(--iterationsMax > 0){
		for(var i = 0; i < objects.length; i++){
			var obj = objects[i];
			var hiz = false;
			for(var j = 0; j < obj.pin_bb.length; j++){
				var pin = obj.pin_bb[j];
				if(pin.out) continue; //Игнорим выходы
				if(pin.logic_level == -1) {
					hiz = true;
					break;
				}
			}
			//На всех входных пинах элемента известен логический уровень - можно рассчитать выходное значение
			if(!hiz){
				obj.func();
			}
		}
	}
}