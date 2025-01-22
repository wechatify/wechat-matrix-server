import Logger from "@braken/logger";
import TypeORM from "@braken/typeorm";
import WechatEntity, { WECHAT_STATUS } from "../entities/wechat.entity";
import WechatCache from "../caches/wechat.cache";
import WechatLogsEntity, { WECHAT_ACTIONS } from "../entities/wechat.logs.entity";
import { Application, ApplicationConfigs } from "@braken/application";
import {
  SDK,
  IProxy,
  WechatLoginWithQrcodeCustomRequest,
  WechatPersonalInfoCustomResponse,
  WechatPlatformSDKProps
} from "wechatify-sdk";
import ProxyEntity from "../entities/proxy.entity";

@Application.Injectable
export default class ApiSDK extends Application {
  public readonly instance: SDK;
  static readonly namespace = Symbol('wechatify:sdk');
  static set(options: WechatPlatformSDKProps) {
    ApplicationConfigs.set(ApiSDK.namespace, options);
  }

  @Application.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Application.Inject(Logger)
  private readonly logger: Logger;

  @Application.Inject(WechatCache)
  private readonly WechatCache: WechatCache;

  public initialize() {
    const props: WechatPlatformSDKProps = ApplicationConfigs.get(ApiSDK.namespace);
    const sdk = new SDK(props);
    Object.defineProperty(this, 'instance', { value: sdk });
    this.instance.on('online', (timestamp: number, wxid: string, uuid: string, info: WechatPersonalInfoCustomResponse, meta: WechatLoginWithQrcodeCustomRequest) => {
      this.online(timestamp, wxid, uuid, info, meta).catch(e => this.logger.error(e));
    })
    this.instance.on('offline', (timestamp: number, wxid: string) => {
      this.offline(timestamp, wxid).catch(e => this.logger.error(e));
    })
    this.instance.on('proxy', (timestamp: number, wxid: string, proxy: IProxy) => {
      this.proxy(timestamp, wxid, proxy).catch(e => this.logger.error(e));
    })
    this.instance.on('forbiden', (timestamp: number, wxid: string) => {
      this.forbiden(timestamp, wxid).catch(e => this.logger.error(e));
    })
    this.instance.on('reconnect', (timestamp: number, wxid: string) => {
      this.reconnect(timestamp, wxid).catch(e => this.logger.error(e));
    })
    this.instance.on('remove', (timestamp: number, wxid: string) => {
      this.remove(timestamp, wxid).catch(e => this.logger.error(e));
    })
  }

  private saveLog(id: number, timestamp: number, type: WECHAT_ACTIONS) {
    const Logs = this.typeorm.connection.manager.getRepository(WechatLogsEntity);
    const log = Logs.create();
    log.last_login_time = new Date(timestamp);
    log.status = type;
    log.wechat_id = id;
    return Logs.save(log);
  }

  public async online(timestamp: number, wxid: string, uuid: string, info: WechatPersonalInfoCustomResponse, meta: WechatLoginWithQrcodeCustomRequest) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    let wechat = await Wechat.findOneBy({ wxid });
    if (!wechat) {
      wechat = Wechat.create();
      wechat.wxid = wxid;
    } else {
      if (uuid === wechat.uuid) return wechat;
    }

    let proxy_id = 0;

    if (meta.proxy?.address) {
      const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
      const proxy = await Proxy.findOneBy({ address: meta.proxy.address });
      if (proxy) {
        proxy_id = proxy.id;
      }
    }

    wechat.avatar = info.imgHead;
    wechat.city = info.city;
    wechat.country = info.country;
    wechat.email = info.email;
    wechat.mobile = info.mobile;
    wechat.nickname = info.nickname;
    wechat.province = info.province;
    wechat.sex = info.sex;
    wechat.signature = info.signature;
    wechat.uin = info.uin;
    wechat.status = WECHAT_STATUS.ONLINE;
    wechat.last_login_time = new Date(timestamp);
    wechat.device_id = meta.deviceId;
    wechat.device_name = meta.deviceName;
    wechat.proxy = proxy_id;
    wechat.invalid = false;
    wechat.uuid = uuid;
    wechat = await Wechat.save(wechat);
    await this.saveLog(wechat.id, timestamp, WECHAT_ACTIONS.ONLINE);
    await this.WechatCache.$write({ wxid });
    return wechat;
  }

  private async offline(timestamp: number, wxid: string) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    let wechat = await Wechat.findOneBy({ wxid });
    if (wechat && wechat.status !== WECHAT_STATUS.OFFLINE) {
      wechat.status = WECHAT_STATUS.OFFLINE;
      wechat = await Wechat.save(wechat);
      await this.saveLog(wechat.id, timestamp, WECHAT_ACTIONS.OFFLINE);
      await this.WechatCache.$write({ wxid });
    }
  }

  private async proxy(timestamp: number, wxid: string, proxy: IProxy) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    let wechat = await Wechat.findOneBy({ wxid });
    if (wechat) {
      let proxy_id = 0;
      if (proxy?.address) {
        const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
        const _proxy = await Proxy.findOneBy({ address: proxy.address });
        if (_proxy) {
          proxy_id = _proxy.id;
        }
      }
      wechat.proxy = proxy_id;
      wechat = await Wechat.save(wechat);
      await this.saveLog(wechat.id, timestamp, WECHAT_ACTIONS.PROXY);
      await this.WechatCache.$write({ wxid });
    }
  }

  private async forbiden(timestamp: number, wxid: string) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    let wechat = await Wechat.findOneBy({ wxid });
    if (wechat && wechat.status !== WECHAT_STATUS.FORBIDEN) {
      wechat.status = WECHAT_STATUS.FORBIDEN;
      wechat = await Wechat.save(wechat);
      await this.saveLog(wechat.id, timestamp, WECHAT_ACTIONS.FORBIDEN);
      await this.WechatCache.$write({ wxid });
    }
  }

  private async reconnect(timestamp: number, wxid: string) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    let wechat = await Wechat.findOneBy({ wxid });
    if (wechat) {
      await this.saveLog(wechat.id, timestamp, WECHAT_ACTIONS.RECONNECT);
    }
  }

  private async remove(timestamp: number, wxid: string) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    let wechat = await Wechat.findOneBy({ wxid });
    if (wechat && wechat.invalid !== true) {
      wechat.invalid = true;
      wechat = await Wechat.save(wechat);
      await this.saveLog(wechat.id, timestamp, WECHAT_ACTIONS.REMOVE);
      await this.WechatCache.$write({ wxid });
    }
  }
}