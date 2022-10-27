// let SSD_MOBILENETV1 = 'ssd_mobilenetv1'
let TINY_FACE_DETECTOR = 'tiny_face_detector'


let selectedFaceDetector = TINY_FACE_DETECTOR

// // ssd_mobilenetv1 options
// let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 256
let scoreThreshold = 0.45

function getFaceDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

// function onIncreaseMinConfidence() {
//     minConfidence = Math.min(faceapi.utils.round(minConfidence + 0.1), 1.0)
//     $('#minConfidence').val(minConfidence)
//     updateResults()
// }

// function onDecreaseMinConfidence() {
//     minConfidence = Math.max(faceapi.utils.round(minConfidence - 0.1), 0.1)
//     $('#minConfidence').val(minConfidence)
//     updateResults()
// }

// function onInputSizeChanged(e) {
//     changeInputSize(e.target.value)
//     updateResults()
// }

// function changeInputSize(size) {
//     inputSize = parseInt(size)

//     let inputSizeSelect = $('#inputSize')
//     inputSizeSelect.val(inputSize)
//     inputSizeSelect.material_select()
// }

// function onIncreaseScoreThreshold() {
//     scoreThreshold = Math.min(faceapi.utils.round(scoreThreshold + 0.1), 1.0)
//     $('#scoreThreshold').val(scoreThreshold)
//     updateResults()
// }

// function onDecreaseScoreThreshold() {
//     scoreThreshold = Math.max(faceapi.utils.round(scoreThreshold - 0.1), 0.1)
//     $('#scoreThreshold').val(scoreThreshold)
//     updateResults()
// }

// function onIncreaseMinFaceSize() {
//     minFaceSize = Math.min(faceapi.utils.round(minFaceSize + 20), 300)
//     $('#minFaceSize').val(minFaceSize)
// }

// function onDecreaseMinFaceSize() {
//     minFaceSize = Math.max(faceapi.utils.round(minFaceSize - 20), 50)
//     $('#minFaceSize').val(minFaceSize)
// }

function getCurrentFaceDetectionNet() {
    // if (selectedFaceDetector === SSD_MOBILENETV1) {
    //     return faceapi.nets.ssdMobilenetv1
    // }
    if (selectedFaceDetector === TINY_FACE_DETECTOR) {
        return faceapi.nets.tinyFaceDetector
    }
}

function isFaceDetectionModelLoaded() {
    return !!getCurrentFaceDetectionNet().params
}

async function changeFaceDetector(detector) {
    ['#ssd_mobilenetv1_controls', '#tiny_face_detector_controls']
        .forEach(id => $(id).hide())

    selectedFaceDetector = detector
    let faceDetectorSelect = $('#selectFaceDetector')
    faceDetectorSelect.val(detector)
    faceDetectorSelect.material_select()

    $('#loader').show()
    if (!isFaceDetectionModelLoaded()) {
        await getCurrentFaceDetectionNet().load('/')
    }

    $(`#${detector}_controls`).show()
    $('#loader').hide()
}

// async function onSelectedFaceDetectorChanged(e) {
//     selectedFaceDetector = e.target.value

//     await changeFaceDetector(e.target.value)
//     updateResults()
// }
// 
// function initFaceDetectionControls() {
// let faceDetectorSelect = $('#selectFaceDetector')
// faceDetectorSelect.val(selectedFaceDetector)
// faceDetectorSelect.on('change', onSelectedFaceDetectorChanged)
// faceDetectorSelect.material_select()

// let inputSizeSelect = $('#inputSize')
// inputSizeSelect.val(inputSize)
// inputSizeSelect.on('change', onInputSizeChanged)
// inputSizeSelect.material_select()
// }

async function onPlay() {
    let videoEl = $('#inputVideo').get(0)

    if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
        return setTimeout(() => onPlay())


    let options = getFaceDetectorOptions()


    let result = await faceapi.detectAllFaces(videoEl, options)
    console.log(result.length);

    // if (result) {
    //     let canvas = $('#overlay').get(0)
    //     let dims = faceapi.matchDimensions(canvas, videoEl, true)
    //     faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))
    // }

    setTimeout(() => onPlay())
}

async function run() {
    // load face detection model
    await changeFaceDetector(TINY_FACE_DETECTOR)
    // changeInputSize(256)

    // try to access users webcam and stream the images
    // to the video element
    let stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    let videoEl = $('#inputVideo').get(0)

    videoEl.srcObject = stream
}

$(document).ready(function () {
    // initFaceDetectionControls()
    run()
})