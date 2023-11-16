import $ from "jquery";

export default class Frontend{
    main

    //last one is also default
    legend = [
        {
            typ: "Menschen",
            color: "#ffa500aa",
            enabled: true,
            special: true
        },
        {
            typ: "Besucht",
            color: "#00E626aa",
            enabled: true,
            special: true
        },
        {
            typ: "Am nächsten Unbesucht",
            color: "#ff0000aa",
            enabled: true,
            special: true
        },
        {
            typ: "Hallenbad",
            color: "#00FFFFaa",
            enabled: true,
            special: false
        },
        {
            typ: "Kombibad",
            color: "#e337deaa",
            enabled: true,
            special: false
        },
        {
            typ: "Freibad",
            color: "#9999FFaa",
            enabled: true,
            special: false
        },
        {
            typ: "See",
            color: "#1940FFaa",
            enabled: true,
            special: false
        },
    ]

    legendElement 

    constructor(main){
        let that = this;
        this.main = main;
        this.legendElement = $('.legend')

        let i = 0;
        this.legend.forEach(element => {
            if(element.special){
                that.legendElement.find(".special").append('<div class="legend-element" index="'+ i +'"><div class="ball" style="background-color: '+ element.color +';"></div>: '+ element.typ +'</div>');
            }else{
                that.legendElement.find(".normal").append('<div class="legend-element" index="'+ i +'"><div class="ball" style="background-color: '+ element.color +';"></div>: '+ element.typ +'</div>');
            }
            i++;
        });

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
            that.main.berlinMap.selectorChanged();
            that.updateElements();
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