// Silk Background Effect using Three.js
class SilkBackground {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.options = {
            speed: options.speed || 5,
            scale: options.scale || 1,
            color: options.color || '#7B7481',
            noiseIntensity: options.noiseIntensity || 1.5,
            rotation: options.rotation || 0,
            ...options
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.uniforms = null;
        this.time = 0;

        this.init();
    }

    hexToNormalizedRGB(hex) {
        hex = hex.replace('#', '');
        return [
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255
        ];
    }

    init() {
        // Check if container exists
        if (!this.container) {
            console.warn('SilkBackground: Container not found');
            return;
        }

        // Wait for container to have dimensions
        const checkDimensions = () => {
            if (this.container.clientWidth === 0 || this.container.clientHeight === 0) {
                setTimeout(checkDimensions, 100);
                return;
            }
            this.initScene();
        };
        checkDimensions();
    }

    initScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera = new THREE.OrthographicCamera(
            width / -2,
            width / 2,
            height / 2,
            height / -2,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.container.appendChild(this.renderer.domElement);

        console.log('✨ SilkBackground Scene initialized - Size:', width, 'x', height);

        // Shader material
        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vPosition = position;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec2 vUv;
            varying vec3 vPosition;

            uniform float uTime;
            uniform vec3 uColor;
            uniform float uSpeed;
            uniform float uScale;
            uniform float uRotation;
            uniform float uNoiseIntensity;

            const float e = 2.71828182845904523536;

            float noise(vec2 texCoord) {
                float G = e;
                vec2 r = (G * sin(G * texCoord));
                return fract(r.x * r.y * (1.0 + texCoord.x));
            }

            vec2 rotateUvs(vec2 uv, float angle) {
                float c = cos(angle);
                float s = sin(angle);
                mat2 rot = mat2(c, -s, s, c);
                return rot * uv;
            }

            void main() {
                float rnd = noise(gl_FragCoord.xy);
                vec2 uv = rotateUvs(vUv * uScale, uRotation);
                vec2 tex = uv * uScale;
                float tOffset = uSpeed * uTime;

                tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

                float pattern = 0.6 +
                                0.4 * sin(5.0 * (tex.x + tex.y +
                                                cos(3.0 * tex.x + 5.0 * tex.y) +
                                                0.02 * tOffset) +
                                        sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

                vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
                col.a = 1.0;
                gl_FragColor = col;
            }
        `;

        this.uniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(...this.hexToNormalizedRGB(this.options.color)) },
            uSpeed: { value: this.options.speed },
            uScale: { value: this.options.scale },
            uRotation: { value: this.options.rotation },
            uNoiseIntensity: { value: this.options.noiseIntensity }
        };

        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader
        });

        const geometry = new THREE.PlaneGeometry(
            this.container.clientWidth,
            this.container.clientHeight
        );

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.mesh.geometry.dispose();
        this.mesh.geometry = new THREE.PlaneGeometry(width, height);
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        this.time += 0.016; // ~60fps
        this.uniforms.uTime.value = this.time;

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}
