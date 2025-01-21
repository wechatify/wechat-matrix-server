import Bootstrp from './index';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);
const configs = resolve(__dirname, '../wechat.configs.json');

Bootstrp(require(configs));