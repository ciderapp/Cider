var util = require("util");
var castv2Cli = require("castv2-client");
var RequestResponseController = castv2Cli.RequestResponseController;

function CiderCastController(client, sourceId, destinationId) {
  RequestResponseController.call(this, client, sourceId, destinationId, "urn:x-cast:com.ciderapp.customdata");
  this.once("close", onclose);
  var self = this;
  function onclose() {
    self.stop();
  }
}

util.inherits(CiderCastController, RequestResponseController);

CiderCastController.prototype.sendIp = function (ip) {
  // TODO: Implement Callback
  let data = {
    ip: ip,
  };
  this.request(data);
};

CiderCastController.prototype.kill = function () {
  // TODO: Implement Callback
  let data = {
    action: "stop",
  };
  this.request(data);
};

module.exports = CiderCastController;
