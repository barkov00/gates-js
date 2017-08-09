function intersectRect(r1, r2) {
	return !(r2.left > r1.right || 
		r2.right < r1.left || 
		r2.top > r1.bottom ||
		r2.bottom < r1.top); 	
}

function getOverlap(d0, d1){
	x11 = d0.left,
    y11 = d0.top,
    x12 = d0.left + (d0.right - d0.left),
    y12 = d0.top + (d0.bottom - d0.top),
    x21 = d1.left,
    y21 = d1.top,
    x22 = d1.left + (d1.right - d1.left),
    y22 = d1.top + (d1.bottom - d1.top),
            
    /*x_overlap = x12<x21 || x11>x22 ? 0 : Math.min(x12,x22) - Math.max(x11,x21),
    y_overlap = y12<y21 || y11>y22 ? 0 : Math.min(y12,y22) - Math.max(y11,y21);*/
       
    x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
    y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));	
	return { 
		x: x_overlap,
		y: y_overlap,
		s: x_overlap * y_overlap
	};
}

function rectCenter(rect){
	return {
		x: (rect.left + rect.right) / 2,
		y: (rect.top + rect.bottom) / 2
	};
}

function createRect(){
	return {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		width: 0,
		height: 0
	}
}

function createRect(lft, tp, rgt, btm){
	return {
		left: lft,
		right: rgt,
		top: tp,
		bottom: btm,
		width: rgt-lft,
		height: btm-tp
	}
}

function rectContains(r, x, y){
	if(x > r.left && x < r.right && y > r.top && y < r.bottom) 
		return true;
	return false;
}

function _translate(x, y, xx, yy){
	return {x: x + xx, y: y + yy};
}
 
function area (a, b, c) {
	return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
 
function intersect_1 (a, b, c, d) {
	if (a > b)  { var temp = a; a = b; b = temp; }
	if (c > d)  { var temp = c; c = d; d = temp; }
	return Math.max(a,c) <= Math.min(b,d);
}
 
function lineIntersectsLine (a, b, c, d) {
	return intersect_1 (a.x, b.x, c.x, d.x)
		&& intersect_1 (a.y, b.y, c.y, d.y)
		&& area(a,b,c) * area(a,b,d) <= 0
		&& area(c,d,a) * area(c,d,b) <= 0;
}

function lineIntersectsRect(a, b, rect){
		//Отрезок внутри
		if( (a.x > rect.left && a.x < rect.right && a.y < rect.bottom && a.y > rect.top) || (b.x > rect.left && b.x < rect.right && b.y < rect.bottom && b.y > rect.top)) return true; 
		if(lineIntersectsLine(a, b, {x: rect.left, y: rect.top}, {x: rect.left, y: rect.bottom})) 		return true;
		if(lineIntersectsLine(a, b, {x: rect.right, y: rect.top}, {x: rect.right, y: rect.bottom})) 	return true;
		if(lineIntersectsLine(a, b, {x: rect.left, y: rect.top}, {x: rect.right, y: rect.top})) 		return true;
		if(lineIntersectsLine(a, b, {x: rect.left, y: rect.bottom}, {x: rect.right, y: rect.bottom})) 	return true;
		return false;
}