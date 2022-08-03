import type { ILogger } from 'js-logger';
import Logger from 'js-logger';
import type { Ref } from 'vue';
import { isRef, getCurrentInstance, ref, watch } from 'vue';

/**
 * Create and use logger instance.
 * Defaults to current component displayName.
 * @param title - optional title to use.
 * @author Braden Mars
 */
export const useLogger = (title?: string | Ref<string>): Ref<ILogger> => {
  const _title = isRef(title) ? title : ref(title);
  const vm = getCurrentInstance();
  if (vm && !title) {
    // if no title is provided,
    // use the displayName of the
    // component that execute this hook.
    _title.value = vm.type.name;
  }
  const _logger = ref(Logger.get(_title.value || 'Unknown'));
  watch(_title, (newTitle) => {
    if (newTitle && newTitle !== _title.value) {
      _logger.value = Logger.get(newTitle);
    }
  });
  return _logger;
};

/**
 * NOTE: re-exported as default for components using $log
 * @deprecated Please use useLogger hook
 */
export default () => ({ $log: useLogger() });
