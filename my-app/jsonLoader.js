import $ from "jquery";
import BerlinMap from './berlinMap.js'
import Frontend from './frontend.js'

export default class JsonLoader{
    main
    
    data 
    constructor(main){
        this.main = main;
        let that = this;

        $.getJSON( "assets/data.json", function( data ) {
            that.data = data
            that.main.frontend = new Frontend(that.main);
            that.main.berlinMap = new BerlinMap(that.main);
            that.main.berlinMap.load();
        });
    }
}