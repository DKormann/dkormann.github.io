import{S as la,i as ra,s as ia,k as a,a as i,q as n,l,m as r,h as o,c as s,r as c,n as d,J as sa,b as C,G as t,H as go}from"../chunks/index.472b9089.js";const aa=[[[.8,.7,.1],[.5,.7,.4],[.8,.7,.7]],[[.3,.4,.9],[.7,.6,.5],[.7,.7,.8]],[[.9,.5,.1],[.9,.3,.2],[.7,.8,.7]]];document.querySelectorAll(".canvas").forEach((v,x)=>{const b=aa[x%aa.length];na(v,b[0],b[1],b[2])});function na(V,v=[.2,.2,.2],x=[.8,.8,.8],b=[.8,.8,.8]){console.log(window.innerWidth,window.innerHeight);const e=V.getContext("webgl"),Y=`
        attribute vec2 position;


        void main() {
            gl_Position = vec4(position, 0.0, 1.0);

        }
    `,it=`
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
    `,B=e.createShader(e.VERTEX_SHADER);e.shaderSource(B,Y),e.compileShader(B);const L=e.createShader(e.FRAGMENT_SHADER);e.shaderSource(L,it),e.compileShader(L);const u=e.createProgram();e.attachShader(u,B),e.attachShader(u,L),e.linkProgram(u),e.useProgram(u);const X=[1,-1,-1,-1,-1,1,1,1],w=[0,1,2,0,2,3],I=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,I),e.bufferData(e.ARRAY_BUFFER,new Float32Array(X),e.STATIC_DRAW);const Q=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,Q),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(w),e.STATIC_DRAW);const f=e.getAttribLocation(u,"position");e.enableVertexAttribArray(f),e.vertexAttribPointer(f,2,e.FLOAT,!1,0,0);const k=e.getUniformLocation(u,"canvasWidth"),Yt=e.getUniformLocation(u,"canvasHeight"),D=e.getUniformLocation(u,"scrollY"),G=e.getUniformLocation(u,"parentRatio"),Z=e.getUniformLocation(u,"mouse"),st=e.getUniformLocation(u,"top"),z=e.getUniformLocation(u,"windowWidth"),nt=e.getUniformLocation(u,"windowHeight"),ct=e.getUniformLocation(u,"c1"),j=e.getUniformLocation(u,"c2"),ft=e.getUniformLocation(u,"c3"),T=V.parentElement;e.uniform1f(k,V.width),e.uniform1f(Yt,V.height),e.uniform1f(D,window.scrollY/T.clientHeight),e.uniform1f(G,T.clientWidth/T.clientHeight),e.uniform1f(z,window.innerWidth),e.uniform1f(nt,window.innerHeight),e.uniform3f(ct,v[0],v[1],v[2]),e.uniform3f(j,x[0],x[1],x[2]),e.uniform3f(ft,b[0],b[1],b[2]),e.uniform2f(Z,0,0),e.uniform1f(st,T.offsetTop),e.uniform1f(D,window.scrollY/T.clientHeight),e.uniform1f(D,window.scrollY/window.innerWidth),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0),window.addEventListener("scroll",()=>{e.uniform1f(D,window.scrollY/window.innerWidth),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0)}),window.addEventListener("mousemove",F=>{e.uniform2f(Z,F.clientX,F.clientY),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0)}),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,Q),e.drawElements(e.TRIANGLES,w.length,e.UNSIGNED_SHORT,0)}function ca(V){let v,x,b,e,Y,it,B,L,u,X,w,I,Q,f,k,Yt,D,G,Z,st,z,nt,ct,j,ft,T,F,$t,te,dt,ee,oe,M,ht,ae,le,pt,re,ie,ut,se,ne,y,mt,ce,fe,vt,de,he,gt,pe,ue,wt,me,ve,_t,ge,we,xt,_e,xe,E,yt,ye,Ee,Et,be,Le,bt,Ie,Ae,Lt,Se,ke,It,Te,Re,At,Pe,He,R,St,Ue,Ce,kt,De,Fe,Tt,Ne,We,Rt,Ve,Bt,P,O,Ye,m,Pt,Be,Ge,$,ze,tt,je,Me,Ht,Oe,qe,Ut,Je,Ke,Ct,Xe,Qe,Dt,Ze,$e,Ft,to,eo,Nt,oo,Gt,H,q,ao,N,Wt,lo,ro,et,ot,io,so,zt,U,J,no,W,Vt,co,fo,K,at,ho,po,lt,uo;return{c(){v=a("div"),x=a("canvas"),b=i(),e=a("div"),Y=a("h1"),it=n("my profile"),B=i(),L=a("p"),u=n("Kormann"),X=i(),w=a("div"),I=a("canvas"),Q=i(),f=a("div"),k=a("img"),D=i(),G=a("h2"),Z=n("Introduction"),st=i(),z=a("p"),nt=n("Hi, I'm Dominik Kormann and Coding is my long time Passion."),ct=i(),j=a("p"),ft=n("So on this page I want to show you some of my skills and what I want to accomplish in the future."),T=i(),F=a("h3"),$t=n("technical skills:"),te=i(),dt=a("p"),ee=n("strong:"),oe=i(),M=a("ul"),ht=a("li"),ae=n("Python"),le=i(),pt=a("li"),re=n("Html / Javascript + Vuejs Framework"),ie=i(),ut=a("p"),se=n("solid:"),ne=i(),y=a("ul"),mt=a("li"),ce=n("Java + Spring boot"),fe=i(),vt=a("li"),de=n("C# + Unity"),he=i(),gt=a("li"),pe=n("Tensorflow"),ue=i(),wt=a("li"),me=n("Webgl shader programming"),ve=i(),_t=a("li"),ge=n("Golang"),we=i(),xt=a("p"),_e=n("decent"),xe=i(),E=a("ul"),yt=a("li"),ye=n("Rust + web assembly"),Ee=i(),Et=a("li"),be=n("C"),Le=i(),bt=a("li"),Ie=n("Haskell"),Ae=i(),Lt=a("li"),Se=n("Lua script language"),ke=i(),It=a("li"),Te=n("Bash script"),Re=i(),At=a("p"),Pe=n("Things I want to learn more about"),He=i(),R=a("ul"),St=a("li"),Ue=n("Rust and high performance systems"),Ce=i(),kt=a("li"),De=n("Tensorflow and machinge learning"),Fe=i(),Tt=a("li"),Ne=n("organisation and operation of big software Projects"),We=i(),Rt=a("p"),Ve=n("in the following I want to present some software examples"),Bt=i(),P=a("div"),O=a("canvas"),Ye=i(),m=a("div"),Pt=a("h2"),Be=n("Monsunbloom"),Ge=i(),$=a("p"),ze=n("This is a website that wants to teach you math in a more modern way. Try it out here: "),tt=a("a"),je=n("Monsunbloom"),Me=i(),Ht=a("p"),Oe=n("The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),qe=i(),Ut=a("h3"),Je=n("Softaware:"),Ke=i(),Ct=a("p"),Xe=n(`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),Qe=i(),Dt=a("p"),Ze=n(`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),$e=i(),Ft=a("p"),to=n("The database is a mongodb database that stores all the user data and the math exercises."),eo=i(),Nt=a("p"),oo=n("The data is generated in a python notebook and then stored in the database."),Gt=i(),H=a("div"),q=a("canvas"),ao=i(),N=a("div"),Wt=a("h2"),lo=n("Sciepedia"),ro=i(),et=a("p"),ot=a("a"),io=n("Sciepedia"),so=n(" is a notetaking app that makes it easy to create interlinked notes and share them with other users."),zt=i(),U=a("div"),J=a("canvas"),no=i(),W=a("div"),Vt=a("h2"),co=n("Flai"),fo=i(),K=a("p"),at=a("a"),ho=n("Foreign language AI"),po=n(" was developed as part of a university Project together with "),lt=a("a"),uo=n("@flo-bit"),this.h()},l(h){v=l(h,"DIV",{class:!0});var _=r(v);x=l(_,"CANVAS",{class:!0,width:!0,height:!0}),r(x).forEach(o),b=s(_),e=l(_,"DIV",{class:!0});var jt=r(e);Y=l(jt,"H1",{});var wo=r(Y);it=c(wo,"my profile"),wo.forEach(o),B=s(jt),L=l(jt,"P",{class:!0});var _o=r(L);u=c(_o,"Kormann"),_o.forEach(o),jt.forEach(o),_.forEach(o),X=s(h),w=l(h,"DIV",{class:!0});var Mt=r(w);I=l(Mt,"CANVAS",{id:!0,class:!0,width:!0,height:!0}),r(I).forEach(o),Q=s(Mt),f=l(Mt,"DIV",{class:!0});var p=r(f);k=l(p,"IMG",{src:!0,id:!0,alt:!0}),D=s(p),G=l(p,"H2",{});var xo=r(G);Z=c(xo,"Introduction"),xo.forEach(o),st=s(p),z=l(p,"P",{});var yo=r(z);nt=c(yo,"Hi, I'm Dominik Kormann and Coding is my long time Passion."),yo.forEach(o),ct=s(p),j=l(p,"P",{});var Eo=r(j);ft=c(Eo,"So on this page I want to show you some of my skills and what I want to accomplish in the future."),Eo.forEach(o),T=s(p),F=l(p,"H3",{});var bo=r(F);$t=c(bo,"technical skills:"),bo.forEach(o),te=s(p),dt=l(p,"P",{});var Lo=r(dt);ee=c(Lo,"strong:"),Lo.forEach(o),oe=s(p),M=l(p,"UL",{});var Ot=r(M);ht=l(Ot,"LI",{});var Io=r(ht);ae=c(Io,"Python"),Io.forEach(o),le=s(Ot),pt=l(Ot,"LI",{});var Ao=r(pt);re=c(Ao,"Html / Javascript + Vuejs Framework"),Ao.forEach(o),Ot.forEach(o),ie=s(p),ut=l(p,"P",{});var So=r(ut);se=c(So,"solid:"),So.forEach(o),ne=s(p),y=l(p,"UL",{});var A=r(y);mt=l(A,"LI",{});var ko=r(mt);ce=c(ko,"Java + Spring boot"),ko.forEach(o),fe=s(A),vt=l(A,"LI",{});var To=r(vt);de=c(To,"C# + Unity"),To.forEach(o),he=s(A),gt=l(A,"LI",{});var Ro=r(gt);pe=c(Ro,"Tensorflow"),Ro.forEach(o),ue=s(A),wt=l(A,"LI",{});var Po=r(wt);me=c(Po,"Webgl shader programming"),Po.forEach(o),ve=s(A),_t=l(A,"LI",{});var Ho=r(_t);ge=c(Ho,"Golang"),Ho.forEach(o),A.forEach(o),we=s(p),xt=l(p,"P",{});var Uo=r(xt);_e=c(Uo,"decent"),Uo.forEach(o),xe=s(p),E=l(p,"UL",{});var S=r(E);yt=l(S,"LI",{});var Co=r(yt);ye=c(Co,"Rust + web assembly"),Co.forEach(o),Ee=s(S),Et=l(S,"LI",{});var Do=r(Et);be=c(Do,"C"),Do.forEach(o),Le=s(S),bt=l(S,"LI",{});var Fo=r(bt);Ie=c(Fo,"Haskell"),Fo.forEach(o),Ae=s(S),Lt=l(S,"LI",{});var No=r(Lt);Se=c(No,"Lua script language"),No.forEach(o),ke=s(S),It=l(S,"LI",{});var Wo=r(It);Te=c(Wo,"Bash script"),Wo.forEach(o),S.forEach(o),Re=s(p),At=l(p,"P",{});var Vo=r(At);Pe=c(Vo,"Things I want to learn more about"),Vo.forEach(o),He=s(p),R=l(p,"UL",{});var rt=r(R);St=l(rt,"LI",{});var Yo=r(St);Ue=c(Yo,"Rust and high performance systems"),Yo.forEach(o),Ce=s(rt),kt=l(rt,"LI",{});var Bo=r(kt);De=c(Bo,"Tensorflow and machinge learning"),Bo.forEach(o),Fe=s(rt),Tt=l(rt,"LI",{});var Go=r(Tt);Ne=c(Go,"organisation and operation of big software Projects"),Go.forEach(o),rt.forEach(o),We=s(p),Rt=l(p,"P",{});var zo=r(Rt);Ve=c(zo,"in the following I want to present some software examples"),zo.forEach(o),p.forEach(o),Mt.forEach(o),Bt=s(h),P=l(h,"DIV",{class:!0});var qt=r(P);O=l(qt,"CANVAS",{class:!0,width:!0,height:!0}),r(O).forEach(o),Ye=s(qt),m=l(qt,"DIV",{class:!0});var g=r(m);Pt=l(g,"H2",{});var jo=r(Pt);Be=c(jo,"Monsunbloom"),jo.forEach(o),Ge=s(g),$=l(g,"P",{});var mo=r($);ze=c(mo,"This is a website that wants to teach you math in a more modern way. Try it out here: "),tt=l(mo,"A",{href:!0});var Mo=r(tt);je=c(Mo,"Monsunbloom"),Mo.forEach(o),mo.forEach(o),Me=s(g),Ht=l(g,"P",{});var Oo=r(Ht);Oe=c(Oo,"The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student."),Oo.forEach(o),qe=s(g),Ut=l(g,"H3",{});var qo=r(Ut);Je=c(qo,"Softaware:"),qo.forEach(o),Ke=s(g),Ct=l(g,"P",{});var Jo=r(Ct);Xe=c(Jo,`The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.`),Jo.forEach(o),Qe=s(g),Dt=l(g,"P",{});var Ko=r(Dt);Ze=c(Ko,`The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.`),Ko.forEach(o),$e=s(g),Ft=l(g,"P",{});var Xo=r(Ft);to=c(Xo,"The database is a mongodb database that stores all the user data and the math exercises."),Xo.forEach(o),eo=s(g),Nt=l(g,"P",{});var Qo=r(Nt);oo=c(Qo,"The data is generated in a python notebook and then stored in the database."),Qo.forEach(o),g.forEach(o),qt.forEach(o),Gt=s(h),H=l(h,"DIV",{class:!0});var Jt=r(H);q=l(Jt,"CANVAS",{class:!0,width:!0,height:!0}),r(q).forEach(o),ao=s(Jt),N=l(Jt,"DIV",{class:!0});var Kt=r(N);Wt=l(Kt,"H2",{});var Zo=r(Wt);lo=c(Zo,"Sciepedia"),Zo.forEach(o),ro=s(Kt),et=l(Kt,"P",{});var vo=r(et);ot=l(vo,"A",{href:!0});var $o=r(ot);io=c($o,"Sciepedia"),$o.forEach(o),so=c(vo," is a notetaking app that makes it easy to create interlinked notes and share them with other users."),vo.forEach(o),Kt.forEach(o),Jt.forEach(o),zt=s(h),U=l(h,"DIV",{class:!0});var Xt=r(U);J=l(Xt,"CANVAS",{class:!0,width:!0,height:!0}),r(J).forEach(o),no=s(Xt),W=l(Xt,"DIV",{class:!0});var Qt=r(W);Vt=l(Qt,"H2",{});var ta=r(Vt);co=c(ta,"Flai"),ta.forEach(o),fo=s(Qt),K=l(Qt,"P",{});var Zt=r(K);at=l(Zt,"A",{href:!0});var ea=r(at);ho=c(ea,"Foreign language AI"),ea.forEach(o),po=c(Zt," was developed as part of a university Project together with "),lt=l(Zt,"A",{href:!0});var oa=r(lt);uo=c(oa,"@flo-bit"),oa.forEach(o),Zt.forEach(o),Qt.forEach(o),Xt.forEach(o),this.h()},h(){d(x,"class","canvas"),d(x,"width","1000"),d(x,"height","300"),d(L,"class","center"),d(e,"class","itemcontent"),d(v,"class","item"),d(I,"id","canvas"),d(I,"class","canvas"),d(I,"width","1000"),d(I,"height","1000"),sa(k.src,Yt="portrait.png")||d(k,"src",Yt),d(k,"id","portrait"),d(k,"alt",""),d(f,"class","itemcontent"),d(w,"class","item"),d(O,"class","canvas"),d(O,"width","1000"),d(O,"height","1000"),d(tt,"href","https://www.monsunbloom.com"),d(m,"class","itemcontent"),d(P,"class","item"),d(q,"class","canvas"),d(q,"width","1000"),d(q,"height","1000"),d(ot,"href","https://www.sciepedia.com"),d(N,"class","itemcontent"),d(H,"class","item"),d(J,"class","canvas"),d(J,"width","1000"),d(J,"height","1000"),d(at,"href","https://dkormann.github.io/flai"),d(lt,"href","https://github.com/flo-bit"),d(W,"class","itemcontent"),d(U,"class","item")},m(h,_){C(h,v,_),t(v,x),t(v,b),t(v,e),t(e,Y),t(Y,it),t(e,B),t(e,L),t(L,u),C(h,X,_),C(h,w,_),t(w,I),t(w,Q),t(w,f),t(f,k),t(f,D),t(f,G),t(G,Z),t(f,st),t(f,z),t(z,nt),t(f,ct),t(f,j),t(j,ft),t(f,T),t(f,F),t(F,$t),t(f,te),t(f,dt),t(dt,ee),t(f,oe),t(f,M),t(M,ht),t(ht,ae),t(M,le),t(M,pt),t(pt,re),t(f,ie),t(f,ut),t(ut,se),t(f,ne),t(f,y),t(y,mt),t(mt,ce),t(y,fe),t(y,vt),t(vt,de),t(y,he),t(y,gt),t(gt,pe),t(y,ue),t(y,wt),t(wt,me),t(y,ve),t(y,_t),t(_t,ge),t(f,we),t(f,xt),t(xt,_e),t(f,xe),t(f,E),t(E,yt),t(yt,ye),t(E,Ee),t(E,Et),t(Et,be),t(E,Le),t(E,bt),t(bt,Ie),t(E,Ae),t(E,Lt),t(Lt,Se),t(E,ke),t(E,It),t(It,Te),t(f,Re),t(f,At),t(At,Pe),t(f,He),t(f,R),t(R,St),t(St,Ue),t(R,Ce),t(R,kt),t(kt,De),t(R,Fe),t(R,Tt),t(Tt,Ne),t(f,We),t(f,Rt),t(Rt,Ve),C(h,Bt,_),C(h,P,_),t(P,O),t(P,Ye),t(P,m),t(m,Pt),t(Pt,Be),t(m,Ge),t(m,$),t($,ze),t($,tt),t(tt,je),t(m,Me),t(m,Ht),t(Ht,Oe),t(m,qe),t(m,Ut),t(Ut,Je),t(m,Ke),t(m,Ct),t(Ct,Xe),t(m,Qe),t(m,Dt),t(Dt,Ze),t(m,$e),t(m,Ft),t(Ft,to),t(m,eo),t(m,Nt),t(Nt,oo),C(h,Gt,_),C(h,H,_),t(H,q),t(H,ao),t(H,N),t(N,Wt),t(Wt,lo),t(N,ro),t(N,et),t(et,ot),t(ot,io),t(et,so),C(h,zt,_),C(h,U,_),t(U,J),t(U,no),t(U,W),t(W,Vt),t(Vt,co),t(W,fo),t(W,K),t(K,at),t(at,ho),t(K,po),t(K,lt),t(lt,uo)},p:go,i:go,o:go,d(h){h&&o(v),h&&o(X),h&&o(w),h&&o(Bt),h&&o(P),h&&o(Gt),h&&o(H),h&&o(zt),h&&o(U)}}}class da extends la{constructor(v){super(),ra(this,v,null,ca,ia,{})}}export{da as component};
