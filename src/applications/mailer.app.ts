import { createTransport } from 'nodemailer'
import { Application, ApplicationConfigs } from '@braken/application';
import { MailProps } from '../types';

@Application.Injectable
export default class Mailer extends Application {
  static readonly namespace = Symbol('mail');
  private transport: ReturnType<typeof createTransport>;
  public from: string;
  static set(options: MailProps) {
    ApplicationConfigs.set(Mailer.namespace, options);
  }
  public async initialize() {
    const configs: MailProps = ApplicationConfigs.get(Mailer.namespace);
    this.transport = createTransport({
      host: configs.host,
      port: configs.port,
      secure: configs.secure,
      auth: configs.auth,
    });
    this.from = configs.auth.user;
  }

  public async send(from: string, to: string, options: {
    subject: string,
    text?: string,
    html?: string,
  }) {
    const msg = await this.transport.sendMail({
      from, to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return msg.messageId;
  }

  public sendTo(to: string, options: {
    subject: string,
    text?: string,
    html?: string,
  }) {
    return this.send(this.from, to, options);
  }
}