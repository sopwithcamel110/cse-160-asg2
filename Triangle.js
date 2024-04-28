class Triangle {
    constructor() {
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
 
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        drawTriangle3D([-0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0]);
        drawTriangle3D([-0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.5, 0.0, 0.25]);
        drawTriangle3D([-0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.0, 1.0, 0.0]);
        drawTriangle3D([-0.5, 0.0, 0.25, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0]);
        drawTriangle3D([0.5, 0.0, 0.25, 0.0, 1.0, 0.25, 0.0, 1.0, 0.0]);
        drawTriangle3D([0.5, 0.0, 0.25, 0.5, 0.0, 0.0, 0.0, 1.0, 0.0]);
        drawTriangle3D([0.5, 0.0, 0.0, 0.5, 0.0, 0.25, -0.5, 0.0, 0.0]);
        drawTriangle3D([-0.5, 0.0, 0.25, -0.5, 0.0, 0.0, 0.5, 0.0, 0.0]);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    }
}

function drawTriangle(vertices) {
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
}

function drawTriangle3D(vertices) {
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}