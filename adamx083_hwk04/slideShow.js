var iconImg ;
var pics = ["gophers-mascot.png","docMartin.png","neo.png","PGriffin.png"];
var description = ["Goldy","DOC","NEO","PETER"];
var int;
var idx = 0;

function showImage(){
	
iconImg.setAttribute("src",pics[idx]);
iconImg.setAttribute("alt",description[idx]);
idx = (idx+1) % pics.length;

}


function start(){
	iconImg = document.getElementById("big");
	int = setInterval(function(){showImage()},2000);
}

