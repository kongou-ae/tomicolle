var tomicaPublish = {}

var url = window.location.origin + "/"

tomicaPublish.vm = {
    init: function(){

        var xhrConfig = function(xhr) {
            xhr.setRequestHeader("tomicaPublishId", document.getElementsByName('publishId').item(0).content);
        }

        tomicaPublish.vm.listAll = m.prop()
        m.request({
            method: "GET",
            url: url + "api/v1/pos/car/publish",
            config: xhrConfig
        }).then(function(responce){
            tomicaPublish.vm.listAll(responce)
            console.log("res")
        })
    }
}

tomicaPublish.controller = function(){
    tomicaPublish.vm.init()
}

tomicaPublish.view = function () {
    
    return [
        tomicaPublish.vm.listAll().carData.map(function(carInfo,idx){
            if (carInfo.possession == true){
                return [
                    m("div",{class:"col-md-3 col-xs-6"},[
                        m("div",{
                            class:"carInfo thumbnail Pos" ,
                            id:"carId"+(idx + 1),
                            onclick:tomicaPublish.vm.carStatusChange},[
                                m("h2",idx+1),
                                m("div.caption",[
                                    m("p",carInfo.name)
                                ]),  
                                m("img",{src:carInfo.image}),
                        ])
                    ])
                ]
            } else {
                return [
                    m("div",{class:"col-md-3 col-xs-6"},[
                        m("div",{
                            class:"carInfo thumbnail" ,
                            id:"carId"+(idx + 1),
                            onclick:tomicaPublish.vm.carStatusChange},[
                                m("h2",idx+1),
                                m("div.caption",[
                                    m("p",carInfo.name)
                                ]),  
                                m("img",{src:carInfo.image}),                        
      
                        ])
                    ])
                ]
            }
        })
    ]
}

m.mount(document.getElementById("publish"), {controller: tomicaPublish.controller, view: tomicaPublish.view});