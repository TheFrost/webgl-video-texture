import { initShaders, getWebGLContext } from './lib/utils';

export default class WebGLVideo {
  // time control
  frameDuration = 1000 / 60;
  time = 0;
  lastTime = 0;
  renderReady = false;

  gl = null;
  numVertex = null;
  texResources = {};
  uniforms = {};
  vShader = `
    attribute vec4 a_Position;

    void main() {
      gl_Position = a_Position;
    }
  `;
  fShader = `
    precision highp float;

    // texture
    uniform sampler2D u_Sampler;

    // frontend uniforms
    uniform vec2 u_Resolution;
    uniform vec2 u_UserCoord;

    // sin distortion uniforms
    uniform float u_Time;
    uniform float u_Amplitude;
    uniform float u_Speed;
    uniform float u_Frequency;

    // pen settings
    uniform float u_Radius;
    uniform float u_Blur;

    void main() {
      float aspect = u_Resolution.x / u_Resolution.y;

      // Normalize
      vec2 uv = gl_FragCoord.xy / u_Resolution.xy;
      vec2 uvAspect = vec2(uv.x * aspect, uv.y);
      vec2 userCoordNorm = u_UserCoord.xy / u_Resolution.xy;
      userCoordNorm.x *= aspect;

      float dist = distance(uvAspect, userCoordNorm);
      float interpolation = smoothstep(
        u_Radius, 
        u_Radius - u_Blur, 
        dist
      );

      // sin distortion equation
      // d = sin((x * f) + (t * s)) * a
      float x = uvAspect.y;
      float f = u_Frequency;
      float t = u_Time;
      float s = u_Speed;
      float a = u_Amplitude;

      float d = sin((x * f) + (t * s)) * a;
      float mask = d * interpolation;

      // Textures
      vec4 texel = texture2D(
        u_Sampler,
        vec2(
          uv.x + mask,
          uv.y
        )
      );

      gl_FragColor = texel;
      // gl_FragColor = texel + vec4(1.0, 0.0, 0.0, 1.0) * interpolation;
    }
  `;

  constructor(container) {
    this.DOM = {
      container,
      canvas: container.querySelector('#webgl'),
      video: container.querySelector('#media')
    }

    this.setupGl();
    this.setupVertexBuffers();
    this.setupUniforms();
    this.setupResolution();
    this.setupTextures();
    this.bindEvents();
  }

  setupGl() {
    const { canvas, video } = this.DOM;

    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;

    this.gl = getWebGLContext(canvas);

    // validate correct setup shaders
    if (!initShaders(this.gl, this.vShader, this.fShader)) {
      console.log('Failed to init shaders.');
      return;
    }

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  }

  setupUniforms() {
    const { gl } = this;

    this.uniforms = {
      u_Resolution: gl.getUniformLocation(gl.program, 'u_Resolution'),
      u_Radius: gl.getUniformLocation(gl.program, 'u_Radius'),
      u_Blur: gl.getUniformLocation(gl.program, 'u_Blur'),
      u_Sampler: gl.getUniformLocation(gl.program, 'u_Sampler'),
      u_UserCoord: gl.getUniformLocation(gl.program, 'u_UserCoord'),
      u_Time: gl.getUniformLocation(gl.program, 'u_Time'),
      u_Amplitude: gl.getUniformLocation(gl.program, 'u_Amplitude'),
      u_Speed: gl.getUniformLocation(gl.program, 'u_Speed'),
      u_Frequency: gl.getUniformLocation(gl.program, 'u_Frequency')
    }
  }

  setupResolution() {
    const { gl } = this;
    const { canvas } = gl;
    const { u_Resolution } = this.uniforms;

    gl.uniform2f(u_Resolution, canvas.width, canvas.height);
  }

  setupVertexBuffers() {
    const { gl } = this;
    const vertices = new Float32Array([
      -1.0,  1.0,
      -1.0, -1.0,
       1.0,  1.0,
       1.0, -1.0
    ]);

    this.numVertex = vertices.length/2;

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
  }

  setupTextures() {
    const { gl } = this;
    const { u_Sampler } = this.uniforms;
    
    const texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.texResources = { u_Sampler, texture };
  }

  loadTextures() {
    const { gl, numVertex } = this;
    const { u_Sampler, texture } = this.texResources;
    const { video } = this.DOM;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    gl.uniform1i(u_Sampler, 0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertex);
  }

  render(elapsed = 0) {
    const delta = elapsed - this.lastTime;
    this.lastTime = elapsed;

    const step = delta / this.frameDuration;
    this.time += step;

    this.loadTextures();
    this.updateUniforms();

    window.requestAnimationFrame(this.render.bind(this));
  }

  updateUniforms() {
    const { gl, time } = this;
    const { 
      u_Radius,
      u_Blur,
      u_Amplitude,
      u_Frequency,
      u_Speed,
      u_Time
    } = this.uniforms;
    

    gl.uniform1f(u_Radius, 0.3);
    gl.uniform1f(u_Blur, 0.4);

    gl.uniform1f(u_Amplitude, 0.05);
    gl.uniform1f(u_Frequency, 20.0);
    gl.uniform1f(u_Speed, 0.03);
    gl.uniform1f(u_Time, time);
  }

  bindEvents() {
    const { container, video } = this.DOM

    video.addEventListener('canplay', () => {
      this.renderReady = true;
      this.render()
    });
    window.addEventListener('resize', this.resizeHandler.bind(this), false);
    container.addEventListener('mousemove', this.mouseHandler.bind(this), false);
    container.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.mouseHandler(e);
    });
  }

  resizeHandler() {
    const { gl } = this;
    const { video } = this.DOM;
    const { canvas } = gl;
    const { offsetWidth, offsetHeight } = video;
    
    if (canvas.width !== offsetWidth || canvas.height !== offsetHeight) {
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    this.setupResolution();
  }

  mouseHandler(e) {
    if (!this.renderReady) { return; }

    const target = e.touches
      ? e.touches[0]
      : e;

    const { gl } = this;
    const { u_UserCoord } = this.uniforms;
    const { clientX, clientY } = target;
    const { container, video } = this.DOM;
    const { 
      offsetWidth: containerWidth, 
      offsetHeight: containerHeight
    } = container;
    const { 
      offsetWidth: videoWidth, 
      offsetHeight: videoHeight 
    } = video;
    const containerRect = container.getBoundingClientRect();

    const offsetX = (videoWidth - containerWidth) / 2;
    const offsetY = (videoHeight - containerHeight) / 2;

    const x = (clientX - containerRect.left) + offsetX;
    const y = containerHeight - ((clientY - containerRect.top) + offsetY);

    gl.uniform2f(u_UserCoord, x, y);
  }
}