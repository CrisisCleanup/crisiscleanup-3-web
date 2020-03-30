<template>
  <div class="contactbar">
    <div class="contact--call">
      <div class="contact-stats">
        <base-text class="mobile" :weight="600" variant="h1">{{
          callerId
        }}</base-text>
        <base-text :weight="400" variant="h3">{{
          `2 ${lang.callStat.calls} | 1 ${lang.callStat.days}`
        }}</base-text>
      </div>
      <div class="contact-caller">
        <ccu-icon with-text size="md" :type="icons.phone_user">
          <base-text>Julie Smith</base-text>
        </ccu-icon>
        <ccu-icon with-text size="md" :type="icons.earth_globe">
          <base-text>{{ lang.english }}</base-text>
        </ccu-icon>
      </div>
    </div>
    <div lass="contact--actions">
      <base-text :weight="600" variant="h1">14:32</base-text>
      <base-text :weight="400" variant="h3">{{ lang.calltime }}</base-text>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { IconsMixin } from '@/mixins';

export default {
  name: 'BoardCallInfo',
  mixins: [IconsMixin],
  props: {
    lang: VueTypes.objectOf(VueTypes.any),
  },
};
</script>

<style lang="scss">
.board {
  &--grid {
    .grid {
      &--callinfo {
        .contactbar {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          align-content: center;
          flex-grow: 1;
          @apply py-6 px-16;
          .contact {
            &--call {
              display: flex;
              align-items: flex-start;
              flex-grow: 1;
              .contact {
                &-stats {
                  @apply pr-4;
                  p {
                    &.mobile {
                      @apply text-crisiscleanup-dark-500;
                    }
                    &:last-child {
                      @apply text-crisiscleanup-dark-300;
                    }
                  }
                }
                &-caller {
                  @apply pl-4;
                  position: relative;
                  p {
                    @apply text-crisiscleanup-dark-300;
                  }
                  &:before {
                    content: '';
                    height: 100%;
                    width: 1px;
                    @apply bg-crisiscleanup-dark-100;
                    position: absolute;
                    left: 0;
                  }
                }
              }
            }
            &--actions {
              display: flex;
              flex-direction: column;
              p {
                &:last-child {
                  @apply text-crisiscleanup-dark-300;
                }
              }
              position: relative;
              &:before {
                content: '';
                height: 100%;
                width: 1px;
                @apply bg-crisiscleanup-dark-100;
                left: 0;
                position: absolute;
              }
            }
          }
        }
      }
    }
  }
}
</style>
