//global variables
var genSize = 300;
var rooms = readFileRooms();
var courses = readFileCourses();
var timeSlots = readFileTS();
var numOfGens = 1000;
var hcvPoints;
var scvPoints;

function load(){
  reset();
  var improvedList;
  var loop = 1;
  while(loop == 1){
    hcvPoints=[];
    scvPoints=[];
    improvementList = [];

    //create first generation
    var firstGen = createFirstGen();
    var bestFitness = 0;
    var bestChrom;
    var index;
    for(index=0;index<genSize;index++){
      computeFitness(firstGen[index]);
      if(firstGen[index].fitness>bestFitness){
        //console.log(firstGen[index]);
        bestChrom = firstGen[index];
        //console.log(bestChrom);
        bestFitness = bestChrom.fitness;
      }
    }
    console.log(bestChrom.id);
    improvementList.push(bestChrom);
    //console.log(firstGen);
    console.log("bestChromID is "+bestChrom.id + " hcv: "+bestChrom.hcv);
    var hcvPoint = [];
    var scvPoint = [];
    hcvPoint.push(0);
    hcvPoint.push(bestChrom.hcv);
    scvPoint.push(0);
    scvPoint.push(bestChrom.scv);

    hcvPoints.push(hcvPoint);
    scvPoints.push(scvPoint);

    //var nextGen = createNextGen(firstGen,bestChrom);

    var prevGen = firstGen;
    var bC = bestChrom;
    var genCount;
    for(genCount=0;genCount<numOfGens;genCount++){
      var bF = 0;
      var nextGen = createNextGen(prevGen,bC);

      var ii;
      for(ii=0;ii<nextGen.length;ii++){
        computeFitness(nextGen[ii]);
        if(nextGen[ii].fitness>bF){
          bF = nextGen[ii].fitness;
          bC = nextGen[ii];
        }
      }
      //console.log(bC.fitness);
      if(bC.fitness > improvementList[improvementList.length-1].fitness){
        var hcvPoint = [];
        var scvPoint = [];
        hcvPoint.push(genCount+1);
        hcvPoint.push(bC.hcv);
        scvPoint.push(genCount+1);
        scvPoint.push(bC.scv);
        hcvPoints.push(hcvPoint);
        scvPoints.push(scvPoint);

        improvementList.push(bC);
      }
      console.log("best fitness value at generation "+genCount+" is "+bF+" scv: "+bC.scv+" hcv: "+bC.hcv);
      prevGen = nextGen;

    }

    if(bC.hcv == 0){
      loop = 0;
      changeText(bC);
    }

  }
  //console.log(improvementList);
  //draw result graph
  var hcvPointsArray = modifyPoints(hcvPoints);
  var scvPointsArray = modifyPoints(scvPoints);
  drawGraph(hcvPointsArray,scvPointsArray);
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

function computeFitness(chrom){
  var scv = 0;
  var hcv = 0;

  //soft constraints vios
  var durationPrefVio = 0
  var startTimePrefVio = 0

  //hard constraints
  var roomCapVio = 0
  var timeConflict = 0

  var tsConflictArray = [];
  var column;
  var row;
  for(row=0;row<3;row++){
    tsConflictArray[row] = [];
    for(column=0;column<timeSlots.length;column++){
      tsConflictArray[row][column] = [];
    }
  }
  //console.log(tsConflictArray);

  var i;
  for(i=0;i<chrom.genes.length;i++){
    //compute roomCapVio
    var requiredRoomCap = courses[parseInt(chrom.genes[i].courseID)-1].capLevel;
    var actualRoomCap = rooms[parseInt(chrom.genes[i].roomID)-1].capLevel;
    if(requiredRoomCap > actualRoomCap){
      roomCapVio = roomCapVio + 1;
    }

    //compute timeConflict
    if(tsConflictArray[parseInt(chrom.genes[i].roomID)-1][parseInt(chrom.genes[i].tsID)-1].length != 0){
      timeConflict = timeConflict + 1;
    }
    tsConflictArray[parseInt(chrom.genes[i].roomID)-1][parseInt(chrom.genes[i].tsID)-1].push(chrom.genes[i].courseID);

    //compute durationPrefVio
    var requiredDuration = parseInt(chrom.genes[i].durationPref);
    var actualDuration = timeSlots[parseInt(chrom.genes[i].tsID)-1].durationCount;
    if(requiredDuration != actualDuration){
      durationPrefVio = durationPrefVio + 1;
    }
  }

  //console.log(tsConflictArray);

  hcv = roomCapVio + timeConflict;
  scv = durationPrefVio + startTimePrefVio;

  chrom.scv = scv;
  chrom.hcv = hcv;
  penalty = hcv*21+scv;
  chrom.fitness = (1 / penalty) ** 2;

}

function createNextGen(prevGen,bestChrom){
  var nextGen = [];
  //copy the best chrom from prevGen to nextGen
  var temp = new Chrom(1,bestChrom.genes,bestChrom.fitness,bestChrom.scv,bestChrom.hcv);
  nextGen.push(temp);
  //------------------------------------------
  //get total amount of fitness
  var fitnessT = 0;
  var index;
  for(index=0;index<prevGen.length;index++){
    fitnessT = fitnessT+prevGen[index].fitness;
  }

  var l =[];
  for(index=0;index<prevGen.length;index++){
    var numOfIns = Math.floor((prevGen[index].fitness / fitnessT) * 100);
    var j;
    for(j=0;j<numOfIns+1;j++){
      l.push(index);
    }
  }
  //console.log(l);

  for(index=0;index<genSize-1;index++){
    var newChrom;
    var parent1 = prevGen[pickOne(l)];
    var parent2 = prevGen[pickOne(l)];

    //do crossOver
    newChrom = crossOver(parent1,parent2,index+2);

    //do evolve
    evolve(newChrom);

    //mutate
    var ifMutate = getRandomInt(10);
    if(ifMutate <= 0){
      mutate(newChrom);
    }


    nextGen.push(newChrom);
  }
  return nextGen;

}

function pickOne(l){
  var i = getRandomInt(l.length);
  return l[i];
}

function evolve(chrom){
  //evolve RoomCap
    if(chrom.hcv>0){
      var index;
      for (index=0;index<chrom.genes.length;index++){
        if(courses[parseInt(chrom.genes[index].courseID)-1].capLevel > rooms[parseInt(chrom.genes[index].roomID)-1].capLevel){
          chrom.genes[index].roomID = chrom.genes[index].roomID + 1;
        }
      }
    }

}

function mutate(chrom){
  chrom = createChrom(chrom.id);
}

function crossOver(parent1,parent2,id){
  var midPoint = getRandomInt(20) + 1;
  var newGenes = [];
  var i;
  for(i=0;i<midPoint;i++){
    newGenes.push(parent1.genes[i]);
  }
  for(i=midPoint;i<21;i++){
    newGenes.push(parent2.genes[i]);
  }
  newChrom = new Chrom(id,newGenes,0.00000001,100,100);
  return newChrom;
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
  var hcv = document.getElementsByClassName("hcv");
  var scv = document.getElementsByClassName("scv");
  var fitness = document.getElementsByClassName("fitness");
  hcv[0].innerHTML = "hcv: " + chrom.hcv;
  scv[0].innerHTML = "scv: " + chrom.scv;
  fitness[0].innerHTML = "fitness: " + chrom.fitness;


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

function reset(){
  var r1 = document.getElementsByClassName("room1");
  var r2 = document.getElementsByClassName("room2");
  var r3 = document.getElementsByClassName("room3");
  var i;
  for(i=0;i<r1.length;i++){
    r1[i].innerHTML = 0;
  }
  for(i=0;i<r2.length;i++){
    r2[i].innerHTML = 0;
  }
  for(i=0;i<r3.length;i++){
    r3[i].innerHTML = 0;
  }
}

//draw graph
function drawGraph(hcvPointsArray,scvPointsArray){
  var chart = new CanvasJS.Chart("chartContainer", {
	theme: "light2",
	title:{
		text: "Result"
	},
	axisY:{
		title:"Number of Violations"
	},
  axisX:{
		title:"Number of Generation"
	},
  legend: {
		cursor: "pointer",
		verticalAlign: "top",
		horizontalAlign: "center",
		dockInsidePlotArea: true,
		itemclick: toogleDataSeries
	},
	data: [{
		type: "line",
		name: "HCV",
		showInLegend: true,
		dataPoints: hcvPointsArray
	},
  {
    type: "line",
    name: "SCV",
    showInLegend: true,
    dataPoints: scvPointsArray
  }]
});
chart.render();

function toogleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	} else{
		e.dataSeries.visible = true;
	}
	chart.render();
}
}

function modifyPoints(points){
  var array=[];
  var i;
  for(i=0;i<points.length;i++){
    array.push({x:points[i][0],y:points[i][1]})
  }
  return array;
}
