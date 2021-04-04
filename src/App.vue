<template>
  <div id="app">
    <BannerOverlay v-bind="currentBanner" />
    <component
      class="main"
      :class="currentBanner.enabled && 'banner--active'"
      :is="layout"
    >
      <router-view v-if="$route.meta.id !== 'caller'" />
    </component>
    <CCP />
    <dialogs-wrapper />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import CCP from '@/components/phone/CCP.vue';
import Version from '@/components/Version.vue';
import BannerOverlay from '@/components/notifications/BannerOverlay';
import { hash } from '@/utils/promise';
import PhoneLegacy from './pages/phone_legacy/Index';

const defaultLayout = 'authenticated';
export default {
  name: 'App',
  components: { PhoneLegacy, CCP, Version, BannerOverlay },
  computed: {
    ...mapGetters('ui', ['currentBanner']),
    layout() {
      return `${this.$route.meta.layout || defaultLayout}-layout`;
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const newTitle = `${this.$t(to.name)}: Crisis Cleanup`;
        if (document.title !== newTitle) {
          document.title = newTitle;
        }
      },
    },
  },
  created() {
    if (process.env.NODE_ENV === 'development') {
      this.eventsInterval = setInterval(this.pushCurrentEvents, 2000);
    }
  },
  beforeDestroy() {
    if (this.eventsInterval) {
      clearInterval(this.eventsInterval);
      this.eventsInterval = undefined;
    }
  },
  methods: {
    ...mapActions('auth', ['login', 'logout']),
    ...mapActions('events', ['pushEvents']),
    ...mapActions('ui', ['validateBrowser']),
    ...mapGetters('auth', ['isLoggedIn']),
    ...mapMutations('enums', [
      'setStatuses',
      'setWorkTypes',
      'setLocationTypes',
    ]),
    async getEnums() {
      const enums = await hash({
        statuses: this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/statuses`,
          {
            headers: {
              Authorization: null,
            },
          },
        ),
        workTypes: this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/work_types`,
          {
            headers: {
              Authorization: null,
            },
          },
        ),
        locationTypes: this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/location_types`,
          {
            headers: {
              Authorization: null,
            },
          },
        ),
      });
      this.setStatuses(enums.statuses.data.results);
      this.setWorkTypes(enums.workTypes.data.results);
      this.setLocationTypes(enums.locationTypes.data.results);
    },
    async pushCurrentEvents() {
      if (this.isLoggedIn()) {
        await this.pushEvents();
      }
    },
  },
  async mounted() {
    await this.validateBrowser();
    await this.getEnums();
  },
  data() {
    return {
      eventsInterval: null,
    };
  },
};
</script>

<style>
@import '~vue-resize/dist/vue-resize.css';
@import '~vue-phone-number-input/dist/vue-phone-number-input.css';
@lost flexbox flex;

html {
  font-size: responsive 10px 18px;
  @apply subpixel-antialiased;
}

body {
  height: 100vh;
  font-family: 'Nunito Sans', sans-serif;
  @apply text-sm font-light;
}

#app {
  height: 100vh;
  width: 100vw;
}

.interactive-tooltip {
  display: block !important;
  z-index: 10000;
}

.interactive-tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.interactive-tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
  z-index: 1;
}

.interactive-tooltip[x-placement^='top'] {
  margin-bottom: 5px;
}

.interactive-tooltip[x-placement^='top'] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.interactive-tooltip[x-placement^='bottom'] {
  margin-top: 5px;
}

.interactive-tooltip[x-placement^='bottom'] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}

.interactive-tooltip[x-placement^='right'] {
  margin-left: 5px;
}

.interactive-tooltip[x-placement^='right'] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.interactive-tooltip[x-placement^='left'] {
  margin-right: 5px;
}

.interactive-tooltip[x-placement^='left'] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}

.interactive-tooltip.popover .popover-inner {
  background: #f9f9f9;
  color: black;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
}

.interactive-tooltip.popover .popover-arrow {
  border-color: #f9f9f9;
}

.interactive-tooltip[aria-hidden='true'] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s, visibility 0.15s;
}

.interactive-tooltip[aria-hidden='false'] {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s;
}

.main-content {
  height: 100%;
}

.main {
  transition: transform 0.3s ease;
  &.banner--active {
    transform: translateY(3rem);
  }
}
/* v-popper styles */
.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }

  &[x-placement^='top'] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
    }
  }

  &[x-placement^='bottom'] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='right'] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^='left'] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &.popover {
    $color: #f9f9f9;
    $color-dark: theme('colors.crisiscleanup-dark.500');

    box-shadow: 0 1px 15px 0 rgba(164, 177, 184, 0.35);
    border: 1px solid theme('colors.crisiscleanup-dark.100');
    border-radius: 5px;

    .popover-inner {
      background: $color;
      color: theme('colors.crisiscleanup-dark.500');
      padding: 24px;
      border-radius: 5px;
    }

    .popover-arrow {
      border-color: $color;
    }

    &.dark {
      .popover-inner {
        background: $color-dark;
        color: white;
      }
      .popover-arrow {
        border-color: $color-dark;
      }
    }
    &.menu {
      .popover-inner {
        padding: 0;
      }
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }
}
</style>
