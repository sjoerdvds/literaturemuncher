var abstracts = []
var i = 0;
//var stepReady = false;

function initAbstracts(){
    stepIndex = 2;
    console.log("Start abstract evaluation");
    $("#evaluateabstracts").fadeIn(200, function(){});
    
    //Read in the abstracts from the files. DEPRECATED: use activeProject.abstracts
//    $(".file.ready").each(function(){
//       fileID = $(this).attr('id'); 
//       console.log(fileID);
//       arr = localStorage.getObject(fileID);
//       abstracts = abstracts.concat(arr);
//    });
//  
    abstracts = activeProject.abstracts;
    
    for(var j=0; j < abstracts.length; j++){
        var a = abstracts[j];
        var evalID = "eval" + a.id;
        var classes = "";
        if(a.isEvaluated){
            classes = a.isSelected ? "select":"reject";
        }

        $("#evaluations").append("<div class='" + classes + "' id='" + evalID + "'></div>");
    }
    
    if(abstracts && abstracts[0]){
        i = 0;
        
        for(var k = abstracts.length-1; k >= 0; k--){
            if(!abstracts[k].isEvaluated){
                i = k;
            }
        }
        displayAbstract(abstracts[i]);
        setCursorToCurrent();
    }
    
    $("#evaluateabstracts").keyup(function(evt){
        var code = evt.keyCode;
        if(code==74){
            //j:Select & next abstract
            selectCurrent();
            next();
        }
        if(code==78){
            //n:Reject & next abstract
            rejectCurrent();
            next();
        }
        if(code==39){
            //->:Next abstract
            next();
        }
        if(code==37){
            //<-:Previous abstract
            previous();
        }
    });
    
    $("#evaluateabstracts").focus();
    $("#init-download").on("click", function(){
        if(activeProject && activeProject.steps[stepIndex]){
            nextStep();
        }
    });
    
    $("#back-abstracts").on("click", function(){
        $("#evaluateabstracts").fadeOut(1000, function(){
            initFileRead();
        })
    })
}

function displayAbstract(abstractObject){
    $("#title").text(abstractObject.title);
    $("#authors").text(abstractObject.authors);
    $("#publication").text(abstractObject.publication);
    $("#citecount").text(abstractObject.cites);
    $("#year").text(abstractObject.year);
    $("#abstract").text(abstractObject.text);
    $("#keywords").text(abstractObject.keywords);
}

function rejectCurrent(){
    changeCurrentClass("select", "reject");
    abstracts[i].isSelected=false;
    abstracts[i].isEvaluated=true;
}

function changeCurrentClass(from, to){
    var a = abstracts[i];
    var elem = $("#eval" + a.id);
    try{
        elem.removeClass(from)
    }catch(e){}
    elem.addClass(to);
}

function selectCurrent(){
    changeCurrentClass("reject", "select")
    abstracts[i].isSelected=true;
    abstracts[i].isEvaluated=true;
}

function setCursorToCurrent(){
    var a = abstracts[i];
    $("#evaluations .cursor").each(function(){
        $(this).removeClass("cursor");
    })
    
    $("#eval" + a.id).addClass("cursor");
}

function next(){
    if(i < abstracts.length-1){
        i = i + 1;
        console.log(i + "/" + abstracts.length);
        displayAbstract(abstracts[i]);
        setCursorToCurrent();
    }
    else{
        activeProject.steps[stepIndex] = true;
        
    }
}

function previous(){
    if(i>=0){
        i = i - 1;
        displayAbstract(abstracts[i]);
        setCursorToCurrent();
    }
}

function getAbstractFromEval(evalID){
    evalID = evalID.substring(4);
    for(var j=0; j < abstracts.length; j++){
        abs = abstracts[j];
        if(abs.id == evalID){
            return abs;
        }
    }
    return null;
}

function nextStep(){
    $("#evaluateabstracts").fadeOut(1000, function(){
        $("#downloadpapers").fadeIn(200, function(){
            initDownloads(abstracts);
            
        })
    })
}