const createReport = (template) => {
  if (!template) throw new Error('required argument "template" is not passed');

  const cache = new Map();

  const isDynamic = (prop) => typeof template[prop] === 'function';

  const proxy = new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (cache.has(prop)) return cache.get(prop);

        const field = template[prop];

        const value = isDynamic(prop) ? field(proxy) : field;

        cache.set(prop, value);

        return value;
      },
      set(target, prop, value, receiver) {
        cache.set(prop, value);

        return true;
      },
    }
  );

  return proxy;
};

module.exports = {
  createReport,
};
