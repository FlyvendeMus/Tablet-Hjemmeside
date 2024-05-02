//connection variablen bruges til at 
//forbinde til MQTT serveren 
let connection 
//info er en tekst variabel til at vise info på skærmen
let info = "String som bruges til at vise info på skærmen"
//sensorData indeholder de data vi får fra M5'eren
let sensorData = 20

let playing = false;

//600 er ti sekunder 
let tempo = 0
let lastTempo = 0



// Load lyd og Video
function preload() {
  // Lyd
  soundFormats('mp3');
  sRainForest = loadSound('Sounds/Rainforest.mp3');
  sBeach = loadSound('Sounds/Beach.mp3');
  sUndervand = loadSound('Sounds/UnderWater.mp3');
  sIld = loadSound('Sounds/Fireplace.mp3');
  sNull = loadSound('Sounds/Silence.mp3');
  currentlyPlaying = sNull;
  
  // Video
  BE_Loop = createVideo(['Video/BreathingLoop.mp4']);
  BE_Loop.hide()


  
}

let soundButton, breatheButton

function setup() {
  createCanvas(windowWidth, windowHeight)
  //lav en div til infoteksten
  infoDiv = createDiv(info)
  //sæt den nederst på canvas
  infoDiv.position(20,40)
  
  
  //Opret forbindelse til MQTT serveren (den der står i USA)
  connection = mqtt.connect("wss://mqtt.nextservices.dk")
  //Når serveren kommer tilbage til os og siger KLAR
  connection.on("connect", (m) => {
    //vis i inforteksten at der er forbindelse 
    infoDiv.html("Er nu forbundet til Next's MQTT server")    
  })

  //vi abonnerer på et emne
  connection.subscribe('MR-Lyd')
  // Kode for Hver gang vi får en besked på emnet ms = besked
  connection.on("message", (topic, ms) => {
    infoDiv.html("Modtager data: " + ms + " - på emne: " + topic) 
    
    //skift lyd
    switch(ms.toString()) {
      case "Regnskov":
        transition(currentlyPlaying, 500000, sRainForest);
        break;
        
      case "Strand":
        transition(currentlyPlaying, 500000, sBeach);
        break;
        
      case "UnderVand":
        transition(currentlyPlaying, 500000, sUndervand);
        break;
        
      case "Ild":
        transition(currentlyPlaying, 500000, sIld);
        break;
        
      default:
        console.log("Typo in MQTT message-" + ms.toString());
        break;
        
    }
    
  })
  soundButton = createButton('sound')
  breatheButton = createButton('breathe')
  soundButton.position(100, 100)
  breatheButton.position(100, 200)
  soundButton.mousePressed(sound)
  breatheButton.mousePressed(breathe)
}

function sound(){
  select('#explainer').removeClass('show')
  state = 'sound'
  // Loop video
  BE_Loop.show()
  BE_Loop.loop();
}

function breathe(){
  BE_Loop.hide()
  BE_Loop.pause()
  tempo = 0
  direction = true 
  state = 'breatheStart'
  background(0)
  select('#explainer').addClass('show')
  select('#breatheButton').mousePressed(setTempo)
}

function setTempo(){
  if(tempo != 0){
    state = 'breathe'
    select('#explainer').hide()
  }
  select('#breatheButton').html('Breathe Out')
  //vi sætter tempo til nu minus sidste gang
  tempo = round(millis() - lastTempo)
  tempo = round(tempo / 1000 * 60)
  //og så nulstiller vi sidste gang til nu
  lastTempo = millis()
  console.log(tempo)
}


let state = 'start'
let direction = true
let circleSize = 0

function draw() {
  if(state=='sound'){
    //gør evt noget
  }
  if(state=='breathe'){
    background(0)
    fill('white')
    if(direction){
       circleSize += 4
    }else{
      circleSize -= 4
    }
    //HER SKIFTER ÅNDEDRÆTTET 
    if(frameCount % tempo == 0){
      console.log('tempo skifter')
      direction = !direction
      //connection.publish('emne-millis', 'direction')
      //connection.publish('emne-retning', 'direction')
    }
    ellipse(width/2, height/2, circleSize, circleSize)  
    console.log(frameCount % tempo)
  }
}

function transition(sound, duration, newSound) {
  // Get the current volume of the sound
  let currentVolume = 1;

  let NewSoundVolume = 0;
  let NewSoundPlaying = false;

  // Calculate the fade step based on duration
  let fadeStep = currentVolume / (duration / 1000);
  console.log("Fadestep " + fadeStep);

  // Set an interval to gradually decrease the volume
  let FadeOut = setInterval(() => {
    currentVolume -= fadeStep;
    console.log(currentVolume);

    // Check if volume reaches 0, then stop the sound and clear interval
    if (currentVolume <= 0.5 && !NewSoundPlaying) {
      newSound.loop();
      newSound.setVolume(0);
      NewSoundPlaying = true;

      let FadeIn = setInterval(() => {
        NewSoundVolume += fadeStep;
        newSound.setVolume(NewSoundVolume);
        if (NewSoundVolume >= 1) {clearInterval(FadeIn);}
      });
    }

    if (currentVolume <= 0) {
        sound.stop();
        currentlyPlaying = newSound;
        clearInterval(FadeOut);
    }

    sound.setVolume(currentVolume);
    
  }, 10);
}


