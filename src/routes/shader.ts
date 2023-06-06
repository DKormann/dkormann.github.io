import { browser } from "$app/environment";

if(browser){

    // Get a reference to the canvas element
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    console.log(window.innerWidth, window.innerHeight);
    // canvas.width = 300
    // canvas.height = 150;
    

    // Set up WebGL context

    const gl = canvas.getContext('webgl')!;

    // Define vertex shader source code
    const vertexShaderSource = `
        attribute vec2 position;


        void main() {
            gl_Position = vec4(position, 0.0, 1.0);

        }
    `;

    // Define fragment shader source code
    const fragmentShaderSource = `
        precision mediump float;

        uniform float canvasWidth;
        uniform float canvasHeight;
        uniform float scrollY;

        uniform vec2 mouse;

        uniform float windowratio;


        float rnd(float seed){
            return fract(sin(seed)*43758.5453123);
        }

        float random(float seed){

            float fl = floor(seed);
            float me = rnd(fl);
            float that = rnd(fl + 1.0);
            return mix(me, that, fract(seed));
        }

        float k = 100.0;
        float pulse(float x, float p, float f){

            return clamp( (random(x*f)+p)*k - k, 0.0, 1.0 );
        }

        vec3 wires(float x, float h,float light){
            vec3 base_color = vec3(0.05, 0.05, 0.1);

            x = x + h*25.23;

            vec3 bronze_color = vec3(0.7, 0.2, 0.1);
            vec3 silver_color = vec3(0.8, 0.8, 0.8);
            vec3 gold_color = vec3(0.8, 0.7, 0.1);


            float bronze_stripe = pulse(x+5348., 0.2,20.) ;
            float silver_stripe = pulse(x+124., 0.1, 20.) ;
            float gold_stripe   = pulse(x     , 0.05, 20.) ;

            vec3 color = base_color;
            color = mix(color, gold_color, gold_stripe);
            color = mix(color, silver_color, silver_stripe);
            color = mix(color, bronze_color, bronze_stripe);


            return color * 1.-(1.-light)*0.5;
        }

        float peak (float x,float offset, float width, float falloff){

            x -= offset;

            x *= falloff;
            x = 1. -x;

            x = abs(x);
            x = 1.-x;
            x += width * falloff * 0.5;
            x = clamp(x, 0.0, 1.0);

            return x;

        }

        vec3 tiling(float x, float y){

            float rep = 3.5;

            float ystep = floor(y*rep);

            float tilex = x + mod(ystep, 2.0)*2.5/rep;
            float tiley = y;

            float xstep = floor(tilex*rep);
            float rseed = random(xstep + ystep*100.0);


            tilex = fract(tilex*rep);
            tiley = fract(tiley*rep);


            tilex = tilex * 2. - 1.;
            tiley = tiley * 2. - 1.;
            return vec3(tilex, tiley, rseed);
        }

        vec3 tile(vec3 p, float light, vec2 mousevec){

            float l = 0.;

            if (mousevec.y * 16. > p.y){
                l = 1.0;
            }

            l = mousevec.y;
            l = .5;


            float h = p.z;

            vec3 primary = vec3(0.1, 0.5, 0.7);

            vec3 base_color = vec3(0.05, 0.05, 0.1);

            p.x = abs(p.x);
            p.y = abs(p.y);

            float signal = max(p.x, p.y);

            float diff = abs(p.x-p.y);


            // round corners
            float r = 0.1;
            if (diff < r){
                float flt = signal + min(p.x,p.y)+r;
                flt /= 2.;
                float push = signal - (min(p.x,p.y)+r);
                push =1.+push/r;
                push = r - push*push*r;
                signal = flt - push*0.25;
            }

            float border = peak (signal,0.7,0.1,50.);

            float inner = peak (signal,0.5,0.1,50.);

            vec3 col = primary * border;

            col += base_color + inner * l;
            return col;
        }

        void main() {
            vec2 normalizedPos = gl_FragCoord.xy;
            float x = normalizedPos.x / canvasWidth;
            float y = normalizedPos.y / canvasHeight;         

            vec2 mousevec = mouse - vec2(x,1.-y);
            mousevec.y/=windowratio;
            float mouse_dist = length(mousevec);


            
            y/=windowratio;

            y = y - scrollY/windowratio * .8;
            x = x - 0.5;
            x = x * 2.0;
            y = y * 2.0;

            vec3 tl = tiling(x, y);

            float light = 0.25;

            vec3 color = tile(tl, 1.-mouse_dist*2., mousevec)*light;

            gl_FragColor = vec4(color, 1.0);

        }
    `;

    // Create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // Create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Use the program
    gl.useProgram(program);

    // Render a triangle
    const vertices = [
        1, -1,
        -1, -1,
        -1, 1,
        1, 1,
    ];

    const indices = [
        0, 1, 2,
        0, 2, 3
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const canvasWidthLocation = gl.getUniformLocation(program, 'canvasWidth');
    const canvasHeightLocation = gl.getUniformLocation(program, 'canvasHeight');
    const scrollYLocation = gl.getUniformLocation(program, 'scrollY');
    const windowratioLocation = gl.getUniformLocation(program, 'windowratio');
    const mouseLocation = gl.getUniformLocation(program, 'mouse');

    // Pass the canvas dimensions as uniforms
    gl.uniform1f(canvasWidthLocation, canvas.width);
    gl.uniform1f(canvasHeightLocation, canvas.height);
    gl.uniform1f(scrollYLocation, window.scrollY/window.innerHeight);
    gl.uniform1f(windowratioLocation, window.innerWidth/window.innerHeight);
    gl.uniform2f(mouseLocation, 0, 0);

    gl.uniform1f(scrollYLocation, window.scrollY/window.innerHeight);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    

    window.addEventListener('scroll', () => {
        gl.uniform1f(scrollYLocation, window.scrollY/window.innerHeight);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        
    });

    window.addEventListener("mousemove", (e) => {
        gl.uniform2f(mouseLocation, e.clientX/window.innerWidth, e.clientY/window.innerHeight);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    });
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


}