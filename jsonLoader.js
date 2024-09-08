import $ from "jquery";
import mapBuilder from './mapBuilder.js'
import Frontend from './frontend.js'

export default class JsonLoader{
    main
    
    data 
    constructor(main){
        this.main = main;
        this.load();
    }

    async load(){
        let that = this;

        const branch = import.meta.env.VITE_WEBSITE_TYPE || 'bath';
        console.log(import.meta.env)

        const response = await fetch("/" + branch + "/data.json");
        const file = await response.json();

        this.data = file;

        that.main.frontend = new Frontend(that.main);
        that.main.mapBuilder = new mapBuilder(that.main);
        that.main.mapBuilder.load();
    }
}