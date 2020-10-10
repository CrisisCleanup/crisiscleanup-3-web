import VueLog from '@dreipol/vue-log';
import * as Sentry from '@sentry/browser';
import Vue from 'vue';

const SentryLevelMap = {
  debug: Sentry.Severity.Debug,
  info: Sentry.Severity.Info,
  warn: Sentry.Severity.Info,
  error: Sentry.Severity.Error,
};

const SentryMiddleware = (name) => {
  return (result, { level, config, statements }) => {
    Sentry.addBreadcrumb({
      category: name,
      message: statements.toString ? statements.toString() : '',
      level: SentryLevelMap[level] || Sentry.Severity.Critical,
      data: JSON.parse(JSON.stringify(config.context)),
    });
    return result;
  };
};

export default ({ name, ...params }) => {
  if (!('log' in Vue)) {
    Vue.use(VueLog);
  }
  const opts = {
    name,
    proxy: false,
    middlewares: [
      (result, { statements }) => {
        result.unshift(`[${name}] `);
        return [...result, ...statements];
      },
      SentryMiddleware(name),
    ],
    ...params,
  };

  return Vue.log(opts);
};
