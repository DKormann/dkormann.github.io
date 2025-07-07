export {}

import { htmlElement } from "./html";
import {topics as topicsData, content as contentData, topics as topicData} from "./content"
import { Vector, PosRel, addRenderer, render, Resolution, PosOffset, ResGlobal, vector, FragPos, PosAbs } from "./shader";

const body = document.body as HTMLBodyElement
 

body.appendChild(htmlElement('h1', 'homepage', ''))
body.appendChild(htmlElement('h2', 'dominik kormann', ''))
body.appendChild(htmlElement('h3', 'I simply love software.', ''))
const search = htmlElement('input', '', 'search') as HTMLInputElement
search.placeholder = "Search for topics"
body.appendChild(search)


const mainCanvas = htmlElement('canvas', '', 'mainRender') as HTMLCanvasElement
body.appendChild(mainCanvas)

let R = PosAbs.sub(ResGlobal.div(2)).div(ResGlobal.min().div(2)).length()

{
  let pos = vector(
    Pos
  )

  
  addRenderer(mainCanvas, col)
}


const topicbox = (color:string, topic:string, content:string) =>{

  const box = htmlElement('div', '', 'topicbox')
  const canvas = htmlElement('canvas', '', 'topicshader') as HTMLCanvasElement

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
render()