// @ts-nocheck
import castv2Cli from "castv2-client";
import { CiderCastController } from "./castcontroller.js";

const Application = castv2Cli.Application;
const MediaController = castv2Cli.MediaController;

export class CiderReceiver extends Application {
  // FE96A351
  // 27E1334F
  public APP_ID = "FE96A351";

  constructor(_client: unknown, _session: unknown) {
    super();
    super.apply(this, arguments);

    this.media = this.createController(MediaController);
    this.mediaReceiver = this.createController(CiderCastController);

    this.media.on("status", onstatus);

    var self = this;

    function onstatus(status: string) {
      self.emit("status", status);
    }
  }

  getStatus(callback: unknown) {
    this.media.getStatus.apply(this.media, arguments);
  }

  load(media: unknown, options: unknown, callback: unknown) {
    this.media.load.apply(this.media, arguments);
  }

  play(callback: unknown) {
    this.media.play.apply(this.media, arguments);
  }

  pause(callback: unknown) {
    this.media.pause.apply(this.media, arguments);
  }

  stop(callback: unknown) {
    this.media.stop.apply(this.media, arguments);
  }

  seek(currentTime: unknown, callback: unknown) {
    this.media.seek.apply(this.media, arguments);
  }

  queueLoad(items: unknown, options: unknown, callback: unknown) {
    this.media.queueLoad.apply(this.media, arguments);
  }

  queueInsert(items: unknown, options: unknown, callback: unknown) {
    this.media.queueInsert.apply(this.media, arguments);
  }

  queueRemove(itemIds: unknown, options: unknown, callback: unknown) {
    this.media.queueRemove.apply(this.media, arguments);
  }

  queueReorder(itemIds: unknown, options: unknown, callback: unknown) {
    this.media.queueReorder.apply(this.media, arguments);
  }

  queueUpdate(items: unknown, callback: unknown) {
    this.media.queueUpdate.apply(this.media, arguments);
  }

  sendIp(opts: unknown) {
    this.mediaReceiver.sendIp.apply(this.mediaReceiver, arguments);
  }

  kill(opts: unknown) {
    this.mediaReceiver.kill.apply(this.mediaReceiver, arguments);
  }
}
