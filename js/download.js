
function initDownloads(){
    $("#downloadpapers").show();
    var abstractList = activeProject.abstracts;
    for(var i = 0; i < abstractList.length; i++){
        var abs = abstractList[i];
        if(abs.isSelected){
            var rowHtml = "<div id='tr"+ abs.id + "' class='row'><div class='title'>"+abs.title+"</div><div class='tags'><div class='tag'>"+(abs.doi? "DOI":"SCHOLAR")+"</div></div></div>";
            $("#paperlist").append(rowHtml);
        }
        //var abshtml = "<tr id='" + abs.id + "'><td>" + abs.title + "</td><td>" + (abs.isSelected? "yes":"no") + "</td></tr>";
        //console.log(abshtml)
        //$("#paperlist").append(abshtml);
    }
    $("#paperlist .row").click(function(){
        $("#paperlist .row").not($(this)).animate({width:"108ex", height:"30px"}, 400, function(){})
        $("#documentresource").remove();
        var offset = $(this).offset().top;
        //$("#paperlist .row").trigger("click");
        $("body").scrollTop(offset);
        console.log("Offset scroll " + offset)
           
        $(this).animate({width:"98%", height:"800px"},1200, function(){
           var absId = $(this).prop("id").substring(2)
           var theAbstract = getAbstractById(absId);
           
            if(theAbstract.doi){
                var documentURI = "";
                documentURI = "http://dx.doi.org/" + theAbstract.doi;
                $(this).append("<iframe name='documentresource' id='documentresource' src='" + documentURI + "'></iframe>"); 
            }
            else{
                $(this).append("<div id='documentresource'><a target='blank' href='http://scholar.google.com/scholar?hl=en&q=" + theAbstract.title + "'>Search Google Scholar for this document.</a></div>");
            }
           
            
        })
        
        
    })
    $("#back-downloads").click(function(){
        $("#downloadpapers").fadeOut(function(){
            initAbstracts();
        })
    })
}

function getAbstractById(absId){
    if(activeProject.abstracts){
        for(var j = 0; j < activeProject.abstracts.length; j++){
            var a = activeProject.abstracts[j];
            if(absId == a.id){
                return a;
            }
        }
        
    }
    return null;
}
