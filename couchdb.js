// 環境変数からサービス一覧を取得し、認証情報をセット
if (process.env.VCAP_SERVICES){
  var services = JSON.parse(process.env.VCAP_SERVICES);
} else {
  var services = require('./VCAP_Services.json')
}

if (services['cloudantNoSQLDB']) {
  var svc = services['cloudantNoSQLDB'][0].credentials;
  var service_url = svc.url;
  var service_host = svc.host;
  var service_username = svc.username;
  var service_password = svc.password;  
}

var nano = require('nano')(service_url)
var Db = nano.use('tomica_collection')

// CRUDのC　新規ドキュメントを作成する
exports.create = function(req, res) {
  var uid = req.user.uid;
  var content = req.body;
  content.uid = uid;
  Db.insert(content, function(err, body) {
    if (err){
      console.log("create error!!! " + err)
    }
    res.send();
  });
};

// CRUDのR　uidに紐づくデータを読み取り
exports.read = function(req, res) {
  var uid = req.user.uid;
  Db.view('search','uid',{ keys: [uid],include_docs: true},function(err, body) {
    if (err){
      console.log("read error!!! " + err)
    }
    res.send(JSON.stringify(body.rows[0].doc));
  });
};

// CRUDのU 既存ドキュメントをを更新する
exports.update = function(req, res) {
  var content = req.body;
  var _id = content._id
  var _rev = content._rev

  Db.insert(content,{'id': _id, '_rev':_rev,}, function(err, result) {
    console.log('update error!!! '+err)
    res.send(result);
  });
};

// 更新フラグの立っているデータだけを読み出す処理
exports.publish = function(req, res) {
  var _id = String(req.headers.tomicapublishid)
  Db.view('search','_id',{ keys: [_id], include_docs: true},function(err, body) {
    if (err){
      console.log("read error!!! " + err)
    }
    console.log(body.rows[0].doc.publish)
    if (body.rows[0].doc.publish == true){
      res.send(JSON.stringify(body.rows[0].doc));
    } else {
      res.send("this id is not published");
    }
  });
}