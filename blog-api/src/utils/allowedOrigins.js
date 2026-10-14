const toMatcher = (pattern) => {
  if (!pattern.includes('*')) return (origin) => origin === pattern;
  const source = pattern
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^.:/]+');
  const regex = new RegExp(`^${source}$`);
  return (origin) => regex.test(origin);
};

const clientUrls = () =>
  (process.env.CLIENT_URL || '').split(',').map((o) => o.trim()).filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return false;
  return clientUrls().some((pattern) => toMatcher(pattern)(origin));
};

module.exports = { clientUrls, isOriginAllowed };
