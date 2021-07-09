<template>
  <div class="flex flex-col w-64 ml-4 px-2">
    <div class="flex justify-between">
      <span
        class="
          text-crisiscleanup-grey-900 text-sm
          flex
          items-center
          justify-start
        "
        >{{ $t('svi.most_vulnerable') }}
        <ccu-icon
          v-tooltip="{
            content: $t(`svi.svi_more_info_link`),
            trigger: 'click',
            classes: 'interactive-tooltip w-auto',
          }"
          :alt="$t('actions.help_alt')"
          type="help"
          size="medium"
        />
      </span>
      <span
        class="text-crisiscleanup-grey-900 text-sm items-center justify-start"
        >{{ $t('svi.everyone') }}</span
      >
    </div>
    <div class="range-slider" :title="title || value">
      <input
        class="range-slider__range"
        :class="{ activated: value < 100 }"
        type="range"
        @input="update"
        :value="value"
        min="1"
        max="100"
        step="1"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SviSlider',
  props: {
    value: {
      type: Number,
      default: 100,
    },
    title: {
      type: String,
      default: '',
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
$range-handle-size: 12px !default;
$range-track-height: 8px !default;

.range-slider {
  @apply w-full;
}

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
  -webkit-appearance: none;
  width: 100%;
  height: $range-track-height;
  @apply bg-gradient-to-r from-crisiscleanup-dark-500 to-crisiscleanup-dark-100;
  outline: none;
  padding: 0;
  margin: 0;

  // Range Handle
  &::-webkit-slider-thumb {
    appearance: none;
    width: $range-handle-size;
    height: $range-handle-size;
    box-shadow: 0 0 0 3px white, 0 0 0 6px #dadada;
    border-radius: 50%;
    @apply bg-crisiscleanup-dark-100;
    cursor: pointer;
    transition: background 0.15s ease-in-out;

    &:hover {
      @apply bg-crisiscleanup-dark-100;
    }
  }

  &:active::-webkit-slider-thumb {
    @apply bg-crisiscleanup-dark-100;
  }

  &::-moz-range-thumb {
    width: $range-handle-size;
    height: $range-handle-size;
    border: 0;
    border-radius: 50%;
    @apply bg-crisiscleanup-dark-100;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
    box-shadow: 0 0 0 3px white, 0 0 0 6px #dadada;

    &:hover {
      @apply bg-crisiscleanup-dark-100;
    }
  }

  &:active::-moz-range-thumb {
    @apply bg-crisiscleanup-dark-100;
  }
}

// Firefox Overrides
::-moz-range-track {
  @apply bg-gradient-to-r from-crisiscleanup-dark-500 to-crisiscleanup-dark-100;
  border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer {
  border: 0;
}
</style>
