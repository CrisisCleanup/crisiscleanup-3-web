<template>
  <component
    :is="linked ? 'div' : 'base-button'"
    :class="`flex items-center base-icon ${iconSelector} ${
      withText ? 'with-text' : ''
    } `"
    :title="alt || title"
    :alt="alt || title"
    :action="action"
    :ccu-event="ccuEvent"
  >
    <img
      v-if="!fa"
      :class="[iconClasses, styles]"
      :style="cssVars"
      :src="iconMap[type]"
      :alt="alt || title"
    />
    <font-awesome-icon
      v-else
      :class="[iconClasses, styles]"
      :style="cssVars"
      :icon="type"
      :alt="alt || title"
      :size="size"
    />
    <slot></slot>
  </component>
</template>

<script lang="ts">
import { kebabCase } from 'lodash';
import type { PropType } from 'vue';
import { computed, defineComponent, ref } from 'vue';
import type { ICON_SIZES, ICONS } from '../constants';
import { ICON_MAP } from '../constants';

type IconSize = (typeof ICON_SIZES)[number];

export default defineComponent({
  name: 'BaseIcon',

  props: {
    type: {
      type: String as PropType<(typeof ICONS)[keyof typeof ICONS]>,
      default: '',
    },
    fa: {
      type: Boolean,
      default: false,
    },
    alt: {
      type: String,
      default: 'button',
    },
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<IconSize>,
      default: '',
    },
    selector: {
      type: String,
      default: '',
    },
    withText: {
      type: Boolean,
      default: false,
    },
    invertColor: {
      type: Boolean,
      default: false,
    },
    linked: {
      type: Boolean,
      default: false,
    },
    iconClasses: {
      type: String,
      default: '',
    },
    action: {
      type: Function as PropType<() => any>,
      default() {},
    },
    width: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const iconSelector = computed(
      () => props.selector || `js-${kebabCase(props.alt)}`,
    );

    const iconMap = ref(ICON_MAP);

    const styles = computed(() => {
      return {
        'ccu-icon': true,
        'cursor-pointer': true,
        large: ['lg', 'large'].includes(props.size),
        medium: ['md', 'medium'].includes(props.size),
        small: ['sm', 'small'].includes(props.size),
        tiny: props.size === 'tiny',
        xs: props.size === 'xs',
        xxs: props.size === 'xxs',
        xl: props.size === 'xl',
        text: props.withText === true,
        inverted: props.invertColor === true,
      };
    });

    const cssVars = computed(() => {
      const style = {};

      if (props.width) {
        style['--width'] = `${props.width}px`;
      }

      if (props.height) {
        style['--height'] = `${props.height}px`;
      }

      return style;
    });

    return {
      iconSelector,
      iconMap,
      styles,
      cssVars,
    };
  },
});
</script>

<style scoped>
.ccu-icon {
  width: var(--width, 30px);
  height: var(--height, 30px);
}
.ccu-icon.medium {
  height: 20px;
  width: 20px;
}
.ccu-icon.xl {
  height: 35px;
  width: 35px;
}
.ccu-icon.small {
  height: 16px;
  width: 16px;
}
.ccu-icon.tiny {
  height: 13px;
  width: 13px;
}
.ccu-icon.xs {
  height: 10px;
  width: 10px;
}

.ccu-icon.xxs {
  height: 7px;
  width: 7px;
}

.ccu-icon.inverted {
  filter: brightness(0) invert(1);
}

.base-icon.with-text p {
  @apply pl-2;
}

.filter-gray {
  filter: invert(84%) sepia(0%) saturate(30%) hue-rotate(209deg)
    brightness(107%) contrast(90%);
}
.filter-yellow {
  filter: invert(92%) sepia(21%) saturate(3995%) hue-rotate(346deg)
    brightness(98%) contrast(106%);
}

img {
  max-width: fit-content;
}
</style>
