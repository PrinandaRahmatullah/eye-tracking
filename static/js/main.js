let faceDetected = true;
let timeCounter = null;
let focusState = false; // pop indikasi nyontek
let recordOn = false;
let saveToBE = false; // saving to backend 

var textLog = document.getElementById("log");

let tracker = null;
var eyeRight = null;
var eyeLeft = null;
var eyeRightX = null;
var eyeRightY = null;
var eyeLeftX = null;
var eyeLeftY = null;
var currentWidthELER = null;

window.onload = async function () {
    webgazer.showVideoPreview(true) /* shows all video previews */
        .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
        .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //start the webgazer tracker
    await webgazer.setRegression('ridge') /* currently must set regression and tracker */
        //.setTracker('clmtrackr')
        .setGazeListener(function (data, clock) {
            //   console.log(data); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
            //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
            if (data == null) {
                // console.log("Warning : No Face Detected!");
                faceDetected = false;
            } else {
                // not focus

                // DIRECTION : WORKED
                tracker = webgazer.getTracker(); // Hidung

                eyeRight = tracker.getPositions()[33]; // mata kanan
                eyeLeft = tracker.getPositions()[263]; // mata kiri

                eyeRightX = eyeRight[0];
                eyeRightY = eyeRight[1];

                eyeLeftX = eyeLeft[0];
                eyeLeftY = eyeLeft[1];
                
                currentWidthELER = eyeLeftX - eyeRightX;
                console.log(Math.round((250 * 33) / currentWidthELER) + " cm");
                
                // if (currentWidthELER > 230) {
                //     console.log("Wajah Anda terlalu dekat dengan layar");
                // } else if (currentWidthELER < 120) {
                //     console.log("Wajah Anda terlalu jauh dari layar");
                // }

                if (
                    data.x <= 0 ||
                    data.x >= screen.width ||
                    data.y <= 0 ||
                    data.y >= screen.height
                ) {
                    if (timeCounter === null || !timeCounter) {
                        timeCounter = new Date();
                        // textLog.innerHTML += "Warning : Anda tidak fokus!<br>";
                        // console.log("Warning : Anda tidak fokus!");
                        recordOn = true;

                    }

                    focusState = false;
                }
                // back to focus
                else {
                    if (timeCounter && timeCounter !== null) {
                        // timer on
                        let secondsDifference = parseFloat(
                            (new Date() - timeCounter) / 1000
                        );
                        if (secondsDifference > 5) {
                            // console.log(
                            //     "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " +
                            //     secondsDifference +
                            //     " seconds"
                            // );
                            // textLog.innerHTML += "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + secondsDifference + " seconds<br>";
                            saveToBE = true;
                            // TODO : compile, upload record

                        } else {
                            // Belum cukup syarat
                            // console.log("Warning : Delete recorded data! - " + secondsDifference + " seconds");
                            // textLog.innerHTML += "Warning : Delete recorded data! - " + secondsDifference + " seconds<br>";
                        }
                        // TODO : delete record

                        timeCounter = null;
                        recordOn = false;
                    }

                    focusState = true;
                }
                faceDetected = true;
            }
        })
        .saveDataAcrossSessions(true)
        .begin();

    //Set up the webgazer video feedback.
    var setup = function () {

        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };
    setup();

};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function () {
    webgazer.end();
}

/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart() {
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}