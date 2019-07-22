function Room(id,capLevel){
  this.id = id;
  this.capLevel = capLevel;
};

function Course(id,capLevel,duration,timePref){
  this.id = id;
  this.capLevel = capLevel;
  this.duration = duration;
  this.timePref = timePref;
};

function TimeSlot(id,startTime,durationCount){
  this.id = id;
  this.startTime = startTime;
  this.durationCount = durationCount;
};

function Gene(courseID,roomID,tsID,durationPref){
  this.courseID = courseID;
  this.roomID = roomID;
  this.tsID = tsID;
  this.durationPref = durationPref;
};

function Chrom(id,genes,fitness,scv,hcv){
  this.id = id;
  this.genes = genes;
  this.fitness = fitness;
  this.scv = scv;
  this.hcv = hcv;
};
