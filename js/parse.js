

/**
 * Add a hash code method to the String object. This hashcode converts a Sting to something fancy.
 */
String.prototype.hashCode = function(){
    var hash = 0, i, ch;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        ch  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+ch;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

/**
 * Generate random string of length 5
 */
function randomSalt()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * Convenience methods for adding to localStorage
 */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

/**
 * Pretty prints an Abstract
 */
function pretty_print(){
    console.log(this.title + ", " + this.authors + ". " + this.publication + " (" + this.year + ")");
}
/**
 * Creates a new Abstract object, complete with authors, title, year, source publication, abstract text and document object identifier
 */
function Abstract(authors, title, year, publication, cites, text, keywords, doi, sourceFileId){
    this.authors = authors;
    this.title = title;
    this.year = year;
    this.publication = publication;
    this.cites = cites;
    this.text = text;
    this.keywords = keywords;
    this.doi = doi;
    this.pretty_print = pretty_print;
    this.isSelected = false;
    this.isEvaluated = false;
    var idString = title + year + doi;
    this.id = "document" + idString.hashCode();
    this.sourceFileId = sourceFileId;
}

/**
 * Create a source file object representing one file of abstracts, represented in html.
 * @method toHTML gives an HTML representation of the object
 * @method ready adds "ready" to the style class of the HTML representation
 */
function AbstractSourceFile(name){
    this.name = name;
    var time = new Date().getTime()/1000;
    var idString = name + time;
    this.id = "sourcefile" + idString.hashCode();
    this.ready = false;
   /** Deprecated: won't survive serialization/deserialization. Use sourceFileToHTML and setSourceFileReady, respectively.
   this.toHTML = function(){
        return "<div class='file' id='"+ this.id + "'><div class='file-check'></div><div class='file-name'>" + this.name + "</div><div class='file-remove'></div><div class='spacer'></div></div>";
    }
    this.ready = function(){
        console.log("File processing ready");
        $("#" + this.id).addClass("ready");
        setStepReady();
    }*/
    
}

function sourceFileToHTML(sourceFile){
    return "<div class='file "+ (sourceFile.ready? "ready":"") + "' id='"+ sourceFile.id + "'><div class='file-check'></div><div class='file-name'>" + sourceFile.name + "</div><div class='delete'><span></span></div><div class='spacer'></div></div>";
}

function setSourceFileReady(sourceFile){
     $("#" + sourceFile.id).addClass("ready");
     sourceFile.ready =true;
     setStepReady();
}
/**
 * Array of abstract files
 */
var abstractfiles=[]

function initFileRead(){
    stepIndex = 1;
    $("#readfiles").fadeIn(200, function(){});
    if(activeProject){
        console.log("\"" + activeProject.name + "\"" + " is the active project");
        abstractfiles = activeProject.sources;
        updateFileTable();
    }
    $("#filechooser").on("change", function(evt){
        var file = document.getElementById("filechooser").files[0];
        console.log(file);
        var name = ($(evt.target).val());
        parseFile(file, name);
        })
    $("#init-abstracts").on("click", function(){
        if(activeProject && activeProject.steps[stepIndex]){
            saveProjects();
            $("#readfiles").fadeOut(1000, function(){initAbstracts()});
        }
    });

    
}

function addFile(name){
    name = name.replace(/(C:\\fakepath\\)(.*)/,"$2");
    var f = new AbstractSourceFile(name);
    abstractfiles.push(f);
    activeProject.sources = abstractfiles;
    saveProjects();
    updateFileTable();
    return f;
}

/**
 * Remove file and associated abstracts
 */
function removeFile(sourceFileId){
    if(activeProject){
        var srcs = activeProject.sources;
        var absts = activeProject.abstracts;
        
        for(var j = 0; j < srcs.length; j++){
            if(srcs[j].id == sourceFileId){
                console.log("Removing file.");
                srcs.splice(j, 1);
            }
        }
        
        for(j = 0; j < absts.length; j++){
            if(absts[j].sourceFileId == sourceFileId){
                console.log("Removing abstract");
                absts.splice(j,1);
            }
        }
        
        activeProject.sources = srcs;
        activeProject.abstracts = absts;
        updateFileTable();
    }
}

function parseFile(file, name){
    var reader = new FileReader();
    reader.onload = function(e){
        console.log("Ready to read");
        text = e.target.result;
        var fi = addFile(name);
        if(text.substring(0,6)=="Scopus"){
            console.log("SCOPUS FILE");
            parseScopus(text, fi);
        }
        else{
            console.log("WOS FILE");
            parseWOS(text, fi)
        }
        setSourceFileReady(fi);
        
        
    };
    reader.readAsText(file);
}

function parseScopus(text, abstractFile){
    var scopusAbstracts = text.split(/[\r\n]\s*[\r\n]/g);
 
    console.log(scopusAbstracts);    
    console.log(scopusAbstracts[1]);
    console.log("Number of abstracts" + scopusAbstracts.length);
   // console.log(scopusAbstracts)
    var abstractObjects = [];
        
    for(var i=1; i < scopusAbstracts.length; i++){
        var abst = scopusAbstracts[i];
        //console.log(abst);
        if(abst.match(/[\r\n]ABSTRACT:/g)){
            var lines = abst.split(/[\r\n]/g);
            var authors = lines[0];
            var title = lines[1];
            var year_pub = lines[2];
            var year = year_pub.replace(/\((\d{4})\).*$/g, "$1");
            var publication = year_pub.replace(/\(\d{4}\) (.*)\. (.*)$/,"$1");
                
            var cites = 0;
                
            if(year_pub.match(/Cited (\d+)\s/)){
                cites = year_pub.replace(/(^.*Cited )(\d+)(\s.*$)/, "$2");
            }
                
            var atext = lines[4].replace(/abstract: (.+)$/gi, "$1");
            
            var keywords = ""
            if(lines[5]){
                keywords = keywords + lines[5];
            }
            if(lines[6]){
                keywords = keywords + lines[6];
            }
            var doi = null    
            if(i < scopusAbstracts.length-1 && scopusAbstracts[i+1].match(/^DOI:/)){
                var rest = scopusAbstracts[i+1];
                var rest_lines = rest.split(/[\r\n]/g);
                doi = rest_lines[0].replace(/doi: (.+)$/gi, "$1")
                //Extra increment: next one will be another abstract
                i=i+1;
            }

            var the_abstract = new Abstract(authors, title, year, publication, cites, atext, keywords, doi, abstractFile.id);
            abstractObjects.push(the_abstract);
            console.log(title + " " + publication + " CITES:" + cites);
        //the_abstract.pretty_print();
        }
    }
    
    //Replaced by saveProjects();
    //localStorage.setObject(abstractFile.id, abstractObjects);
    activeProject.abstracts = $.merge($.merge([],activeProject.abstracts), abstractObjects);    
    console.log("Total number of abstracts processed: " + abstractObjects.length);
    
    
}

function parseWOS(text, abstractFile){
    //Parse Web of Science
    var abstractObjects = [];
    
    var absts = text.split(/[\r\n]+/g);
    if(absts && absts.length > 0){
        var fieldTags = absts[0].split(/\t*([^\t]+)/g);
        
        for(var j = 1; j < absts.length; j++){
            if(absts[j].trim()){
            //console.log("index:" + j + " " + absts[j]);
            var values = absts[j].split(/([^\t]*)/g);
            //console.log(values)
            //authors, title, year, publication, cites, text, keywords, doi, sourceFileId
            var authors = wosValueForKey(fieldTags, values, "AU");
            var title = wosValueForKey(fieldTags, values, "TI");
            var year = wosValueForKey(fieldTags, values, "PY");
            var publication = wosValueForKey(fieldTags, values, "SO");
            var cites = wosValueForKey(fieldTags, values, "TC");
            var txt = wosValueForKey(fieldTags, values, "AB");
            var keywords = wosValueForKey(fieldTags, values, "DE");
            var doi = wosValueForKey(fieldTags, values, "DI");
            
            var abstractObject = new Abstract(authors, title, year, publication, cites, txt, keywords, doi, abstractFile.id);
            abstractObjects.push(abstractObject); 
            console.log(title + " " + publication + " cites:" + cites + " " + year)
            }
        }
        
        activeProject.abstracts = $.merge($.merge([],activeProject.abstracts), abstractObjects);    
        console.log("Total number of abstracts processed: " + abstractObjects.length);
    
    
    }
    
}

function wosValueForKey(fields, values, key){
    var index = fields.indexOf(key);
    if(index > -1){
        return values[index]?values[index]: "";
    }
    return "";
}

function updateFileTable(){
    if(activeProject){
        var html = ""
        for(var j = 0; j < activeProject.sources.length; j++){
            var f = activeProject.sources[j];
            console.log(f);
            html += sourceFileToHTML(f);
        }
        $("#files").html(html);
        $(".file .delete").on("click", function(){
            var fId = $(this).parent().prop("id");
            console.log("Remove file with id: " + fId);
            alert("Disabled!")
            //TODO: Temporarily disabled: fix later.
          //  removeFile(fId);
        })
    }
}