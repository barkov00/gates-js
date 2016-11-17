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