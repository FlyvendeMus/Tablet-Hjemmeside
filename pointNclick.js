
function AddEvent(TargetID, Interaction, Function) {
    document.getElementById(TargetID).addEventListener(Interaction, Function);
}

// Makes object react when hovered over.
function Hover(TargetID, Color, SoundID) {
    var Target = document.getElementById(TargetID);
    Target.addEventListener("mouseover", function(){ 
        Target.style.setProperty("-webkit-filter", "drop-shadow(0px 0px 10px " + Color + ")");
        PlaySound(SoundID, 0, 1);
     });
     Target.addEventListener("mouseout", function(){ 
        Target.style.setProperty("-webkit-filter", "");
     });
}

// Changes the inner html of the target
function ChangeContent(TargetID,html) {
    var Target = document.getElementById(TargetID);
    Target.innerHTML = html;
}

// Hides target element by setting its scale to zero, this also disables interactibility and makes clicking though the object posible
function Hide(TargetID) {
    var Target = document.getElementById(TargetID);
    Target.style.transform = 'scale(0)';
}
function Show(TargetID) {
    var Target = document.getElementById(TargetID);
    Target.style.transform = 'scale(1)';
}

// Play a Sound, every execute starts the sound from the beginning. Returns Playing sound ID
function PlaySound(AudioID, Time, Volume) {
    var audio = document.getElementById(AudioID);
    audio.currentTime = Time;
    audio.volume  = Volume;
    audio.play();
    return audio;
}
function PauseSound(AudioID) {
    var audio = document.getElementById(AudioID);
    audio.pause();
    return audio;
}
function ResumeSound(Sound) {
    Sound.play();
    return Sound;
}
