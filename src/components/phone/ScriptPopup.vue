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
          {{ $t('"Crisis Cleanup Hotline, my name is ') }}
          {{ currentUser.first_name }}
          {{ $t('. How may I help you?"') }}
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
export default {
  name: 'ScriptPopup',
  mixins: [UserMixin, LocalStorageMixin],
  data() {
    return {
      checkState: false,
    };
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
};
</script>

<style scoped lang="scss">
.script {
  @apply w-full bg-white h-32;
  z-index: 999;
  position: absolute;
  transform: translateY(-8rem);
  &--wrapper {
    transition: 1s ease;
    &.dismiss {
      transform: translateY(-16rem);
    }
    @apply bg-white w-full h-32 shadow-lg pt-3 px-16 border-crisiscleanup-light-grey;
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
  }
}
</style>
