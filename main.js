// Util
function debounce(func, time, context) {
    var timeoutId
    return function() {
        clearTimeout(timeoutId)
        var args = arguments
        timeoutId = setTimeout(function() { func.apply(context, args) }, time)
    }
}

// Misc global
var gui
var isFullscreen
var uiZoomed

var extra = {
    fullscreen: function() {
        // fullscreen canvas
        var canvas = document.getElementById('canvas')
        var requestFullScreen = canvas.requestFullScreen || canvas.webkitRequestFullscreen || canvas.mozRequestFullScreen || canvas.msRequestFullscreen
        if (requestFullScreen) {
            requestFullScreen.call(canvas)
        } else {
            alert('Sorry, full screen web apps are not possible on iOS (for now..?)')
        }
    },
    zoomUI: function() {
        uiZoomed = !uiZoomed
        gui.destroy()
        initGUI()
    },
    source: function() {
        window.open('https://github.com/foolmoron/art.indie.haus', '_blank')
    },
}

document.onfullscreenchange = document.onwebkitfullscreenchange = document.onmozfullscreenchange = document.onmsfullscreenchange = function(e) {
    var prevFullscreen = isFullscreen
    isFullscreen = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen
    if (!prevFullscreen && isFullscreen) {
        // destroy dat.gui in full screen for performance
        gui.destroy()
    } else if (prevFullscreen && !isFullscreen) {
        // rebuild dat.gui when exiting full screen
        initGUI()
    }
}

// Device rotation
var latestDeviceRotation
window.addEventListener('deviceorientation', function(e) {
    var yaw = e.alpha / 180 * Math.PI
    var pitch = e.beta / 180 * Math.PI
    var roll = e.gamma / 180 * Math.PI
    var x = -Math.cos(yaw) * Math.sin(pitch) * Math.sin(roll) - Math.sin(yaw) * Math.cos(roll)
    var y = -Math.sin(yaw) * Math.sin(pitch) * Math.sin(roll) + Math.cos(yaw) * Math.cos(roll)
    var z = Math.cos(pitch) * Math.sin(roll)
    var angle = Math.atan2(y, x)
    latestDeviceRotation = angle
})

// Mouse input
var latestMousePosition = {x: 0.5, y: 0.5 }
var latestMouseClick = {x: 0.5, y: 0.5 }
window.addEventListener('mousemove', function(e) {
    latestMousePosition = {x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight }
})
window.addEventListener('mousedown', function(e) {
    latestMouseClick = {x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight }
})
window.addEventListener('touchmove', function(e) {
    latestMousePosition = {x: e.touches[e.which].clientX / window.innerWidth, y: 1 - e.touches[e.which].clientY / window.innerHeight }
})
window.addEventListener('touchstart', function(e) {
    latestMouseClick = {x: e.touches[e.which].clientX / window.innerWidth, y: 1 - e.touches[e.which].clientY / window.innerHeight }
})

// fader
document.querySelector('.fader').classList.add('fade');