//@ts-nocheck
var util = require("util");
// var debug       = require('debug')('castv2-client');
var Application = require("castv2-client").Application;
var MediaController = require("castv2-client").MediaController;
var CiderCastController = require("./castcontroller");

function CiderReceiver(client, session) {
  Application.apply(this, arguments);

  this.media = this.createController(MediaController);
  this.mediaReceiver = this.createController(CiderCastController);

  this.media.on("status", onstatus);

  var self = this;

  function onstatus(status) {
    self.emit("status", status);
  }
}
// FE96A351
// 27E1334F
CiderReceiver.APP_ID = "FE96A351";

util.inherits(CiderReceiver, Application);

CiderReceiver.prototype.getStatus = function (callback) {
  this.media.getStatus.apply(this.media, arguments);
};

CiderReceiver.prototype.load = function (media, options, callback) {
  this.media.load.apply(this.media, arguments);
};

CiderReceiver.prototype.play = function (callback) {
  this.media.play.apply(this.media, arguments);
};

CiderReceiver.prototype.pause = function (callback) {
  this.media.pause.apply(this.media, arguments);
};

CiderReceiver.prototype.stop = function (callback) {
  this.media.stop.apply(this.media, arguments);
};

CiderReceiver.prototype.seek = function (currentTime, callback) {
  this.media.seek.apply(this.media, arguments);
};

CiderReceiver.prototype.queueLoad = function (items, options, callback) {
  this.media.queueLoad.apply(this.media, arguments);
};

CiderReceiver.prototype.queueInsert = function (items, options, callback) {
  this.media.queueInsert.apply(this.media, arguments);
};

CiderReceiver.prototype.queueRemove = function (itemIds, options, callback) {
  this.media.queueRemove.apply(this.media, arguments);
};

CiderReceiver.prototype.queueReorder = function (itemIds, options, callback) {
  this.media.queueReorder.apply(this.media, arguments);
};

CiderReceiver.prototype.queueUpdate = function (items, callback) {
  this.media.queueUpdate.apply(this.media, arguments);
};

CiderReceiver.prototype.sendIp = function (opts) {
  this.mediaReceiver.sendIp.apply(this.mediaReceiver, arguments);
};

CiderReceiver.prototype.kill = function (opts) {
  this.mediaReceiver.kill.apply(this.mediaReceiver, arguments);
};

module.exports = CiderReceiver;
