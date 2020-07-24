<template>
  <modal :title="$t('~~You have been moved')" modal-classes="max-w-lg h-64" @cancel="$emit('close')" closeable>
    <div class="p-3">
      <div>
        {{ $t('~~You have been moved to ') }} {{currentUser.organization.name}} {{$t('~~by')}} {{requestingUser.first_name}} {{requestingUser.last_name}} ({{requestingUser.email}})
      </div>
      <div>{{ $t('~~You can choose to stay in the current organization, or request to move back') }}</div>
    </div>
    <div slot="footer" class="p-3 flex items-center justify-center">
      <base-button
        variant="outline"
        :action="goBack"
        :text="$t('~~Move Back')"
        class="ml-2 p-3 px-6 text-xs"
      />
      <base-button
        :action="stay"
        :text="$t('~~Stay')"
        variant="solid"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </modal>
</template>

<script>
import User from '../models/User';
import { UserMixin } from '@/mixins';

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
