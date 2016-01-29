var tomicaPrivate = {}
var url = window.location.href

tomicaPrivate.vm = {
    init: function(){

        // クリックでトミカの色を変える
        tomicaPrivate.vm.carStatusChange = function(mouseEvent){
            if(mouseEvent.target.nodeName=="DIV"){
                var elemPath = "0"
            } else {
                var elemPath = "1"
            }

            if( /\sPos/.test(mouseEvent.path[elemPath].className) ){
                document.getElementById(mouseEvent.path[elemPath].id).className = mouseEvent.path[elemPath].className.replace(/\sPos/,"");
                eval("tomicaPrivate.vm.pos_" + mouseEvent.path[elemPath].id + "(false)")
            } else {
                document.getElementById(mouseEvent.path[elemPath].id).className = mouseEvent.path[elemPath].className + " Pos";
                eval("tomicaPrivate.vm.pos_" + mouseEvent.path[elemPath].id + "(true)")
            }
        }
        
        // todo:140件待つのに時間がかかる。クリックしたらセーブにするか？
        // 現在の状態をDBに保存する
        tomicaPrivate.vm.save = function(){
            //tomicaPrivate.vm.pos_carIdxxを使ってDBを更新するイメージ
            for (var i = 1; i < 141; i++){
                tomicaPrivate.vm.listAll().carData.map(function(carInfo,idx){
                    carInfo.possession = eval("tomicaPrivate.vm.pos_carId" + (idx + 1) +"()")
                })
            }
            
            // 既存ユーザであればPUT、新規であればPOST
            if(tomicaPrivate.vm.userFlag()){
                m.request({
                    method: "PUT",
                    url: url + "api/v1/pos/car",
                    data: tomicaPrivate.vm.listAll()
                }).then(function(putResponce){
                    console.log("PUT")
                    m.request({
                        method: "GET",
                        url: url + "api/v1/pos/car",
                    }).then(function(GetResponce){
                        tomicaPrivate.vm.listAll(GetResponce)
                    })
                })                
            } else {
                m.request({
                    method: "POST",
                    url: url + "api/v1/pos/car",
                    data: tomicaPrivate.vm.listAll()
                }).then(function(putResponce){
                    console.log("POST")
                    m.request({
                        method: "GET",
                        url: url + "api/v1/pos/car",
                    }).then(function(GetResponce){
                        tomicaPrivate.vm.listAll(GetResponce)
                    })
                })                 
            }
            // saveした＝既存ユーザなのでフラグを立てる
            tomicaPrivate.vm.userFlag(true)
            
        }
        
        //公開処理
        tomicaPrivate.vm.publish = function(){
            tomicaPrivate.vm.listAll().publish = true
            m.request({
                method: "PUT",
                url: url + "api/v1/pos/car",
                data: tomicaPrivate.vm.listAll()
            }).then(function(responce){
                console.log("publish!!")
            })    
        }
        
        //非公開処理
        tomicaPrivate.vm.private = function(){
            tomicaPrivate.vm.listAll().publish = false
            m.request({
                method: "PUT",
                url: url + "api/v1/pos/car",
                data: tomicaPrivate.vm.listAll()
            }).then(function(responce){
                console.log("private!!")
            })              
        }
        
        // ページロード時の処理
        tomicaPrivate.vm.listAll = m.prop()
        tomicaPrivate.vm.userFlag = m.prop()
        m.request({
            method: "GET",
            url: url + "api/v1/car",
        }).then(function(defResponce){
            tomicaPrivate.vm.listAll(defResponce)
            m.request({
                method: "GET",
                url: url + "api/v1/pos/car",
            }).then(function(PosResponce){
                if(PosResponce != null ){
                    tomicaPrivate.vm.userFlag(true)
                    tomicaPrivate.vm.listAll(PosResponce)
                } else {
                    console.log("データ未登録ユーザです")
                }
                // 現在の所持状態を記録
                for (var i = 1; i < 141; i++){
                    eval("tomicaPrivate.vm.pos_carId" + i + "= m.prop()")
                    if (tomicaPrivate.vm.userFlag()){
                        eval("tomicaPrivate.vm.pos_carId"+ i + "= m.prop(tomicaPrivate.vm.listAll().carData[i-1].possession)")
                    } else {
                        eval("tomicaPrivate.vm.pos_carId" + i + "= m.prop(false)")    
                    }
                    
                }
            })
        })
    }
}

tomicaPrivate.controller = function(){
    tomicaPrivate.vm.init()
}

tomicaPrivate.view = function () {
    
    var publishCheck = function(){
        if (tomicaPrivate.vm.listAll().publish == true){
            return [
                m("button.btn.btn-default",{
                    onclick:tomicaPrivate.vm.private
                },"非公開"),  
                m("div",{ class:"alert alert-success",role:"alert"},[
                    m("a",{class:"alert-link",href:url + "publish/" + tomicaPrivate.vm.listAll()._id,target:"_blank"},[
                        m("p",url + "publish/" + tomicaPrivate.vm.listAll()._id)
                    ])
                ])
            ]
        } else{
            return [
                m("button.btn.btn-default",{
                    onclick:tomicaPrivate.vm.publish
                },"公開"),             
            ]
        }        
    }
    
    return [
        m("div.header",[
            m("img",{src:document.getElementsByName('photo').item(0).content}),
            m("p",document.getElementsByName('name').item(0).content),
            m("button.btn.btn-default",{
                onclick:tomicaPrivate.vm.save
            },"保存"),
            publishCheck()
        ]),
        tomicaPrivate.vm.listAll().carData.map(function(carInfo,idx){
            if (carInfo.possession == true){
                return [
                    m("div",{class:"col-md-3 col-xs-6"},[
                        m("div",{
                            class:"carInfo thumbnail Pos" ,
                            id:"carId"+(idx + 1),
                            onclick:tomicaPrivate.vm.carStatusChange},[
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
                            onclick:tomicaPrivate.vm.carStatusChange},[
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

m.mount(document.getElementById("private"), {controller: tomicaPrivate.controller, view: tomicaPrivate.view});