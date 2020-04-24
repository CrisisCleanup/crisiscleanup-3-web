<template>
  <div class="script">
    <div :class="`script--wrapper ${checkState ? 'dismiss' : ''}`">
      <div class="script-body">
        <div class="title">
          <base-text variant="h1" weight="700">{{
            $t('~~A Sample Script would be:')
          }}</base-text>
        </div>
        <div class="body">
          <base-text>
            {{ $t('"Crisis Cleanup Hotline, my name is ') }}
            {{ currentUser.first_name }}
            {{ $t('. How may I help you?"') }}
          </base-text>
        </div>
        <div class="action">
          <base-checkbox :checked="checkState" @change="onChange" />
          <base-text>{{ $t('~~Do not show this again.') }}</base-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UserMixin, LocalStorageMixin } from '@/mixins';
import { template } from 'lodash';
import VueTypes from 'vue-types';

export default {
  name: 'ScriptPopup',
  mixins: [UserMixin, LocalStorageMixin],
  data() {
    return {
      checkState: false,
      // To Aaron: do not localize these,
      // they will not stay hard coded like this.
      scripts: {
        inbound:
          'Crisis Cleanup Hotline. My name is <%= name %>, how may I help you?',
        outbound:
          'My name is <%= name %> from the Crisis Cleanup Hotline. Someone from this number called to ask for help cleanup up after a recent disaster. I am returning your call.',
        covid:
          'My name is <%= name %> from the Crisis Cleanup Hotline. Someone from this number called to ask for help related to COVID-19. I am returning your call.',
        covidPda:
          'My name is <%= name %> from the Crisis Cleanup Hotline. We received a web request for help relating to COVID-19. Do you have a minute to discuss that?',
      },
    };
  },
  props: {
    scriptName: VueTypes.string.def('inbound'),
  },
  methods: {
    onChange(value) {
      this.checkState = value;
      this.setLocalStorage('ccu-ivr-hide-script', true);
      this.$emit('dismissed', this.checkState);
    },
  },
  async mounted() {
    if (this.existsLocalStorage('ccu-ivr-hide-script')) {
      this.$emit('dismissed', this.checkState);
      this.checkState = true;
    }
  },
  computed: {
    currentScript() {
      const script = this.scripts[this.scriptName];
      return template(script, { user: this.currentUser.first_name });
    },
  },
};
</script>

<style scoped lang="scss">
.script {
  @apply w-full bg-crisiscleanup-light-grey h-32;
  z-index: 999;
  position: absolute;
  transform: translateY(-8rem);
  &--wrapper {
    transition: 1s ease;
    &.dismiss {
      transform: translateY(-16rem);
    }
    @apply bg-crisiscleanup-lightblue-100  w-full h-32 shadow-lg pt-3 px-16;
    position: absolute;
    top: 0;
    left: 0;
    border-top: 1px solid;
  }
  &-body {
    @apply h-full;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .action {
      display: flex;
      align-self: flex-end;
      justify-self: flex-end;
    }

    .body p {
      @apply text-xl;
    }

    .title p {
      @apply text-3xl;
    }
  }
}
</style>
