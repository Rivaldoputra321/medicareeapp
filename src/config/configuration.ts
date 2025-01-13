import { registerAs } from '@nestjs/config';
import { appConfig } from './app.config';

export default registerAs('config', () => appConfig);