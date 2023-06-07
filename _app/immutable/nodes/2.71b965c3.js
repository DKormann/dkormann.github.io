import{S as la,i as ra,s as sa,k as a,a as s,q as n,l,m as r,h as o,c as i,r as c,n as d,J as ia,b as D,G as e,H as go}from"../chunks/index.472b9089.js";const aa=[[[.8,.7,.1],[.9,.5,.2],[.8,.7,.7]],[[.3,.4,.9],[.8,.7,.2],[.9,.9,.9]],[[.9,.5,.1],[.6,.6,.4],[.9,.9,.9]]];document.querySelectorAll(".canvas").forEach((v,y)=>{const b=aa[y%aa.length];na(v,b[0],b[1],b[2])});function na(N,v=[.2,.2,.2],y=[.8,.8,.8],b=[.8,.8,.8]){console.log(window.innerWidth,window.innerHeight);const t=N.getContext("webgl"),V=`
        attribute vec2 position;


        void main() {
            gl_Position = vec4(position, 0.0, 1.0);

        }
    `,se=`
        precision mediump float;

        uniform float canvasWidth;
        uniform float canvasHeight;
        uniform float scrollY;
        uniform float windowWidth;

        uniform float top;
        uniform vec2 mouse;
        uniform float windowratio;

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

            float rep = 7.;

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
            if (mousevec.y * 16. > p.y){
                l = 1.0;
            }

            l = mousevec.y;
            l = .5;

            float h = p.z;


            vec3 col = vec3(0.);

            col += spot(p.xy, vec2(0.,0),h+1.) * c2;
            col += spot(p.xy, vec2(.2,.0),h+2.) * c2;
            col += spot(p.xy, vec2(-.2,.0),h+3.) * c2;
            col += spot(p.xy, vec2(.1,.17),h+4.) * c2;
            col += spot(p.xy, vec2(-.1,.17),h+5.) * c2;
            col += spot(p.xy, vec2(.1,-.17),h+6.) * c2;
            col += spot(p.xy, vec2(-.1,-.17),h+7.) * c2;


            float xdiff = abs ( mousevec.x * 13.3 + p.x);
            float ydiff = abs ( mousevec.y * 13.3 - p.y);

            light = mix(0.7,1., peak (max(xdiff,ydiff),0.0,0.9,5.));


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

            vec3 col = vec3(0.);

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

            y/=windowratio;

            y += (top)/windowWidth;
            
            float sdiff = 0.05;
            float y2 = y*(1.-sdiff)+sdiff/2.;
            float x2 = x*(1.-sdiff)+sdiff/2.;



            y += -scrollY*0.2;
            y2 += -scrollY*0.15;


            vec2 mousevec = mouse - vec2(x,1.-y);
            mousevec.y/=windowratio;
            float mouse_dist = length(mousevec);


            vec3 tl = tiling(x, y);
            vec3 tl2 = tiling(x2, y2);


            float light = .5;

            vec3 color = street(tl, 1.-mouse_dist*2.);

            vec4 house = tile(tl2, mousevec);
            color = mix(color, house.xyz, house.w) * light;


            gl_FragColor = vec4(color, 1.0);

        }
    `,W=t.createShader(t.VERTEX_SHADER);t.shaderSource(W,V),t.compileShader(W);const I=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(I,se),t.compileShader(I);const m=t.createProgram();t.attachShader(m,W),t.attachShader(m,I),t.linkProgram(m),t.useProgram(m);const K=[1,-1,-1,-1,-1,1,1,1],w=[0,1,2,0,2,3],A=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,A),t.bufferData(t.ARRAY_BUFFER,new Float32Array(K),t.STATIC_DRAW);const X=t.createBuffer();t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,X),t.bufferData(t.ELEMENT_ARRAY_BUFFER,new Uint16Array(w),t.STATIC_DRAW);const f=t.getAttribLocation(m,"position");t.enableVertexAttribArray(f),t.vertexAttribPointer(f,2,t.FLOAT,!1,0,0);const k=t.getUniformLocation(m,"canvasWidth"),Be=t.getUniformLocation(m,"canvasHeight"),B=t.getUniformLocation(m,"scrollY"),Y=t.getUniformLocation(m,"windowratio"),Q=t.getUniformLocation(m,"mouse"),ie=t.getUniformLocation(m,"top"),G=t.getUniformLocation(m,"windowWidth"),ne=t.getUniformLocation(m,"c1"),ce=t.getUniformLocation(m,"c2"),z=t.getUniformLocation(m,"c3"),L=N.parentElement;t.uniform1f(k,N.width),t.uniform1f(Be,N.height),t.uniform1f(B,window.scrollY/L.clientHeight),t.uniform1f(Y,L.clientWidth/L.clientHeight),t.uniform1f(G,window.innerWidth),t.uniform3f(ne,v[0],v[1],v[2]),t.uniform3f(ce,y[0],y[1],y[2]),t.uniform3f(z,b[0],b[1],b[2]),t.uniform2f(Q,0,0),t.uniform1f(ie,L.offsetTop),t.uniform1f(B,window.scrollY/L.clientHeight),t.drawElements(t.TRIANGLES,w.length,t.UNSIGNED_SHORT,0),window.addEventListener("scroll",()=>{t.uniform1f(B,window.scrollY/window.innerWidth),t.drawElements(t.TRIANGLES,w.length,t.UNSIGNED_SHORT,0)}),window.addEventListener("mousemove",Z=>{t.uniform2f(Q,Z.clientX/L.clientWidth,Z.clientY/L.clientHeight),t.drawElements(t.TRIANGLES,w.length,t.UNSIGNED_SHORT,0)}),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,X),t.drawElements(t.TRIANGLES,w.length,t.UNSIGNED_SHORT,0)}function ca(N){let v,y,b,t,V,se,W,I,m,K,w,A,X,f,k,Be,B,Y,Q,ie,G,ne,ce,z,L,Z,fe,$e,et,de,tt,ot,j,he,at,lt,pe,rt,st,ue,it,nt,x,me,ct,ft,ve,dt,ht,ge,pt,ut,we,mt,vt,_e,gt,wt,ye,_t,yt,E,xe,xt,Et,Ee,bt,Lt,be,It,At,Le,St,Tt,Ie,kt,Pt,Ae,Rt,Ht,P,Se,Ut,Dt,Te,Ct,Ft,ke,Nt,Vt,Pe,Wt,Ye,R,M,Bt,u,Re,Yt,Gt,$,zt,ee,jt,Mt,He,Ot,qt,Ue,Jt,Kt,De,Xt,Qt,Ce,Zt,$t,Fe,eo,to,Ne,oo,Ge,H,O,ao,C,Ve,lo,ro,te,oe,so,io,ze,U,q,no,F,We,co,fo,J,ae,ho,po,le,uo;return{c(){v=a("div"),y=a("canvas"),b=s(),t=a("div"),V=a("h1"),se=n("my profile"),W=s(),I=a("p"),m=n("Kormann"),K=s(),w=a("div"),A=a("canvas"),X=s(),f=a("div"),k=a("img"),B=s(),Y=a("h2"),Q=n("Introduction"),ie=s(),G=a("p"),ne=n("Hi, I'm Dominik Kormann and Coding is my long time Passion."),ce=s(),z=a("p"),L=n("So on this page I want to show you some of my skills and what I want to accomplish in the future."),Z=s(),fe=a("h3"),$e=n("technical skills:"),et=s(),de=a("p"),tt=n("strong:"),ot=s(),j=a("ul"),he=a("li"),at=n("Python"),lt=s(),pe=a("li"),rt=n("Html / Javascript + Vuejs Framework"),st=s(),ue=a("p"),it=n("solid:"),nt=s(),x=a("ul"),me=a("li"),ct=n("Java + Spring boot"),ft=s(),ve=a("li"),dt=n("C# + Unity"),ht=s(),ge=a("li"),pt=n("Tensorflow"),ut=s(),we=a("li"),mt=n("Webgl shader programming"),vt=s(),_e=a("li"),gt=n("Golang"),wt=s(),ye=a("p"),_t=n("decent"),yt=s(),E=a("ul"),xe=a("li"),xt=n("Rust + web assembly"),Et=s(),Ee=a("li"),bt=n("C"),Lt=s(),be=a("li"),It=n("Haskell"),At=s(),Le=a("li"),St=n("Lua script language"),Tt=s(),Ie=a("li"),kt=n("Bash script"),Pt=s(),Ae=a("p"),Rt=n("Things I want to learn more about"),Ht=s(),P=a("ul"),Se=a("li"),Ut=n("Rust and high performance systems"),Dt=s(),Te=a("li"),Ct=n("Tensorflow and machinge learning"),Ft=s(),ke=a("li"),Nt=n("organisation and operation of big software Projects"),Vt=s(),Pe=a("p"),Wt=n("in the following I want to present some software examples"),Ye=s(),R=a("div"),M=a("canvas"),Bt=s(),u=a("div"),Re=a("h2"),Yt=n("Monsunbloom"),Gt=s(),$=a("p"),zt=n("This is a website that wants to teach you math in a more modern way. Try it out here: "),ee=a("a"),jt=n("Monsunbloom"),Mt=s(),He=a("p"),Ot=n("The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),qt=s(),Ue=a("h3"),Jt=n("Softaware:"),Kt=s(),De=a("p"),Xt=n(`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),Qt=s(),Ce=a("p"),Zt=n(`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),$t=s(),Fe=a("p"),eo=n("The database is a mongodb database that stores all the user data and the math exercises."),to=s(),Ne=a("p"),oo=n("The data is generated in a python notebook and then stored in the database."),Ge=s(),H=a("div"),O=a("canvas"),ao=s(),C=a("div"),Ve=a("h2"),lo=n("Sciepedia"),ro=s(),te=a("p"),oe=a("a"),so=n("Sciepedia"),io=n(" is a notetaking app that makes it easy to create interlinked notes and share them with other users."),ze=s(),U=a("div"),q=a("canvas"),no=s(),F=a("div"),We=a("h2"),co=n("Flai"),fo=s(),J=a("p"),ae=a("a"),ho=n("Foreign language AI"),po=n(" was developed as part of a university Project together with "),le=a("a"),uo=n("@flo-bit"),this.h()},l(h){v=l(h,"DIV",{class:!0});var _=r(v);y=l(_,"CANVAS",{class:!0,width:!0,height:!0}),r(y).forEach(o),b=i(_),t=l(_,"DIV",{class:!0});var je=r(t);V=l(je,"H1",{});var wo=r(V);se=c(wo,"my profile"),wo.forEach(o),W=i(je),I=l(je,"P",{class:!0});var _o=r(I);m=c(_o,"Kormann"),_o.forEach(o),je.forEach(o),_.forEach(o),K=i(h),w=l(h,"DIV",{class:!0});var Me=r(w);A=l(Me,"CANVAS",{id:!0,class:!0,width:!0,height:!0}),r(A).forEach(o),X=i(Me),f=l(Me,"DIV",{class:!0});var p=r(f);k=l(p,"IMG",{src:!0,id:!0,alt:!0}),B=i(p),Y=l(p,"H2",{});var yo=r(Y);Q=c(yo,"Introduction"),yo.forEach(o),ie=i(p),G=l(p,"P",{});var xo=r(G);ne=c(xo,"Hi, I'm Dominik Kormann and Coding is my long time Passion."),xo.forEach(o),ce=i(p),z=l(p,"P",{});var Eo=r(z);L=c(Eo,"So on this page I want to show you some of my skills and what I want to accomplish in the future."),Eo.forEach(o),Z=i(p),fe=l(p,"H3",{});var bo=r(fe);$e=c(bo,"technical skills:"),bo.forEach(o),et=i(p),de=l(p,"P",{});var Lo=r(de);tt=c(Lo,"strong:"),Lo.forEach(o),ot=i(p),j=l(p,"UL",{});var Oe=r(j);he=l(Oe,"LI",{});var Io=r(he);at=c(Io,"Python"),Io.forEach(o),lt=i(Oe),pe=l(Oe,"LI",{});var Ao=r(pe);rt=c(Ao,"Html / Javascript + Vuejs Framework"),Ao.forEach(o),Oe.forEach(o),st=i(p),ue=l(p,"P",{});var So=r(ue);it=c(So,"solid:"),So.forEach(o),nt=i(p),x=l(p,"UL",{});var S=r(x);me=l(S,"LI",{});var To=r(me);ct=c(To,"Java + Spring boot"),To.forEach(o),ft=i(S),ve=l(S,"LI",{});var ko=r(ve);dt=c(ko,"C# + Unity"),ko.forEach(o),ht=i(S),ge=l(S,"LI",{});var Po=r(ge);pt=c(Po,"Tensorflow"),Po.forEach(o),ut=i(S),we=l(S,"LI",{});var Ro=r(we);mt=c(Ro,"Webgl shader programming"),Ro.forEach(o),vt=i(S),_e=l(S,"LI",{});var Ho=r(_e);gt=c(Ho,"Golang"),Ho.forEach(o),S.forEach(o),wt=i(p),ye=l(p,"P",{});var Uo=r(ye);_t=c(Uo,"decent"),Uo.forEach(o),yt=i(p),E=l(p,"UL",{});var T=r(E);xe=l(T,"LI",{});var Do=r(xe);xt=c(Do,"Rust + web assembly"),Do.forEach(o),Et=i(T),Ee=l(T,"LI",{});var Co=r(Ee);bt=c(Co,"C"),Co.forEach(o),Lt=i(T),be=l(T,"LI",{});var Fo=r(be);It=c(Fo,"Haskell"),Fo.forEach(o),At=i(T),Le=l(T,"LI",{});var No=r(Le);St=c(No,"Lua script language"),No.forEach(o),Tt=i(T),Ie=l(T,"LI",{});var Vo=r(Ie);kt=c(Vo,"Bash script"),Vo.forEach(o),T.forEach(o),Pt=i(p),Ae=l(p,"P",{});var Wo=r(Ae);Rt=c(Wo,"Things I want to learn more about"),Wo.forEach(o),Ht=i(p),P=l(p,"UL",{});var re=r(P);Se=l(re,"LI",{});var Bo=r(Se);Ut=c(Bo,"Rust and high performance systems"),Bo.forEach(o),Dt=i(re),Te=l(re,"LI",{});var Yo=r(Te);Ct=c(Yo,"Tensorflow and machinge learning"),Yo.forEach(o),Ft=i(re),ke=l(re,"LI",{});var Go=r(ke);Nt=c(Go,"organisation and operation of big software Projects"),Go.forEach(o),re.forEach(o),Vt=i(p),Pe=l(p,"P",{});var zo=r(Pe);Wt=c(zo,"in the following I want to present some software examples"),zo.forEach(o),p.forEach(o),Me.forEach(o),Ye=i(h),R=l(h,"DIV",{class:!0});var qe=r(R);M=l(qe,"CANVAS",{class:!0,width:!0,height:!0}),r(M).forEach(o),Bt=i(qe),u=l(qe,"DIV",{class:!0});var g=r(u);Re=l(g,"H2",{});var jo=r(Re);Yt=c(jo,"Monsunbloom"),jo.forEach(o),Gt=i(g),$=l(g,"P",{});var mo=r($);zt=c(mo,"This is a website that wants to teach you math in a more modern way. Try it out here: "),ee=l(mo,"A",{href:!0});var Mo=r(ee);jt=c(Mo,"Monsunbloom"),Mo.forEach(o),mo.forEach(o),Mt=i(g),He=l(g,"P",{});var Oo=r(He);Ot=c(Oo,"The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),Oo.forEach(o),qt=i(g),Ue=l(g,"H3",{});var qo=r(Ue);Jt=c(qo,"Softaware:"),qo.forEach(o),Kt=i(g),De=l(g,"P",{});var Jo=r(De);Xt=c(Jo,`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),Jo.forEach(o),Qt=i(g),Ce=l(g,"P",{});var Ko=r(Ce);Zt=c(Ko,`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),Ko.forEach(o),$t=i(g),Fe=l(g,"P",{});var Xo=r(Fe);eo=c(Xo,"The database is a mongodb database that stores all the user data and the math exercises."),Xo.forEach(o),to=i(g),Ne=l(g,"P",{});var Qo=r(Ne);oo=c(Qo,"The data is generated in a python notebook and then stored in the database."),Qo.forEach(o),g.forEach(o),qe.forEach(o),Ge=i(h),H=l(h,"DIV",{class:!0});var Je=r(H);O=l(Je,"CANVAS",{class:!0,width:!0,height:!0}),r(O).forEach(o),ao=i(Je),C=l(Je,"DIV",{class:!0});var Ke=r(C);Ve=l(Ke,"H2",{});var Zo=r(Ve);lo=c(Zo,"Sciepedia"),Zo.forEach(o),ro=i(Ke),te=l(Ke,"P",{});var vo=r(te);oe=l(vo,"A",{href:!0});var $o=r(oe);so=c($o,"Sciepedia"),$o.forEach(o),io=c(vo," is a notetaking app that makes it easy to create interlinked notes and share them with other users."),vo.forEach(o),Ke.forEach(o),Je.forEach(o),ze=i(h),U=l(h,"DIV",{class:!0});var Xe=r(U);q=l(Xe,"CANVAS",{class:!0,width:!0,height:!0}),r(q).forEach(o),no=i(Xe),F=l(Xe,"DIV",{class:!0});var Qe=r(F);We=l(Qe,"H2",{});var ea=r(We);co=c(ea,"Flai"),ea.forEach(o),fo=i(Qe),J=l(Qe,"P",{});var Ze=r(J);ae=l(Ze,"A",{href:!0});var ta=r(ae);ho=c(ta,"Foreign language AI"),ta.forEach(o),po=c(Ze," was developed as part of a university Project together with "),le=l(Ze,"A",{href:!0});var oa=r(le);uo=c(oa,"@flo-bit"),oa.forEach(o),Ze.forEach(o),Qe.forEach(o),Xe.forEach(o),this.h()},h(){d(y,"class","canvas"),d(y,"width","1000"),d(y,"height","300"),d(I,"class","center"),d(t,"class","itemcontent"),d(v,"class","item"),d(A,"id","canvas"),d(A,"class","canvas"),d(A,"width","1000"),d(A,"height","1000"),ia(k.src,Be="portrait.png")||d(k,"src",Be),d(k,"id","portrait"),d(k,"alt",""),d(f,"class","itemcontent"),d(w,"class","item"),d(M,"class","canvas"),d(M,"width","1000"),d(M,"height","1000"),d(ee,"href","https://www.monsunbloom.com"),d(u,"class","itemcontent"),d(R,"class","item"),d(O,"class","canvas"),d(O,"width","1000"),d(O,"height","1000"),d(oe,"href","https://www.sciepedia.com"),d(C,"class","itemcontent"),d(H,"class","item"),d(q,"class","canvas"),d(q,"width","1000"),d(q,"height","1000"),d(ae,"href","https://dkormann.github.io/flai"),d(le,"href","https://github.com/flo-bit"),d(F,"class","itemcontent"),d(U,"class","item")},m(h,_){D(h,v,_),e(v,y),e(v,b),e(v,t),e(t,V),e(V,se),e(t,W),e(t,I),e(I,m),D(h,K,_),D(h,w,_),e(w,A),e(w,X),e(w,f),e(f,k),e(f,B),e(f,Y),e(Y,Q),e(f,ie),e(f,G),e(G,ne),e(f,ce),e(f,z),e(z,L),e(f,Z),e(f,fe),e(fe,$e),e(f,et),e(f,de),e(de,tt),e(f,ot),e(f,j),e(j,he),e(he,at),e(j,lt),e(j,pe),e(pe,rt),e(f,st),e(f,ue),e(ue,it),e(f,nt),e(f,x),e(x,me),e(me,ct),e(x,ft),e(x,ve),e(ve,dt),e(x,ht),e(x,ge),e(ge,pt),e(x,ut),e(x,we),e(we,mt),e(x,vt),e(x,_e),e(_e,gt),e(f,wt),e(f,ye),e(ye,_t),e(f,yt),e(f,E),e(E,xe),e(xe,xt),e(E,Et),e(E,Ee),e(Ee,bt),e(E,Lt),e(E,be),e(be,It),e(E,At),e(E,Le),e(Le,St),e(E,Tt),e(E,Ie),e(Ie,kt),e(f,Pt),e(f,Ae),e(Ae,Rt),e(f,Ht),e(f,P),e(P,Se),e(Se,Ut),e(P,Dt),e(P,Te),e(Te,Ct),e(P,Ft),e(P,ke),e(ke,Nt),e(f,Vt),e(f,Pe),e(Pe,Wt),D(h,Ye,_),D(h,R,_),e(R,M),e(R,Bt),e(R,u),e(u,Re),e(Re,Yt),e(u,Gt),e(u,$),e($,zt),e($,ee),e(ee,jt),e(u,Mt),e(u,He),e(He,Ot),e(u,qt),e(u,Ue),e(Ue,Jt),e(u,Kt),e(u,De),e(De,Xt),e(u,Qt),e(u,Ce),e(Ce,Zt),e(u,$t),e(u,Fe),e(Fe,eo),e(u,to),e(u,Ne),e(Ne,oo),D(h,Ge,_),D(h,H,_),e(H,O),e(H,ao),e(H,C),e(C,Ve),e(Ve,lo),e(C,ro),e(C,te),e(te,oe),e(oe,so),e(te,io),D(h,ze,_),D(h,U,_),e(U,q),e(U,no),e(U,F),e(F,We),e(We,co),e(F,fo),e(F,J),e(J,ae),e(ae,ho),e(J,po),e(J,le),e(le,uo)},p:go,i:go,o:go,d(h){h&&o(v),h&&o(K),h&&o(w),h&&o(Ye),h&&o(R),h&&o(Ge),h&&o(H),h&&o(ze),h&&o(U)}}}class da extends la{constructor(v){super(),ra(this,v,null,ca,sa,{})}}export{da as component};
