import{S as qa,i as Ka,s as Xa,k as a,a as i,q as s,l,m as r,h as o,c as n,r as c,n as f,J as Ja,b as N,G as t,H as $o}from"../chunks/index.472b9089.js";const za=[[[.8,.7,.1],[.5,.7,.4],[.8,.7,.7]],[[.3,.4,.9],[.7,.6,.5],[.7,.7,.8]],[[.9,.5,.1],[.9,.3,.2],[.7,.8,.7]]];document.querySelectorAll(".canvas").forEach((w,b)=>{const A=za[b%za.length];Qa(w,A[0],A[1],A[2])});function Qa(G,w=[.2,.2,.2],b=[.8,.8,.8],A=[.8,.8,.8]){console.log(window.innerWidth,window.innerHeight);const e=G.getContext("webgl"),O=`
        attribute vec2 position;


        void main() {
            gl_Position = vec4(position, 0.0, 1.0);

        }
    `,pt=`
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
    `,M=e.createShader(e.VERTEX_SHADER);e.shaderSource(M,O),e.compileShader(M);const S=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(S,pt),e.compileShader(S);const m=e.createProgram();e.attachShader(m,M),e.attachShader(m,S),e.linkProgram(m),e.useProgram(m);const tt=[1,-1,-1,-1,-1,1,1,1],y=[0,1,2,0,2,3],T=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,T),e.bufferData(e.ARRAY_BUFFER,new Float32Array(tt),e.STATIC_DRAW);const et=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,et),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(y),e.STATIC_DRAW);const h=e.getAttribLocation(m,"position");e.enableVertexAttribArray(h),e.vertexAttribPointer(h,2,e.FLOAT,!1,0,0);const P=e.getUniformLocation(m,"canvasWidth"),Jt=e.getUniformLocation(m,"canvasHeight"),C=e.getUniformLocation(m,"scrollY"),j=e.getUniformLocation(m,"parentRatio"),ot=e.getUniformLocation(m,"mouse"),ut=e.getUniformLocation(m,"top"),z=e.getUniformLocation(m,"windowWidth"),mt=e.getUniformLocation(m,"windowHeight"),vt=e.getUniformLocation(m,"c1"),q=e.getUniformLocation(m,"c2"),gt=e.getUniformLocation(m,"c3"),H=G.parentElement;e.uniform1f(P,G.width),e.uniform1f(Jt,G.height),e.uniform1f(C,window.scrollY/H.clientHeight),e.uniform1f(j,H.clientWidth/H.clientHeight),e.uniform1f(z,window.innerWidth),e.uniform1f(mt,window.innerHeight),e.uniform3f(vt,w[0],w[1],w[2]),e.uniform3f(q,b[0],b[1],b[2]),e.uniform3f(gt,A[0],A[1],A[2]),e.uniform2f(ot,0,0),e.uniform1f(ut,H.offsetTop),e.uniform1f(C,window.scrollY/H.clientHeight),e.uniform1f(C,window.scrollY/window.innerWidth),e.drawElements(e.TRIANGLES,y.length,e.UNSIGNED_SHORT,0),window.addEventListener("scroll",()=>{e.uniform1f(C,window.scrollY/window.innerWidth),e.drawElements(e.TRIANGLES,y.length,e.UNSIGNED_SHORT,0)}),window.addEventListener("mousemove",V=>{e.uniform2f(ot,V.clientX,V.clientY),e.drawElements(e.TRIANGLES,y.length,e.UNSIGNED_SHORT,0)}),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,et),e.drawElements(e.TRIANGLES,y.length,e.UNSIGNED_SHORT,0)}function Za(G){let w,b,A,e,O,pt,M,S,m,tt,y,T,et,h,P,Jt,C,j,ot,ut,z,mt,vt,q,gt,H,V,ce,he,wt,fe,de,K,_t,pe,ue,yt,me,ve,xt,ge,we,I,Et,_e,ye,bt,xe,Ee,It,be,Ie,Lt,Le,ke,kt,Ae,Se,At,Te,Re,x,St,Pe,He,Tt,Ue,We,Rt,De,Be,Pt,Ne,Ce,Ht,Ve,Fe,Ut,Ye,Ge,Wt,Oe,Me,U,Dt,je,ze,Bt,qe,Ke,Nt,Xe,Je,u,Qe,Ze,$e,at,to,eo,oo,ao,lt,lo,ro,io,no,rt,so,co,ho,fo,it,po,uo,mo,vo,go,Ct,wo,Qt,W,X,_o,F,Vt,yo,xo,nt,st,Eo,bo,Zt,D,J,Io,L,Ft,Lo,ko,Q,ct,Ao,So,ht,To,Ro,Yt,Po,Ho,Gt,Uo,$t,B,Z,Wo,v,Ot,Do,Bo,$,No,ft,Co,Vo,Fo,Mt,Yo,Go,jt,Oo,Mo,zt,jo,zo,qt,qo,Ko,Kt,Xo,Jo,Xt,Qo;return{c(){w=a("div"),b=a("canvas"),A=i(),e=a("div"),O=a("h1"),pt=s("my profile"),M=i(),S=a("p"),m=s("Kormann"),tt=i(),y=a("div"),T=a("canvas"),et=i(),h=a("div"),P=a("img"),C=i(),j=a("h2"),ot=s("Introduction"),ut=i(),z=a("p"),mt=s("Hi, I'm Dominik Kormann and I coding is what I do."),vt=i(),q=a("p"),gt=s("On this page I want to show you some of my skills and what I want to accomplish in the future."),H=i(),V=a("h3"),ce=s("technical skills:"),he=i(),wt=a("p"),fe=s("strong:"),de=i(),K=a("ul"),_t=a("li"),pe=s("Machine learning with Python + Pytorch"),ue=i(),yt=a("li"),me=s("Web dev. with Svelte.js framework"),ve=i(),xt=a("p"),ge=s("solid:"),we=i(),I=a("ul"),Et=a("li"),_e=s("Web dev. + Vue.js"),ye=i(),bt=a("li"),xe=s("Backend with Java + Spring boot"),Ee=i(),It=a("li"),be=s("Game dev. with C# + Unity"),Ie=i(),Lt=a("li"),Le=s("Webgl shader programming"),ke=i(),kt=a("li"),Ae=s("Golang"),Se=i(),At=a("p"),Te=s("decent"),Re=i(),x=a("ul"),St=a("li"),Pe=s("Rust + web assembly"),He=i(),Tt=a("li"),Ue=s("Tensorflow"),We=i(),Rt=a("li"),De=s("C"),Be=i(),Pt=a("li"),Ne=s("Haskell"),Ce=i(),Ht=a("li"),Ve=s("Lua script language"),Fe=i(),Ut=a("li"),Ye=s("Bash script"),Ge=i(),Wt=a("p"),Oe=s("Things I want to learn more about"),Me=i(),U=a("ul"),Dt=a("li"),je=s("Rust and high performance systems"),ze=i(),Bt=a("li"),qe=s("Machinge learning"),Ke=i(),Nt=a("li"),Xe=s("Organisation and operation of big software Projects"),Je=i(),u=a("p"),Qe=s(`connect with me: 
            `),Ze=a("br"),$e=i(),at=a("a"),to=s("X"),eo=i(),oo=a("br"),ao=i(),lt=a("a"),lo=s("github"),ro=i(),io=a("br"),no=i(),rt=a("a"),so=s("sciepedia"),co=i(),ho=a("br"),fo=i(),it=a("a"),po=s("email"),uo=s(" dominikormann@outlook.com"),mo=i(),vo=a("br"),go=i(),Ct=a("p"),wo=s("in the following I want to present some software I wrote"),Qt=i(),W=a("div"),X=a("canvas"),_o=i(),F=a("div"),Vt=a("h2"),yo=s("Sciepedia"),xo=i(),nt=a("p"),st=a("a"),Eo=s("Sciepedia"),bo=s(" is a notetaking app that makes it easy to create interlinked notes and share them with other users."),Zt=i(),D=a("div"),J=a("canvas"),Io=i(),L=a("div"),Ft=a("h2"),Lo=s("Instalingua"),ko=i(),Q=a("p"),ct=a("a"),Ao=s("Instalingua.com"),So=s(" was developed as part of a university Project together with "),ht=a("a"),To=s("@flo-bit"),Ro=i(),Yt=a("p"),Po=s("The Idea is to employ a chat bot to teach you different languages."),Ho=i(),Gt=a("p"),Uo=s("(On first opening the site it might take a minute since a container is gonna be spun up)"),$t=i(),B=a("div"),Z=a("canvas"),Wo=i(),v=a("div"),Ot=a("h2"),Do=s("Monsunbloom"),Bo=i(),$=a("p"),No=s("This is a website that wants to teach you math in a more modern way. Try it out here: "),ft=a("a"),Co=s("Monsunbloom"),Vo=s(" [site might be down at the moment]"),Fo=i(),Mt=a("p"),Yo=s("The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),Go=i(),jt=a("h3"),Oo=s("Software:"),Mo=i(),zt=a("p"),jo=s(`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),zo=i(),qt=a("p"),qo=s(`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),Ko=i(),Kt=a("p"),Xo=s("The database is a mongodb database that stores all the user data and the math exercises."),Jo=i(),Xt=a("p"),Qo=s("The data is generated in a python notebook and then stored in the database."),this.h()},l(p){w=l(p,"DIV",{class:!0});var E=r(w);b=l(E,"CANVAS",{class:!0,width:!0,height:!0}),r(b).forEach(o),A=n(E),e=l(E,"DIV",{class:!0});var te=r(e);O=l(te,"H1",{});var ta=r(O);pt=c(ta,"my profile"),ta.forEach(o),M=n(te),S=l(te,"P",{class:!0});var ea=r(S);m=c(ea,"Kormann"),ea.forEach(o),te.forEach(o),E.forEach(o),tt=n(p),y=l(p,"DIV",{class:!0});var ee=r(y);T=l(ee,"CANVAS",{id:!0,class:!0,width:!0,height:!0}),r(T).forEach(o),et=n(ee),h=l(ee,"DIV",{class:!0});var d=r(h);P=l(d,"IMG",{src:!0,id:!0,alt:!0}),C=n(d),j=l(d,"H2",{});var oa=r(j);ot=c(oa,"Introduction"),oa.forEach(o),ut=n(d),z=l(d,"P",{});var aa=r(z);mt=c(aa,"Hi, I'm Dominik Kormann and I coding is what I do."),aa.forEach(o),vt=n(d),q=l(d,"P",{});var la=r(q);gt=c(la,"On this page I want to show you some of my skills and what I want to accomplish in the future."),la.forEach(o),H=n(d),V=l(d,"H3",{});var ra=r(V);ce=c(ra,"technical skills:"),ra.forEach(o),he=n(d),wt=l(d,"P",{});var ia=r(wt);fe=c(ia,"strong:"),ia.forEach(o),de=n(d),K=l(d,"UL",{});var oe=r(K);_t=l(oe,"LI",{});var na=r(_t);pe=c(na,"Machine learning with Python + Pytorch"),na.forEach(o),ue=n(oe),yt=l(oe,"LI",{});var sa=r(yt);me=c(sa,"Web dev. with Svelte.js framework"),sa.forEach(o),oe.forEach(o),ve=n(d),xt=l(d,"P",{});var ca=r(xt);ge=c(ca,"solid:"),ca.forEach(o),we=n(d),I=l(d,"UL",{});var R=r(I);Et=l(R,"LI",{});var ha=r(Et);_e=c(ha,"Web dev. + Vue.js"),ha.forEach(o),ye=n(R),bt=l(R,"LI",{});var fa=r(bt);xe=c(fa,"Backend with Java + Spring boot"),fa.forEach(o),Ee=n(R),It=l(R,"LI",{});var da=r(It);be=c(da,"Game dev. with C# + Unity"),da.forEach(o),Ie=n(R),Lt=l(R,"LI",{});var pa=r(Lt);Le=c(pa,"Webgl shader programming"),pa.forEach(o),ke=n(R),kt=l(R,"LI",{});var ua=r(kt);Ae=c(ua,"Golang"),ua.forEach(o),R.forEach(o),Se=n(d),At=l(d,"P",{});var ma=r(At);Te=c(ma,"decent"),ma.forEach(o),Re=n(d),x=l(d,"UL",{});var k=r(x);St=l(k,"LI",{});var va=r(St);Pe=c(va,"Rust + web assembly"),va.forEach(o),He=n(k),Tt=l(k,"LI",{});var ga=r(Tt);Ue=c(ga,"Tensorflow"),ga.forEach(o),We=n(k),Rt=l(k,"LI",{});var wa=r(Rt);De=c(wa,"C"),wa.forEach(o),Be=n(k),Pt=l(k,"LI",{});var _a=r(Pt);Ne=c(_a,"Haskell"),_a.forEach(o),Ce=n(k),Ht=l(k,"LI",{});var ya=r(Ht);Ve=c(ya,"Lua script language"),ya.forEach(o),Fe=n(k),Ut=l(k,"LI",{});var xa=r(Ut);Ye=c(xa,"Bash script"),xa.forEach(o),k.forEach(o),Ge=n(d),Wt=l(d,"P",{});var Ea=r(Wt);Oe=c(Ea,"Things I want to learn more about"),Ea.forEach(o),Me=n(d),U=l(d,"UL",{});var dt=r(U);Dt=l(dt,"LI",{});var ba=r(Dt);je=c(ba,"Rust and high performance systems"),ba.forEach(o),ze=n(dt),Bt=l(dt,"LI",{});var Ia=r(Bt);qe=c(Ia,"Machinge learning"),Ia.forEach(o),Ke=n(dt),Nt=l(dt,"LI",{});var La=r(Nt);Xe=c(La,"Organisation and operation of big software Projects"),La.forEach(o),dt.forEach(o),Je=n(d),u=l(d,"P",{});var g=r(u);Qe=c(g,`connect with me: 
            `),Ze=l(g,"BR",{}),$e=n(g),at=l(g,"A",{href:!0});var ka=r(at);to=c(ka,"X"),ka.forEach(o),eo=n(g),oo=l(g,"BR",{}),ao=n(g),lt=l(g,"A",{href:!0});var Aa=r(lt);lo=c(Aa,"github"),Aa.forEach(o),ro=n(g),io=l(g,"BR",{}),no=n(g),rt=l(g,"A",{href:!0});var Sa=r(rt);so=c(Sa,"sciepedia"),Sa.forEach(o),co=n(g),ho=l(g,"BR",{}),fo=n(g),it=l(g,"A",{href:!0});var Ta=r(it);po=c(Ta,"email"),Ta.forEach(o),uo=c(g," dominikormann@outlook.com"),g.forEach(o),mo=n(d),vo=l(d,"BR",{}),go=n(d),Ct=l(d,"P",{});var Ra=r(Ct);wo=c(Ra,"in the following I want to present some software I wrote"),Ra.forEach(o),d.forEach(o),ee.forEach(o),Qt=n(p),W=l(p,"DIV",{class:!0});var ae=r(W);X=l(ae,"CANVAS",{class:!0,width:!0,height:!0}),r(X).forEach(o),_o=n(ae),F=l(ae,"DIV",{class:!0});var le=r(F);Vt=l(le,"H2",{});var Pa=r(Vt);yo=c(Pa,"Sciepedia"),Pa.forEach(o),xo=n(le),nt=l(le,"P",{});var Zo=r(nt);st=l(Zo,"A",{href:!0});var Ha=r(st);Eo=c(Ha,"Sciepedia"),Ha.forEach(o),bo=c(Zo," is a notetaking app that makes it easy to create interlinked notes and share them with other users."),Zo.forEach(o),le.forEach(o),ae.forEach(o),Zt=n(p),D=l(p,"DIV",{class:!0});var re=r(D);J=l(re,"CANVAS",{class:!0,width:!0,height:!0}),r(J).forEach(o),Io=n(re),L=l(re,"DIV",{class:!0});var Y=r(L);Ft=l(Y,"H2",{});var Ua=r(Ft);Lo=c(Ua,"Instalingua"),Ua.forEach(o),ko=n(Y),Q=l(Y,"P",{});var ie=r(Q);ct=l(ie,"A",{href:!0});var Wa=r(ct);Ao=c(Wa,"Instalingua.com"),Wa.forEach(o),So=c(ie," was developed as part of a university Project together with "),ht=l(ie,"A",{href:!0});var Da=r(ht);To=c(Da,"@flo-bit"),Da.forEach(o),ie.forEach(o),Ro=n(Y),Yt=l(Y,"P",{});var Ba=r(Yt);Po=c(Ba,"The Idea is to employ a chat bot to teach you different languages."),Ba.forEach(o),Ho=n(Y),Gt=l(Y,"P",{});var Na=r(Gt);Uo=c(Na,"(On first opening the site it might take a minute since a container is gonna be spun up)"),Na.forEach(o),Y.forEach(o),re.forEach(o),$t=n(p),B=l(p,"DIV",{class:!0});var ne=r(B);Z=l(ne,"CANVAS",{class:!0,width:!0,height:!0}),r(Z).forEach(o),Wo=n(ne),v=l(ne,"DIV",{class:!0});var _=r(v);Ot=l(_,"H2",{});var Ca=r(Ot);Do=c(Ca,"Monsunbloom"),Ca.forEach(o),Bo=n(_),$=l(_,"P",{});var se=r($);No=c(se,"This is a website that wants to teach you math in a more modern way. Try it out here: "),ft=l(se,"A",{href:!0});var Va=r(ft);Co=c(Va,"Monsunbloom"),Va.forEach(o),Vo=c(se," [site might be down at the moment]"),se.forEach(o),Fo=n(_),Mt=l(_,"P",{});var Fa=r(Mt);Yo=c(Fa,"The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),Fa.forEach(o),Go=n(_),jt=l(_,"H3",{});var Ya=r(jt);Oo=c(Ya,"Software:"),Ya.forEach(o),Mo=n(_),zt=l(_,"P",{});var Ga=r(zt);jo=c(Ga,`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),Ga.forEach(o),zo=n(_),qt=l(_,"P",{});var Oa=r(qt);qo=c(Oa,`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),Oa.forEach(o),Ko=n(_),Kt=l(_,"P",{});var Ma=r(Kt);Xo=c(Ma,"The database is a mongodb database that stores all the user data and the math exercises."),Ma.forEach(o),Jo=n(_),Xt=l(_,"P",{});var ja=r(Xt);Qo=c(ja,"The data is generated in a python notebook and then stored in the database."),ja.forEach(o),_.forEach(o),ne.forEach(o),this.h()},h(){f(b,"class","canvas"),f(b,"width","1000"),f(b,"height","300"),f(S,"class","center"),f(e,"class","itemcontent"),f(w,"class","item"),f(T,"id","canvas"),f(T,"class","canvas"),f(T,"width","1000"),f(T,"height","1000"),Ja(P.src,Jt="portrait.png")||f(P,"src",Jt),f(P,"id","portrait"),f(P,"alt",""),f(at,"href","https://x.com/__kormann__"),f(lt,"href","https://github.com/dkormann"),f(rt,"href","https://sciepedia.com/kormann"),f(it,"href","mailto:dominikormann@outlook.com"),f(h,"class","itemcontent"),f(y,"class","item"),f(X,"class","canvas"),f(X,"width","1000"),f(X,"height","1000"),f(st,"href","https://sciepedia.com"),f(F,"class","itemcontent"),f(W,"class","item"),f(J,"class","canvas"),f(J,"width","1000"),f(J,"height","1000"),f(ct,"href","https://instalingua.com"),f(ht,"href","https://github.com/flo-bit"),f(L,"class","itemcontent"),f(D,"class","item"),f(Z,"class","canvas"),f(Z,"width","1000"),f(Z,"height","1000"),f(ft,"href","https://www.monsunbloom.com"),f(v,"class","itemcontent"),f(B,"class","item")},m(p,E){N(p,w,E),t(w,b),t(w,A),t(w,e),t(e,O),t(O,pt),t(e,M),t(e,S),t(S,m),N(p,tt,E),N(p,y,E),t(y,T),t(y,et),t(y,h),t(h,P),t(h,C),t(h,j),t(j,ot),t(h,ut),t(h,z),t(z,mt),t(h,vt),t(h,q),t(q,gt),t(h,H),t(h,V),t(V,ce),t(h,he),t(h,wt),t(wt,fe),t(h,de),t(h,K),t(K,_t),t(_t,pe),t(K,ue),t(K,yt),t(yt,me),t(h,ve),t(h,xt),t(xt,ge),t(h,we),t(h,I),t(I,Et),t(Et,_e),t(I,ye),t(I,bt),t(bt,xe),t(I,Ee),t(I,It),t(It,be),t(I,Ie),t(I,Lt),t(Lt,Le),t(I,ke),t(I,kt),t(kt,Ae),t(h,Se),t(h,At),t(At,Te),t(h,Re),t(h,x),t(x,St),t(St,Pe),t(x,He),t(x,Tt),t(Tt,Ue),t(x,We),t(x,Rt),t(Rt,De),t(x,Be),t(x,Pt),t(Pt,Ne),t(x,Ce),t(x,Ht),t(Ht,Ve),t(x,Fe),t(x,Ut),t(Ut,Ye),t(h,Ge),t(h,Wt),t(Wt,Oe),t(h,Me),t(h,U),t(U,Dt),t(Dt,je),t(U,ze),t(U,Bt),t(Bt,qe),t(U,Ke),t(U,Nt),t(Nt,Xe),t(h,Je),t(h,u),t(u,Qe),t(u,Ze),t(u,$e),t(u,at),t(at,to),t(u,eo),t(u,oo),t(u,ao),t(u,lt),t(lt,lo),t(u,ro),t(u,io),t(u,no),t(u,rt),t(rt,so),t(u,co),t(u,ho),t(u,fo),t(u,it),t(it,po),t(u,uo),t(h,mo),t(h,vo),t(h,go),t(h,Ct),t(Ct,wo),N(p,Qt,E),N(p,W,E),t(W,X),t(W,_o),t(W,F),t(F,Vt),t(Vt,yo),t(F,xo),t(F,nt),t(nt,st),t(st,Eo),t(nt,bo),N(p,Zt,E),N(p,D,E),t(D,J),t(D,Io),t(D,L),t(L,Ft),t(Ft,Lo),t(L,ko),t(L,Q),t(Q,ct),t(ct,Ao),t(Q,So),t(Q,ht),t(ht,To),t(L,Ro),t(L,Yt),t(Yt,Po),t(L,Ho),t(L,Gt),t(Gt,Uo),N(p,$t,E),N(p,B,E),t(B,Z),t(B,Wo),t(B,v),t(v,Ot),t(Ot,Do),t(v,Bo),t(v,$),t($,No),t($,ft),t(ft,Co),t($,Vo),t(v,Fo),t(v,Mt),t(Mt,Yo),t(v,Go),t(v,jt),t(jt,Oo),t(v,Mo),t(v,zt),t(zt,jo),t(v,zo),t(v,qt),t(qt,qo),t(v,Ko),t(v,Kt),t(Kt,Xo),t(v,Jo),t(v,Xt),t(Xt,Qo)},p:$o,i:$o,o:$o,d(p){p&&o(w),p&&o(tt),p&&o(y),p&&o(Qt),p&&o(W),p&&o(Zt),p&&o(D),p&&o($t),p&&o(B)}}}class tl extends qa{constructor(w){super(),Ka(this,w,null,Za,Xa,{})}}export{tl as component};
