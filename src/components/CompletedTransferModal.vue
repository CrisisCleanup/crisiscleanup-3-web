<template>
  <modal
    :title="$t('userTransfer.you_have_been_moved')"
    modal-classes="max-w-lg h-64"
    @cancel="$emit('close')"
    closeable
  >
    <div class="p-3">
      <div>
        {{ $t('userTransfer.you_have_been_moved_to') }} 
        {{ currentUser.organization.name }} {{ $t('userTransfer.by') }}
        {{ requestingUser.first_name }} {{ requestingUser.last_name }} ({{
          requestingUser.email
        }})
      </div>
      <div>
        {{ $t('userTransfer.choose_to_stay_return') }}
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

<script>
import { UserMixin } from '@/mixins';
import User from '../models/User';

export default {
  name: 'CompletedTransferModal',
  mixins: [UserMixin],
  async mounted() {
    await this.getRequestingUser();
  },
  methods: {
    async getRequestingUser() {
      await User.api().get(`/users/${this.transferRequest.requested_by}`);
    },
    async markAsSeen() {
      await this.$http.patch(
        `${process.env.VUE_APP_API_BASE_URL}/transfer_requests/${this.transferRequest.id}`,
        {
          user_approved_at: this.$moment().toISOString(),
        },
      );
    },
    async stay() {
      await this.markAsSeen();
      this.$emit('close');
    },
    async goBack() {
      await this.markAsSeen();
      await this.$router.push('/profile?move=true');
      this.$emit('close');
    },
  },
  computed: {
    requestingUser() {
      return User.find(this.transferRequest.requested_by);
    },
  },
  props: {
    transferRequest: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
