
let varcounter = 0;

type UOp = "sin" | "cos" | "tan" | "log" | "exp"
type BOp = "add" | "sub" | "mul" | "div" | "atan" | "pow" | "lt" | "mod"
type TOp = "clamp"


type VecType = 1 | 2 | 3 | 4

type Op = UOp | BOp | TOp | "const" | "uniform" | "varying" | "vec" | "index"

type AST =
  ({op:"uniform", srcs:[], name:string}
  | {op:"varying", srcs:[], name:string}
  | {op: "vec", srcs:AST[]}
  | {op:"index", srcs:[AST], value:number}
  | {op:"const", value:number, srcs:[]}
  | {op:UOp, srcs:[AST]}
  | {op:BOp, srcs:[AST,AST]}
  | {op:TOp, srcs:[AST,AST,AST]}) & {vectype:VecType}


export type veclike = Vector | AST | number | veclike[]

const upcast = (a:AST, vectype:VecType) :AST => {
  if (a.vectype == vectype) return a
  if (a.vectype != 1) throw new Error("upcast not implemented for dtype " + a.vectype + " to " + vectype)
  return {op:"vec", srcs:Array.from({length: vectype}, ()=>a) as AST[], vectype:vectype}
}

const broadcast = (srcs:AST[]) => {
  const vectype = Math.max(...srcs.map(a=>a.vectype)) as VecType
  return {srcs: srcs.map(s=>upcast(s,vectype)), vectype}
}

type field = "x" | "y" | "z" | "w"
type fields = field | `${field}${field}` | `${field}${field}${field}` | `${field}${field}${field}${field}`


class FieldGetter{
  [key:string] : Vector
  constructor(vec:Vector){
    let prox = new Proxy(this, {
      get(target, prop):Vector{
        if (typeof prop == "string"){
          const fields = Array.from(prop).map(x =>x.charCodeAt(0) - "x".charCodeAt(0))
          .filter(x=>x>=0 && x<4)
          .map(x => vec.get(x))
          return vector(...fields)
        }
        throw new Error(`FieldGetter: unknown field: ${prop.toString()}`)
      }
    })
    return prox
  }
}

export const vector = (...args:veclike[]) => gather(args)

const gather = (args:veclike): Vector =>
{
  if (args instanceof Array){
    let vecs = args.map(gather)
    let vsum = vecs.reduce((a,b)=>a + b.vectype, 0)
    if (vsum > 4) throw new Error("gather: too many or too big vectors: " + vecs.map(v=>v.vectype).join(","))
    if (vecs.length == 1) return vecs[0]
    let res = new Vector({op:"vec", srcs:vecs.map(v=>v.ast), vectype:vsum as VecType})
    vecs.forEach(v=>v.parents.forEach(p=>res.parents.add(p)))
    return res
  }
  if (args instanceof Vector) return args
  if (typeof args == "number")args ={op:"const", value:args, vectype:1, srcs:[]} as AST
  return new Vector(args)
}

export class Vector{
  ast:AST
  vectype:VecType
  parents : Set<Vector>
  onclick? : string;

  fields: Record<fields, Vector>

  constructor( ast: AST){
    this.ast = ast
    this.vectype = ast.vectype
    this.fields = new FieldGetter(this) as Record<fields, Vector>
    this.parents = new Set([this])
  }

  static fromVecs(vecs:Vector[], op:Op){
    const {srcs, vectype} = broadcast(vecs.map(v=>v.ast))
    let res = new Vector({op, srcs, vectype} as AST)
    vecs.forEach(v=>v.parents.forEach(p=>res.parents.add(p)))
    return res
  }

  static from(args: veclike[], op:Op){
    const vecs = args.map(gather)
    return Vector.fromVecs(vecs, op)
  }

  sin(){return Vector.from([this], "sin")}
  cos(){return Vector.from([this], "cos")}
  tan(){return Vector.from([this], "tan")}
  log(){return Vector.from([this], "log")}
  exp(){return Vector.from([this], "exp")}

  add(...a:veclike[]){return Vector.from([this, a], "add")}
  sub(...a:veclike[]){return Vector.from([this, a], "sub")}
  mul(...a:veclike[]){return Vector.from([this, a], "mul")}
  lt(...a:veclike[]){return Vector.from([this, a], "lt")}
  div(...a:veclike[]){return Vector.from([this, a], "div")}
  mod(...a:veclike[]){return Vector.from([this, a], "mod")}

  pow(a:veclike){return Vector.from([this, a], "pow")}
  atan(...a:veclike[]){return Vector.from([this, a], "atan")}

  clamp(a:veclike, b:veclike){return Vector.from([this, a, b], "clamp")}
  
  dot(a:veclike){return this.mul(a).sum()}
  abs(){return this.square().sqrt()}
  
  mix(a:veclike, b:veclike){
    let t = this.clamp(0,1)
    return t.mul(a).add((gather(1).sub(t)).mul(b))
  }
  where(a:veclike, b:veclike){return this.lt(0).mix(b,a)}

  get(idx:number){
    if (idx >= this.vectype) throw new Error("index out of bounds")
    let res = new Vector({op:"index", srcs:[this.ast], value:idx, vectype:1})
    this.parents.forEach(p=>res.parents.add(p))
    return res
  }

  length(){return this.square().sum().sqrt()}
  normalize(){return this.div(this.length())}

  reduce(fn:(a:Vector, b:Vector)=>Vector){
    let vec = this.get(0)
    for (let i = 1; i < this.vectype; i++) {
      vec = fn(vec, this.get(i))
    }
    return vec
  }

  gt(other:veclike){return this.lt(other).complement()}
  maximum(other:veclike){
    let t = this.lt(other)
    return t.mul(other).add((vector(1).sub(t)).mul(this))
  }
  minimum(other:veclike){return this.inv().maximum(vector(other).inv()).inv()}
  complement(){return vector(1).sub(this)}

  sum(){return this.reduce((a,b)=>a.add(b))}
  prod(){return this.reduce((a,b)=>a.mul(b))}

  max(){return this.reduce((a,b)=>a.maximum(b))}
  min(){return this.reduce((a,b)=>a.minimum(b))}

  sqrt(){return this.pow(0.5)}
  square(){return this.pow(2)}
  inv(){return this.pow(-1)}
  neg(){return this.mul(-1)}
  sub1(){return vector(1).sub(this)}

  tanh(){
    let e = this.exp()
    let e2 = e.inv()
    return e.sub(e2).div(e.add(e2))
  }

   atanh(){
    return (this.add(1).div(this.sub1())).log().mul(.5)
  }

  sigmoid(){
    return this.neg().exp().add(1).inv() 
  }

  compute(pos:[number,number] = [0,0]):number[]{
    return JsRunner(this)(pos)
  }

  frac(){return this.mod(1)}
  floor(){return this.sub(this.frac())}
  steps(n:veclike){return this.mul(n).floor().div(n)}
}






type ProgramNode = {ast:AST, srcs: ProgramNode[], name:string, usecount: number}

export const  Linearize = (ast:AST) => {
  const nodesmap = new Map<AST, ProgramNode>()
  const nodes: ProgramNode [] = []
  function walkast(ast:AST):ProgramNode{
    if (nodesmap.has(ast)) {
      let res = nodesmap.get(ast)!
      res.usecount += 1
      return res
    }

    const srcs = ast.srcs.map(walkast)
    const name = ast.op == "varying" || ast.op == "uniform" ? ast.name : "x" + nodes.length
    const node = {ast, srcs, name, usecount: 1}
    nodes.push(node)
    nodesmap.set(ast, node)
    return node
  }
  walkast(ast)
  return nodes
}


export const WebGlCompiler = (nodes:ProgramNode[]) =>{

  function rep(node:ProgramNode):string{
    if (node.ast.op == "const" || node.usecount <= 1) return render(node)
    return node.name
  }
  
  function render(node:ProgramNode):string{
    const op = node.ast.op
    if (op == "uniform" || op == "varying") return node.name
    if (op == "const") {
      let res = node.ast.value.toString()
      if (!res.includes(".")) res += ".0"
      return res
    }

    const typ = ["float","vec2","vec3","vec4"][node.ast.vectype-1]


    if (op == "vec") return `${typ}(${node.srcs.map(x=>rep(x)).join(",")})`
    if (op == "index") return `${rep(node.srcs[0])}.${["x","y","z","w"][node.ast.value]}`
    if (op == "add") return `(${rep(node.srcs[0])} + ${rep(node.srcs[1])})`
    if (op == "sub") return `(${rep(node.srcs[0])} - ${rep(node.srcs[1])})`
    if (op == "mul") return `(${rep(node.srcs[0])} * ${rep(node.srcs[1])})`
    if (op == "div") return `(${rep(node.srcs[0])} / ${rep(node.srcs[1])})`
    if (op == "mod") return `mod(${rep(node.srcs[0])}, ${rep(node.srcs[1])})`

    if (op == "lt") return elemwise((a,b)=>`${a} < ${b} ? 1.0 : 0.0`)

    function elemwise(fn:(a:string, b:string)=>string){
      const [a,b] = node.srcs.map(rep)
      if (node.srcs[0].ast.vectype == 1) return `(${fn(a,b)})`
      const parts = []
      for (let i = 0; i < node.srcs[0].ast.vectype; i++) {
        const field = ["x","y","z","w"][i]
        parts.push(`${fn(`${a}.${field}`, `${b}.${field}`)}`)
      }
      return `${typ}(${parts.join(", ")})`
    }

    return `${op}(${node.srcs.map(x=>rep(x)).join(", ")})`
  }

  return nodes.map(n =>{
    if (["uniform","varying", "const"].includes(n.ast.op) || n.usecount <= 1) return ""
    return `${["float","vec2","vec3","vec4"][n.ast.vectype-1]} ${n.name} = ${render(n)};\n`
  }).join("") + "gl_FragColor = " +render(nodes[nodes.length-1]) + ";"
}

export class Input extends Vector{
  value:number[]
  subscribers = new Set<(arg0: number[]) => void>()
  name:string

  constructor(size:VecType){
    const name = "input"+varcounter++
    super({op:"uniform", vectype: size, srcs:[], name})
    this.name = name
    this.value = Array.from({length:size}, ()=>0)
  }

  set(...v:number[]){
    if (v.length != this.vectype) throw new Error("Input.set: wrong number of arguments")
    this.value = v;
    this.subscribers.forEach(s=>s(v))
  }

  subscribe(f:(arg0: number[]) => void){
    f(this.value)
    this.subscribers.add(f)
  }



  update(f: (arg0: number[]) => number[]){
    this.set(...f(this.value))
  }

}

const Varying = (name:string, vectype:VecType) => new Vector({op:"varying", name, vectype, srcs:[]})

export const Resolution = new Input(2)
export const ResGlobal = new Input(2)
export const PosOffset = new Input(2)
export const FragPos = Varying("gl_FragCoord", 4)
export const PosRel = FragPos.fields.xy.div(Resolution)
export const PosAbs = FragPos.fields.xy.add(PosOffset)

ResGlobal.set(window.innerWidth, window.innerHeight)


export const JSCompiler = (vec:Vector) => {

  let nodes = Linearize(vec.ast)

  function rep(node:ProgramNode):string{
    if (node.ast.op == "uniform") return node.name
    if (node.ast.op == "const") return node.ast.value.toString()
    return node.name
  }

  function render(node:ProgramNode):string{
    const op = node.ast.op
    const srcs = node.srcs.map(rep)
    const elem_app = (f:(arg0: string[])=>string)=>{
      let res = []

      if (node.ast.vectype == 1)return f(srcs)
      for (let i = 0; i < node.ast.vectype; i++) {
        res.push(f(srcs.map(s=>`${s}[${i}]`)))
      }
      return `[${res.join(",")}]`
    }

    const app_fn = (fn:string) => elem_app(s=>fn + "(" + s.join(",") + ")")

    switch (op){
      case "uniform":
      case "varying": return node.name
      case "const": return node.ast.value.toString()
      case "vec": return `[${srcs.join(",")}].flat()`
      case "index": return `${render(node.srcs[0])}[${node.ast.value}]`
      case "add": return elem_app(s=>s.join(" + "))
      case "mul": return elem_app(s=>s.join(" * "))
      case "sub": return elem_app(s=>`(${s[0]} - ${s[1]})`)
      case "div": return elem_app(s=>`(${s[0]} / ${s[1]})`)
      case "mod": return elem_app(s=>`(${s[0]} % ${s[1]})`)
      case "pow": return elem_app(s=>`(${s[0]} ** ${s[1]})`)
      case "lt": return elem_app(s=>`(${s[0]} < ${s[1]} ? 1. : 0.)`)
      case "atan": return app_fn("Math.atan2")
      case "sin": return app_fn("Math.sin")
      case "cos": return app_fn("Math.cos")
      case "tan": return app_fn("Math.tan")
      case "log": return app_fn("Math.log")
      case "exp": return app_fn("Math.exp")
      case "clamp": return elem_app(s=>`Math.min(Math.max(${s[0]}, ${s[1]}), ${s[2]})`)
      default:
        throw new Error("JSCompiler: unknown op " + op)
    }
  }


  const codeinner = "  " + nodes.map(n =>{
    if (["uniform", "varying", "const"].includes(n.ast.op)) return ""
    return `const ${n.name} = ${render(n)};\n  `
  }).join("") + "return " +nodes[nodes.length-1].name

  return codeinner
}

export const JsRunner = (vec:Vector) => {
  let inputs = Array.from(vec.parents).filter(v=>v.ast.op == "uniform") as Input[]
  const FN = new Function("gl_FragCoord", ...Array.from(inputs).map(i=>i.name), JSCompiler(vec))   
  return (pos: [number,number]) => (FN(pos,...Array.from(inputs).map(i=>i.value))) as number[]
}

const renderList:(()=>void)[] = []



export const addRenderer = (canvas:HTMLCanvasElement, ...graphs:veclike[])=>{

  let graph = vector(...graphs)

  if (graph.vectype == 1) graph = vector(graph, graph, graph)
  if (graph.vectype == 2) graph = vector(graph, 0)
  if (graph.vectype == 3) graph = vector(graph, 1)

  canvas.addEventListener("click", (e)=>{
    let y = canvas.clientHeight - e.offsetY
    let x = e.offsetX
    graph.parents.forEach(v=>{
      if (v.onclick){console.log(`${v.onclick} = [${v.compute([x,y])}]`);}
    })
  })

  const nodes = Linearize(graph.ast)
  const inputs = Array.from(graph.parents).filter(v=>v.ast.op == "uniform") as Input[]
  const gl = canvas.getContext("webgl2")

  {
    
    if (!gl) throw new Error("webgl not suppported");
    const compileShader = (src: string, type: number): WebGLShader =>{
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader)!);
      }
      return shader;
    }

    const vertexShader = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0, 1);
    }`;
    
    const fragShader  =`
precision mediump float;
${inputs.map(u=>`uniform ${["float","vec2","vec3","vec4"][u.ast.vectype-1]} ${u.name};`).join("\n")}


void main() {

${WebGlCompiler(nodes)}

}`


    

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(vertexShader, gl.VERTEX_SHADER));
    gl.attachShader(program, compileShader(fragShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program)!);
    }
    gl.useProgram(program);

    const posAttrLoc = gl.getAttribLocation(program, "a_position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttrLoc);
    gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

    inputs.forEach(u=>{
      const uf = u.ast as {name:string, vectype:VecType, op:"varying"}
      const loc = gl.getUniformLocation(program, uf.name)
      u.subscribe((v)=>{
        ( (uf.vectype == 1) ? gl.uniform1f(loc, ...(v as[number,])):
          (uf.vectype == 2) ? gl.uniform2f(loc, ...(v as[number,number,])):
          (uf.vectype == 3) ? gl.uniform3f(loc, ...(v as[number,number,number,])):
          gl.uniform4f(loc, ...(v as[number,number,number,number,])));})
    })
  }

  renderList.push(()=>{

    
    const rect = canvas.getBoundingClientRect();
    PosOffset.set(
      // rect.left,
      // rect.top
      rect.left,
      window.innerHeight - rect.top - rect.height,
    )

    // console.log(rect.bottom);
    

    console.log(PosOffset.value);

    console.log(canvas);

    // console.log(canvas);

    console.log(canvas.getBoundingClientRect());
    
    
    
    
    canvas.width = rect.width
    canvas.height = rect.height
    Resolution.set(canvas.width, canvas.height)

    gl.viewport(0,0,canvas.width,canvas.height)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  })
}

export const render = () =>{
  // ResGlobal.set(window.innerWidth, window.innerHeight)

  renderList.forEach(f=>f())
}