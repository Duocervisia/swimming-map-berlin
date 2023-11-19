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

        let branch;
        console.log(process)
        if (typeof process !== 'undefined' && process.env && process.env.WEBSITE_TYPE) {
            // Running on the server (Node.js environment)
            branch = process.env.WEBSITE_TYPE;
        } else {
            // Running in the browser
            // You might want to set a default value if process.env.WEBSITE_BRANCH is not available
            branch = 'bath';
        }

        const response = await fetch("/" + branch + "/data.json");
        const file = await response.json();

        this.data = file;

        that.main.frontend = new Frontend(that.main);
        that.main.berlinMap = new mapBuilder(that.main);
        that.main.berlinMap.load();
    }
}