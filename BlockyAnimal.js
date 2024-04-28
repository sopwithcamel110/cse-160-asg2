var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main(){
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`


var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';

let u_Size, u_ModelMatrix, u_GlobalRotateMatrix, canvas, gl, a_Position, u_FragColor;

function setupWebGL() {
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true
      });
    if (!gl) {
        console.log("failed to get rendering content of web gl.");
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("failed to initialize shaders.");
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log("Failed ti get the storage location of u_ModelMatrix");
        return;
    }

    
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log("Failed ti get the storage location of u_GlobalRotateMatrix");
        return;
    }


    
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;

let g_thighAngle = 0;
let g_lowerLegAngle = 0;
let g_bodyAngle = 0;
let g_headAngle = 0;
let g_headAngle1 = 0;
let g_wingAngle = 0;
let g_animation = false;
let shift = false;

function addActionsForHtmlUI() {
    document.getElementById('animationOff').onclick = function () {
        g_animation = false;
    };
    document.getElementById('animationOn').onclick = function () {
        g_animation = true;
    };

    document.getElementById('thighSlide').addEventListener('mousemove', function () {
        g_thighAngle = this.value;
        renderAllShapes();
    });
    document.getElementById('lowerLegSlide').addEventListener('mousemove', function () {
        g_lowerLegAngle = this.value;
        renderAllShapes();
    });
    document.getElementById('bodyslide').addEventListener('mousemove', function () {
        g_bodyAngle = this.value;
        renderAllShapes();
    });

    document.getElementById('headslide').addEventListener('mousemove', function () {
        g_headAngle = this.value;
        g_headAngle1 = this.value * 10;
        renderAllShapes();
    });

    document.getElementById('angleSlide').addEventListener('mousemove', function () {
        g_globalAngle = this.value;
        renderAllShapes();
    });

}

function main() {
    setupWebGL();

    connectVariablesToGLSL();

    addActionsForHtmlUI();

    initEventHandlers(canvas, currentAngle);

    gl.clearColor(255 / 255, 127 / 255, 127 / 255, 0);

    requestAnimationFrame(tick);
}

function initEventHandlers(canvas, currentAngle) {
    var dragging = false;
    var lastX = -1, lastY = -1;
    canvas.onmousedown = function(ev) { 
        var x = ev.clientX, y = ev.clientY;

        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x; lastY = y;
            dragging = true;
            }
        };

    canvas.onmouseup = function(ev) { dragging = false; };
        canvas.onmousemove = function(ev) {
        var x = ev.clientX, y = ev.clientY;
        if (dragging) {
            var factor = 100/canvas.height;
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);

            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
            currentAngle[1] = currentAngle[1] + dx;
            }
        lastX = x, lastY = y;
        };
    }

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;


function tick() {
    g_seconds = performance.now() / 500.0 - g_startTime;
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_animation == true) {
        g_thighAngle = (8 * Math.sin(g_seconds));
        g_lowerLegAngle = -(6 * Math.sin(g_seconds));
        g_bodyAngle = 2 * (Math.sin(g_seconds));
        g_headAngle = 4 * (Math.sin(g_seconds));
        g_headAngle1 = 10000 * (Math.sin(g_seconds));
        g_wingAngle = 10 * (Math.sin(g_seconds));
    }
}

var currentAngle=[0.0,0.0];
function renderAllShapes() {
    var startTime = performance.now();
    var globalRotMat = new Matrix4().rotate(currentAngle[0], 1.0, 0.0, 0.0);
    globalRotMat.rotate(currentAngle[1], 0.0, 1.0, 0.0);
    globalRotMat.rotate(g_globalAngle, 0.0, 1.0, 0.0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderScene();
    var duration = performance.now() - startTime;

    var e = document.getElementById("numdot");
    e.innerHTML = "delta:" + Math.floor(duration) + " FPS: " + Math.floor(10000 / duration) / 10;
}

function renderScene() {
    var body = new Cube([255,255,255]);
    body.matrix.translate(0.5, -0.25, 0);
    body.matrix.rotate(90, 0, 0, 1);
    body.matrix.rotate(g_bodyAngle, 0, 0, 1);
    body.matrix.scale(0.5, 0.5, 0.5);
    body.render();
    var leftWing = new Cube([255,255,255]);
    leftWing.matrix = new Matrix4(body.matrix)
    leftWing.matrix.translate(0.8,0.3,1);
    leftWing.matrix.rotate(90, 0, 0, 1);
    if (shift == false) {
        leftWing.matrix.rotate(0, 0, g_wingAngle, 1);
    } else {
        leftWing.matrix.rotate(g_headAngle1, 1, 1, 0)
    }
    leftWing.matrix.scale(0.5, 0.5, 0.2);
    leftWing.render();
    var rightWing = new Cube([255,255,255]);
    rightWing.matrix = new Matrix4(body.matrix)
    rightWing.matrix.translate(0.8,0.3,-0.2);
    rightWing.matrix.rotate(90, 0, 0, 1);
    if (shift == false) {
        rightWing.matrix.rotate(0, 0, g_wingAngle, 1);
    } else {
        rightWing.matrix.rotate(g_headAngle1, 1, 1, 0)
    }
    rightWing.matrix.scale(0.5, 0.5, 0.2);
    rightWing.render();
    
    var B_L_Upper_Leg = new Cube([245,186,29]);
    B_L_Upper_Leg.matrix.translate(0.35, -0.4, 0.20);
    B_L_Upper_Leg.matrix.scale(0.15, 0.25, 0.1);
    B_L_Upper_Leg.matrix.rotate(180, 0, 1, 0);
    B_L_Upper_Leg.matrix.rotate(g_thighAngle, 0, 0, 1);
    var B_L_Coor = new Matrix4(B_L_Upper_Leg.matrix);
    B_L_Upper_Leg.render();
    var B_L_Lower_Leg = new Cube([245,186,29]);
    B_L_Lower_Leg.matrix = B_L_Coor;
    B_L_Lower_Leg.matrix.translate(0.25, -0.4, 0.25);
    B_L_Lower_Leg.matrix.scale(0.5, 0.6, 0.5);
    B_L_Lower_Leg.matrix.rotate(g_lowerLegAngle, 0, 0, 1);
    var B_L_Foot_Coor = new Matrix4(B_L_Lower_Leg.matrix);
    B_L_Lower_Leg.render();
    var B_L_Foot = new Cube([245,186,29]);
    B_L_Foot.matrix = B_L_Foot_Coor;
    B_L_Foot.matrix.translate(-0.25, -0.15, -0.7);
    B_L_Foot.matrix.scale(1.5, 0.15, 2.5);
    B_L_Foot.render();

    var B_R_Upper_Leg = new Cube([245,186,29]);
    B_R_Upper_Leg.matrix.translate(0.35, -0.4, 0.40);
    B_R_Upper_Leg.matrix.scale(0.15, 0.25, 0.1);
    B_R_Upper_Leg.matrix.rotate(180, 0, 1, 0);
    B_R_Upper_Leg.matrix.rotate(g_thighAngle, 0, 0, 1);
    var B_R_Coor = new Matrix4(B_R_Upper_Leg.matrix);
    B_R_Upper_Leg.render();
    var B_R_Lower_Leg = new Cube([245,186,29]);
    B_R_Lower_Leg.matrix = B_R_Coor;
    B_R_Lower_Leg.matrix.translate(0.25, -0.4, 0.25);
    B_R_Lower_Leg.matrix.scale(0.5, 0.6, 0.5);
    B_R_Lower_Leg.matrix.rotate(g_lowerLegAngle, 0, 0, 1);
    var B_R_Foot_Coor = new Matrix4(B_R_Lower_Leg.matrix);
    B_R_Lower_Leg.render();
    var B_R_Foot = new Cube([245,186,29]);
    B_R_Foot.matrix = B_R_Foot_Coor;
    B_R_Foot.matrix.translate(-0.25, -0.15, -0.7);
    B_R_Foot.matrix.scale(1.5, 0.15, 2.5);
    B_R_Foot.render();
    
    var head = new Cube([255,255,255])
    head.matrix.setTranslate(0, 0.05, 0.04)
    head.matrix.rotate(90, 0, 0, 1)
    head.matrix.rotate(g_headAngle, 0, 0, 1)
    head.matrix.scale(0.3, 0.15, 0.4);
    head.render();
    var beak = new Cube([245,186,29])
    beak.matrix = new Matrix4(head.matrix)
    beak.matrix.translate(0.1, 1, 0.25)
    beak.matrix.scale(0.5, 0.8, 0.5)
    beak.render()
    var watt = new Cube([255,0,0])
    watt.matrix = new Matrix4(head.matrix)
    watt.matrix.translate(0, 1, 0.3)
    watt.matrix.scale(0.5, 0.5, 0.4)
    watt.render()
    var leftEye = new Cube([0,0,0])
    leftEye.matrix = new Matrix4(head.matrix)
    leftEye.matrix.translate(0.7, 1, 0.7)
    leftEye.matrix.scale(0.2,0.2,0.2)
    leftEye.render()
    var rightEye = new Cube([0,0,0])
    rightEye.matrix = new Matrix4(head.matrix)
    rightEye.matrix.translate(0.7, 1, 0.1)
    rightEye.matrix.scale(0.2,0.2,0.2)
    rightEye.render()

    
    var tail = new Triangle();
    tail.color = [1,1,1, 1.0];
    tail.matrix.translate(0.45, 0., 0.2);
    tail.matrix.rotate(270, 0, 0, 1);
    tail.matrix.rotate(g_bodyAngle, 0, 0, 1);
    tail.matrix.scale(0.15, 0.1, 0.4);
    tail.render();
}

function funcShiftKey(event) {
    if (event.shiftKey) {
        shift = true;
    } else {
        shift = false;
    }
}

