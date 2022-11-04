// Check face detected, not focus, and count time
let faceDetected = true;
let timeCounter = null;
let focusState = false; // pop indikasi nyontek
let recordOn = false;
let saveToBE = false; // saving to backend 

let textLog = document.getElementById("log");

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
                console.log(c / currentWidthELER);
                // // determine face direction and calculate direction percentage
                // if (percentageX > 0.42 || comparisonY > 2.5 || comparisonY < 1.1) {
                //     console.log("Warning : Anda tidak fokus!");
                // }

                if (
                    data.x <= 0 || data.x >= screen.width || data.y <= 0 || data.y >= screen.height ||
                    percentageX > 0.42 || comparisonY > 2.5 || comparisonY < 1.1
                ) {
                    if (timeCounter === null || !timeCounter) {
                        timeCounter = new Date();
                        textLog.innerHTML = "Warning : Anda tidak fokus!<br>" + textLog.innerHTML;
                        // console.log("Warning : Anda tidak fokus!");
                        recordOn = true;

                        // // set MIME type of recording as video/webm
                        // media_recorder = new MediaRecorder(camera_stream, {
                        //     mimeType: "video/webm",
                        // });

                        // // event : new recorded video blob available
                        // media_recorder.addEventListener("dataavailable", function (e) {
                        //     blobs_recorded.push(e.data);
                        // });

                        // // event : recording stopped & all blobs sent
                        // media_recorder.addEventListener("stop", function () {
                        //     // create local object URL from the recorded video blobs
                        //     video_local = URL.createObjectURL(
                        //         new Blob(blobs_recorded, {
                        //             type: "video/webm"
                        //         })
                        //     );
                        //     // download_link.href = video_local;

                        // });

                        // // start recording with each recorded blob having 1 second video
                        // media_recorder.start(1000);


                    }
                    // New condition : to prevent large video recorded size
                    else {
                        let longRecords = parseFloat(new Date() - timeCounter) / 1000

                        // hitung lama tidak fokus
                        if (recordOn && longRecords >= maximumRecordTime) {
                            textLog.innerHTML = "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + longRecords + " seconds<br>" + textLog.innerHTML;

                            saveToBE = true;
                            recordOn = false;

                            // // TODO : delete record
                            // blobs_recorded = [];
                        }
                    }
                    focusState = false;
                }

                // back to focus
                else {
                    if (timeCounter && timeCounter !== null) {

                        // // stop record
                        // media_recorder.stop();

                        // timer on
                        let secondsDifference = parseFloat(
                            (new Date() - timeCounter) / 1000
                        );

                        if (secondsDifference > maximumRecordTime) {
                            // // console.log("Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + secondsDifference + " seconds");
                            // textLog.innerHTML = "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " + secondsDifference + " seconds<br>" + textLog.innerHTML;
                            // saveToBE = true;

                            // // TODO : compile, upload record
                            // textLog.innerHTML = "Rekaman " + video_local + "<br>" + textLog.innerHTML;

                        } else {
                            // Belum cukup syarat
                            // console.log("Warning : Delete recorded data! - " + secondsDifference + " seconds");
                            textLog.innerHTML = "Warning : Delete recorded data! - " + secondsDifference + " seconds<br>" + textLog.innerHTML;
                        }
                        timeCounter = null;
                        recordOn = false;

                        // // TODO : delete record
                        // blobs_recorded = [];
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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}