// Check face detected, not focus, and count time
let faceDetected = true;
let timeCounter = null;
let focusState = false; // pop indikasi nyontek
let recordOn = false;
let saveToBE = false; // saving to backend 

var textLog = document.getElementById("log");

window.onload = async function () {
    webgazer.showVideoPreview(false) /* shows all video previews */
        .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
        .applyKalmanFilter(true);

    // Webgazer activated
    await webgazer
        .setRegression("ridge")
        .setTracker("TFFacemesh")
        .setGazeListener(function (data, elapsedTime) {
            if (data == null) {
                // console.log("Warning : No Face Detected!");
                textLog.innerHTML += "Warning : No Face Detected!<br>";
                faceDetected = false;
            } else {
                // not focus
                if (
                    data.x <= 0 ||
                    data.x >= screen.width ||
                    data.y <= 0 ||
                    data.y >= screen.height
                ) {
                    if (timeCounter === null || !timeCounter) {
                        timeCounter = new Date();
                        textLog.innerHTML += "Warning : Anda tidak fokus!<br>";
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
                            textLog.innerHTML += "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + secondsDifference + " seconds<br>";
                            saveToBE = true;
                            // TODO : compile, upload record

                        } else {
                            // Belum cukup syarat
                            // console.log("Warning : Delete recorded data! - " + secondsDifference + " seconds");
                            textLog.innerHTML += "Warning : Delete recorded data! - " + secondsDifference + " seconds<br>";
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
}

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function () {
    webgazer.end();
}

/**
 * Restart the calibration process by clearing the local storage
 */
 function Restart() {
    webgazer.clearData();
}