// ========== AURORA BACKGROUND (Vanilla WebGL2 — faithful port of React Bits Aurora) ==========

function initAurora(containerId, options = {}) {
    const {
        colorStops = ['#da67ff', '#B497CF', '#ff2774'],
        blend      = 0.5,
        amplitude  = 1.0,
        speed      = 0.7,
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) { console.warn('Aurora: WebGL2 not supported'); return; }

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // ── Shaders ─────────────────────────────────────────────────────────────
    const VERT = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}`;

    const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3  uColorStops[3];
uniform vec2  uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
    const vec4 C = vec4(
        0.211324865405187,  0.366025403784439,
       -0.577350269189626,  0.024390243902439
    );
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy  -= i1;
    i = mod(i, 289.0);

    vec3 p = permute(
        permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0)
    );

    vec3 m = max(0.5 - vec3(
        dot(x0,      x0),
        dot(x12.xy, x12.xy),
        dot(x12.zw, x12.zw)
    ), 0.0);
    m = m * m;
    m = m * m;

    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

    vec3 g;
    g.x  = a0.x  * x0.x   + h.x  * x0.y;
    g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

vec3 colorRamp(vec3 c0, vec3 c1, vec3 c2, float t) {
    float s = clamp(t, 0.0, 1.0);
    if (s < 0.5) return mix(c0, c1, s * 2.0);
    return mix(c1, c2, (s - 0.5) * 2.0);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    vec3 rampColor = colorRamp(uColorStops[0], uColorStops[1], uColorStops[2], uv.x);

    float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
    height = exp(height);
    height = (uv.y * 2.0 - height + 0.2);
    float intensity = 0.6 * height;

    float midPoint  = 0.20;
    float auroraAlpha = smoothstep(
        midPoint - uBlend * 0.5,
        midPoint + uBlend * 0.5,
        intensity
    );

    vec3 auroraColor = intensity * rampColor;
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}`;

    // ── Compile / link ────────────────────────────────────────────────────────
    function compileShader(type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            console.error('Aurora shader error:', gl.getShaderInfoLog(sh));
            gl.deleteShader(sh);
            return null;
        }
        return sh;
    }

    const vert    = compileShader(gl.VERTEX_SHADER,   VERT);
    const frag    = compileShader(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Aurora link error:', gl.getProgramInfoLog(program));
        return;
    }

    // ── Full-screen triangle ──────────────────────────────────────────────────
    const verts = new Float32Array([-1, -1,  3, -1,  -1, 3]);
    const vbo   = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const vao    = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // ── Uniform locations ─────────────────────────────────────────────────────
    const uTimeLoc       = gl.getUniformLocation(program, 'uTime');
    const uAmplitudeLoc  = gl.getUniformLocation(program, 'uAmplitude');
    const uColorStopsLoc = gl.getUniformLocation(program, 'uColorStops');
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
    const uBlendLoc      = gl.getUniformLocation(program, 'uBlend');

    // ── Helpers ────────────────────────────────────────────────────────────────
    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return [
            parseInt(h.slice(0, 2), 16) / 255,
            parseInt(h.slice(2, 4), 16) / 255,
            parseInt(h.slice(4, 6), 16) / 255,
        ];
    }

    function resize() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        const w   = container.offsetWidth;
        const h   = container.offsetHeight;
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    // ── Render loop ────────────────────────────────────────────────────────────
    let animId;

    function render(t) {
        animId = requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        const time      = t * 0.001 * speed;
        const colorData = colorStops.flatMap(hexToRgb);

        gl.uniform1f(uTimeLoc,       time);
        gl.uniform1f(uAmplitudeLoc,  amplitude);
        gl.uniform3fv(uColorStopsLoc, colorData);
        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform1f(uBlendLoc,      blend);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
    }

    animId = requestAnimationFrame(render);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
}
