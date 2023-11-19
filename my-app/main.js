import './style.css';
import './arrow.css';
import JsonLoader from './jsonLoader.js'

export default class Main{
  frontend
  berlinMap
  jsonLoader

  constructor(){
    this.jsonLoader = new JsonLoader(this);
  }
}
new Main();