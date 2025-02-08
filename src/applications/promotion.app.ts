import axios from 'axios';
import { Application } from "@braken/application";
import ApiSDK from "./sdk.app";

@Application.Injectable
export default class Promotion extends Application {
  @Application.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  public async initialize() {
    // const token = Date.now().toString();
    // const members = await this.sdk.instance.promotion.members('plmes3', token);
    // console.log('members:', members);
    // const session = await this.sdk.instance.promotion.scan('plmes3', token);
    // console.log('session:', session);

    // const promotion = this.sdk.instance.promotion.use('plmes3');
    // promotion.setSession('BgAAE+UD1LENW0STxRYdDF/ltOrHcuXFO9qjY1CQsww3yvf1ZOoq5HuZY9mIXAVQKWJv0A72/5NEzW2YkbmmKhbeb1xlwYNjskwqw30Bt9o=');
    // promotion.on('session', session => console.log('+', session));
    // const res = await promotion.post('/promote/api/web/transfer/MMFinderPromotionLiveDspApiSvr/searchLivePromotionOrderList?_rid=67a59cf4-985277x7&_vid=24c194e0-770c6ee', {
    //   exportIds: [],
    //   page: 1,
    //   pageSize: 20,
    //   sortField: 1,
    //   sortOrder: 0,
    // })
    // console.log(res);
  }
}