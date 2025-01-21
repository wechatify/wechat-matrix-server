import BootStrap, { load } from '@braken/bootstrap';
import Http, { HttpGlobalMiddlewares } from '@braken/http';
import Redis from '@braken/ioredis';
import TypeORM from '@braken/typeorm';
import Logger from '@braken/logger';
import HttpTypeormPlugin from '@braken/http-plugin-typeorm';
import CacheServer from '@braken/cache';
import RedisCache from '@braken/cache-ioredis';
import { Props } from './types';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import ApiSDK from './applications/sdk.app';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const __controllers = resolve(__dirname, 'controllers');
const __applications = resolve(__dirname, 'applications');
const __middlewares = resolve(__dirname, 'middlewares');
const __caches = resolve(__dirname, 'caches');
const __services = resolve(__dirname, 'services');

export default (props: Props) => BootStrap(async (ctx, logger) => {
  const env = (props.env || process.env.NODE_ENV || 'production') as Props['env'];
  process.env.NODE_ENV = env;

  Http.set(props.http);
  Redis.set(props.redis);
  ApiSDK.set(props.api);
  TypeORM.set({
    entityPrefix: props.http.keys.join('_') + '_',
    ...props.database,
    entities: [
      resolve(__dirname, './entities/*.entity.{js,ts}'),
    ],
    synchronize: true,
    logging: false,
  });

  await ctx.use(Redis);
  await ctx.use(TypeORM);
  await ctx.use(Logger);

  if (env === 'development') {
    const middlewares = await ctx.use(HttpGlobalMiddlewares);
    middlewares.add('prefix', async (ctx, next) => {
      await next();
      const code = ctx.body?.status || ctx.body?.code || ctx.status || 404;
      logger.http(`[${ctx.method}:${code}] =>`, ctx.url);
    })
  }

  const http = await ctx.use(Http);
  http.use(HttpTypeormPlugin);
  RedisCache.prefix(http.keys.join(':'));
  CacheServer.set([await ctx.use(RedisCache)]);

  await ctx.use(CacheServer);
  await http.load(__controllers);

  await load('app', __applications, ctx);
  await load('cache', __caches, ctx);
  await load('ware', __middlewares, ctx);
  await load('service', __services, ctx);

  logger.http('127.0.0.1:' + http.port);
})