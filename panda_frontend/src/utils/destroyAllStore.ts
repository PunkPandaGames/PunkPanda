
export default function destroyAllStore() {
  // 
  const storeFiles = require.context('../store', true, /\S*Store.(ts$|js$)/);

  /**
   * _helpDestroy
   * @param {*} modulesFiles 
   */
  function _helpDestroy(modulesFiles) {
    const stores = modulesFiles.keys().reduce((modules, modulePath) => {
      const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
      const value = modulesFiles(modulePath);
      modules[moduleName] = value.default;
      return modules;
    }, {});

    for (const storeName in stores) {
      if (Object.hasOwnProperty.call(stores, storeName)) {
        const store = stores[storeName];
        store?.()?.$reset?.();
      }
    }
  }

  _helpDestroy(storeFiles);
}
