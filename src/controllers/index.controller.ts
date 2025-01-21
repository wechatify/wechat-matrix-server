import PlainErrorWare from "../middlewares/plain.ware";
import { Controller } from "@braken/http";

@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(PlainErrorWare)
export default class extends Controller {
  public async response() {
    return Date.now();
  }
}