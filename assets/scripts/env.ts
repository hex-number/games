// assets/scripts/config/env.ts

type EnvType = 'dev' | 'test' | 'prod';

const ENV: EnvType = 'dev'; // 👈 你可以手动切换或用构建脚本生成

const EnvConfig = {
  dev: {
    HTTP_URL: 'http://localhost:11000',
    WS_URL: 'ws://localhost:11000/stomp'
  },
  test: {
    HTTP_URL: 'http://localhost:11000',
    WS_URL: 'ws://localhost:11000/stomp'
  },
  prod: {
    HTTP_URL: 'http://39.106.137.189:11000',
    WS_URL: 'ws://39.106.137.189:11000/stomp'
  }
};

export const HTTP_URL = EnvConfig[ENV].HTTP_URL;
export const WS_URL = EnvConfig[ENV].WS_URL;
