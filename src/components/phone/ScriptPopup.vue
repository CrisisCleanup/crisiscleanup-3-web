<template>
  <div class="script" ref="script">
    <div :class="`script--wrapper ${checkState ? 'dismiss' : ''}`">
      <div class="script-body">
        <div class="title">
          <base-text variant="h1" weight="700"
            >{{ $t('~~A Sample Script would be:') }}
          </base-text>
        </div>
        <div class="body">
          <base-text>
            {{ currentScript }}
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
import { UserMixin, LocalStorageMixin, IncidentMixin } from '@/mixins';
import { template } from 'lodash';
import VueTypes from 'vue-types';
import { Scripts } from '@/store/modules/phone/controller';

export default {
  name: 'ScriptPopup',
  mixins: [UserMixin, LocalStorageMixin, IncidentMixin],
  data() {
    return {
      checkState: false,
      scripts: Scripts,
    };
  },
  props: {
    scriptName: VueTypes.string.def('inbound'),
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
  computed: {
    currentScript() {
      const script = this.scripts[this.scriptName];
      return template(script)({
        name: this.currentUser.first_name,
        incidentType: this.currentIncident.incident_type,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.script {
  @apply w-full bg-crisiscleanup-light-grey h-32;
  z-index: 999;
  position: absolute;
  top: 0;

  &--wrapper {
    transition: 1s ease;
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
