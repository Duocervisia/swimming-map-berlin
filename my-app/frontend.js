import $ from "jquery";

export default class Frontend{

    //last one is also default
    legend = [
        {
            typ: "Menschen",
            color: "#ffa500",
            enabled: true
        },
        {
            typ: "Besucht",
            color: "#00E626",
            enabled: true
        },
        {
            typ: "Am nächsten Unbesucht",
            color: "#ff0000",
            enabled: true
        },
        {
            typ: "Hallenbad",
            color: "#00FFFF",
            enabled: true
        },
        {
            typ: "Kombibad",
            color: "#e337de",
            enabled: true
        },
        {
            typ: "Freibad",
            color: "#9999FF",
            enabled: true
        },
        {
            typ: "See",
            color: "#1940FF",
            enabled: true
        },
    ]

    legendElement 

    constructor(){
        let that = this;
        this.legendElement = $('.legend')

        let i = 0;
        this.legend.forEach(element => {
            that.legendElement.append('<div class="legend-element" index="'+ i +'"><div class="ball" style="background-color: '+ element.color +';"></div>: '+ element.typ +'</div>');
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
}