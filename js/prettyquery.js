/** Keywords and classes. Each keyword has a regular expression and an associated CSS class*/
//OR
var Keywords = {
	OR : 1,
	AND: 2,
	NOT: 3,
	properties:{
		1: {regex: /^or[( ]/gi, styleclass:"key blue", value:"OR"},
		2: {regex: /^and[( ]/gi, styleclass:"key green", value:"AND"},
		3: {regex: /^not[( ]/gi, styleclass:"key red", value:"NOT"},
	}
}

/**Convenience: provide endsWith method for String objects */
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}


$(document).ready(function(){init()})
function init(){
	console.log("initing")
	$("#txt").keyup(function(evt){eval_key(evt)})
	$("#query").click(function(){$("#txt").focus()})
}

function eval_key(evt){
	console.log("key up " + evt.keyCode)
	code = evt.keyCode;
	elem = $(evt.target);
	if(code==32 || (evt.shiftKey && (code==57 || code==48))){
		parse_text(elem)
	}
	else{
		elem.width((elem.val().length*1.2 + 2) + "ex")
	}
}

var parentheses = []

function parse_text(elem){
	//convert textarea elements to spans with the right class
	text = elem.val();

	//check if text matches a pattern, then convert to span with appropriate class
	if(text.endsWith(")")){
		console.log("End parenthesis:" + parentheses)
		last_par = parentheses.pop()
		keyprops = Keywords.properties[last_par]
		par_style = ""
		if(keyprops){
			par_style = keyprops.styleclass
			console.log("Parentheses style:" + par_style)
		}
		else{
			par_style = "plain"
		}
		elem.parent().replaceWith("<span class='plain'>" + text.substring(0, text.length-1) + "</span><span class='" + par_style + "'>)</span>")
	}
	else{	
		key_value = match_keywords(text)
		if(key_value){
			keyprops = Keywords.properties[key_value]
			elem.parent().replaceWith("<span class='" + keyprops.styleclass + "'>" + text.toUpperCase().replace(/ /g, "&nbsp;") + "</span>")
			if(text.endsWith("(")){
				parentheses.push(key_value)
				console.log("Start parenthesis:" + parentheses)
			}
	
		}
		else{
			text = text.replace(/ /g, "&nbsp;")
			elem.parent().replaceWith("<span class='plain'>" + text + "</span>")
		}
	}	
	new_input = $("<span class='plain'><input type='text' class='in' id='txt'/></span>").insertBefore("#spacer")
	$("#txt").focus()
	$("#txt").keyup(function(evt){eval_key(evt)})
}

function match_keywords(text){
	result =null;
	$.each(Keywords, function(key, value){
		//console.log("Key " + key + " Value " + value)
		//console.log(text.match(Keywords.properties[value].regex))
		if(key!='properties' && (text.match(Keywords.properties[value].regex))){
			result = value
		}	
	})
	console.log("match " + result)
	return result
}




