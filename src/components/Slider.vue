<template>
  <div class="flex flex-col" :style="[cssVars]">
    <div class="flex justify-between">
      <span
        class="
          text-crisiscleanup-grey-900 text-sm
          mx-1
          flex
          items-center
          justify-start
        "
      >
        {{ from }}
        <ccu-icon
          v-if="fromTooltip"
          v-tooltip="{
            content: fromTooltip,
            trigger: 'click',
            classes: 'interactive-tooltip w-auto',
          }"
          :alt="$t('actions.help_alt')"
          type="help"
          size="medium"
        />
      </span>
      <div>
        <span
          class="text-crisiscleanup-grey-900 text-sm mx-1 font-bold"
          v-if="title"
          >{{ title }}</span
        >
      </div>
      <span
        class="
          text-crisiscleanup-grey-900 text-sm
          items-center
          justify-start
          mx-1
        "
        >{{ to }}</span
      >
    </div>
    <div class="range-slider mx-2 mb-1" :title="value">
      <input
        class="range-slider__range flex-auto"
        :class="[sliderClass, { activated: value < max }]"
        type="range"
        @input="update"
        :value="value"
        :min="min"
        :max="max"
        :step="step"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Slider',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    from: {
      type: String,
      default: '0',
    },
    to: {
      type: String,
      default: '100',
    },
    primaryColor: {
      type: String,
      default: '#61d5f8',
    },
    secondaryColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0.5)',
    },
    handleSize: {
      type: String,
      default: '5px',
    },
    trackSize: {
      type: String,
      default: '3px',
    },
    sliderClass: {
      type: String,
      default: 'w-84',
    },
    title: {
      type: String,
      default: '',
    },
    fromTooltip: {
      type: String,
      default: null,
      required: false,
    },
  },
  methods: {
    update(e) {
      const { value } = e.target;
      this.$emit('input', Number(value));
    },
  },
  computed: {
    cssVars() {
      return {
        '--primary-color': this.primaryColor,
        '--secondary-color': this.secondaryColor,
        '--handle-size': this.handleSize,
        '--track-size': this.trackSize,
      };
    },
  },
};
</script>

<style scoped lang="scss">
// Range Slider
$handle-size: var(--handle-size);
$track-size: var(--track-size);

$range-handle-size: $handle-size !default;
$range-track-height: $track-size !default;

$primary: var(--primary-color);
$secondary: var(--secondary-color);

.activated.range-slider__range {
  // Range Handle
  &::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px white, 0 0 0 6px #fece09;
    @apply bg-primary-light;
    &:hover {
      @apply bg-primary-light;
    }
  }

  &:active::-webkit-slider-thumb {
    @apply bg-primary-light;
  }

  &::-moz-range-thumb {
    box-shadow: 0 0 0 3px white, 0 0 0 6px #fece09;
    @apply bg-primary-light;
    &:hover {
      @apply bg-primary-light;
    }
  }

  &:active::-moz-range-thumb {
    @apply bg-primary-light;
  }
}

.range-slider__range {
  // Range Handle
  &::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px $secondary, 0 0 0 5px $primary;
    @apply bg-primary-light;
    &:hover {
      @apply bg-primary-light;
    }
  }

  &:active::-webkit-slider-thumb {
    @apply bg-primary-light;
  }

  &::-moz-range-thumb {
    box-shadow: 0 0 0 3px $secondary, 0 0 0 5px $primary;
    @apply bg-primary-light;
    &:hover {
      @apply bg-primary-light;
    }
  }

  &:active::-moz-range-thumb {
    @apply bg-primary-light;
  }
}

.range-slider__range {
  -webkit-appearance: none;
  height: $range-track-height;
  background-color: $primary;
  outline: none;
  padding: 0;
  margin: 0;

  // Range Handle
  &::-webkit-slider-thumb {
    appearance: none;
    width: $range-handle-size;
    height: $range-handle-size;
    box-shadow: 0 0 0 3px $secondary, 0 0 0 5px $primary;
    border-radius: 50%;
    background-color: $primary;
    cursor: pointer;
    transition: background 0.15s ease-in-out;

    &:hover {
      background-color: $primary;
    }
  }

  &:active::-webkit-slider-thumb {
    background-color: $primary;
  }

  &::-moz-range-thumb {
    width: $range-handle-size;
    height: $range-handle-size;
    border: 0;
    border-radius: 50%;
    background-color: $primary;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
    box-shadow: 0 0 0 3px $secondary, 0 0 0 5px $primary;

    &:hover {
      background-color: $primary;
    }
  }

  &:active::-moz-range-thumb {
    background-color: $primary;
  }
}

// Firefox Overrides
::-moz-range-track {
  background-color: $primary;
  border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer {
  border: 0;
}
</style>
