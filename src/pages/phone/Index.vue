<template>
  <PageLayout class="h-full w-full" :is-loading="false">
    <component :is="pageComponent" />
    <IncomingPopup v-show="callPending" />
    <PhoneDebugger v-if="currentUser.isAdmin" />
  </PageLayout>
</template>

<script>
// @flow
import PageLayout from '@/layouts/page/Page.vue';
import IncomingPopup from '@/components/phone/Popup.vue';
import { ControllerPages } from '@/store/modules/phone/controller';
import useAgent from '@/use/phone/useAgent';
import { computed, onMounted, watch } from '@vue/composition-api';
import { useIntervalFn } from '@vueuse/core';
import useContact from '@/use/phone/useContact';
import useController from '@/use/phone/useController';
import PhoneDebugger from '@/components/phone/Widgets/PhoneDebugger.vue';
import useIncident from '@/use/worksites/useIncident';
import useUser from '@/use/user/useUser';
import Dashboard from './Dashboard.vue';
import Controller from './Controller.vue';

export default {
  name: 'PhoneRoot',
  components: { IncomingPopup, PageLayout, PhoneDebugger },
  setup(props, context) {
    const { agent, loading } = useAgent();
    const controller = useController();
    const { callPending, callConnected, currentContact } = useContact({
      agent,
    });
    const { currentIncident } = useIncident();

    const { start } = useIntervalFn(() => {
      if (!agent.value) {
        context.root.$log.debug('no client to send heartbeat with!');
      } else {
        agent.value.heartbeat().then(() => {
          context.root.$log.debug('triggering heartbeat');
        });
      }
    }, 30000);

    watch(
      () => loading.value,
      async () => {
        if (!loading.value) {
          await controller.actions.updateCallerHistory({
            agent_id: agent.value.agentId,
          });
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

    const requestOutbound = async () => {
      if (!agent.value) return;
      if (
        !callConnected.value &&
        !currentContact.value &&
        !callPending.value &&
        agent.value.isRoutable
      ) {
        await controller.actions.serveOutbound({
          agent: agent.value,
          incident: currentIncident.value,
        });
      }
    };

    const pollOutbound = useIntervalFn(
      () => {
        requestOutbound().then(() =>
          context.root.$log.debug('outbound requested!'),
        );
      },
      20000,
      true,
    );

    watch(
      () => agent.value && agent.value.isRoutable,
      () => {
        if (!agent.value) return;
        if (!agent.value.isRoutable) {
          context.root.$log.debug('Outbound Polling: PAUSED');
          pollOutbound.stop();
        } else {
          context.root.$log.debug('Outbound Polling: ACTIVE');
          pollOutbound.start();
        }
      },
    );

    watch(
      () => callConnected.value,
      async () => updatePage(),
    );

    const pageComponent = computed(() => {
      const pages = {
        [ControllerPages.DASHBOARD]: Dashboard,
        [ControllerPages.CONTROLLER]: Controller,
      };
      return pages[controller.state.view.value.page];
    });

    onMounted(async () => {
      await updatePage();
      await controller.actions.updateHistoricMetrics();
    });

    return {
      pageComponent,
      agent,
      loading,
      callPending,
      callConnected,
      currentContact,
      pollOutbound,
      ...useUser(),
    };
  },
};
</script>

<style></style>
