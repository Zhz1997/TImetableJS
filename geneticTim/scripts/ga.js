//global variables
var genSize = 10;
var rooms = readFileRooms();
var courses = readFileCourses();
var timeSlots = readFileTS();
var numOfGens = 2;

function load(){

  /*
  console.log(rooms);
  console.log(courses);
  console.log(timeSlots);
  */

  var firstGen = createFirstGen();
  console.log(firstGen[0]);

  changeText(firstGen[0]);
  //document.getElementById("m1").textContent = "New text!";

}

//read file functions
function readFileRooms(){
  var result = [];
  var rList = JSON.parse(room);
  var i;
  for(i = 0; i < rList.length; i++){
    var newRoom = new Room(rList[i].roomID,rList[i].capLevel);
    result.push(newRoom);
  }
  return result;
}

function readFileCourses(){
  var result = [];
  var cList = JSON.parse(course);
  var i;
  for(i = 0; i < cList.length; i++){
    var newCourse = new Course(cList[i].courseID,cList[i].capLevel,cList[i].duration,cList[i].timePref);
    result.push(newCourse)
  }
  return result;
}

function readFileTS(){
  var result = [];
  var tList = JSON.parse(timeSlot);
  var i;
  for(i = 0; i < tList.length; i++){
    var id = tList[i].tsID;
    var realStartTime = parseInt(tList[i].time.split('&')[0]);
    var startTime;
    if(realStartTime <= 12){
      startTime = 0;
    }
    else{
      startTime = 1;
    }
    var durationCount = tList[i].time.split('&').length;

    var newTs = new TimeSlot(id,startTime,durationCount);
    result.push(newTs)
  }
  return result;

}

//GA part
function createFirstGen(){
  var firstGen = [];
  var i;
  for (i = 0; i <genSize;i++){
    var newChrom = createChrom(i);
    firstGen.push(newChrom);
  }
  return firstGen;
}

function createChrom(idMinusOne){
  var cId = idMinusOne + 1;
  var genes = [];
  var i;
  for(i = 0; i < courses.length; i++){
    var gene = createGene(i);
    genes.push(gene);
  }
  var newChrom = new Chrom(cId,genes,0.00000001,100,100);
  return newChrom;
}

function createGene(courseIDMinusOne){
  var gCourseID = courseIDMinusOne + 1;
  var gRoomID = getRandomInt(rooms.length) + 1;
  var gTsID = getRandomInt(timeSlots.length) + 1;
  var gDurationPref = courses[courseIDMinusOne].duration;
  var newGene = new Gene(gCourseID,gRoomID,gTsID,gDurationPref);
  return newGene;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

//change text functions
function changeText(chrom){
  var i;
  for(i=0;i<chrom.genes.length;i++){
    var curGene = chrom.genes[i];
    var idList = getIDList(curGene);
    var roomID = curGene.roomID;
    var courseID = curGene.courseID;
    var j;
    for(j=0;j<idList.length;j++){
      //console.log(idList[j]);
      item = document.querySelector('#'+idList[j]);
      if(item.children[roomID-1].textContent == 0){
        item.children[roomID-1].textContent = courseID;
      }
      else{
        item.children[roomID-1].textContent = item.children[roomID-1].textContent + "," + courseID;
      }
    }
    //console.log("i = "+i+" "+idList);
  }
  return 0;
}

function getIDList(curGene){
  var result;
  if(curGene.tsID == 1){
    result = ["m1","m2","m3","w1","w2","w3"];
  }

  else if (curGene.tsID == 2) {
    result = ["m4","m5","m6","w4","w5","w6"];
  }

  else if (curGene.tsID == 3) {
    result = ["m7","m8","m9","w7","w8","w9"];
  }

  else if (curGene.tsID == 4) {
    result = ["t1","t2","th1","th2","f1","f2"];
  }

  else if (curGene.tsID == 5) {
    result = ["t3","t4","th3","th4","f3","f4"];
  }

  else if (curGene.tsID == 6) {
    result = ["t5","t6","th5","th6","f5","f6"];
  }

  else if (curGene.tsID == 7) {
    result = ["t7","t8","th7","th8","f7","f8"];
  }

  else if (curGene.tsID == 8) {
    result = ["t9","t10","th9","th10","f9","f10"];
  }

  return result;
}
