/* global style */
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
var bg;
var gutter;

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
	this.c.style.top = PADDING.top;
	this.c.style.left = PADDING.left;
	this.c.className = "jstextarea-cursor";
	parent.appendChild(this.c);

	this.blinkRef = undefined;

};
Cursor.prototype = {

	init: function () {
		//this.toggleOn();
	},
	blink: function () {
		if (this.c.style.visibility === "hidden") {
			this.c.style.visibility = "visible";
		}
		else {
			this.c.style.visibility = "hidden";
		}
	},

	toggleOff: function () {
		clearInterval(this.blinkRef);
		this.c.style.visibility = "hidden";
	},

	toggleOn: function () {
		this.c.style.visibility = "visible";
		this.blinkRef = setInterval(this.blink.bind(this), 530);
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

var OPERATIONS = /[+\-*&%=<>!?|~^]/;

var FUNCTIONS = [
	"log"	
];

var PADDING = { top: "10px", iTop: 10, left: "40px", iLeft: 40 };

function jsTextarea(parent, textarea) {
	// new textarea
	p = parent;
	t = textarea;
}

jsTextarea.prototype = {
	init: function () {
		// create background
		function createBackground(parent) {
			var tBg = document.createElement("div");
			tBg.className = "jstextarea-background";
			parent.appendChild(tBg);
			return tBg;
		}
		bg = createBackground(p);
		
		// create gutter background
		function createGutter(parent) {
			var tGutter = document.createElement("div");
			tGutter.className = "jstextarea-gutter";
			parent.appendChild(tGutter);
			return tGutter;
		}
		gutter = createGutter(bg);
		
		// create textarea
		ta = document.createElement("div");
		ta.style.top = PADDING.top;
		ta.style.left = PADDING.left;
		ta.className = "jstextarea-textarea";

		bg.appendChild(ta);
		
		// create caret
		cursor = new Cursor(bg);
		cursor.init();
		caretCoordX = 3;
		caretCoordY = 3;
		p.insertBefore(bg, t.parentNode);
		
		// add listeners
		["keydown", "keyup"].forEach(function (event) {
			t.addEventListener(event, this.update.bind(this));
		}.bind(this));

		t.addEventListener("blur", function () { cursor.toggleOff(); }.bind(this));
		t.addEventListener("focus", function () { cursor.toggleOn(); }.bind(this));

		t.focus();

		bg.addEventListener("click", function () { t.focus(); }.bind(this));
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
			for (index = 0; index < newlines.length; index++) {
				// calculate caret pos
				if (countChar(index, newlines[index])) {
					createMirrorNodeCaret(newlines[index]);
					ta.appendChild(createFocusedLine());
				}
				
				// add line number
				var tempNewLineNumberNode = this.createNewLineNumber(index);
				ta.appendChild(tempNewLineNumberNode);

				var tempNewLineNode;// = this.createNewLineNode(newlines[index]);
				tempNewLineNode = this.createNewLineNode1(newlines[index]);
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
				// get line height
				var hStr = window.getComputedStyle(ta).lineHeight;
				lineheight = parseInt(hStr.substr(0, hStr.length - 2));
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
		
		function createFocusedLine() {
			var lineNode = document.createElement("div");
			lineNode.className = "jstextarea-focusline";
			return lineNode;
		}
	},

	createNewLineNode: function (str) {
		var lineNode = document.createElement("pre");
		lineNode.className = "jstextarea-linenode";
		
		// if empty
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
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////
	createNewLineNode1: function (str) {
		var lineNode = document.createElement("pre");
		lineNode.className = "jstextarea-linenode";
		
		// if empty
		if (str === "") {
			lineNode.appendChild(document.createTextNode("\n"));
			return lineNode;
		}
		
		this.createQuoteString({char: "", end: true}, str, lineNode);
		// not empty
// 		var splits = str.split(/(\s)/);
// 		var quoteState = {char: "", end: true};
// 		for (var i = 0; i<splits.length; i++) {
// 			if (splits[i] !== "") {
// 				var tSubstr = splits[i];
// 				// quotation marks " and '
// 				if (splits[i] === " ") {
// 					// add space? may have some problems
// 					lineNode.appendChild(this.createTextNode(' '));
// 				} else {
// 					// check if the line has quote
// 					var tStringNode = document.createElement("span");
// 					quoteState = this.createQuoteString(quoteState, tSubstr, tStringNode);
// 			//		console.log(quoteState);
// 					lineNode.appendChild(tStringNode);
					
// //					lineNode.appendChild(this.createKeywordNode(tSubstr));	
// 				}
// 			}
// 		}
		return lineNode;
	},
	
	createQuoteString: function(state, str, parent) {
		var qState = state;
		var sNode;	
		// find new quotes
		if (qState.end === true) {
			var qSingleIndex = str.indexOf("'");
			var qDoubleIndex = str.indexOf('"');
			if (qSingleIndex !== -1 && qDoubleIndex !== -1) {
				if (qSingleIndex < qDoubleIndex) { // single '
					sNode = this.createKeywordNode(str.substring(0, qSingleIndex + 1));
					parent.appendChild(sNode);
					qState = this.createQuoteString({ char: "'", end: false }, str.substr(qSingleIndex + 1), parent);
				} else {	// double "
					sNode = this.createKeywordNode(str.substring(0, qDoubleIndex + 1));
					parent.appendChild(sNode);
					qState = this.createQuoteString({ char: '"', end: false }, str.substr(qDoubleIndex + 1), parent);
				}
			} else if (qSingleIndex !== -1) {
				sNode = this.createKeywordNode(str.substring(0, qSingleIndex + 1));
				parent.appendChild(sNode);
				qState = this.createQuoteString({ char: "'", end: false }, str.substr(qSingleIndex + 1), parent);
			} else if (qDoubleIndex !== -1) {
				sNode = this.createKeywordNode(str.substring(0, qDoubleIndex + 1));
				parent.appendChild(sNode);
				qState = this.createQuoteString({ char: '"', end: false }, str.substr(qDoubleIndex + 1), parent);
			} else { // no quotes
				sNode = this.createKeywordNode(str);
				parent.appendChild(sNode);
			}
		} else {
			var qIndex = str.indexOf(qState.char);
			if (qIndex !== -1) {
				sNode = this.createStringNode(str.substring(0, qIndex));
				parent.appendChild(sNode);
				parent.appendChild(this.createKeywordNode(qState.char));
				this.createQuoteString({ char: "", end: true }, str.substr(qIndex + 1), parent);
			} else {
				sNode = this.createStringNode(str);
				parent.appendChild(sNode);
			}
		}
		
		return qState;
	},
	
	createStringNode: function(str) {
		var tNode = document.createElement("span");
		tNode.className = "jstextarea-string";
		tNode.textContent = str;
		return tNode;
	},
	
	createQuoteString1: function(qState, str, parent) {
		if (str === "") return qState;
		// end
		var tQState = qState;
		var qIndex = -1;
		var tSNode = document.createElement("span");
		// if previous does not close the string
		if (qState.end === false) {
			// find the end tag
			if ((qIndex = str.indexOf(qState.char)) !== -1) {
				tSNode.textContent = str.substring(0, qIndex);
				tSNode.className = "jstextarea-string";
				parent.appendChild(tSNode);
				console.log("substr", str.substr(qIndex));
				tQState = this.createQuoteString1({char: "", end: true}, str.substr(qIndex), parent);
			} else {
				console.log(str);
				tSNode.textContent = str;
				tSNode.className = "jstextarea-string";
				parent.appendChild(tSNode);
			}
			
		} else { // if close, find its own
			var qSingleIndex = str.indexOf("'");
			var qDoubleIndex = str.indexOf('"');
			// if find string
			if (qSingleIndex !== -1 && qDoubleIndex !== -1) {
				if (qSingleIndex < qDoubleIndex) {
					tSNode = this.createKeywordNode(str.substring(0, qSingleIndex + 1));
					parent.appendChild(tSNode);
					// do the same thing to the rest of the string
					tQState = this.createQuoteString1({ char: "'", end: false }, str.substr(qSingleIndex + 1), parent);
				} else {
					tSNode = this.createKeywordNode(str.substring(0, qDoubleIndex + 1));
					parent.appendChild(tSNode);
					tQState = this.createQuoteString1({ char: '"', end: false }, str.substr(qDoubleIndex + 1), parent);
				}
			} else if (qSingleIndex !== -1) {
				tSNode = this.createKeywordNode(str.substring(0, qSingleIndex + 1));
				parent.appendChild(tSNode);
				// do the same thing to the rest of the string
				tQState = this.createQuoteString1({ char: "'", end: false }, str.substr(qSingleIndex + 1), parent);
			} else if (qDoubleIndex !== -1) {
				console.log(str.substr(qDoubleIndex + 1));
				tSNode = this.createKeywordNode(str.substring(0, qDoubleIndex + 1));
				parent.appendChild(tSNode);
				tQState = this.createQuoteString1({ char: '"', end: false }, str.substr(qDoubleIndex + 1), parent);
			} else {
				tSNode = this.createKeywordNode(str);
				parent.appendChild(tSNode);
			}

		}
		return tQState;
	},

	createKeywordNode: function (str) {
		var tKNode = document.createElement("span");
		tKNode.textContent = str;
		// keyword
		if (KEY_WORDS.indexOf(str) !== -1) {
			tKNode.className = "jstextarea-keyword";
			return tKNode;
		} else {
			//
			tKNode.className = "jstextarea-variable";
			return tKNode;
		}
	},
//////////////////////////////////////////////////////////////////////////////////////////////////////////

	createTextNode: function (str) {
		return document.createTextNode(str);
	},

	createHighlightNode: function (str) {
		var hlNode = document.createElement("span");
		hlNode.style.zIndex = "3";
		hlNode.style.position = "relative";
		//	hlNode.style.paddingRight = "3px";
		hlNode.style.color = "red";
		hlNode.appendChild(this.createTextNode(str));
		return hlNode;
	},

	createNewLineNumber: function (index) {
		var lnNode = document.createElement("div");
		lnNode.className = "jstextarea-linenumber";
		lnNode.style.left = -(PADDING.iLeft - 10) + "px";
		lnNode.textContent = index + 1;
		return lnNode;
	},

	splitLines: function (str) {
		return str.split("\n");
	},

	emptyTextarea: function () {
		ta.innerHTML = '';
	}
};