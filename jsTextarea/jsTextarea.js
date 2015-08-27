// 
var ta;
var p;
var t;

//
var prevalue = "";

function jsTextarea(parent, textarea) {
	// new textarea
	p = parent;
	t = textarea;
}

jsTextarea.prototype = {
	init: function() {
		ta = document.createElement("div");
		// <div id="ma" style="position: absolute; top: 0px; z-index: 2;"></div>
		ta.style.position = "absolute";
		ta.style.top = "0px";
		ta.style.zIndex = "2";

		p.insertBefore(ta, t.parentNode);


		t.addEventListener("keydown", this.update.bind(this));
		t.focus();
	},

	update: function() {
		var text = t.value;

		// Find the part of the input that is actually new
		var same = 0,
			l = Math.min(prevalue.length, text.length);
		while (same < l && prevalue.charCodeAt(same) == text.charCodeAt(same)) ++same;
		//
		this.applyTextInput(text.slice(same), text.slice(text.length - same));
		
		prevalue = text;
	},

	applyTextInput: function(prestr, newstr) {
		var newlines = newstr.split("\n");
		console.log(newlines);
		var index = 0;
		for (index = 0; index < newlines.length; index++) {
			ta.appendChild(this.createTextNode(newlines[index]));
		}
	},

	createTextNode: function(str) {
		return document.createTextNode(str);
	}
};