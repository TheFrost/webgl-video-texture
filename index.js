import WebGLVideo from './refactor';

const container = document.getElementById('video-container');
new WebGLVideo(container);

// utils
// import { initShaders, getWebGLContext } from './lib/utils';

// shaders
// import vertexShader from './shaders/vertex.glsl';
// import fragmentShader from './shaders/fragment.glsl';

// const vertexShader = `
// 	attribute vec4 a_Position;
// 	attribute vec2 a_TexCoord;

// 	varying vec2 v_TexCoord;

// 	void main() {
// 		gl_Position = a_Position;
// 		v_TexCoord = a_TexCoord;
// 	}
// `;

// const fragmentShader = `
// 	precision mediump float;

// 	uniform sampler2D u_Sampler;
// 	uniform vec2 u_UserCoords;

// 	varying vec2 v_TexCoord;

// 	void main() {
// 		vec4 color = texture2D(u_Sampler, v_TexCoord);
// 		float avg = color.r*0.3 + color.g*0.6 + color.b*0.1;
		
// 		if (avg > 0.019) {
// 			color = color * vec4(u_UserCoords, u_UserCoords.x / u_UserCoords.y, 1.0);
// 		}

// 		gl_FragColor = color;
// 	}
// `;

// window.onload = function() {
// 	var canvas = document.getElementById('webgl');
// 	var video = document.getElementById('media');
// 	var ambient = document.getElementById('ambient');
// 	var overlay = document.getElementById('overlay');
// 	var intro = document.querySelector('.intro');

// 	canvas.width = video.offsetWidth;
// 	canvas.height = video.offsetHeight;

// 	var gl = getWebGLContext(canvas);

// 	if (!initShaders(gl, vertexShader, fragmentShader)) {
// 		console.log('Failed to initialize shaders.');
// 		return;
// 	}

// 	var n = initVertexBuffers(gl);

// 	// setting the textures
// 	if (!initTextures(gl, n)) {
// 		console.log('Failer to init textures');
// 		return;
// 	}

// 	// bind events
// 	var u_UserCoords = gl.getUniformLocation(gl.program, 'u_UserCoords');
// 	window.addEventListener('mousemove', function(e) {
// 		var x = (e.clientX / window.innerWidth) * 2 - 1;
// 		var y = (e.clientY / window.innerHeight) * 2 - 1;

// 		gl.uniform2f(u_UserCoords, x, y);
// 	});

// 	window.addEventListener('resize', function() {
// 		gl.canvas.width = video.offsetWidth;
// 		gl.canvas.height = video.offsetHeight;
// 		resize(gl.canvas);
// 		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// 	});

// 	overlay.onclick = function() {
// 		this.classList.toggle('off');
// 		video.play();
// 		ambient.play();
// 		setTimeout(function() {
// 			intro.classList.toggle('on');
// 			overlay.onclick = null;
// 			overlay.style.display = 'none';
// 		}, 1500);
// 	};

// 	// clear canvas color
// 	gl.clearColor(0.0, 0.0, 0.0, 1.0);
// }

// function resize(canvas) {
// 	// Lookup the size the browser is displaying the canvas.
// 	var displayWidth  = canvas.clientWidth;
// 	var displayHeight = canvas.clientHeight;

// 	// Check if the canvas is not the same size.
// 	if (canvas.width  != displayWidth ||
// 			canvas.height != displayHeight) {

// 		// Make the canvas the same size
// 		canvas.width  = displayWidth;
// 		canvas.height = displayHeight;
// 	}
// }

// function initVertexBuffers (gl) {
// 	var vertices = new Float32Array([
// 		-1.0,  1.0, 	0.0, 1.0,
// 		-1.0, -1.0, 	0.0, 0.0,
// 		 1.0,  1.0, 	1.0, 1.0,
// 		 1.0, -1.0, 	1.0, 0.0
// 	]);

// 	var n = 4;

// 	var vertexBuffer = gl.createBuffer();

// 	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// 	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// 	var FSIZE = vertices.BYTES_PER_ELEMENT;

// 	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
// 	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
// 	gl.enableVertexAttribArray(a_Position);

// 	var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
// 	gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
// 	gl.enableVertexAttribArray(a_TexCoord);

// 	return n;
// }

// function initTextures (gl, n) {
// 	var texture = gl.createTexture();
// 	gl.bindTexture(gl.TEXTURE_2D, texture);
// 	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);  
// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
// 	var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
	
// 	var video = document.getElementById('media');
	
// 	loadTexture(gl, n, texture, u_Sampler, video);
	
// 	return true;
// }

// function loadTexture (gl, n, texture, u_Sampler, media) {
// 	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
// 	gl.activeTexture(gl.TEXTURE0);
// 	gl.bindTexture(gl.TEXTURE_2D, texture);
	
// 	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, media);
// 	gl.uniform1i(u_Sampler, 0);
// 	gl.clear(gl.COLOR_BUFFER_BIT);
// 	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

// 	window.requestAnimationFrame(function() {
// 		loadTexture(gl, n, texture, u_Sampler, media);
// 	});
// }