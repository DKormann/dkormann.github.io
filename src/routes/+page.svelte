<script lang="ts">

    import "./shader"

</script>


<div class = item>

    <canvas class=canvas width=1000 height=300></canvas>


    <div class=itemcontent>


        <h1>my profile</h1>
        
        <p class="center">Kormann</p>
    </div>

</div>

<div class = item>

    <canvas id=canvas class=canvas width=1000 height=1000 ></canvas>

    <div class=itemcontent>

        <img src="portrait.png" id="portrait" alt="">

        <h2>Introduction</h2>

        <p>Hi, I'm Dominik Kormann and I coding is what I do.</p> 

        <p>On this page I want to show you some of my skills and what I want to accomplish in the future.</p>


        <h3>technical skills:</h3>

        <p>strong:</p>
        <ul>
            <li>Machine learning with Python + Pytorch</li>
            <li>Web dev. with Svelte.js framework</li>
        </ul>
        <p>solid:</p>
        <ul>
            <li>Web dev. + Vue.js</li>
            <li>Backend with Java + Spring boot</li>
            <li>Game dev. with C# + Unity</li>
            <li>Webgl shader programming</li>
            <li>Golang</li>
        </ul>
        
        <p>decent</p>
        
        <ul>
            <li>Rust + web assembly</li>
            <li>Tensorflow</li>
            <li>C</li>
            <li>Haskell</li>
            <li>Lua script language</li>
            <li>Bash script</li>
        </ul>

        <p>Things I want to learn more about</p>

        <ul>
            <li>Rust and high performance systems</li>
            <li>Machinge learning</li>
            <li>Organisation and operation of big software Projects</li>
        </ul>
        <p>
            connect with me: 
            <br>
            <a href="https://x.com/__kormann__">X</a>
            <br>
            <a href="https://github.com/dkormann">github</a>
            <br>
            <a href="https://sciepedia.com/kormann">sciepedia</a>
            <br>
            <a href="mailto:dominikormann@outlook.com">email</a> dominikormann@outlook.com

        </p>
        <br>
        <p>in the following I want to present some software I wrote</p>
    </div>
</div>



<div class=item>
    <canvas class= canvas width=1000 height=1000 ></canvas>
    <div class=itemcontent>

        <h2>Sciepedia</h2>

        <p><a href="https://sciepedia.com">Sciepedia</a> is a notetaking app that makes it easy to create interlinked notes and share them with other users.</p>

    </div>
</div>



<div class=item>
    <canvas class= canvas width=1000 height=1000 ></canvas>
    <div class=itemcontent>

        <h2>Instalingua</h2>

        <p><a href="https://instalingua.com">Instalingua.com</a> was developed as part of a university Project together with <a href="https://github.com/flo-bit">@flo-bit</a> </p>
        <p>The Idea is to employ a chat bot to teach you different languages.</p>
        <p> (On first opening the site it might take a minute since a container is gonna be spun up)</p>

    </div>
</div>

<!-- 

<div class=item>
    <canvas class= canvas width=1000 height=1000 ></canvas>
    <div class=itemcontent>

        <h2>Flai</h2>

        <p><a href="https://dkormann.github.io/flai">Foreign language AI</a> was developed as part of a university Project together with <a href="https://github.com/flo-bit">@flo-bit</a> </p>

    </div>
</div> -->




<div class=item>
    <canvas class= canvas width=1000 height=1000 ></canvas>
    <div class=itemcontent>

        <h2>Monsunbloom</h2>

        <p>This is a website that wants to teach you math in a more modern way. Try it out here: <a href="https://www.monsunbloom.com">Monsunbloom</a> [site might be down at the moment] </p>
        <p>The Idea is that we want to create a feed of small math challenges for the user that are tunes to the current skillset of the student.</p>

        <h3>Software:</h3>

        <p>
            The frontend is a relatively simple svelte application. 
            The core services is the account creation and after that display a feed of math excerices and the corresponding graphics.
            Of course passwords are hashed on the frontend and backend according to industry standards and never stored or transmitted in plain text.
            This project gets compiled down to a static website and is hosted on an ubuntu nginx server.
        </p>

        <p>The backend is a golang project running that exposes all the api routes needed for the frontend. On user login we first verify the credentials and create a temporary user token.
            All subsequent user requests mus be send with this token.
        </p>

        <p>
            The database is a mongodb database that stores all the user data and the math exercises.
        </p>

        <p>
            The data is generated in a python notebook and then stored in the database.
        </p>



    </div>
</div>
