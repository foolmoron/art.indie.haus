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
    latestMousePosition = {x: e.screenX / window.innerWidth, y: e.screenY / window.innerHeight }
})
window.addEventListener('mousedown', function(e) {
    latestMouseClick = {x: e.screenX / window.innerWidth, y: e.screenY / window.innerHeight }
})

// Renderer setup
var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') })
renderer.setPixelRatio(window.devicePixelRatio)
var camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0, 1000)
var clock = new THREE.Clock()

var w, h
var handleResize = function() {
    w = window.innerWidth
    h = window.innerHeight
    renderer.setSize(w, h)
    camera.left = -w/2
    camera.right = w/2
    camera.top = -h/2
    camera.bottom = h/2
    camera.zoom = Math.max(w, h)/700
    camera.updateProjectionMatrix()
}
handleResize() // once on load
window.addEventListener('resize', debounce(handleResize, 100)) // then on every resize

// Textures
var texLoader = new THREE.TextureLoader()
var loadTex = function(path) {
    var texture = texLoader.load(path)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    return texture
}
var tex = {
}

// Fullscreen shader setup
var scene = new THREE.Scene()

var quadSize = 1000
var quadGeometry = new THREE.Geometry()
quadGeometry.vertices.push(new THREE.Vector3(0, 0, 0))
quadGeometry.vertices.push(new THREE.Vector3(quadSize, 0, 0))
quadGeometry.vertices.push(new THREE.Vector3(0, quadSize, 0))
quadGeometry.vertices.push(new THREE.Vector3(quadSize, quadSize, 0))
quadGeometry.faces.push(new THREE.Face3(0, 2, 3))
quadGeometry.faces.push(new THREE.Face3(0, 3, 1))
quadGeometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)])
quadGeometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(1, 0)])
quadGeometry.uvsNeedUpdate = true

var uniforms = {
    time: { type: 'f', value: 30 },

    mouseX: { type: 'f', value: 0 },
    mouseY: { type: 'f', value: 0 },

    resolutionX: { type: 'f', value: 0 },
    resolutionY: { type: 'f', value: 0 },
}
var prevUniforms = {} // for diffing

var uniformsExtras = {
    advanceTime: true,
}

var quad = new THREE.Mesh(quadGeometry, new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vert').textContent,
    fragmentShader: document.getElementById('frag').textContent,
    uniforms: uniforms,
    depthWrite: false,
    depthTest: false,
}))
quad.position.x = -quadSize/2
quad.position.y = -quadSize/2
scene.add(quad)

// Render loop
function render() {
    var dt = clock.getDelta()

    if (uniformsExtras.advanceTime) {
        uniforms.time.value += dt
    }
    if (isFullscreen && latestDeviceRotation != null) {
        camera.rotation.z = -latestDeviceRotation
    } else {
    }

    uniforms.mouseX.value = latestMousePosition.x;
    uniforms.mouseY.value = latestMousePosition.y;
    uniforms.resolutionX.value = window.innerWidth;
    uniforms.resolutionY.value = window.innerHeight;

    // check uniform diffs
    for (key in uniforms) {
        if (uniforms[key].value !== prevUniforms[key]) {
            uniforms[key].needsUpdate = true
        }
        prevUniforms[key] = uniforms[key].value
    }

    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

// GUI
function initGUI() {
    return;

    gui = new dat.GUI()

    // gui.remember(uniformsExtras, uniforms.time, uniforms.period, uniforms.offset, uniforms.amplitude, uniforms.morphphase, uniforms.colorphase)
    // setTimeout(() => { // force dat.gui local storage saving
    //     var checkbox = document.getElementById('dg-local-storage')
    //     if (!checkbox.getAttribute('checked')) {
    //         checkbox.click()
    //     }
    // }, 0)

    gui.add(extra, 'source')
        .name('Source code by @samloeschen and @foolmoron')
    gui.add(extra, 'zoomUI')
        .name('Toggle UI Zoom')
        .__li.style.padding = "14px 0px"
    
    var fGen = gui.addFolder('General')
    fGen.open()
    fGen.add(uniformsExtras, 'advanceTime')
        .name('Advance Time')
    fGen.add(uniforms.time, 'value')
        .name('Time')
        .min(0)
        .step(0.1)
    fGen.add(uniforms.resolutionX, 'value')
        .name('Resolution X')
        .step(1)
    fGen.add(uniforms.resolutionY, 'value')
        .name('Resolution Y')
        .step(1)
    fGen.add(uniforms.mouseX, 'value')
        .name('Mouse X')
        .step(0.01)
    fGen.add(uniforms.mouseY, 'value')
        .name('Mouse Y')
        .step(0.01)

    gui.add(extra, 'fullscreen')
        .name('GUI-less Fullscreen Mode! PROTIP: On a phone, lock the screen rotation and rotate it around')

    // zooming
    const scaleAmount = 2
    var mainControls = document.querySelector('.dg.main')
    if (uiZoomed) {
        mainControls.style.transform = `scale(${scaleAmount}) translate3d(-${mainControls.offsetWidth / (scaleAmount*scaleAmount)}px, ${mainControls.offsetHeight / (scaleAmount*scaleAmount)}px, 0)`;
    }
}

// Init
window.onload = function() {
    initGUI()
    render()
}