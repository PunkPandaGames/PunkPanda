export type IMode = 'devTest' | 'devMain' | 'buildTest' | 'buildMain' | 'childTest' | 'childMain';


export function getEnv(mode) {
  const config = {
    contractEnv: true, // 
    routerBase: './', //
    viteBase: './', // 
  };

  const BuildEnv = ['buildTest', 'buildMain', 'childTest', 'childMain'];

  if (BuildEnv.includes(mode)) {
    if (['childTest', 'childMain'].includes(mode)) {
      config.routerBase = `/${mode}/`;
      config.viteBase = `/${mode}/`;
    } else {
      config.routerBase = '/';
      config.viteBase = '/';
    }
  } else {
    
  }

  if (['devTest', 'buildTest', 'childTest'].includes(mode)) {
  } else {
    config.contractEnv = false;
  }
  return config;
}
