//connection variablen bruges til at 
//forbinde til MQTT serveren 
let connection 
//info er en tekst variabel til at vise info på skærmen
let info = "String som bruges til at vise info på skærmen"
//sensorData indeholder de data vi får fra M5'eren
let sensorData = 20

let playing = false;

//state holder styr på hvad draw loopet gør eller ikke gør 
let state = 'start'
//direction skifter når man trækker vejret - vi starter  med at puste ud
let direction = false
const circleMax = 500
let circleSize = circleMax

let tempo = 0
let lastTempo = 0
let breatheTimer 



// Load lyd og Video
function preload() {
  // Lyd
  soundFormats('mp3');
  sRainForest = loadSound('Sounds/Rainforest.mp3');
  sBeach = loadSound('Sounds/Beach.mp3');
  sUndervand = loadSound('Sounds/Underwater.mp3');
  sIld = loadSound('Sounds/Fireplace.mp3');
  sNull = loadSound('Sounds/Silence.mp3');
  currentlyPlaying = sNull;
  
  // Video
  BE_Loop = createVideo(['Video/BreathingLoop.mp4']);
  BE_Loop.size(windowWidth, windowHeight)
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
  select('#tempoButton').mousePressed(setTempo)
}

function sound(){
  select('#explainer').removeClass('show')
  state = 'sound'
  // Loop video
  BE_Loop.show()
  BE_Loop.loop();
}

function breathe(){
  //sæt state så loopet ikke fortsætter 
  state = 'prepareBreathing'
  //stop og skjul filmen
  BE_Loop.hide()
  BE_Loop.pause()
  //clear timer og variabler hvis der var et tempo i gang  
  if(breatheTimer){
    //ånd ind fra 0 
    direction = true 
    clearInterval(breatheTimer)
    console.log('timer cancelled')
    lastTempo = 0
    tempo = 0
    direction = false
    circleSize = circleMax
    //reset knap tekst
    select('#tempoButton').html('Breathe In')
  } 
  //Vis forklaring 
  background(0)
  select('#explainer').addClass('show')
}

function setTempo(){
  //hvis lastTempo er 0, er det første gang der trykkes på knappen 
  if(lastTempo == 0){
    //knapteksten vendes
    select('#tempoButton').html('Breathe Out')
    //lastTempo indstilles 
    lastTempo = millis()
    console.log('Indstiller last tempo:  ', lastTempo)
  }else{
    //tempo indstilles
    tempo = round(millis() - lastTempo)
    //state skifter til breathe
    state = 'breathe'
    select('#explainer').removeClass('show')
    //start timeren som kalder funktionen changeDirection, hvert "tempo" millisekund
    breatheTimer = setInterval(changeDirection, tempo)
    console.log('Timer i gang med tempo: ', tempo)
    }
}

function changeDirection(){
  //hvis direction er true, sæt den til false, hvis den er false, sæt den til true etc
  direction = !direction
}



function draw() {

  if(state=='sound'){
    //gør evt noget
  }
  if(state=='breathe'){
    //RGBA - den sidste parameter er Alpha (0, 255)
    background(0,0,0, 2)
    fill('white')
    if(direction){
      circleSize += 1
    }else{
      circleSize -= 1
    }
    //sørg for at cirkel ikke kan blive mindre end eller større end... 
    //circleSize = constrain(circleSize, 250, 500)
    console.log(circleSize)
    //fjern fyld i cirklen
    noFill()
    //stroke er cirklens omkreds med næsten helt hvid 
    stroke(255, 255, 255, 200)
    //omkredsens tykkelse
    strokeWeight(12)
    ellipse(width/2, height/2, circleSize, circleSize)  
    if(frameCount % 60 == 0){
      //draw Stars
      for(i=0; i < 3; i++){
        noStroke()
        fill(255, 255, 255, random(255))
        ellipse(random(width), random(height), random(6))
      }
    }
  
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


