let camera_button = document.querySelector("#compile");
const video = document.getElementById('video')
// video.style.visibility = "hidden"

Promise.all([
    // faceapi.nets.faceRecognitionNet.loadFromUri('static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('static/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('static/models')
]).then(start)

//const webcam = new Webcam(video);

function start()
{
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) 
    {
        console.log("getUserMedia() not supported.");
        return;
    }
    
    navigator.getUserMedia(
        {video: {}},
        stream => video.srcObject = stream,
        err => console.error(err)
    );

}



video.addEventListener('play', () =>
{
    const displaySize = {width: video.width, height: video.height};
    setInterval(async()=>
    {
        const detections = await faceapi.detectAllFaces(video) //.withFaceLandmarks().withFaceDescriptors()
        // const resizedDetections = faceapi.resizeResults(detections, displaySize)

        if (detections.length > 1){           
            console.log("Warning : More than one face!")
        }
        else if (detections.length == 1) {
            console.log("Success : 1 face detected!")
        }

        else {
            console.log("Warning : No face detected!")
        }
    }, 50);
});
