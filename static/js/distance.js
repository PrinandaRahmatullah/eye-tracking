// Check face detected, not focus, and count time
let faceDetected = true;
let timeCounter = null;
let focusState = false; // pop indikasi nyontek
let recordOn = false;
let saveToBE = false; // saving to backend 

let textLog = document.getElementById("log");
let inputVideo = document.getElementById("inputVideo");

// Recording variable
let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];
let video_local = null;

// face direction 
let tracker = null;
let nose = null;
let eyeRight = null;
let eyeLeft = null;
let topLip = null;
let noseX = null;
let noseY = null;
let eyeRightX = null;
let eyeRightY = null;
let eyeLeftX = null;
let eyeLeftY = null;
let currentWidthELER = null;

var noseEyeRightX = null;
var noseEyeLeftX = null;
var comparisonX = null;
var percentageX = null;

var noseEyeY = null;
var noseTopLipY = null;
var comparisonY = null;

let maximumRecordTime = 7;

window.onload = async function () {
    await webgazer.showVideoPreview(false) /* shows all video previews */
        .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
        .applyKalmanFilter(true);

    // init camera stream
    camera_stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });
    inputVideo.srcObject = camera_stream;

    // Webgazer activated
    await webgazer
        .setRegression("ridge")
        .setTracker("TFFacemesh")
        .setGazeListener(function (data, elapsedTime) {
            if (data == null) {
                // console.log("Warning : No Face Detected!");
                textLog.innerHTML = "Warning : No Face Detected!";
                faceDetected = false;
            } else {
                // not focus

                // face direction
                tracker = webgazer.getTracker();
                nose = tracker.getPositions()[1]; //hidung
                eyeRight = tracker.getPositions()[33]; // mata kanan
                eyeLeft = tracker.getPositions()[263]; // mata kiri
                topLip = tracker.getPositions()[0];
                noseX = nose[0];
                noseY = nose[1];
                eyeRightX = eyeRight[0];
                eyeRightY = eyeRight[1];
                eyeLeftX = eyeLeft[0];
                eyeLeftY = eyeLeft[1];
                currentWidthELER = eyeLeftX - eyeRightX;

                // direction x axis
                noseEyeRightX = noseX - eyeRightX
                noseEyeLeftX = eyeLeftX - noseX
                comparisonX = noseEyeRightX / noseEyeLeftX
                percentageX = ((comparisonX > 1) ? comparisonX - 1 : 1 - comparisonX);

                // direction y axis
                noseEyeY = noseY - ((eyeLeftY + eyeRightY) / 2)
                noseTopLipY = topLip[1] - noseY
                comparisonY = noseEyeY / noseTopLipY
                var c = 210 * 22.5;
                // var a = 160 * 29;
                // console.log(Math.round(c / currentWidthELER));
                textLog.innerHTML = Math.round(c / currentWidthELER) + " cm";

            }
        })
        .saveDataAcrossSessions(true)
        .begin();
}


// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function () {
    webgazer.end();
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}