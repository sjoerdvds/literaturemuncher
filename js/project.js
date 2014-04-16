$(document).ready(function(){
    init()
})

$(window).unload(function(){
    saveProjects();
    saveActiveProject();
})
/**
 * A Project object, to be maintained throughout the page. The project contains the list of abstracts and sourcefiles associated with the project.
 */

function Project(name, sourcesArray, abstractsArray){
    this.name = name;
    this.sources = sourcesArray;
    this.abstracts = abstractsArray;
    this.created = new Date().getTime();
    this.id = "project" + (this.name + this.created).hashCode();
    this.steps = [false, false, false, false, false, false, false, false];
}

/**
 * Array of projects
 */
var projects = [];
var activeProject;
var stepReady = false;

var stepIndex;

var creatingDone = true;

function init(){
    console.log("init");
    stepIndex = 0;
    restoreProjects();
    restoreActiveProject();
    if(projects){
        console.log("Projects set.");
        //Check which is the first incomplete step.
        if(activeProject){
            var lastStep = -1;
            for(var j = (activeProject.steps.length-1); j >= 0; j--){
                if(!activeProject.steps[j]){
                    lastStep = j;
                    
                }
            }
            initStep(lastStep);
        }
        else{
            //No active project
            initProjects();
        }
    }
    else{
        initProjects();
    }
}

function initProjects(){
    console.log("initing projects")
    $("#manageprojects").show();
    updateDisplay();
    
    $("#createproject").on("click", function(){
        if(creatingDone){
            creatingDone = false;
            $("#projecttable").append("<tr id='createprojectrow'><td></td><td><input type='text' id='newproject'></td><td></td></tr>");
            $("#newproject").on("keyup", function(evt){
                code = evt.keyCode;
                
                if(code==13){
                    var val = $(evt.target).val();
                    activeProject = new Project(val, [], []);
                    projects.push(activeProject);
                    
                    setStepReady();
                    $("#createprojectrow").remove();
                    updateDisplay();
                    saveProjects();
                    saveActiveProject();
                    console.log("Active project id:" + activeProject.id);
                    creatingDone = true;
                }
            })
        }
    })
    
    $("#init-fileread").on("click", function(){
        if(activeProject && activeProject.steps[stepIndex]){
            $("#manageprojects").fadeOut(1000, function(){initFileRead();})
        }
        
    })
}

function initStep(stepNumber){
    console.log("Start step " + stepNumber)
    var initFun;
    switch(stepNumber){
        case 1:
            initFun = initFileRead;
            break;
        case 2:
            initFun = initAbstracts;
            break;
        case 3:
            initFun = initDownloads;
            break;
        default:
            initFun = initProjects;
            break;
    }
    $("#manageprojects").hide();
    initFun();
}

function setStepReady(){
    console.log("Step " + stepIndex + " is ready");
    activeProject.steps[stepIndex] = true;
}

var months=["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
/**
 * Fill the projects table in the html with the available projects.
 */
function updateDisplay(){
    var html = "";
    if(projects){
        for(var i=0; i<projects.length; i++){
            var p = projects[i];
            var d = new Date(p.created);
            
            html = html + "<tr class='projectrow' id='"+p.id+"'><td><input type='checkbox'></td><td>" + p.name + "</td><td>" + dateToHumanReadable(d) +"</td><td class='delete'><span>x</span></td></tr>";
                       
        }
    }
    $("#projecttable").html(html);
    
    $("tr.projectrow input:checkbox").on("click", function(){
        if($(this).is(":checked")){
            var projectId = $(this).parent().parent().prop("id");
            $("tr.projectrow input:checkbox").not($(this)).prop('checked', false);
            activeProject = projects[projectIndexById(projectId)];
           
            saveActiveProject()
            setStepReady();
        }
    });
    
    $("#projecttable td.delete span").on("click", function(evt){
        var projectId = $(evt.target).parent().parent().prop("id");
        console.log("Remove project: " + projectId);
        var conf = confirm("Are you sure you want to delete this project? All associated data (source files and abstracts) will be lost!")
        if(conf){
            removeProject(projectId);
            saveProjects();
        }
    });
}

/**
 * Remove a project by id and update the display
 */
function removeProject(projectId){
    var projectIndex = projectIndexById(projectId);
    if(projectIndex > -1){
        projects.splice(projectIndex, 1);
    }
    updateDisplay();
    
}

/**
 * Get the index of a project with specified id in the array of projects
 */
function projectIndexById(projectId){
    for(var j = 0; j < projects.length; j++){
        if(projects[j].id == projectId){
            return j;
        }
    }
    return -1;
}

function dateToHumanReadable(date){
    dayOfMonth = date.getDate()
    var suffix = "th";
    if(dayOfMonth == 1){
        suffix = "st"
    }
    if(dayOfMonth == 2){
        suffix = "nd"
    }
    if(dayOfMonth == 3){
        suffix = "rd"
    }
    return months[date.getMonth()] + " " + dayOfMonth + suffix;
    
}

/**
 * Saves the list of projects to local storage, with key "litmunchprojects"
 */
function saveProjects(){
    localStorage.setObject("litmunchprojects", projects);
}

/**
 * Restores the list of projects from local storage
 */
function restoreProjects(){
    var p = localStorage.getObject("litmunchprojects");
    if(p){
        projects = p;
    }
}


/**
 * Saves the active project to local storage, with key "litmunchprojects-active"
 **/
function saveActiveProject(){
    localStorage.setObject("litmunchprojects-active", activeProject.id);
}

/**
 * Restores the active project from local storage
 */
function restoreActiveProject(){
    if(projects){
        activeProject = projects[projectIndexById(localStorage.getObject("litmunchprojects-active"))]
    }
}