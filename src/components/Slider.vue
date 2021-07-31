<template>
  <div class="flex justify-between items-end">
    <span
      class="text-crisiscleanup-grey-900 text-sm flex items-center justify-start mx-1"
      >{{ from }}
    </span>
    <div class="range-slider mx-2 mb-1" :title="value">
      <input
        class="range-slider__range"
        type="range"
        @input="update"
        :value="value"
        :min="min"
        :max="max"
        :step="step"
      />
    </div>
    <span
      class="text-crisiscleanup-grey-900 text-sm items-center justify-start mx-1"
      >{{ to }}</span
    >
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
  },
  methods: {
    update(e) {
      const { value } = e.target;
      this.$emit('input', Number(value));
    },
  },
};
</script>

<style scoped lang="scss">
// Range Slider
$range-handle-size: 5px !default;
$range-track-height: 3px !default;

.range-slider {
  @apply w-full;
}

.range-slider__range {
  // Range Handle
  &::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 0 5px #61d5f8;
    @apply bg-primary-light;
    &:hover {
      @apply bg-primary-light;
    }
  }

  &:active::-webkit-slider-thumb {
    @apply bg-primary-light;
  }

  &::-moz-range-thumb {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 0 5px #61d5f8;
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
  width: 100%;
  height: $range-track-height;
  background-color: #61d5f8;
  outline: none;
  padding: 0;
  margin: 0;

  // Range Handle
  &::-webkit-slider-thumb {
    appearance: none;
    width: $range-handle-size;
    height: $range-handle-size;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5), 0 0 0 5px #61d5f8;
    border-radius: 50%;
    background-color: #61d5f8;
    cursor: pointer;
    transition: background 0.15s ease-in-out;

    &:hover {
      background-color: #61d5f8;
    }
  }

  &:active::-webkit-slider-thumb {
    background-color: #61d5f8;
  }

  &::-moz-range-thumb {
    width: $range-handle-size;
    height: $range-handle-size;
    border: 0;
    border-radius: 50%;
    background-color: #61d5f8;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.3), 0 0 0 5px #61d5f8;

    &:hover {
      background-color: #61d5f8;
    }
  }

  &:active::-moz-range-thumb {
    background-color: #61d5f8;
  }
}

// Firefox Overrides
::-moz-range-track {
  background-color: #61d5f8;
  border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer {
  border: 0;
}
</style>
