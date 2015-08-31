//  
//                                  _oo8oo_
//                                 o8888888o
//                                 88" . "88
//                                 (| -_- |)
//                                 0\  =  /0
//                               ___/'==='\___
//                             .' \\|     |// '.
//                            / \\|||  :  |||// \
//                           / _||||| -:- |||||_ \
//                          |   | \\\  -  /// |   |
//                          | \_|  ''\---/''  |_/ |
//                          \  .-\__  '-'  __/-.  /
//                        ___'. .'  /--.--\  '. .'___
//                     ."" '<  '.___\_<|>_/___.'  >' "".
//                    | | :  `- \`.:`\ _ /`:.`/ -`  : | |
//                    \  \ `-.   \_ __\ /__ _/   .-` /  /
//                =====`-.____`.___ \_____/ ___.`____.-`=====
//                                  `=---=`
//  
//  
//       ~~~~~~~Powered by https://github.com/ottomao/bugfreejs~~~~~~~
// 
//                          佛祖保佑         永无bug
//                          
// 
var ta;
var p;
var t;

var doc;
//
var prevalue = "";

//
var linenumber = -1;
var lineheight = -1;

// 
var pollingFast = false;
var fastPollVal, slowPollVal;

//
var cursor;
// create cursor
function Cursor(parent) {
	this.parent = parent;
	this.c = document.createElement("div");
	this.c.style.position = "relative";
	this.c.style.zIndex = "3";
	this.c.style.borderLeft = "solid 1px black";
	this.c.style.height = "19px";
	parent.appendChild(this.c);
};
Cursor.prototype = {
	init: function () {
		setInterval(this.update.bind(this), 500);
	},
	update: function () {
		if (this.c.style.visibility === "hidden") {
			this.c.style.visibility = "";
		}
		else {
			this.c.style.visibility = "hidden";
		}
	}
};


var KEY_WORDS = [
	"abstract", "case", "catch", "class", "def",
	"do", "else", "extends", "false", "final",
	"finally", "for", "forSome", "if", "implicit",
	"import", "lazy", "match", "new", "null",
	"object", "override", "package", "private", "protected",
	"return", "sealed", "super", "this", "throw",
	"trait", "try", "true", "type", "val",
	"var", "while", "with", "yield"
];



function jsTextarea(parent, textarea) {
	// new textarea
	p = parent;
	t = textarea;
}

jsTextarea.prototype = {
	init: function() {
		ta = document.createElement("pre");
		// <div id="ma" style="position: absolute; top: 0px; z-index: 2;"></div>
		ta.style.position = "absolute";
		ta.style.top = "0px";
		ta.style.zIndex = "2";
		p.insertBefore(ta, t.parentNode);


		t.addEventListener("keydown", this.update.bind(this));
		t.focus();
		
		cursor = new Cursor(p);
		cursor.init();
	},

	update: function() {
		//
		pollingFast = true;
		
		clearInterval(fastPollVal);
		// fast poll
		fastPollVal = setInterval(this.poll.bind(this), 20);
	},
	
	poll: function() {
		var text = t.value;
		if (text === prevalue) {
			pollingFast = false;
		} 
		this.applyTextInput(text);
		
		// set timeout for slow poll
		this.setSlowPoll();

		prevalue = text;
		
		console.log(this.getLineNumber());
	},
	
	slowPoll: function() {
			
	},
	
	setSlowPoll: function() {
		// check polling fast 
		if (!pollingFast) {
			slowPollVal = setInterval(this.slowPoll.bind(this), 1000);	
			clearInterval(fastPollVal);
		} else {
			clearInterval(slowPollVal);
		}
	},
	
	applyTextInput: function(inserted) {
		var newlines = this.splitLines(inserted);
		
		// delete 
		this.emptyTextarea();
		
		var index = 0;
		if (inserted != "") {
			for (index = 0; index < newlines.length; index++) {
				// this.createTextNode(newlines[index]);
				ta.appendChild(this.createNewLineNode(newlines[index]));
			}
		}

	},
		
	displayCursor: function() {
		
	},
	
	createNewLineTag: function() {
		return document.createElement("br");
	},
	
	createNewLineNode: function(str) {
		var lineNode = document.createElement("pre");
		lineNode.style.margin = "0";
		lineNode.style.zIndex = "2";
		lineNode.style.position = "relative";
		lineNode.style.whiteSpace = "pre";
		// highlight keywords
		var i = 0;
		var keyword_pos = [];
		var startPos;
		for (i = 0; i< KEY_WORDS.length; i++) {
			while ((startPos = str.indexOf("<" + KEY_WORDS[i] + ">", startPos)) !== -1) {
				keyword_pos.push({start: startPos, end: startPos + KEY_WORDS[i].length  + 2});
				startPos += KEY_WORDS[i].length + 2;
			}
		}
		
		// sort
		keyword_pos.sort(function(a, b) {
			return a.start - b.start;
		});
		
		// add
		startPos = 0;
		for (i = 0; i< keyword_pos.length; i++) {
			var substr = str.substring(startPos, keyword_pos[i].start);
			lineNode.appendChild(this.createTextNode(substr));
			substr = str.substring(keyword_pos[i].start, keyword_pos[i].end);
			lineNode.appendChild(this.createHighlightNode(substr));
			
			startPos = keyword_pos[i].end;
		}
		
		if (startPos !== str.length) {
			lineNode.appendChild(this.createTextNode(str.substr(startPos)));
		}
		
		return lineNode;	
	},
	
	createTextNode: function(str) {
		return document.createTextNode(str);
	},
	
	createHighlightNode: function(str) {
		var hlNode = document.createElement("span");
		hlNode.style.zIndex = "2";
		hlNode.style.position = "relative";
		hlNode.style.paddingRight = "3px";
		hlNode.style.color = "red";
		hlNode.appendChild(this.createTextNode(str));
		return hlNode;
	},

	splitLines: function(str) {
		return str.split("\n");
	},
	
	emptyTextarea: function() {
		ta.innerHTML = '';	
	},
	
	getLineNumber: function() {
		if (lineheight === -1) {
			lineheight = ta.offsetHeight;
		}
		var currentHeight = ta.offsetHeight;
		return currentHeight/ lineheight;
	}
};