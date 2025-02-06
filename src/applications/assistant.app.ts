import axios from 'axios';
import { Application } from "@braken/application";
import ApiSDK from "./sdk.app";

@Application.Injectable
export default class Assistant extends Application {
  @Application.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  public async initialize() {
    // const res = await this.sdk.instance.assistant.members('plmes3', '123');
    // const finders = res.map(item => item.finderUsername);
    // const s1 = await this.sdk.instance.assistant.scan('plmes3', '123', finders[0]);
    // const req = this.sdk.instance.assistant.use('plmes3', 'v2_060000231003b20faec8c5e58d1ac2d0cc04ed35b0773e0dcaa981a2a9947a6ca3fe4c0b0d7d@finder');
    // req.on('session', session => console.log('+', session));
    // req.setSession('BgAAfmXxOYF3pZMW8j2stsEzzPv/wF1DWuf0ml6rmZqfkVO11VPrDcLO+LX/bDqAQIJXfMit645Aee3xL10ojf4T2ha+T2iuBUSxXnRYRK4=');
    // req.setSession('BgAAD6a3vLyFm5qGsY/Wy9zqeebeL1bMdLAF5FddymXtGbT3Opr3YBGIMhEhM/g2OFvd+bV0ZuDOw0hqEAd/RmGqc1NarIvhMnFJNrVMp58=');
    // const res = await req.post(`/cgi-bin/mmfinderassistant-bin/post/post_list?_rid=${Date.now()}`, {
    //   currentPage: 1,
    //   pageSize: 5,
    //   reqScene: 7,
    //   scene: 7,
    //   timestamp: Math.floor(Date.now() / 1000).toString(),
    //   userpageType: 11,
    //   _log_finder_id: 'v2_060000231003b20faec8c5e58d1ac2d0cc04ed35b0773e0dcaa981a2a9947a6ca3fe4c0b0d7d@finder'
    // })
    // const s = 'BgAAD6a3vLyFm5qGsY/Wy9zqeebeL1bMdLAF5FddymXtGbT3Opr3YBGIMhEhM/g2OFvd+bV0ZuDOw0hqEAd/RmGqc1NarIvhMnFJNrVMp58=';
    // const res = await axios.post(`https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/post/post_list?_rid=${Date.now()}`, {
    //   currentPage: 1,
    //   pageSize: 5,
    //   reqScene: 7,
    //   scene: 7,
    //   timestamp: Math.floor(Date.now() / 1000).toString(),
    //   userpageType: 11,
    //   _log_finder_id: 'v2_060000231003b20faec8c5e58d1ac2d0cc04ed35b0773e0dcaa981a2a9947a6ca3fe4c0b0d7d@finder'
    // }, {
    //   headers: {
    //     Cookie: 'sessionid=' + encodeURIComponent(s),
    //   }
    // })
    // console.log(res);
  }
}