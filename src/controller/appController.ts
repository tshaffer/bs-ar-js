import HostConfig from '@brightsign/hostconfiguration';

const getHostConfig = (): Promise<string> => {
  const hc = new HostConfig();
  return hc.getConfig()
    .then((config: any) => {
      console.log('config.hostName');
      return Promise.resolve(config['hostName']);
    }).catch((e: any) => {
      console.log('hostConfig.getConfig error: ');
      console.log(e);
      return Promise.resolve('myplayer');
    })
};

const loadPresentationData = (): Promise<any> => {

  let runtimeEnvironment = 'Dev';

  return getHostConfig()
    .then((hostName: string) => {
      if (hostName !== 'myplayer') {
        runtimeEnvironment = 'BrightSign';
      }
      return Promise.resolve(runtimeEnvironment);
    });
  }
