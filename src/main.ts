export {}

import { htmlElement } from "./html";
import {topics as topicsData, content as contentData, topics as topicData, Topic, Content} from "./content"
import { Vector, PosRel, addRenderer, render, Resolution, PosOffset, ResGlobal, vector, FragPos, PosAbs, Input } from "./shader";

const body = document.body as HTMLBodyElement
 

body.appendChild(htmlElement('h1', 'homepage', ''))
body.appendChild(htmlElement('h2', 'dominik kormann', ''))
body.appendChild(htmlElement('h3', 'I simply love software.', ''))
const search = htmlElement('input', '', 'search') as HTMLInputElement
search.placeholder = "Search for topics"
body.appendChild(search)


const mainCanvas = htmlElement('canvas', '', 'mainRender') as HTMLCanvasElement
body.appendChild(mainCanvas)


const Time = new Input(1)

let pos = PosAbs.sub(ResGlobal.div(2)).div(ResGlobal.min().div(2))

let basecol1 = new Input(3)
let basecol2 = new Input(3)
let basecol3 = new Input(3)


const colchange = (e: {matches: boolean}) =>{
  if (e.matches){
    basecol1.set(.0,.0,.4)
    basecol2.set(.2,.0,.0)
    basecol3.set(.0,.0,.0)
  }else{
    basecol1.set(.5,.5,.9)
    basecol2.set(.5,.9,.5)
    basecol3.set(.9,.9,.9)
  }
}

colchange(window.matchMedia("(prefers-color-scheme: dark)"))

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", colchange)


pos = vector(
  pos.fields.x.atan(pos.fields.y),
  pos.length().log().sub(Time.div(2)),
)


for (let i = 0; i < 10; i++) {
  pos = pos.add(pos.fields.yx.mul(1+i, 2+i).sin().div(2+i))
}

let sig = vector(0,1,2).add(pos.fields.x).sin().square()

const mixcolor = (signal:Vector, col1:Vector, col2:Vector, col3:Vector) =>{
  const sig = signal.normalize()
  return col1.mul(sig.fields.x).add(col2.mul(sig.fields.y)).add(col3.mul(sig.fields.z))
}

addRenderer(mainCanvas, mixcolor(sig, basecol1, basecol2, basecol3))


const topicbox = (color:string, topic:string, content:string) =>{

  const box = htmlElement('div', '', 'topicbox')
  const canvas = htmlElement('canvas', '', 'topicshader') as HTMLCanvasElement

  let col = mixcolor(sig, basecol2, basecol1, basecol3)


  addRenderer(canvas, col)
  box.appendChild(canvas)
  box.style.backgroundColor = color
  box.appendChild(htmlElement('h2', topic, ''))
  return box
}

const topics = htmlElement('div', '', 'topics', {
  children:Object.entries(topicsData).map((top, i)=>{
    return topicbox("", top[0], "content")
  })
})

body.appendChild(topics)


const contentSection = (title:string, content:string) =>{
  const el = htmlElement('div', '', 'contentSection')
  el.appendChild(htmlElement('h2', title, ''))
  return el
}




Object.entries(contentData).forEach(([title, content]) => {
  body.appendChild(contentSection(title, content.content))
})



const update = (time:number)=>{
  Time.set(time/ 1000)
  render()
  requestAnimationFrame(update)
}

update(0)
