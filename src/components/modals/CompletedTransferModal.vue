<template>
  <modal
    :title="$t('userTransfer.you_have_been_moved')"
    modal-classes="max-w-lg h-64"
    @cancel="$emit('close')"
    closeable
  >
    <div class="p-3">
      <div>
        {{ $t("userTransfer.you_have_been_moved_to") }}
        {{ currentUser.organization.name }} {{ $t("userTransfer.by") }}
        {{ requestingUser.first_name }} {{ requestingUser.last_name }} ({{
          requestingUser.email
        }})
      </div>
      <div>
        {{ $t("userTransfer.choose_to_stay_return") }}
      </div>
    </div>
    <div slot="footer" class="p-3 flex items-center justify-center">
      <base-button
        variant="outline"
        :action="goBack"
        :text="$t('actions.move_back')"
        class="ml-2 p-3 px-6 text-xs"
      />
      <base-button
        :action="stay"
        :text="$t('actions.stay')"
        variant="solid"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </modal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from "vue";
import moment from "moment";
import { useRouter } from "vue-router";
import User from "../../models/User";
import axios from "axios";
import { useStore } from "vuex";

export default defineComponent({
  name: "CompletedTransferModal",
  props: {
    transferRequest: {
      type: Object,
      required: true,
    },
  },

  setup(props, context) {
    const store = useStore();
    const currentUser = User.find(store.getters["auth/userId"]);
    const $http = axios;
    const router = useRouter();

    const requestingUser = computed(() =>
      User.find(props.transferRequest.requested_by)
    );

    async function getRequestingUser() {
      await User.api().get(`/users/${props.transferRequest.requested_by}`);
    }
    async function markAsSeen() {
      await $http.patch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/transfer_requests/${
          props.transferRequest.id
        }`,
        {
          user_approved_at: moment().toISOString(),
        }
      );
    }
    async function stay() {
      await markAsSeen();
      context.emit("close");
    }
    async function goBack() {
      await markAsSeen();
      await router.push("/profile?move=true");
      context.emit("close");
    }

    onMounted(async () => {
      await getRequestingUser();
    });

    return {
      currentUser,
      requestingUser,
      stay,
      goBack,
    };
  },
});
</script>

<style scoped></style>
