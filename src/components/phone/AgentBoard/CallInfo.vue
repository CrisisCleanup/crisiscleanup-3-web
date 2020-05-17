<template>
  <div class="contactbar">
    <div class="contactbar--conference">
      <div class="calls">
        <div v-for="c in activeCalls" :key="c.name" class="contactbar--call">
          <div class="contact--call">
            <div class="contact-stats">
              <base-text class="mobile" :weight="600" variant="h2">{{
                c.mobile
              }}</base-text>
              <base-text :weight="400" variant="h4">{{
                `${callerHistory.total} Calls | ${callerHistory.recent}`
              }}</base-text>
            </div>
            <div class="contact-caller">
              <ccu-icon with-text size="xs" :type="icons.phone_user">
                <base-text variant="bodysm">{{ c.name }}</base-text>
              </ccu-icon>
              <ccu-icon with-text size="xs" :type="icons.earth_globe">
                <base-text variant="bodysm">{{ c.locale }}</base-text>
              </ccu-icon>
            </div>
          </div>
          <div class="contact--actions">
            <div class="timer">
              <base-text :weight="600" variant="h2">{{ c.time }}</base-text>
              <base-text variant="bodysm">{{ lang.calltime }}</base-text>
            </div>
            <div class="buttons">
              <ccu-icon
                @click.native="() => setActionTab('resources')"
                size="xl"
                :type="icons.phone_contact_add"
              />
              <ccu-icon
                @click.native="() => endCurrentCall({ external: c.external })"
                size="xl"
                :type="icons.phone_hangup"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeCalls.length >= 2" class="confactions">
        <ccu-icon
          :type="icons.phone_exit"
          size="large"
          @click.native="endAllCalls"
        />
      </div>
    </div>
    <div class="contactbar--cases">
      <carousel
        :pagination-enabled="false"
        :per-page-custom="[
          [768, 3],
          [1024, 3],
          [1400, 4],
        ]"
        class="carousel"
      >
        <slide class="case" v-for="c in caseCards" :key="c.id">
          <case-card
            :key="c.caseNumber"
            :case-number="c.caseNumber"
            :state="c.state"
            :worktype="c.worktype"
            :address="c.address"
            :tile="true"
            :active="c.id === currentCaseId"
            :type="c.type"
            @click.native="setActive(c.id, c.type)"
          />
        </slide>
      </carousel>
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { AgentMixin, IconsMixin } from '@/mixins';
import { mapActions, mapGetters } from 'vuex';
import { EVENTS as CCEvent } from '@/services/acs.service';
import { mixin as VueTimers } from 'vue-timers';
import { EventBus } from '@/event-bus';
import CaseCard from '@/components/cards/Case.vue';
import { Carousel, Slide } from 'vue-carousel';

export default {
  name: 'BoardCallInfo',
  mixins: [IconsMixin, VueTimers, AgentMixin],
  components: { CaseCard, Carousel, Slide },
  timers: {
    syncCallDuration: { time: 1000, autostart: true, repeat: true },
  },
  props: {
    lang: VueTypes.objectOf(VueTypes.any),
  },
  methods: {
    ...mapActions('phone', [
      'syncCallDuration',
      'setCurrentCase',
      'setActionTab',
    ]),
    async setActive(id, type) {
      return this.setCurrentCase({ id, type });
    },
    formatTimer(millis) {
      return this.$moment.duration(millis, 'ms').format('h:mm:ss');
    },
    async endAllCalls() {
      await this.endCurrentCall();
      await this.endCurrentCall({ external: true });
    },
  },
  computed: {
    ...mapGetters('phone', [
      'callerId',
      'callDuration',
      'extCallDuration',
      'currentCase',
    ]),
    activeCalls() {
      const calls = [];
      calls.push({
        name: this.callerName,
        locale: this.callerLocale.name_t.split(' ')[0],
        time: this.formatTimer(this.callDuration),
        mobile: this.callerFormattedNumber,
        external: false,
      });
      if (this.currentExternalResource) {
        calls.push({
          name: this.currentExternalResource.name_t,
          locale: this.$t('~~English'),
          time: this.formatTimer(this.extCallDuration),
          mobile: this.extResourceFormattedNumber,
          external: true,
        });
      }
      return calls;
    },
  },
  async mounted() {
    await this.createCaseCards();
  },
  created() {
    EventBus.$on(CCEvent.PAUSED, () => {
      this.$timer.stop('syncCallDuration');
    });
    EventBus.$on(CCEvent.CASE_SAVED, (worksite) => {
      this.createCaseCards().then(() => {
        this.setCurrentCase({ id: worksite.id, type: 'worksite' });
      });
    });
  },
};
</script>

<style lang="scss">
.board {
  &--grid {
    .grid {
      &--callinfo {
        .contactbar {
          &--conference {
            display: flex;
            flex-grow: 1;
            .calls {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
            }
            .confactions {
              display: flex;
              flex-direction: column;
              justify-content: center;
              @apply pr-6;
              .base-icon {
                @apply p-2 bg-crisiscleanup-red-400;
                border-radius: 100%;
                cursor: pointer;
                transition: 300ms ease;
                &:hover {
                  filter: drop-shadow(0 0 0.2rem fade-out(crimson, 0.3));
                  transform: translateY(-3px);
                }
              }
            }
          }
          &--call {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            align-content: center;
            flex-grow: 1;
            position: relative;
            @apply py-3 px-6;
            &:nth-child(even):after {
              content: '';
              height: 1px;
              @apply bg-crisiscleanup-light-grey;
              width: 100%;
              position: absolute;
              top: 0;
            }
            .contact {
              &--call {
                display: flex;
                align-items: center;
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
                      height: 90%;
                      width: 1px;
                      @apply bg-crisiscleanup-dark-100;
                      position: absolute;
                      left: 0;
                      bottom: 0;
                    }
                  }
                }
              }
              &--actions {
                display: flex;
                flex-direction: row;
                justify-content: center;
                @apply pl-3 ml-6;
                p {
                  &:last-child {
                    @apply text-crisiscleanup-dark-300;
                  }
                }
                div {
                  @apply px-1;
                }
                .buttons {
                  display: flex;
                  flex-direction: row;
                  cursor: pointer;
                  div {
                    @apply px-2;
                  }
                  div:last-child img:hover {
                    filter: drop-shadow(0 0 0.2rem fade-out(crimson, 0.3));
                  }
                  div:first-child img:hover {
                    filter: drop-shadow(0 0 0.2rem fade-out(#818181, 0.1));
                  }
                  img {
                    transition: 300ms ease;
                    &:hover {
                      transform: translateY(-3px);
                    }
                  }
                }
                position: relative;
                &:before {
                  content: '';
                  height: 90%;
                  width: 1px;
                  @apply bg-crisiscleanup-dark-100;
                  left: 0;
                  bottom: 0;
                  position: absolute;
                }
              }
            }
          }
          &--cases {
            display: flex;
            justify-content: center;
            flex-grow: 1;
            align-items: center;
            align-content: center;
            @apply py-4 bg-crisiscleanup-light-grey;
            .VueCarousel {
              &-slide {
                @apply px-2;
                display: flex;
                justify-content: center;
                align-content: center;
                align-items: center;
              }
            }
          }
        }
      }
    }
  }
}
</style>
