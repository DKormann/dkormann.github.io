import { browser } from "$app/environment";


// function add_shader(canvas:HTMLCanvasElement){

// }

const color_palette = [
    
    [
        // yellow
        [0.8, 0.7, 0.1],
        [0.5, 0.7, 0.4],
        [0.8, 0.7, 0.7],

    ],
    [
        // blue
        [0.3, 0.4, 0.9],
        [0.7, 0.6, 0.5],
        [0.7, 0.7, 0.8]
    ],
    [
        //orange
        [0.9, 0.5, 0.1],//outer
        [0.9, 0.3, 0.2],//street
        [0.7, 0.8, 0.7]//inner

    ],
]

if (browser) {
    const canvases = document.querySelectorAll('.canvas') as NodeListOf<HTMLCanvasElement>;
    canvases.forEach((canvas,i) => {
        const col_pal = color_palette[i%color_palette.length];
        add_shader(canvas, col_pal[0], col_pal[1], col_pal[2]);
    });
}

function add_shader (canvas:HTMLCanvasElement, c1= [0.2, 0.2, 0.2], c2 = [0.8, 0.8, 0.8], c3 = [0.8, 0.8, 0.8]){
    // // Get a reference to the canvas element
    // const canvas = document.getElementById('canvas') as HTMLCanvasElement;

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
        uniform float windowWidth;
        uniform float windowHeight;

        uniform float top;
        uniform vec2 mouse;
        uniform float parentRatio;

        uniform vec3 c1;
        uniform vec3 c2;
        uniform vec3 c3;


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

            x = x + h*25.23;

            vec3 bronze_color = vec3(0.7, 0.2, 0.1);
            vec3 silver_color = vec3(0.8, 0.8, 0.8);
            vec3 gold_color = vec3(0.8, 0.7, 0.1);


            float bronze_stripe = pulse(x+5348., 0.2,20.) ;
            float silver_stripe = pulse(x+124., 0.1, 20.) ;
            float gold_stripe   = pulse(x     , 0.05, 20.) ;

            vec3 color = vec3(0.0);
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

        float flipped = 0.;

        vec3 tiling(float x, float y){

            float rep = 7./1000.*windowWidth;

            float fill_height = 0.9;

            y = y/fill_height;

            float ystep = floor(y*rep);

            flipped = mod(ystep, 2.0);
            float tilex = x + flipped*2.5/rep;
            float tiley = y;

            float xstep = floor(tilex*rep);
            float rseed = random(xstep + ystep*100.0);

            tilex = fract(tilex*rep);
            tiley = fract(tiley*rep)*fill_height;

            tilex = tilex * 2. - 1.;
            tiley = tiley * 2. - 1.;
            return vec3(tilex, tiley, rseed);
        }

        float roundCorner(vec2 p, float r){

            float signal = max(p.x, p.y);

            // round corners
            float diff = abs(p.x-p.y);
            if (diff < r){
                float flt = signal + min(p.x,p.y)+r;
                flt /= 2.;
                float push = signal - (min(p.x,p.y)+r);
                push =1.+push/r;
                push = r - push*push*r;
                signal = flt - push*0.25;

            }
            return signal;

        }

        float spot(vec2 p, vec2 center, float rseed){

            
            float radius = 0.03;
            float falloff = 40.0;
            float dist = length(p-center);
            float signal = peak(dist, 0.0, radius, falloff);
            return signal * (random(rseed*87.+13.23)>0.4?1.0:0.2);
        }

        vec4 tile(vec3 p, vec2 mousevec ){

            float l = 0.;

            float light = .5;

            float h = p.z;

            vec3 col = vec3(0.);

            col += spot(p.xy, vec2(0.,0),h+1.) * c2;
            col += spot(p.xy, vec2(.2,.0),h+2.) * c2;
            col += spot(p.xy, vec2(-.2,.0),h+3.) * c2;
            col += spot(p.xy, vec2(.1,.17),h+4.) * c2;
            col += spot(p.xy, vec2(-.1,.17),h+5.) * c2;
            col += spot(p.xy, vec2(.1,-.17),h+6.) * c2;
            col += spot(p.xy, vec2(-.1,-.17),h+7.) * c2;

            float xdiff = abs ( mousevec.x + p.x);
            float ydiff = abs ( mousevec.y + p.y);


            light = mix(0.5,1.,peak(max(xdiff,ydiff),0.0,0.9,5.));

            float dist = length(vec2(xdiff,ydiff));
            float scaler = mix(.9,1., peak(dist,0.0,2.,2.));

            p /=scaler;

            p.x = abs(p.x);
            p.y = abs(p.y);

            float signal = roundCorner(p.xy, 0.1);


            float border = peak (signal,0.7,0.1,50.);

            float inner = peak (signal,0.5,0.1,50.);

            col += c1 * border;

            col += c3 * inner ;


            return vec4(col *light ,peak(signal, 0.0, 1.4, 20.)) ;

        }

        vec3 street(vec3 p, float light){


            float h = p.z;

            p.x = abs(p.x);
            p.y = abs(p.y);

            float signal = roundCorner(p.xy, 0.1);

            float street_d = (signal - 0.8)/0.2;

            

            if (p.x < 0.5 && p.y > 0.5){

                float sx = p.x/0.2;
                float sy = (p.y - 0.8)/0.2;

                street_d = min(sx, sy);
                street_d = roundCorner(vec2(1.-sx,1.-sy), .5);
                street_d = 1.-street_d;

            }

            vec3 col = vec3(0.)+c2 * 0.15;

            street_d += (1.-2.*street_d)*flipped;

            float street = peak (street_d,0.7,0.1,50.);
            street += peak (street_d,0.3,0.1,50.);


            if (street_d > 0. && street_d < 1.){
                col +=  street * c2;
            }

            return col;
        }


        void main() {


            vec2 normalizedPos = gl_FragCoord.xy;

            float x = normalizedPos.x ;
            float y = (normalizedPos.y ) ;


            x = normalizedPos.x / canvasWidth;
            y = 1.-(normalizedPos.y ) / canvasHeight;    

            y/=parentRatio;

            y += (top)/windowWidth;
            
            float sdiff = 0.05;
            float y2 = y*(1.-sdiff)+sdiff/2.;
            float x2 = x*(1.-sdiff)+sdiff/2.;

            y += -scrollY*0.2;
            y2 += -scrollY*0.15;


            float my = mouse.y/windowWidth;
            float mx = mouse.x/windowWidth;

            my -= y - scrollY*0.8;

            mx -= x;

            // gl_FragColor = vec4(mx,my,0., 1.0);
            // return ;


            vec3 tl = tiling(x, y);
            vec3 tl2 = tiling(x2, y2);


            float light = .8;

            vec3 color = street(tl, 1.);

            vec4 house = tile(tl2, vec2(mx,my) * 12. *(windowWidth/windowHeight) );
            color = mix(color, house.xyz, house.w) * light;


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
    const parentRatioLocation = gl.getUniformLocation(program, 'parentRatio');
    const mouseLocation = gl.getUniformLocation(program, 'mouse');
    const topLocation = gl.getUniformLocation(program, 'top');
    const windowWidthLocation = gl.getUniformLocation(program, 'windowWidth');
    const windowHeightLocation = gl.getUniformLocation(program, 'windowHeight');
    const c1Location = gl.getUniformLocation(program, 'c1');
    const c2Location = gl.getUniformLocation(program, 'c2');
    const c3Location = gl.getUniformLocation(program, 'c3');


    const parent = canvas.parentElement as HTMLDivElement;

    // Pass the canvas dimensions as uniforms
    gl.uniform1f(canvasWidthLocation, canvas.width);
    gl.uniform1f(canvasHeightLocation, canvas.height);
    gl.uniform1f(scrollYLocation, window.scrollY/parent.clientHeight);
    gl.uniform1f(parentRatioLocation, parent.clientWidth/parent.clientHeight);
    gl.uniform1f(windowWidthLocation, window.innerWidth)
    gl.uniform1f(windowHeightLocation, window.innerHeight)



    gl.uniform3f(c1Location, c1[0], c1[1], c1[2]);
    gl.uniform3f(c2Location, c2[0], c2[1], c2[2]);
    gl.uniform3f(c3Location, c3[0], c3[1], c3[2]);

    gl.uniform2f(mouseLocation, 0, 0);
    gl.uniform1f(topLocation, parent.offsetTop);


    gl.uniform1f(scrollYLocation, window.scrollY/parent.clientHeight);
    // gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.uniform1f(scrollYLocation, window.scrollY/window.innerWidth);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


    window.addEventListener('scroll', () => {
        gl.uniform1f(scrollYLocation, window.scrollY/window.innerWidth);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        
    });

    window.addEventListener("mousemove", (e) => {
        gl.uniform2f(mouseLocation, e.clientX, e.clientY);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    });
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);


}