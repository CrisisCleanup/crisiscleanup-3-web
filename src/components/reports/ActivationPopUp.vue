<template>
  <div>
    <base-button
      :text="$t('usersVue.request_access')"
      variant="solid"
      class="px-3 py-1"
      :action="() => (showRequestAccessModal = true)"
    />
    <modal
      v-if="showRequestAccessModal"
      title="Reports Activation"
      modal-classes="w-108"
      @close="showRequestAccessModal = false"
    >
      <div class="flex justify-around m-5">
        <base-text variant="body">
          Your state does not yet have a subscription to this section.
          <a
            href="mailto:aaron@crisiscleanup.org"
            class="text-crisiscleanup-yellow-900 underline"
            >Click here</a
          >
          to request more information on report access"
        </base-text>
      </div>
      <div slot="footer" class="flex p-1 justify-center">
        <base-button
          variant="outline"
          :action="() => (showRequestAccessModal = false)"
        ></base-button>
      </div>
    </modal>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'ActivationPopUp',
  props: {
    showRequestAccessModal: VueTypes.bool.def(false),
  },
};
</script>
