<template>
  <PageLayout class="h-full w-full" :loading="loading">
    <div class="h-full w-full">
      <keep-alive>
        <router-view />
      </keep-alive>
    </div>
    <IncomingPopup v-show="callPending" />
  </PageLayout>
</template>

<script>
// @flow
import PageLayout from '@/layouts/page/Page.vue';
import { EventBus } from '@/event-bus';
import IncomingPopup from '@/components/phone/Popup.vue';
import { ControllerPages } from '@/store/modules/phone/controller';
import useAgent from '@/use/phone/useAgent';
import { computed, onMounted, watch } from '@vue/composition-api';
import { useIntervalFn } from '@vueuse/core';
import useContact from '@/use/phone/useContact';
import useController from '@/use/phone/useController';
import { useRouter } from '@u3u/vue-hooks';
import Dashboard from './Dashboard.vue';
import Controller from './Controller.vue';

export default {
  name: 'Phone',
  components: { IncomingPopup, PageLayout },
  setup(props, context) {
    const { agent, loading } = useAgent();
    const controller = useController();
    const { callPending, callConnected, currentContact } = useContact({
      agent,
    });
    const { route, router } = useRouter();

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

    const pageComponent = computed(() => {
      const pages = {
        [ControllerPages.DASHBOARD]: Dashboard,
        [ControllerPages.CONTROLLER]: Controller,
      };
      return pages[controller.state.view.value.page];
    });

    onMounted(() => {
      EventBus.$emit('acs:init');
      updatePage();
      watch(
        () => controller.state.view.value,
        () => {
          if (route.name !== controller.state.view.value)
            router.replace({
              name: `nav.phone_${controller.state.view.value.page}`,
            });
        },
      );
    });

    return {
      pageComponent,
      agent,
      loading,
      callPending,
      callConnected,
      currentContact,
    };
  },
};
</script>

<style></style>
