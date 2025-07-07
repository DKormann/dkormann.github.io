// functional glue to persistant storage
// only the main store is saved in the local storage of the browser

export type Store = {
  get:(key:string)=>any|null,
  set:(key:string, value:any)=>Store
}

class PersistantStore {
  private _is_main:boolean
  private _side_store:Map<string,string>|null
  constructor(_is_main:boolean, _side_store:Map<string,string>|null){
    this._is_main = _is_main
    this._side_store = _side_store
  }

  public get = (key:string):any|null =>{
    const val:string = this._is_main? localStorage.getItem('sciepedia'+key) || 'null': this._side_store?.get(key) || 'null'
    if (!this._is_main && !this._side_store) throw new Error('side store not initialized')
    return JSON.parse(val)
  }

  public set = (key:string, value:any):PersistantStore =>{
    const val = JSON.stringify(value, (k,v)=>k=='id'?undefined:v)
    if (this._is_main){
      localStorage.setItem('sciepedia'+key, val)
      this._is_main = false
      this._side_store = new Map()
      return new PersistantStore(true, null)
    }
    if (this._side_store){
      console.error('WARNING: side store initialized')
      const mapcopy = new Map(this._side_store)
      return new PersistantStore(false, mapcopy.set(key, val))
    } else throw new Error('side store not initialized')
  }
}

class TestStore {
  private _store:Map<string,any>
  constructor(){
    this._store = new Map()
  }

  public get = (key:string):any|null =>{
    return this._store.get(key) || null
  }

  public set = (key:string, value:any):TestStore =>{
    const mapcopy = new Map(this._store)
    return new TestStore().setStore(new Map(mapcopy.set(key, value)))
  }

  public setStore = (store:Map<string,any>):TestStore =>{
    this._store = store
    return this
  }
}

export const store:Store = new PersistantStore(true, null)
export const teststore:Store = new TestStore()