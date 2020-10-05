<template>
  <TabbedCard :tabs="tabs" class="board board--grid shadow-crisiscleanup-card">
    <template #status>
      <div class="grid--callinfo">
        <call-info v-bind="$attrs" :lang="lang" />
      </div>
      <div class="grid--status">
        <board-status v-bind="$attrs" :lang="lang" />
      </div>
    </template>
    <template #scripts>
      <div class="scripts__container">
        <div class="scripts__section">
          <div class="scripts__config">
            <base-text variant="h4" class="pr-2" semi-bold>
              {{ $t('phoneDashboard.always_show_script') }}
            </base-text>
            <toggle-button
              @input="updatePopupConfig"
              :value="showPopup"
              :font-size="14"
              :width="85"
              :labels="{
                checked: $t('actions.show'),
                unchecked: $t('actions.hide'),
              }"
            />
          </div>
          <div class="scripts__header">
            <base-text variant="h1">
              {{ $t('phoneDashboard.here_are_sample_scripts') }}
            </base-text>
          </div>
          <div class="scripts__accord">
            <div>
              <Accordion :cards="cards">
                <template v-for="c in cards" v-slot:[c.key]>
                  <div :key="c.key" class="scripts__card">
                    {{ $t(renderScript(c.key)) }}
                  </div>
                </template>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </template>
  </TabbedCard>
</template>

<script>
import {
  LangMixin,
  UserMixin,
  LocalStorageMixin,
  IncidentMixin,
} from '@/mixins';
import TabbedCard from '@/components/cards/TabbedCard.vue';
import Accordion from '@/components/accordion/Accordion.vue';
import { Scripts } from '@/store/modules/phone/controller';
import Contact, { CallType } from '@/models/phone/Contact';
import BoardStatus from './Status.vue';
import CallInfo from './CallInfo.vue';

export default {
  name: 'AgentBoard',
  mixins: [LangMixin, UserMixin, LocalStorageMixin, IncidentMixin],
  components: {
    CallInfo,
    BoardStatus,
    TabbedCard,
    Accordion,
  },
  data() {
    return {
      activeKey: 'currentCall',
      scripts: Scripts,
    };
  },
  methods: {
    renderScript(key) {
      return this.$t(this.scripts[key], {
        name: this.currentUser.first_name,
        incidentType: this.currentIncident.incident_type,
        timeAgo: this.recentWorksite
          ? this.$moment(this.recentWorksite.updated_at).fromNow()
          : '',
      });
    },
    updatePopupConfig(value) {
      this.setLocalStorage('ccu-ivr-hide-script', value);
    },
  },
  computed: {
    recentWorksite() {
      const contact = Contact.query().first();
      if (contact) {
        return contact.mostRecentWorksite;
      }
      return null;
    },
    showPopup() {
      return this.getLocalStorage('ccu-ivr-hide-script');
    },
    tabs() {
      return [
        {
          key: 'status',
          title: 'phoneDashboard.current_call',
        },
        {
          key: 'scripts',
        },
      ];
    },
    cards() {
      return [
        {
          title: this.$t('phoneDashboard.inbound_call'),
          key: CallType.INBOUND,
        },
        {
          title: this.$t('phoneDashboard.outbound_call'),
          key: CallType.OUTBOUND,
        },
        {
          title: this.$t('phoneDashboard.calldown'),
          key: CallType.CALLDOWN,
        },
      ];
    },
    lang() {
      return this.getLang({
        currentCall: 'phoneDashboard.current_call',
        scripts: 'phoneDashboard.scripts',
        calltime: 'phoneDashboard.call_time',
        english: 'phoneDashboard.english',
        callStat: {
          calls: 'phoneDashboard.calls',
          days: 'phoneDashboard.days',
        },
        notes: 'phoneDashboard.notes',
        callStatus: 'phoneDashboard.call_status_star',
        issuesResolved: 'phoneDashboard.issues_resolved',
      });
    },
  },
};
</script>

<style scoped lang="postcss">
.board {
  @apply bg-white h-full w-full;
  &--grid {
    .grid {
      &--callinfo {
        position: relative;
        &:after {
          content: '';
          height: 1px;
          width: 100%;
          @apply bg-crisiscleanup-grey-100;
          position: absolute;
          bottom: 0px;
          opacity: 0.5;
        }
      }
    }
  }
}
@lost flexbox flex;

.scripts {
  &__container {
    lost-center: 1/1;
    @apply h-full w-full;
    .scripts__section {
      @apply h-full w-full;
      & > div {
        lost-row: 1/2;
      }
      .scripts__config {
        lost-flex-container: row;
        lost-align: top-right;
        @apply p-3;
        & > div {
          lost-column: 1/2;
          align-items: center;
        }
      }
      .scripts__header {
        lost-align: center;
      }
    }
  }
}
</style>
