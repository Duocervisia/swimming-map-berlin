import $ from "jquery";

export default class Frontend{
    main

    //last one is also default
    legend

    legendElement 

    constructor(main){
        let that = this;
        this.main = main;
        this.legendElement = $('.legend')

        this.legend = this.main.jsonLoader.data.legend;

        let i = 0;
        this.legend.forEach(element => {
            if(element.special){
                that.legendElement.find(".special").append('<div class="legend-element" index="'+ i +'"><div class="ball" style="background-color: '+ element.color +';"></div>: '+ element.typ +'</div>');
            }else{
                that.legendElement.find(".normal").append('<div class="legend-element" index="'+ i +'"><div class="ball" style="background-color: '+ element.color +';"></div>: '+ element.typ +'</div>');
            }
            i++;
        });

        document.title = this.main.jsonLoader.data.html.title;
        document.querySelector("link[rel~='icon']").href = this.main.jsonLoader.data.html.favicon

        this.setEvents()
    }
    updateElements(){
        let i = 0;
        this.legend.forEach(element => {
            if(element.enabled){
                $(".legend-element[index="+i+"]").removeAttr("disabled")
            }else{
                $(".legend-element[index="+i+"]").attr("disabled", "")
            }
            i++;
        });
    }
    setEvents(){
        let that = this;
        $(".legend-element").on( "click", function() {
            that.legend[$( this ).attr("index")].enabled = !that.legend[$( this ).attr("index")].enabled;
            that.main.mapBuilder.selectorChanged();
            that.updateElements();
        });
        $('.arrow-down').on('click', function() {
            if ($(this).hasClass("active")) {
                $(".stats-content-wrapper").attr("disabled", "")
            }else{

                $(".stats-content-wrapper").removeAttr("disabled")
            }
            $(this).toggleClass('active');

        });
        $('.arrow.left').on('click', function() {
            if(that.main.mapBuilder.shortestPeopleDistanceIndex === null){
                that.main.mapBuilder.shortestPeopleDistanceIndex = 0;
            }else if(that.main.mapBuilder.shortestPeopleDistanceIndex === 0){
                that.main.mapBuilder.shortestPeopleDistanceIndex = that.main.mapBuilder.shortestPeopleDistance.length - 1;
            }else{
                that.main.mapBuilder.shortestPeopleDistanceIndex -= 1;
            }
        
            that.main.mapBuilder.triggerPointerMoveEvent();
        });
        $('.arrow.right').on('click', function() {
            if(that.main.mapBuilder.shortestPeopleDistanceIndex === null){
                that.main.mapBuilder.shortestPeopleDistanceIndex = 0;
            }else if(that.main.mapBuilder.shortestPeopleDistanceIndex + 1 === that.main.mapBuilder.shortestPeopleDistance.length){
                that.main.mapBuilder.shortestPeopleDistanceIndex = 0;
            }else{
                that.main.mapBuilder.shortestPeopleDistanceIndex += 1;
            }
            $('.count-index-to-visit').text(that.main.mapBuilder.shortestPeopleDistanceIndex+1)

            that.main.mapBuilder.triggerPointerMoveEvent();
        });
    }
    getColorByType(typ){
        let color = null;
        this.legend.forEach(element => {
            if(element.typ == typ){
                color = element.color
            }
        });
        if(color === null){
            color = this.legend[this.legend.length - 1].color
        }
        return color;
    }
    getColorByTypeAttribute(attribute){
        let color = null;
        this.legend.forEach(element => {
            if(element[attribute] !== undefined && element[attribute]){
                color = element.color
            }
        });
        return color;

    }
    isTypeAttributeEnabled(attribute){
        let enabled;
        this.legend.forEach(element => {
            if(element[attribute] !== undefined && element[attribute]){
                enabled = element.enabled
            }
        });
        return enabled;
    }
    isTypeEnabled(typ){
        let enabled;
        this.legend.forEach(element => {
            if(element.typ == typ){
                enabled = element.enabled
            }
        });
        if(enabled === undefined){
            enabled = this.legend[this.legend.length - 1].enabled
        }
        return enabled;
    }
}