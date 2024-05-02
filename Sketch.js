//connection variablen bruges til at 
//forbinde til MQTT serveren 
let connection 
//info er en tekst variabel til at vise info på skærmen
let info = "String som bruges til at vise info på skærmen"
//sensorData indeholder de data vi får fra M5'eren
let sensorData = 20

let playing = false;



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

  
}


function setup() {
  noCanvas();
  //lav en div til infoteksten
  infoDiv = createDiv(info)
  //sæt den nederst på canvas
  infoDiv.position(20,40)
  // Loop video
  BE_Loop.loop();
  
  
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


function draw() {
  
}