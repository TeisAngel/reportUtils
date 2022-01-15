const createReport = (template) => {
  if (!template) throw new Error('required argument "template" is not passed');

  const cache = new Map();

  const proxy = new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (cache.has(prop)) return cache.get(prop);

        const value = template[prop](proxy);

        cache.set(prop, value);

        return value;
      },
    }
  );

  return proxy;
};

module.exports = {
  createReport,
};
