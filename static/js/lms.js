// Check face detected, not focus, and count time
let faceDetected = true;
let timeCounter = null;
let focusState = false; // pop indikasi nyontek
let recordOn = false;
let saveToBE = false; // saving to backend 

// Webgazer activated
webgazer
    .setRegression("ridge")
    .setTracker("TFFacemesh")
    .setGazeListener(function (data, elapsedTime) {
        if (data == null) {
            console.log("Warning : No Face Detected!");
            faceDetected = false;
        } 
        else {
            // not focus
            if (
                data.x <= 0 ||
                data.x >= screen.width ||
                data.y <= 0 ||
                data.y >= screen.height
            ) {
                if (timeCounter === null || !timeCounter) {
                    timeCounter = new Date();
                    console.log("Warning : Anda tidak fokus!");
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
                        console.log(
                            "Warning : Anda dicuragai menyontek! Compile and Upload recorded data! - " +
                            secondsDifference +
                            " seconds"
                        );
                        saveToBE = true;
                        // TODO : compile, upload record

                    } else {
                        // Belum cukup syarat
                        console.log(
                            "Warning : Delete recorded data! - " +
                            secondsDifference +
                            " seconds"
                        );
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
    .begin();
