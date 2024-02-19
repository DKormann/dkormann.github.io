import{S as ga,i as wa,s as _a,k as a,a as i,q as n,l,m as r,h as o,c as s,r as c,n as d,J as ya,b as D,G as t,H as ko}from"../chunks/index.472b9089.js";const va=[[[.8,.7,.1],[.5,.7,.4],[.8,.7,.7]],[[.3,.4,.9],[.7,.6,.5],[.7,.7,.8]],[[.9,.5,.1],[.9,.3,.2],[.7,.8,.7]]];document.querySelectorAll(".canvas").forEach((v,x)=>{const L=va[x%va.length];xa(v,L[0],L[1],L[2])});function xa(F,v=[.2,.2,.2],x=[.8,.8,.8],L=[.8,.8,.8]){console.log(window.innerWidth,window.innerHeight);const e=F.getContext("webgl"),Y=`
        attribute vec2 position;


        void main() {
            gl_Position = vec4(position, 0.0, 1.0);

        }
    `,nt=`
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
    `,G=e.createShader(e.VERTEX_SHADER);e.shaderSource(G,Y),e.compileShader(G);const S=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(S,nt),e.compileShader(S);const u=e.createProgram();e.attachShader(u,G),e.attachShader(u,S),e.linkProgram(u),e.useProgram(u);const Z=[1,-1,-1,-1,-1,1,1,1],w=[0,1,2,0,2,3],k=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,k),e.bufferData(e.ARRAY_BUFFER,new Float32Array(Z),e.STATIC_DRAW);const $=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,$),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(w),e.STATIC_DRAW);const f=e.getAttribLocation(u,"position");e.enableVertexAttribArray(f),e.vertexAttribPointer(f,2,e.FLOAT,!1,0,0);const T=e.getUniformLocation(u,"canvasWidth"),Mt=e.getUniformLocation(u,"canvasHeight"),N=e.getUniformLocation(u,"scrollY"),O=e.getUniformLocation(u,"parentRatio"),tt=e.getUniformLocation(u,"mouse"),st=e.getUniformLocation(u,"top"),M=e.getUniformLocation(u,"windowWidth"),ct=e.getUniformLocation(u,"windowHeight"),ft=e.getUniformLocation(u,"c1"),j=e.getUniformLocation(u,"c2"),dt=e.getUniformLocation(u,"c3"),P=F.parentElement;e.uniform1f(T,F.width),e.uniform1f(Mt,F.height),e.uniform1f(N,window.scrollY/P.clientHeight),e.uniform1f(O,P.clientWidth/P.clientHeight),e.uniform1f(M,window.innerWidth),e.uniform1f(ct,window.innerHeight),e.uniform3f(ft,v[0],v[1],v[2]),e.uniform3f(j,x[0],x[1],x[2]),e.uniform3f(dt,L[0],L[1],L[2]),e.uniform2f(tt,0,0),e.uniform1f(st,P.offsetTop),e.uniform1f(N,window.scrollY/P.clientHeight),e.uniform1f(N,window.scrollY/window.innerWidth),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0),window.addEventListener("scroll",()=>{e.uniform1f(N,window.scrollY/window.innerWidth),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0)}),window.addEventListener("mousemove",C=>{e.uniform2f(tt,C.clientX,C.clientY),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0)}),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,$),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0)}function Ea(F){let v,x,L,e,Y,nt,G,S,u,Z,w,k,$,f,T,Mt,N,O,tt,st,M,ct,ft,j,dt,P,C,ae,le,ht,re,ie,z,pt,ne,se,ut,ce,fe,mt,de,he,E,vt,pe,ue,gt,me,ve,wt,ge,we,_t,_e,ye,yt,xe,Ee,xt,be,Ie,_,Et,Le,Se,bt,ke,Ae,It,Te,Pe,Lt,Re,He,St,Ue,We,kt,De,Ne,At,Ce,Ve,R,Tt,Be,Fe,Pt,Ye,Ge,Rt,Oe,Me,Ht,je,jt,H,q,ze,V,Ut,qe,Ke,et,ot,Je,Xe,zt,U,K,Qe,b,Wt,Ze,$e,J,at,to,eo,lt,oo,ao,Dt,lo,ro,Nt,io,qt,W,X,no,m,Ct,so,co,Q,fo,rt,ho,po,uo,Vt,mo,vo,Bt,go,wo,Ft,_o,yo,Yt,xo,Eo,Gt,bo,Io,Ot,Lo;return{c(){v=a("div"),x=a("canvas"),L=i(),e=a("div"),Y=a("h1"),nt=n("my profile"),G=i(),S=a("p"),u=n("Kormann"),Z=i(),w=a("div"),k=a("canvas"),$=i(),f=a("div"),T=a("img"),N=i(),O=a("h2"),tt=n("Introduction"),st=i(),M=a("p"),ct=n("Hi, I'm Dominik Kormann and I coding is what I do."),ft=i(),j=a("p"),dt=n("On this page I want to show you some of my skills and what I want to accomplish in the future."),P=i(),C=a("h3"),ae=n("technical skills:"),le=i(),ht=a("p"),re=n("strong:"),ie=i(),z=a("ul"),pt=a("li"),ne=n("Machine learning with Python + Pytorch"),se=i(),ut=a("li"),ce=n("Web dev. with Svelte.js framework"),fe=i(),mt=a("p"),de=n("solid:"),he=i(),E=a("ul"),vt=a("li"),pe=n("Web dev. + Vue.js"),ue=i(),gt=a("li"),me=n("Backend with Java + Spring boot"),ve=i(),wt=a("li"),ge=n("Game dev. with C# + Unity"),we=i(),_t=a("li"),_e=n("Webgl shader programming"),ye=i(),yt=a("li"),xe=n("Golang"),Ee=i(),xt=a("p"),be=n("decent"),Ie=i(),_=a("ul"),Et=a("li"),Le=n("Rust + web assembly"),Se=i(),bt=a("li"),ke=n("Tensorflow"),Ae=i(),It=a("li"),Te=n("C"),Pe=i(),Lt=a("li"),Re=n("Haskell"),He=i(),St=a("li"),Ue=n("Lua script language"),We=i(),kt=a("li"),De=n("Bash script"),Ne=i(),At=a("p"),Ce=n("Things I want to learn more about"),Ve=i(),R=a("ul"),Tt=a("li"),Be=n("Rust and high performance systems"),Fe=i(),Pt=a("li"),Ye=n("Machinge learning"),Ge=i(),Rt=a("li"),Oe=n("Organisation and operation of big software Projects"),Me=i(),Ht=a("p"),je=n("in the following I want to present some software I wrote"),jt=i(),H=a("div"),q=a("canvas"),ze=i(),V=a("div"),Ut=a("h2"),qe=n("Sciepedia"),Ke=i(),et=a("p"),ot=a("a"),Je=n("Sciepedia"),Xe=n(" is a notetaking app that makes it easy to create interlinked notes and share them with other users."),zt=i(),U=a("div"),K=a("canvas"),Qe=i(),b=a("div"),Wt=a("h2"),Ze=n("Instalingua"),$e=i(),J=a("p"),at=a("a"),to=n("Instalingua.com"),eo=n(" was developed as part of a university Project together with "),lt=a("a"),oo=n("@flo-bit"),ao=i(),Dt=a("p"),lo=n("The Idea is to employ a chat bot to teach you different languages."),ro=i(),Nt=a("p"),io=n("(On first opening the site it might take a minute since a container is gonna be spun up)"),qt=i(),W=a("div"),X=a("canvas"),no=i(),m=a("div"),Ct=a("h2"),so=n("Monsunbloom"),co=i(),Q=a("p"),fo=n("This is a website that wants to teach you math in a more modern way. Try it out here: "),rt=a("a"),ho=n("Monsunbloom"),po=n(" [site might be down at the moment]"),uo=i(),Vt=a("p"),mo=n("The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),vo=i(),Bt=a("h3"),go=n("Software:"),wo=i(),Ft=a("p"),_o=n(`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),yo=i(),Yt=a("p"),xo=n(`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),Eo=i(),Gt=a("p"),bo=n("The database is a mongodb database that stores all the user data and the math exercises."),Io=i(),Ot=a("p"),Lo=n("The data is generated in a python notebook and then stored in the database."),this.h()},l(h){v=l(h,"DIV",{class:!0});var y=r(v);x=l(y,"CANVAS",{class:!0,width:!0,height:!0}),r(x).forEach(o),L=s(y),e=l(y,"DIV",{class:!0});var Kt=r(e);Y=l(Kt,"H1",{});var Ao=r(Y);nt=c(Ao,"my profile"),Ao.forEach(o),G=s(Kt),S=l(Kt,"P",{class:!0});var To=r(S);u=c(To,"Kormann"),To.forEach(o),Kt.forEach(o),y.forEach(o),Z=s(h),w=l(h,"DIV",{class:!0});var Jt=r(w);k=l(Jt,"CANVAS",{id:!0,class:!0,width:!0,height:!0}),r(k).forEach(o),$=s(Jt),f=l(Jt,"DIV",{class:!0});var p=r(f);T=l(p,"IMG",{src:!0,id:!0,alt:!0}),N=s(p),O=l(p,"H2",{});var Po=r(O);tt=c(Po,"Introduction"),Po.forEach(o),st=s(p),M=l(p,"P",{});var Ro=r(M);ct=c(Ro,"Hi, I'm Dominik Kormann and I coding is what I do."),Ro.forEach(o),ft=s(p),j=l(p,"P",{});var Ho=r(j);dt=c(Ho,"On this page I want to show you some of my skills and what I want to accomplish in the future."),Ho.forEach(o),P=s(p),C=l(p,"H3",{});var Uo=r(C);ae=c(Uo,"technical skills:"),Uo.forEach(o),le=s(p),ht=l(p,"P",{});var Wo=r(ht);re=c(Wo,"strong:"),Wo.forEach(o),ie=s(p),z=l(p,"UL",{});var Xt=r(z);pt=l(Xt,"LI",{});var Do=r(pt);ne=c(Do,"Machine learning with Python + Pytorch"),Do.forEach(o),se=s(Xt),ut=l(Xt,"LI",{});var No=r(ut);ce=c(No,"Web dev. with Svelte.js framework"),No.forEach(o),Xt.forEach(o),fe=s(p),mt=l(p,"P",{});var Co=r(mt);de=c(Co,"solid:"),Co.forEach(o),he=s(p),E=l(p,"UL",{});var A=r(E);vt=l(A,"LI",{});var Vo=r(vt);pe=c(Vo,"Web dev. + Vue.js"),Vo.forEach(o),ue=s(A),gt=l(A,"LI",{});var Bo=r(gt);me=c(Bo,"Backend with Java + Spring boot"),Bo.forEach(o),ve=s(A),wt=l(A,"LI",{});var Fo=r(wt);ge=c(Fo,"Game dev. with C# + Unity"),Fo.forEach(o),we=s(A),_t=l(A,"LI",{});var Yo=r(_t);_e=c(Yo,"Webgl shader programming"),Yo.forEach(o),ye=s(A),yt=l(A,"LI",{});var Go=r(yt);xe=c(Go,"Golang"),Go.forEach(o),A.forEach(o),Ee=s(p),xt=l(p,"P",{});var Oo=r(xt);be=c(Oo,"decent"),Oo.forEach(o),Ie=s(p),_=l(p,"UL",{});var I=r(_);Et=l(I,"LI",{});var Mo=r(Et);Le=c(Mo,"Rust + web assembly"),Mo.forEach(o),Se=s(I),bt=l(I,"LI",{});var jo=r(bt);ke=c(jo,"Tensorflow"),jo.forEach(o),Ae=s(I),It=l(I,"LI",{});var zo=r(It);Te=c(zo,"C"),zo.forEach(o),Pe=s(I),Lt=l(I,"LI",{});var qo=r(Lt);Re=c(qo,"Haskell"),qo.forEach(o),He=s(I),St=l(I,"LI",{});var Ko=r(St);Ue=c(Ko,"Lua script language"),Ko.forEach(o),We=s(I),kt=l(I,"LI",{});var Jo=r(kt);De=c(Jo,"Bash script"),Jo.forEach(o),I.forEach(o),Ne=s(p),At=l(p,"P",{});var Xo=r(At);Ce=c(Xo,"Things I want to learn more about"),Xo.forEach(o),Ve=s(p),R=l(p,"UL",{});var it=r(R);Tt=l(it,"LI",{});var Qo=r(Tt);Be=c(Qo,"Rust and high performance systems"),Qo.forEach(o),Fe=s(it),Pt=l(it,"LI",{});var Zo=r(Pt);Ye=c(Zo,"Machinge learning"),Zo.forEach(o),Ge=s(it),Rt=l(it,"LI",{});var $o=r(Rt);Oe=c($o,"Organisation and operation of big software Projects"),$o.forEach(o),it.forEach(o),Me=s(p),Ht=l(p,"P",{});var ta=r(Ht);je=c(ta,"in the following I want to present some software I wrote"),ta.forEach(o),p.forEach(o),Jt.forEach(o),jt=s(h),H=l(h,"DIV",{class:!0});var Qt=r(H);q=l(Qt,"CANVAS",{class:!0,width:!0,height:!0}),r(q).forEach(o),ze=s(Qt),V=l(Qt,"DIV",{class:!0});var Zt=r(V);Ut=l(Zt,"H2",{});var ea=r(Ut);qe=c(ea,"Sciepedia"),ea.forEach(o),Ke=s(Zt),et=l(Zt,"P",{});var So=r(et);ot=l(So,"A",{href:!0});var oa=r(ot);Je=c(oa,"Sciepedia"),oa.forEach(o),Xe=c(So," is a notetaking app that makes it easy to create interlinked notes and share them with other users."),So.forEach(o),Zt.forEach(o),Qt.forEach(o),zt=s(h),U=l(h,"DIV",{class:!0});var $t=r(U);K=l($t,"CANVAS",{class:!0,width:!0,height:!0}),r(K).forEach(o),Qe=s($t),b=l($t,"DIV",{class:!0});var B=r(b);Wt=l(B,"H2",{});var aa=r(Wt);Ze=c(aa,"Instalingua"),aa.forEach(o),$e=s(B),J=l(B,"P",{});var te=r(J);at=l(te,"A",{href:!0});var la=r(at);to=c(la,"Instalingua.com"),la.forEach(o),eo=c(te," was developed as part of a university Project together with "),lt=l(te,"A",{href:!0});var ra=r(lt);oo=c(ra,"@flo-bit"),ra.forEach(o),te.forEach(o),ao=s(B),Dt=l(B,"P",{});var ia=r(Dt);lo=c(ia,"The Idea is to employ a chat bot to teach you different languages."),ia.forEach(o),ro=s(B),Nt=l(B,"P",{});var na=r(Nt);io=c(na,"(On first opening the site it might take a minute since a container is gonna be spun up)"),na.forEach(o),B.forEach(o),$t.forEach(o),qt=s(h),W=l(h,"DIV",{class:!0});var ee=r(W);X=l(ee,"CANVAS",{class:!0,width:!0,height:!0}),r(X).forEach(o),no=s(ee),m=l(ee,"DIV",{class:!0});var g=r(m);Ct=l(g,"H2",{});var sa=r(Ct);so=c(sa,"Monsunbloom"),sa.forEach(o),co=s(g),Q=l(g,"P",{});var oe=r(Q);fo=c(oe,"This is a website that wants to teach you math in a more modern way. Try it out here: "),rt=l(oe,"A",{href:!0});var ca=r(rt);ho=c(ca,"Monsunbloom"),ca.forEach(o),po=c(oe," [site might be down at the moment]"),oe.forEach(o),uo=s(g),Vt=l(g,"P",{});var fa=r(Vt);mo=c(fa,"The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),fa.forEach(o),vo=s(g),Bt=l(g,"H3",{});var da=r(Bt);go=c(da,"Software:"),da.forEach(o),wo=s(g),Ft=l(g,"P",{});var ha=r(Ft);_o=c(ha,`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),ha.forEach(o),yo=s(g),Yt=l(g,"P",{});var pa=r(Yt);xo=c(pa,`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),pa.forEach(o),Eo=s(g),Gt=l(g,"P",{});var ua=r(Gt);bo=c(ua,"The database is a mongodb database that stores all the user data and the math exercises."),ua.forEach(o),Io=s(g),Ot=l(g,"P",{});var ma=r(Ot);Lo=c(ma,"The data is generated in a python notebook and then stored in the database."),ma.forEach(o),g.forEach(o),ee.forEach(o),this.h()},h(){d(x,"class","canvas"),d(x,"width","1000"),d(x,"height","300"),d(S,"class","center"),d(e,"class","itemcontent"),d(v,"class","item"),d(k,"id","canvas"),d(k,"class","canvas"),d(k,"width","1000"),d(k,"height","1000"),ya(T.src,Mt="portrait.png")||d(T,"src",Mt),d(T,"id","portrait"),d(T,"alt",""),d(f,"class","itemcontent"),d(w,"class","item"),d(q,"class","canvas"),d(q,"width","1000"),d(q,"height","1000"),d(ot,"href","https://sciepedia.com"),d(V,"class","itemcontent"),d(H,"class","item"),d(K,"class","canvas"),d(K,"width","1000"),d(K,"height","1000"),d(at,"href","https://instalingua.com"),d(lt,"href","https://github.com/flo-bit"),d(b,"class","itemcontent"),d(U,"class","item"),d(X,"class","canvas"),d(X,"width","1000"),d(X,"height","1000"),d(rt,"href","https://www.monsunbloom.com"),d(m,"class","itemcontent"),d(W,"class","item")},m(h,y){D(h,v,y),t(v,x),t(v,L),t(v,e),t(e,Y),t(Y,nt),t(e,G),t(e,S),t(S,u),D(h,Z,y),D(h,w,y),t(w,k),t(w,$),t(w,f),t(f,T),t(f,N),t(f,O),t(O,tt),t(f,st),t(f,M),t(M,ct),t(f,ft),t(f,j),t(j,dt),t(f,P),t(f,C),t(C,ae),t(f,le),t(f,ht),t(ht,re),t(f,ie),t(f,z),t(z,pt),t(pt,ne),t(z,se),t(z,ut),t(ut,ce),t(f,fe),t(f,mt),t(mt,de),t(f,he),t(f,E),t(E,vt),t(vt,pe),t(E,ue),t(E,gt),t(gt,me),t(E,ve),t(E,wt),t(wt,ge),t(E,we),t(E,_t),t(_t,_e),t(E,ye),t(E,yt),t(yt,xe),t(f,Ee),t(f,xt),t(xt,be),t(f,Ie),t(f,_),t(_,Et),t(Et,Le),t(_,Se),t(_,bt),t(bt,ke),t(_,Ae),t(_,It),t(It,Te),t(_,Pe),t(_,Lt),t(Lt,Re),t(_,He),t(_,St),t(St,Ue),t(_,We),t(_,kt),t(kt,De),t(f,Ne),t(f,At),t(At,Ce),t(f,Ve),t(f,R),t(R,Tt),t(Tt,Be),t(R,Fe),t(R,Pt),t(Pt,Ye),t(R,Ge),t(R,Rt),t(Rt,Oe),t(f,Me),t(f,Ht),t(Ht,je),D(h,jt,y),D(h,H,y),t(H,q),t(H,ze),t(H,V),t(V,Ut),t(Ut,qe),t(V,Ke),t(V,et),t(et,ot),t(ot,Je),t(et,Xe),D(h,zt,y),D(h,U,y),t(U,K),t(U,Qe),t(U,b),t(b,Wt),t(Wt,Ze),t(b,$e),t(b,J),t(J,at),t(at,to),t(J,eo),t(J,lt),t(lt,oo),t(b,ao),t(b,Dt),t(Dt,lo),t(b,ro),t(b,Nt),t(Nt,io),D(h,qt,y),D(h,W,y),t(W,X),t(W,no),t(W,m),t(m,Ct),t(Ct,so),t(m,co),t(m,Q),t(Q,fo),t(Q,rt),t(rt,ho),t(Q,po),t(m,uo),t(m,Vt),t(Vt,mo),t(m,vo),t(m,Bt),t(Bt,go),t(m,wo),t(m,Ft),t(Ft,_o),t(m,yo),t(m,Yt),t(Yt,xo),t(m,Eo),t(m,Gt),t(Gt,bo),t(m,Io),t(m,Ot),t(Ot,Lo)},p:ko,i:ko,o:ko,d(h){h&&o(v),h&&o(Z),h&&o(w),h&&o(jt),h&&o(H),h&&o(zt),h&&o(U),h&&o(qt),h&&o(W)}}}class Ia extends ga{constructor(v){super(),wa(this,v,null,Ea,_a,{})}}export{Ia as component};
