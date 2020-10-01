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
                `${callerHistory.total} {{ $t('phoneDashboard.calls') }} | ${callerHistory.recent}`
              }}</base-text>
            </div>
            <div class="contact-caller">
              <ccu-icon with-text size="xs" :type="enums.icons.phone_user" :alt="$t('phoneDashboard.user_name')">
                <base-text variant="bodysm">{{ c.name }}</base-text>
              </ccu-icon>
              <ccu-icon with-text size="xs" :type="enums.icons.earth_globe" :alt="$t('phoneDashboard.locale')">
                <base-text variant="bodysm">{{ c.locale }}</base-text>
              </ccu-icon>
            </div>
          </div>
          <div class="contact--actions">
            <div class="timer">
              <base-text :weight="600" variant="h2">{{
                formatDuration(callDuration)
              }}</base-text>
              <base-text variant="bodysm">{{ lang.calltime }}</base-text>
            </div>
            <div class="buttons">
              <ccu-icon
                @click.native="() => setActionTab('resources')"
                size="xl"
                :type="enums.icons.phone_contact_add"
                :alt="$t('phoneDashboard.call_someone')"
              />
              <ccu-icon
                @click.native="() => currentContact.disconnect()"
                size="xl"
                :type="enums.icons.phone_hangup"
                :alt="$t('phoneDashboard.hangup')"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeCalls.length >= 2" class="confactions">
        <ccu-icon
          :type="enums.icons.phone_exit"
          :alt="$t('phoneDashboard.exit_phone')"
          size="large"
          @click.native="() => currentContact.disconnect()"
        />
      </div>
    </div>
    <div class="contactbar--cases">
      <case-card
        v-for="c in caseCards"
        v-bind="c"
        :key="c.caseNumber"
        :tile="true"
        :active="c.id === activeCaseId"
        @click.native="setActiveCase(c.id, c.type)"
        class="m-2"
        @update:worktype="
          (value, workType) => updateWorkTypeStatus(value, workType, c.id)
        "
      />
    </div>
  </div>
</template>

<script>
// @flow

import VueTypes from 'vue-types';
import CaseCard from '@/components/cards/Case.vue';
import useEnums from '@/use/useEnums';
import useContact from '@/use/phone/useContact';
import { onMounted } from '@vue/composition-api';
import useController from '@/use/phone/useController';
import useCaseCards from '@/use/worksites/useCaseCards';
import { useStore } from '@u3u/vue-hooks';
import Worksite from '@/models/Worksite';
import { getErrorMessage } from '@/utils/errors';
import useIncident from '@/use/worksites/useIncident';

export default {
  name: 'BoardCallInfo',
  components: { CaseCard },
  props: {
    lang: VueTypes.objectOf(VueTypes.any),
  },
  setup(props, context) {
    const store = useStore();
    const formatDuration = (duration) =>
      context.root.$moment.duration(duration, 'ms').format('h:mm:ss');

    const { syncDuration, callerCases, ...contact } = useContact();
    const { caseCards } = useCaseCards({ cases: callerCases, addNew: true });
    const { setCurrentIncident } = useIncident();

    onMounted(() => syncDuration.start());

    const { actions, getters } = useController();

    const setActiveCase = async (caseId: number, type: string) => {
      if (type === 'new') {
        await actions.setCase(null);
        return;
      }
      const model = await store.value.$db().model(type);
      const caseItem = await model.fetchOrFindId(caseId);
      await actions.setCase(caseItem);
      await setCurrentIncident(caseItem.incident);
    };

    return {
      ...contact,
      ...useEnums(),
      ...actions,
      ...getters,
      formatDuration,
      caseCards,
      setActiveCase,
      async updateWorkTypeStatus(value, workType, worksiteId) {
        try {
          await Worksite.api().updateWorkTypeStatus(workType.id, value);
        } catch (e) {
          await context.root.$toasted.error(getErrorMessage(e));
        } finally {
          const wkSite = await Worksite.fetchById(worksiteId);
          await Worksite.update({
            where: worksiteId,
            data: wkSite,
          });
          const updWksite = await Worksite.fetchOrFindId(worksiteId);
          await actions.addCase({
            contact: contact.currentContact.value,
            newCase: updWksite,
          });
        }
      },
    };
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
            justify-content: flex-start;
            flex-grow: 1;
            flex-wrap: wrap;
            @apply py-2 px-2 bg-crisiscleanup-light-grey;
          }
        }
      }
    }
  }
}
</style>
