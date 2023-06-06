import{S as Ie,i as be,s as Se,k as a,q as f,a as s,l as r,m as i,r as d,h as o,c,n as E,J as Re,b as nt,G as t,H as Qt}from"../chunks/index.472b9089.js";{const B=document.getElementById("canvas");console.log(window.innerWidth,window.innerHeight);const e=B.getContext("webgl"),L=`
        attribute vec2 position;


        void main() {
            gl_Position = vec4(position, 0.0, 1.0);

        }
    `,D=`
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
    `,I=e.createShader(e.VERTEX_SHADER);e.shaderSource(I,L),e.compileShader(I);const v=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(v,D),e.compileShader(v);const m=e.createProgram();e.attachShader(m,I),e.attachShader(m,v),e.linkProgram(m),e.useProgram(m);const P=[1,-1,-1,-1,-1,1,1,1],l=[0,1,2,0,2,3],x=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,x),e.bufferData(e.ARRAY_BUFFER,new Float32Array(P),e.STATIC_DRAW);const C=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,C),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(l),e.STATIC_DRAW);const U=e.getAttribLocation(m,"position");e.enableVertexAttribArray(U),e.vertexAttribPointer(U,2,e.FLOAT,!1,0,0);const b=e.getUniformLocation(m,"canvasWidth"),G=e.getUniformLocation(m,"canvasHeight"),S=e.getUniformLocation(m,"scrollY"),R=e.getUniformLocation(m,"windowratio"),k=e.getUniformLocation(m,"mouse");e.uniform1f(b,B.width),e.uniform1f(G,B.height),e.uniform1f(S,window.scrollY/window.innerHeight),e.uniform1f(R,window.innerWidth/window.innerHeight),e.uniform2f(k,0,0),e.uniform1f(S,window.scrollY/window.innerHeight),e.drawElements(e.TRIANGLES,l.length,e.UNSIGNED_SHORT,0),window.addEventListener("scroll",()=>{e.uniform1f(S,window.scrollY/window.innerHeight),e.drawElements(e.TRIANGLES,l.length,e.UNSIGNED_SHORT,0)}),window.addEventListener("mousemove",F=>{e.uniform2f(k,F.clientX/window.innerWidth,F.clientY/window.innerHeight),e.drawElements(e.TRIANGLES,l.length,e.UNSIGNED_SHORT,0)}),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,C),e.drawElements(e.TRIANGLES,l.length,e.UNSIGNED_SHORT,0)}function Ae(B){let e,L,D,I,v,m,P,l,x,C,U,b,G,S,R,k,F,Y,ft,dt,W,ht,mt,z,pt,ut,A,V,vt,gt,J,_t,wt,M,Et,xt,p,O,yt,Lt,j,It,bt,K,St,Rt,q,At,Ht,X,Tt,Pt,Q,Ut,kt,u,Z,Ft,Nt,$,Bt,Dt,tt,Ct,Gt,et,Yt,Wt,ot,zt,Vt,lt,Jt,Mt,y,at,Ot,jt,rt,Kt,qt,it,Xt,st,H,T;return{c(){e=a("div"),L=a("h1"),D=f("my profile"),I=s(),v=a("p"),m=f("Kormann"),P=s(),l=a("div"),x=a("img"),U=s(),b=a("h2"),G=f("Introduction"),S=s(),R=a("p"),k=f("Hi, I'm Dominik Kormann and Coding is my long time Passion."),F=s(),Y=a("p"),ft=f("So on this page I want to show you some of my skills and what I want to accomplish in the future."),dt=s(),W=a("h3"),ht=f("technical skills:"),mt=s(),z=a("p"),pt=f("strong:"),ut=s(),A=a("ul"),V=a("li"),vt=f("Python"),gt=s(),J=a("li"),_t=f("Html / Javascript + Vuejs Framework"),wt=s(),M=a("p"),Et=f("solid:"),xt=s(),p=a("ul"),O=a("li"),yt=f("Java + Spring boot"),Lt=s(),j=a("li"),It=f("C# + Unity"),bt=s(),K=a("li"),St=f("Tensorflow"),Rt=s(),q=a("li"),At=f("Webgl shader programming"),Ht=s(),X=a("li"),Tt=f("Golang"),Pt=s(),Q=a("p"),Ut=f("decent"),kt=s(),u=a("ul"),Z=a("li"),Ft=f("Rust + web assembly"),Nt=s(),$=a("li"),Bt=f("C"),Dt=s(),tt=a("li"),Ct=f("Haskell"),Gt=s(),et=a("li"),Yt=f("Lua script language"),Wt=s(),ot=a("li"),zt=f("Bash script"),Vt=s(),lt=a("p"),Jt=f("Things I want to learn more about"),Mt=s(),y=a("ul"),at=a("li"),Ot=f("Rust and high performance systems"),jt=s(),rt=a("li"),Kt=f("Tensorflow and machinge learning"),qt=s(),it=a("li"),Xt=f("organisation and operation of big software Projects"),st=s(),H=a("div"),T=a("canvas"),this.h()},l(h){e=r(h,"DIV",{class:!0});var g=i(e);L=r(g,"H1",{});var Zt=i(L);D=d(Zt,"my profile"),Zt.forEach(o),I=c(g),v=r(g,"P",{class:!0});var $t=i(v);m=d($t,"Kormann"),$t.forEach(o),g.forEach(o),P=c(h),l=r(h,"DIV",{class:!0});var n=i(l);x=r(n,"IMG",{src:!0,id:!0,alt:!0}),U=c(n),b=r(n,"H2",{});var te=i(b);G=d(te,"Introduction"),te.forEach(o),S=c(n),R=r(n,"P",{});var ee=i(R);k=d(ee,"Hi, I'm Dominik Kormann and Coding is my long time Passion."),ee.forEach(o),F=c(n),Y=r(n,"P",{});var oe=i(Y);ft=d(oe,"So on this page I want to show you some of my skills and what I want to accomplish in the future."),oe.forEach(o),dt=c(n),W=r(n,"H3",{});var le=i(W);ht=d(le,"technical skills:"),le.forEach(o),mt=c(n),z=r(n,"P",{});var ae=i(z);pt=d(ae,"strong:"),ae.forEach(o),ut=c(n),A=r(n,"UL",{});var ct=i(A);V=r(ct,"LI",{});var re=i(V);vt=d(re,"Python"),re.forEach(o),gt=c(ct),J=r(ct,"LI",{});var ie=i(J);_t=d(ie,"Html / Javascript + Vuejs Framework"),ie.forEach(o),ct.forEach(o),wt=c(n),M=r(n,"P",{});var ne=i(M);Et=d(ne,"solid:"),ne.forEach(o),xt=c(n),p=r(n,"UL",{});var _=i(p);O=r(_,"LI",{});var se=i(O);yt=d(se,"Java + Spring boot"),se.forEach(o),Lt=c(_),j=r(_,"LI",{});var ce=i(j);It=d(ce,"C# + Unity"),ce.forEach(o),bt=c(_),K=r(_,"LI",{});var fe=i(K);St=d(fe,"Tensorflow"),fe.forEach(o),Rt=c(_),q=r(_,"LI",{});var de=i(q);At=d(de,"Webgl shader programming"),de.forEach(o),Ht=c(_),X=r(_,"LI",{});var he=i(X);Tt=d(he,"Golang"),he.forEach(o),_.forEach(o),Pt=c(n),Q=r(n,"P",{});var me=i(Q);Ut=d(me,"decent"),me.forEach(o),kt=c(n),u=r(n,"UL",{});var w=i(u);Z=r(w,"LI",{});var pe=i(Z);Ft=d(pe,"Rust + web assembly"),pe.forEach(o),Nt=c(w),$=r(w,"LI",{});var ue=i($);Bt=d(ue,"C"),ue.forEach(o),Dt=c(w),tt=r(w,"LI",{});var ve=i(tt);Ct=d(ve,"Haskell"),ve.forEach(o),Gt=c(w),et=r(w,"LI",{});var ge=i(et);Yt=d(ge,"Lua script language"),ge.forEach(o),Wt=c(w),ot=r(w,"LI",{});var _e=i(ot);zt=d(_e,"Bash script"),_e.forEach(o),w.forEach(o),Vt=c(n),lt=r(n,"P",{});var we=i(lt);Jt=d(we,"Things I want to learn more about"),we.forEach(o),Mt=c(n),y=r(n,"UL",{});var N=i(y);at=r(N,"LI",{});var Ee=i(at);Ot=d(Ee,"Rust and high performance systems"),Ee.forEach(o),jt=c(N),rt=r(N,"LI",{});var xe=i(rt);Kt=d(xe,"Tensorflow and machinge learning"),xe.forEach(o),qt=c(N),it=r(N,"LI",{});var ye=i(it);Xt=d(ye,"organisation and operation of big software Projects"),ye.forEach(o),N.forEach(o),n.forEach(o),st=c(h),H=r(h,"DIV",{class:!0});var Le=i(H);T=r(Le,"CANVAS",{id:!0,width:!0,height:!0}),i(T).forEach(o),Le.forEach(o),this.h()},h(){E(v,"class","center"),E(e,"class","item"),Re(x.src,C="portrait.png")||E(x,"src",C),E(x,"id","portrait"),E(x,"alt",""),E(l,"class","item"),E(T,"id","canvas"),E(T,"width","1000"),E(T,"height","1000"),E(H,"class","item")},m(h,g){nt(h,e,g),t(e,L),t(L,D),t(e,I),t(e,v),t(v,m),nt(h,P,g),nt(h,l,g),t(l,x),t(l,U),t(l,b),t(b,G),t(l,S),t(l,R),t(R,k),t(l,F),t(l,Y),t(Y,ft),t(l,dt),t(l,W),t(W,ht),t(l,mt),t(l,z),t(z,pt),t(l,ut),t(l,A),t(A,V),t(V,vt),t(A,gt),t(A,J),t(J,_t),t(l,wt),t(l,M),t(M,Et),t(l,xt),t(l,p),t(p,O),t(O,yt),t(p,Lt),t(p,j),t(j,It),t(p,bt),t(p,K),t(K,St),t(p,Rt),t(p,q),t(q,At),t(p,Ht),t(p,X),t(X,Tt),t(l,Pt),t(l,Q),t(Q,Ut),t(l,kt),t(l,u),t(u,Z),t(Z,Ft),t(u,Nt),t(u,$),t($,Bt),t(u,Dt),t(u,tt),t(tt,Ct),t(u,Gt),t(u,et),t(et,Yt),t(u,Wt),t(u,ot),t(ot,zt),t(l,Vt),t(l,lt),t(lt,Jt),t(l,Mt),t(l,y),t(y,at),t(at,Ot),t(y,jt),t(y,rt),t(rt,Kt),t(y,qt),t(y,it),t(it,Xt),nt(h,st,g),nt(h,H,g),t(H,T)},p:Qt,i:Qt,o:Qt,d(h){h&&o(e),h&&o(P),h&&o(l),h&&o(st),h&&o(H)}}}class Te extends Ie{constructor(e){super(),be(this,e,null,Ae,Se,{})}}export{Te as component};
