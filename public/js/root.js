var url = window.location.href
var tomicaRoot = {}

tomicaRoot.vm = {
    init: function(){

        for (var i = 1; i < 141; i++){
            eval("tomicaRoot.vm.car" + i + "= m.prop()")
        }

        tomicaRoot.vm.carStatusChange = function(mouseEvent){
            if(mouseEvent.target.nodeName=="DIV"){
                var elemPath = "0"
            } else {
                var elemPath = "1"
            }

            if( /\sPos/.test(mouseEvent.path[elemPath].className) ){
                document.getElementById(mouseEvent.path[elemPath].id).className = mouseEvent.path[elemPath].className.replace(/\sPos/,"");   
            } else {
                document.getElementById(mouseEvent.path[elemPath].id).className = mouseEvent.path[elemPath].className + " Pos";   
            }
        }

        tomicaRoot.vm.listAll = m.prop()
        m.request({
            method: "GET",
            url: url + "api/v1/car",
        }).then(function(responce){
            tomicaRoot.vm.listAll(responce)
        })

    }
}

tomicaRoot.controller = function(){
    tomicaRoot.vm.init()
}

tomicaRoot.view = function () {
    return [
        tomicaRoot.vm.listAll().carData.map(function(carInfo,idx){
            return [
                m("div",{class:"col-md-3 col-xs-6"},[
                    m("div",{
                        class:"carInfo thumbnail" ,
                        id:"carId"+(idx + 1),
                        onclick:tomicaRoot.vm.carStatusChange},[
                            m("h2",idx+1),
                            m("div.caption",[
                                m("p",carInfo.name)
                            ]),  
                            m("img",{src:carInfo.image}),                        
  
                    ])
                ])
            ]
        })
    ]
}

m.mount(document.getElementById("root"), {controller: tomicaRoot.controller, view: tomicaRoot.view});