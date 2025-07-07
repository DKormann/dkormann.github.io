

export type Topic = "3 highlights" | "Machine Learning" | "Compilers" | "Blog & Fun"

export type Content = {
  tags: string[],
  content: string
}




export const content:{[key:string]:Content} = {
  "Tinygrad":{
    tags:["Machine Learning", "AI", "Software Infrastructure", "Deep Learning", "Compiler", "Python"],
    content: "working on a deep learning framework"
  },

  "Immorise AI":{
    tags:["AI", "Software Infrastructure", "Deep Learning", "Computer Vision", "Image Processing", "Python", "Architecture"],
    content: "shape generation through token sampling"
  },

  "Sciepedia Website":{
    tags:["Web Development", "Software Infrastructure", "TypeScript", "HTML", "CSS", "Vite", "Database", "Deployment"],
    content: "Obsidian notes with a twist and scripting integration"
  },

  "HVM: parallizing symbolic AI":{
    tags:["AI", "Software Infrastructure", "Symbolic AI", "Parallelization", "GPU", "Compiler", "Haskell"],
    content: "HVM developed by HigherOrderCo.com project is truly impressive in multiple regards: "
  },

  "Shader Play" :{
    tags:["Web Development", "Software Infrastructure", "TypeScript", "Compilers", "HTML", "Deployment"],
    content: "Shaderplay tries to bring shader development into typescript"
  },

  "Panda Farm" :{
    tags:["Web Development", "Software Infrastructure", "TypeScript", "Compilers", "HTML", "Deployment"],
    content: `playing games with a serious infrastructure`
  }

}

export const topics: Record<Topic, Content[]> ={

  "3 highlights": [
    content.Tinygrad,
    content["Immorise AI"],
    content.HVM
  ],
  "Machine Learning": [
    content.Tinygrad,
    content["Immorise AI"],
    content.HVM
  ],

  "Compilers":[
    content.HVM,
    content.Tinygrad,
    // content.Funscript
  ],

  "Blog & Fun": [
    content.HVM,
    content.Tinygrad,
  ],
}
