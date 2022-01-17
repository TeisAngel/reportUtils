const createReport = (template) => {
  if (!template) throw new Error('required argument "template" is not passed');

  const cache = new Map();

  const isDynamic = (prop) => typeof template[prop] === 'function';

  const dependencyMap = new Map();

  const effects = [];

  const track = (dep) => {
    if (effects.length === 0) return;

    const prop = effects[effects.length - 1];

    if (!dependencyMap.has(dep)) dependencyMap.set(dep, new Set());

    dependencyMap.get(dep).add(prop);
  };

  const dropCache = key => {
    const dependencies = Array.from(dependencyMap.get(key) || []);

    const toDelete = new Set(dependencies);

    while (dependencies.length > 0) {
      const key = dependencies.pop();

      if (dependencyMap.has(key)) {
        const values = dependencyMap.get(key);

        dependencies.push(...values);
        toDelete.add(...values);
      }
    }

    console.log('Deleting cache for', toDelete);

    toDelete.forEach(key => {
      cache.delete(key);
    })
  }

  const proxy = new Proxy(
    {},
    {
      get(target, prop, receiver) {
        track(prop);

        if (cache.has(prop)) return cache.get(prop);

        effects.push(prop);

        const field = template[prop];

        let value;

        if (isDynamic(prop)) {
          value = field(proxy);
        } else {
          value = field;
        }

        cache.set(prop, value);

        effects.pop();

        return value;
      },
      set(target, prop, value, receiver) {
        if (isDynamic(prop)) {
          throw new Error(`Dynamic field "${prop}" cannot be set`);
        }

        cache.set(prop, value);

        dropCache(prop);

        return true;
      },
    }
  );

  return proxy;
};

module.exports = {
  createReport,
};
