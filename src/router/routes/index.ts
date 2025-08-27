const modules = import.meta.glob('./modules/*.ts', { eager: true });
const externalModules = import.meta.glob('./externalModules/*.ts', {
  eager: true
});

function formatModules(_modules: any, result: any[]) {
  Object.keys(_modules).forEach((key) => {
    const defaultModule = _modules[key].default;
    if (!defaultModule) return;
    const moduleList = Array.isArray(defaultModule) ? [...defaultModule] : [defaultModule];
    result.push(...moduleList);
  });
  return result;
}

export const appRoutes: any[] = formatModules(modules, []);

export const appExternalRoutes: any[] = formatModules(externalModules, []);
