<template>
  <Loader class="w-full h-full" :loading="loading">
    <template #content>
      <component v-if="!loading" :is="pageComponent" />
      <IncomingPopup v-show="callPending" :cases="cases" :agent="agent" />
    </template>
  </Loader>
</template>

<script>
// @flow
import { EventBus } from '@/event-bus';
import { EVENTS as CCEvent } from '@/services/acs.service';
import IncomingPopup from '@/components/phone/Popup.vue';
import { ControllerPages } from '@/store/modules/phone/controller';
import useAgent from '@/use/phone/useAgent';
import { computed, onMounted, watch } from '@vue/composition-api';
import Loader from '@/components/Loader.vue';
import { useIntervalFn } from '@vueuse/core';
import useContact from '@/use/phone/useContact';
import useController from '@/use/phone/useController';
import Dashboard from './Dashboard.vue';
import Controller from './Controller.vue';

export default {
  name: 'Phone',
  components: { IncomingPopup, Loader },
  setup(props, context) {
    const { agent, loading } = useAgent();
    const controller = useController();
    const {
      callPending,
      callConnected,
      currentContact,
      callState,
    } = useContact({
      agent,
    });
    const cases = computed(() => [
      ...callState.worksites.value,
      ...callState.pdas.value,
    ]);

    const { start } = useIntervalFn(() => {
      agent.value.heartbeat().then(() => {
        context.root.$log.debug('triggering heartbeat');
      });
    }, 30000);

    watch(
      () => loading.value,
      () => {
        if (!loading.value) {
          agent.value.heartbeat().then(() => start());
        }
      },
    );

    const updatePage = async () => {
      if (callConnected.value) {
        await controller.actions.setView({
          page: ControllerPages.CONTROLLER,
        });
      }
      if (!callConnected.value && !currentContact.value) {
        await controller.actions.setView({ page: ControllerPages.DASHBOARD });
      }
    };

    watch(
      () => callConnected.value,
      async () => updatePage(),
    );

    onMounted(() => {
      EventBus.$emit(CCEvent.INIT);
      updatePage();
    });

    const pageComponent = computed(() => {
      const pages = {
        [ControllerPages.DASHBOARD]: Dashboard,
        [ControllerPages.CONTROLLER]: Controller,
      };
      return pages[controller.state.view.value.page];
    });

    return {
      pageComponent,
      agent,
      loading,
      callPending,
      callConnected,
      currentContact,
      cases,
    };
  },
};
</script>

<style></style>
