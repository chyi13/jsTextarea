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
var linePaddingLeft;
var linePaddingTop;

// 
var pollingFast = false;
var fastPollVal, slowPollVal;

//
var caretPosX, caretPosY;
var caretCoordX, caretCoordY;
//
var cursor;
// create cursor
function Cursor(parent) {
	this.parent = parent;
	this.c = document.createElement("div");
	this.c.style.position = "absolute";
	this.c.style.zIndex = "3";
	this.c.style.borderLeft = "solid 1px black";
	this.c.style.margin = "0";
	this.c.style.top = PADDING.top;
	this.c.style.left = PADDING.left;
//	this.c.top = window.getComputedStyle(parent).top;
	this.c.style.height = window.getComputedStyle(parent).fontSize;
	parent.appendChild(this.c);
	
	console.log(window.getComputedStyle(this.c).top);
};
Cursor.prototype = {
	init: function () {
		setInterval(this.blink.bind(this), 500);
	},
	blink: function () {
		if (this.c.style.visibility === "hidden") {
			this.c.style.visibility = "";
		}
		else {
			this.c.style.visibility = "hidden";
		}
	},

	updatePos: function (x, y) {
		this.c.style.left = x + "px";
		this.c.style.top = y + "px";
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

var PADDING = {top: "30px", left: "30px"};

function jsTextarea(parent, textarea) {
	// new textarea
	p = parent;
	t = textarea;
}

jsTextarea.prototype = {
	init: function () {
		ta = document.createElement("div");
		// <div id="ma" style="position: absolute; top: 0px; z-index: 2;"></div>
		ta.style.position = "absolute";
		ta.style.top = PADDING.top;
		ta.style.left = PADDING.left;
		ta.style.zIndex = "2";
		
		caretCoordX = 3;
		caretCoordY = 3;
		
		p.insertBefore(ta, t.parentNode);
		
		["keydown", "keyup"].forEach(function(event) {
			t.addEventListener(event, this.update.bind(this));
		}.bind(this));
		
		t.focus();

		cursor = new Cursor(p);
		cursor.init();
	},

	update: function () {
		//
		pollingFast = true;

		clearInterval(fastPollVal);
		// fast poll
		fastPollVal = setInterval(this.poll.bind(this), 20);
	},

	poll: function () {
		var text = t.value;
		if (text === prevalue) {
			pollingFast = false;
		}
		this.applyTextInput(text);
		
		// set timeout for slow poll
		this.setSlowPoll();

		prevalue = text;
		// update cursor
		cursor.updatePos(caretCoordX, caretCoordY);
	},

	slowPoll: function () {

	},

	setSlowPoll: function () {
		// check polling fast 
		if (!pollingFast) {
			slowPollVal = setInterval(this.slowPoll.bind(this), 1000);
			clearInterval(fastPollVal);
		} else {
			clearInterval(slowPollVal);
		}
	},

	applyTextInput: function (inserted) {
		
		var newlines = this.splitLines(inserted);
		
		// delete 
		this.emptyTextarea();

		var index = 0;
		
		// caret 
		var caretPos = t.selectionStart;
		var chCount = 0;

		caretPosX = -1, caretPosY = -1;
		if (inserted !== "") {
			console.log(newlines.length);
			for (index = 0; index < newlines.length; index++) {
				if (countChar(index, newlines[index])) {
					createMirrorNodeCaret(newlines[index]);
				}
				var tempNewLineNode = this.createNewLineNode(newlines[index]);
				ta.appendChild(tempNewLineNode);

				setLineHeight();
			}
		} else {
			caretCoordX = linePaddingLeft;
			caretCoordY = linePaddingTop;
		}

		function countChar(tempIndex, tempStr) {
			if (caretPosX !== -1) { return false; }
			if (caretPos >= chCount + tempStr.length + 1) {
				chCount += (tempStr.length + 1);
				return false;
			}
			 
			caretPosX = caretPos - chCount;
			caretPosY = tempIndex;
			return true;
		}

		function setLineHeight() {
			if (lineheight === -1) {
				lineheight = ta.offsetHeight;
				linePaddingLeft = ta.offsetLeft;
				linePaddingTop = ta.offsetTop;
			}
		}

		function createMirrorNodeCaret(str) {
			var lineNode = document.createElement("pre");
			lineNode.style.margin = "0";
			lineNode.style.zIndex = "1";
			lineNode.style.position = "absolute";
			lineNode.style.whiteSpace = "pre";
			lineNode.style.visibility = "hidden";

			var beforeCaret = document.createElement("span");
			var afterCaret = document.createElement("span");
			beforeCaret.textContent = str.substring(0, caretPosX);
			afterCaret.textContent = str.substr(caretPosX);

			lineNode.appendChild(beforeCaret);
			lineNode.appendChild(afterCaret);
			
			ta.appendChild(lineNode);
			caretCoordX = afterCaret.offsetLeft + linePaddingLeft;
			caretCoordY = afterCaret.offsetTop + caretPosY * lineheight + linePaddingTop;
		}
	},
	displayCursor: function () {

	},

	createNewLineTag: function () {
		return document.createElement("br");
	},

	createNewLineNode: function (str) {
		var lineNode = document.createElement("pre");
		lineNode.style.margin = "0";
		lineNode.style.zIndex = "2";
		lineNode.style.position = "relative";
		lineNode.style.whiteSpace = "pre";
		
		if (str === "") {
			lineNode.appendChild(document.createTextNode("\n"));
			return lineNode;
		}
		// highlight keywords
		var i = 0;
		var keyword_pos = [];
		var startPos;
		for (i = 0; i < KEY_WORDS.length; i++) {
			while ((startPos = str.indexOf("<" + KEY_WORDS[i] + ">", startPos)) !== -1) {
				keyword_pos.push({ start: startPos, end: startPos + KEY_WORDS[i].length + 2 });
				startPos += KEY_WORDS[i].length + 2;
			}
		}
		
		// sort
		keyword_pos.sort(function (a, b) {
			return a.start - b.start;
		});
		
		// add
		startPos = 0;
		for (i = 0; i < keyword_pos.length; i++) {
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

	createTextNode: function (str) {
		return document.createTextNode(str);
	},

	createHighlightNode: function (str) {
		var hlNode = document.createElement("span");
		hlNode.style.zIndex = "2";
		hlNode.style.position = "relative";
	//	hlNode.style.paddingRight = "3px";
		hlNode.style.color = "red";
		hlNode.appendChild(this.createTextNode(str));
		return hlNode;
	},

	splitLines: function (str) {
		return str.split("\n");
	},

	emptyTextarea: function () {
		ta.innerHTML = '';
	},

	getLineNumber: function () {
		if (lineheight === -1) {
			lineheight = ta.offsetHeight;
		}
		var currentHeight = ta.offsetHeight;
		return currentHeight / lineheight;
	}
};