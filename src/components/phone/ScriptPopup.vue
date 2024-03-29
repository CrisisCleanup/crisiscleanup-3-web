<template>
  <div class="script" ref="script">
    <div
      :class="`script--wrapper ${checkState ? 'dismiss' : ''}`"
      :style="{ backgroundColor: scriptColor }"
    >
      <div class="script-body">
        <div class="info">
          <base-text variant="h4">{{
            $t('homeVue.phone_or_website')
          }}</base-text>
          <base-text variant="h4">{{
            $t('phoneDashboard.disaster_distress_helpline')
          }}</base-text>
        </div>

        <div class="main h-100 flex flex-col text-center">
          <div class="title">
            <base-text variant="h1" weight="700"
              >{{ $t('phoneDashboard.inbound_script') }}
              {{ $t('phoneDashboard.outbound_script') }}
              {{ $t('phoneDashboard.calldown_script') }}
            </base-text>
          </div>
          <div class="body">
            <base-text>
              {{ $t(script) }}
            </base-text>
          </div>
        </div>

        <div class="action">
          <base-checkbox :checked="checkState" @change="onChange" />
          <base-text>{{ $t('phoneDashboard.do_not_show_again') }}</base-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { UserMixin, LocalStorageMixin, IncidentMixin } from '@/mixins';

export default {
  name: 'ScriptPopup',
  mixins: [UserMixin, LocalStorageMixin, IncidentMixin],
  data() {
    return {
      checkState: false,
    };
  },
  props: {
    script: VueTypes.string,
    scriptColor: VueTypes.string,
    active: VueTypes.string.def(false),
  },
  methods: {
    onChange(value) {
      this.checkState = value;
      this.setLocalStorage('ccu-ivr-hide-script', this.checkState);
      if (this.checkState) {
        this.animateScript(false);
        this.$emit('dismissed', this.checkState);
      }
    },
    animateScript(direction) {
      const animParams = [
        [{ transform: 'translateY(-16rem)' }, { display: 'none' }],
        {
          duration: 300,
          fill: 'forwards',
          direction: direction ? 'normal' : 'reverse',
        },
      ];
      this.$refs.script.animate(...animParams);
    },
  },
  async mounted() {
    this.checkState = !this.active;
    if (this.checkState) {
      this.$emit('dismissed', this.checkState);
      this.animateScript(false);
    } else {
      this.animateScript(true);
    }
  },
};
</script>

<style lang="postcss" scoped>
$neg-body-x-pad: calc(0rem - theme('spacing.6'));

.script {
  @apply bg-crisiscleanup-light-grey h-32;
  z-index: 999;
  position: absolute;
  top: 0;
  width: 100%;

  &--wrapper {
    transition: 1s ease;
    @apply h-32 shadow-lg;
    position: absolute;
    top: 0;
    left: 0;
    border-top: 1px solid;
    width: 100%;
    margin: 0;
  }

  &-body {
    @apply h-full px-6;
    display: flex;
    flex-grow: 1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .action {
      display: flex;
      align-self: flex-end;
      justify-self: flex-end;
    }

    .body p {
      @apply text-xl;
    }

    .main .title p {
      @apply text-3xl;
    }
  }

  &--tab {
    background-color: red;
    position: absolute;
    bottom: 0;
    left: 50%;
  }
}
</style>
