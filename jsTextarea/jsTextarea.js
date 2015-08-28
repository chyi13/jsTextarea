// 
var ta;
var p;
var t;

var doc;
//
var prevalue = "";

//
var linenumber = -1;

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


		t.addEventListener("keyup", this.update.bind(this));
		t.focus();
	},

	update: function() {
		console.log(t.selectionStart);
		this.poll();
	},

	poll: function() {
		var text = t.value;
		// Find the part of the input that is actually new
		var same = 0,
			l = Math.min(prevalue.length, text.length);
		while (same < l && prevalue.charCodeAt(same) == text.charCodeAt(same)) ++same;
		//
		this.applyTextInput(text.slice(same), prevalue);

		prevalue = text;

		setTimeout(this.poll.bind(this), 20);
	},

	applyTextInput: function(inserted, prestr) {
		var newlines = this.splitLines(inserted);
		
		// delete 
		this.removeFromLineNumber(this.getPrevLineNumber());
		
		var index = 0;
		if (inserted != "") {
			for (index = 0; index < newlines.length; index++) {
				ta.appendChild(this.createTextNode(newlines[index]));
				if ((index+1) < newlines.length) {
					ta.appendChild(this.createNewLine());
				}
			}
		}
	},

	createNewLine: function() {
		return document.createElement("br");
	},

	createTextNode: function(str) {
		return document.createTextNode(str);
	},

	splitLines: function(str) {
		return str.split("\n");
	},
	
	removeFromLineNumber: function(n) {
		console.log("remove ", n);
		if (ta.getElementsByTagName("br")[n] != undefined) {
			this.removeFromChild(ta.getElementsByTagName("br")[n]);	
		}
		
	},
	
	removeFromChild: function(obj) {
		while(obj.nextSibling) {
			ta.removeChild(obj.nextSibling);
		}
		
	},
	
	getLineNumber: function()
	getPrevLineNumber: function() {
		if (prevalue != "") {
			return prevalue.split("\n").length -1;
		}
		else 
			return 0;
	}
};