// ========== BEAMS BACKGROUND (Vanilla Three.js — faithful port of React Bits Beams) ==========

function initBeams(containerId, options = {}) {
    const {
        beamWidth      = 4.3,
        beamHeight     = 15,
        beamNumber     = 12,
        lightColor     = '#ffffff',
        speed          = 3.4,
        noiseIntensity = 1.15,
        scale          = 0.2,
        rotation       = 58
    } = options;

    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ───────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 20);

    // ── Noise GLSL (Perlin 3D + 2D) ─────────────────────────────────────────
    const noiseGLSL = /* glsl */`
float _random(in vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}
float _noise2(in vec2 st){
    vec2 i=floor(st),f=fract(st);
    float a=_random(i),b=_random(i+vec2(1,0)),c=_random(i+vec2(0,1)),d=_random(i+vec2(1,1));
    vec2 u=f*f*(3.-2.*f);
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}
vec4 _permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 _taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec3 _fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}
float cnoise(vec3 P){
    vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.);
    Pi0=mod(Pi0,289.);Pi1=mod(Pi1,289.);
    vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz,iz1=Pi1.zzzz;
    vec4 ixy=_permute(_permute(ix)+iy);
    vec4 ixy0=_permute(ixy+iz0),ixy1=_permute(ixy+iz1);
    vec4 gx0=ixy0/7.,gy0=fract(floor(gx0)/7.)-.5;
    gx0=fract(gx0);vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0);
    vec4 sz0=step(gz0,vec4(0.));
    gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);
    vec4 gx1=ixy1/7.,gy1=fract(floor(gx1)/7.)-.5;
    gx1=fract(gx1);vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1);
    vec4 sz1=step(gz1,vec4(0.));
    gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0=_taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;
    vec4 norm1=_taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;
    float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);
    vec3 fade_xyz=_fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    return 2.2*mix(n_yz.x,n_yz.y,fade_xyz.x);
}`;

    // ── Shared time uniform ──────────────────────────────────────────────────
    const timeUniform = { value: 0 };

    // ── Material via onBeforeCompile ─────────────────────────────────────────
    const material = new THREE.MeshStandardMaterial({
        color:     0x000000,
        roughness: 0.3,
        metalness: 0.3,
    });

    material.onBeforeCompile = (shader) => {
        shader.uniforms.time           = timeUniform;
        shader.uniforms.uSpeed         = { value: speed };
        shader.uniforms.uScale         = { value: scale };
        shader.uniforms.uNoiseIntensity = { value: noiseIntensity };

        // Inject noise + uniforms before vertex main
        shader.vertexShader = noiseGLSL + `
uniform float time;
uniform float uSpeed;
uniform float uScale;
` + shader.vertexShader
            .replace('#include <begin_vertex>', `
#include <begin_vertex>
{
    vec3 noisePos = vec3(transformed.x * 0.0, transformed.y - uv.y, transformed.z + time * uSpeed * 3.0) * uScale;
    transformed.z += cnoise(noisePos);
}`)
            .replace('#include <beginnormal_vertex>', `
#include <beginnormal_vertex>
{
    // recompute normal after displacement
    vec3 p  = position;
    vec3 np = p + vec3(0.01, 0., 0.);
    vec3 nq = p + vec3(0., -0.01, 0.);
    float dz  = cnoise(vec3(p.x *0., p.y - uv.y, p.z + time*uSpeed*3.) * uScale);
    float dzx = cnoise(vec3(np.x*0., np.y - uv.y, np.z + time*uSpeed*3.) * uScale);
    float dzq = cnoise(vec3(nq.x*0., nq.y - uv.y, nq.z + time*uSpeed*3.) * uScale);
    vec3 tan1 = normalize(vec3(0.01, 0., dzx - dz));
    vec3 tan2 = normalize(vec3(0., -0.01, dzq - dz));
    objectNormal = normalize(cross(tan2, tan1));
}`);

        // Inject film-grain noise in fragment
        shader.fragmentShader = `uniform float uNoiseIntensity;\n` + shader.fragmentShader
            .replace('#include <dithering_fragment>', `
#include <dithering_fragment>
{
    float rn = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);
    gl_FragColor.rgb -= rn / 15.0 * uNoiseIntensity;
}`);
    };

    // ── Geometry (stacked planes) ─────────────────────────────────────────────
    function buildGeometry(n, w, h, heightSegments) {
        const numV  = n * (heightSegments + 1) * 2;
        const numF  = n * heightSegments * 2;
        const pos   = new Float32Array(numV * 3);
        const idx   = new Uint32Array(numF * 3);
        const uvArr = new Float32Array(numV * 2);

        let vOff = 0, iOff = 0, uvOff = 0;
        const totalW = n * w;
        const xBase  = -totalW / 2;

        for (let i = 0; i < n; i++) {
            const xOff  = xBase + i * w;
            const uvXOff = Math.random() * 300;
            const uvYOff = Math.random() * 300;

            for (let j = 0; j <= heightSegments; j++) {
                const y = h * (j / heightSegments - 0.5);
                pos.set([xOff, y, 0,  xOff + w, y, 0], vOff * 3);
                const uvY = j / heightSegments;
                uvArr.set([uvXOff, uvY + uvYOff,  uvXOff + 1, uvY + uvYOff], uvOff);

                if (j < heightSegments) {
                    const a = vOff, b = vOff+1, c = vOff+2, d = vOff+3;
                    idx.set([a, b, c,  c, b, d], iOff);
                    iOff += 6;
                }
                vOff  += 2;
                uvOff += 4;
            }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('uv',       new THREE.BufferAttribute(uvArr, 2));
        geo.setIndex(new THREE.BufferAttribute(idx, 1));
        geo.computeVertexNormals();
        return geo;
    }

    const geo  = buildGeometry(beamNumber, beamWidth, beamHeight, 100);
    const mesh = new THREE.Mesh(geo, material);

    const group = new THREE.Group();
    group.rotation.z = THREE.MathUtils.degToRad(rotation);
    group.add(mesh);
    scene.add(group);

    // ── Lights ────────────────────────────────────────────────────────────────
    const dirLight = new THREE.DirectionalLight(lightColor, 1);
    dirLight.position.set(0, 3, 10);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    // ── Animation ─────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId;

    function animate() {
        animId = requestAnimationFrame(animate);
        timeUniform.value += clock.getDelta() * 0.3;
        renderer.render(scene, camera);
    }
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    function onResize() {
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
    };
}
