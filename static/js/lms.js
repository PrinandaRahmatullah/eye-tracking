// Check face detected, not focus, and count time
let faceDetected = true;
let timeCounter = null;
let focusState = false; // pop indikasi nyontek
let recordOn = false;
let saveToBE = false; // saving to backend 

var textLog = document.getElementById("log");

// Recording variable
let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];
let video_local = null;

window.onload = async function () {
    webgazer.showVideoPreview(false) /* shows all video previews */
        .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
        .applyKalmanFilter(true);

    // init camera stream
    camera_stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });

    // Webgazer activated
    await webgazer
        .setRegression("ridge")
        .setTracker("TFFacemesh")
        .setGazeListener(function (data, elapsedTime) {
            if (data == null) {
                // console.log("Warning : No Face Detected!");
                textLog.innerHTML = "Warning : No Face Detected!<br>" + textLog.innerHTML;
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
                        textLog.innerHTML = "Warning : Anda tidak fokus!<br>" + textLog.innerHTML;
                        // console.log("Warning : Anda tidak fokus!");
                        recordOn = true;

                        // set MIME type of recording as video/webm
                        media_recorder = new MediaRecorder(camera_stream, {
                            mimeType: "video/webm",
                        });

                        // event : new recorded video blob available
                        media_recorder.addEventListener("dataavailable", function (e) {
                            blobs_recorded.push(e.data);
                        });

                        // event : recording stopped & all blobs sent
                        media_recorder.addEventListener("stop", function () {
                            // create local object URL from the recorded video blobs
                            video_local = URL.createObjectURL(
                                new Blob(blobs_recorded, {
                                    type: "video/webm"
                                })
                            );
                            // download_link.href = video_local;
                        });

                        // start recording with each recorded blob having 1 second video
                        media_recorder.start(1000);


                    }

                    focusState = false;
                }
                // back to focus
                else {
                    if (timeCounter && timeCounter !== null) {

                        // stop record
                        media_recorder.stop();

                        // timer on
                        let secondsDifference = parseFloat(
                            (new Date() - timeCounter) / 1000
                        );

                        if (secondsDifference > 5) {
                            // console.log("Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + secondsDifference + " seconds");
                            textLog.innerHTML = "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + secondsDifference + " seconds<br>" + textLog.innerHTML;
                            saveToBE = true;

                            // TODO : compile, upload record
                            console.log(video_local);

                        } else {
                            // Belum cukup syarat
                            // console.log("Warning : Delete recorded data! - " + secondsDifference + " seconds");
                            textLog.innerHTML = "Warning : Delete recorded data! - " + secondsDifference + " seconds<br>" + textLog.innerHTML;
                        }
                        timeCounter = null;
                        recordOn = false;

                        // TODO : delete record
                        blobs_recorded = [];
                    }

                    focusState = true;
                }
                faceDetected = true;
            }
        })
        .saveDataAcrossSessions(true)
        .begin();
}


// TODO : Calculate Calibration Accuracy : makes the variables true for 5 seconds & plots the points
//  Nanti bisa diletakkan setelah kalibrasi selesai
// store_points_variable(); // start storing the prediction points

// delay(5000).then(() => {
//     stop_storing_points_variable(); // stop storing the prediction points

//     var past50 = webgazer.getStoredPoints(); // retrieve the stored points
//     var precision_measurement = calculatePrecision(past50);
//     swal({
//         title: "Your accuracy measure is " + precision_measurement + "%",
//         allowOutsideClick: false,
//         buttons: {
//             cancel: "Recalibrate",
//             confirm: true,
//         }
//     }).then(isConfirm => {
//         if (isConfirm) {
//             //clear the calibration & hide the last middle button

//         } else {
//             //use restart function to restart the calibration
//             Restart();
//         }
//     });
// });


// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function () {
    webgazer.end();
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


/**
 * Restart the calibration process by clearing the local storage
 */
// TODO : Restart function
function Restart() {
    webgazer.clearData();
}


/*
 * Sets store_points to true, so all the occuring prediction
 * points are stored
 */
function store_points_variable() {
    webgazer.params.storingPoints = true;
}

/*
 * Sets store_points to false, so prediction points aren't
 * stored any more
 */
function stop_storing_points_variable() {
    webgazer.params.storingPoints = false;
}




/*
 * This function calculates a measurement for how precise 
 * the eye tracker currently is which is displayed to the user
 */
function calculatePrecision(past50Array) {
    var windowHeight = screen.height;
    var windowWidth = screen.width;

    // Retrieve the last 50 gaze prediction points
    var x50 = past50Array[0];
    var y50 = past50Array[1];

    // Calculate the position of the point the user is staring at
    var staringPointX = windowWidth / 2;
    var staringPointY = windowHeight / 2;

    var precisionPercentages = new Array(50);
    calculatePrecisionPercentages(precisionPercentages, windowHeight, x50, y50, staringPointX, staringPointY);
    var precision = calculateAverage(precisionPercentages);

    // Return the precision measurement as a rounded percentage
    return Math.round(precision);
};

/*
 * Calculate percentage accuracy for each prediction based on distance of
 * the prediction point from the centre point (uses the window height as
 * lower threshold 0%)
 */
function calculatePrecisionPercentages(precisionPercentages, windowHeight, x50, y50, staringPointX, staringPointY) {
    for (x = 0; x < 50; x++) {
        // Calculate distance between each prediction and staring point
        var xDiff = staringPointX - x50[x];
        var yDiff = staringPointY - y50[x];
        var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));

        // Calculate precision percentage
        var halfWindowHeight = windowHeight / 2;
        var precision = 0;
        if (distance <= halfWindowHeight && distance > -1) {
            precision = 100 - (distance / halfWindowHeight * 100);
        } else if (distance > halfWindowHeight) {
            precision = 0;
        } else if (distance > -1) {
            precision = 100;
        }

        // Store the precision
        precisionPercentages[x] = precision;
    }
}

/*
 * Calculates the average of all precision percentages calculated
 */
function calculateAverage(precisionPercentages) {
    var precision = 0;
    for (x = 0; x < 50; x++) {
        precision += precisionPercentages[x];
    }
    precision = precision / 50;
    return precision;
}