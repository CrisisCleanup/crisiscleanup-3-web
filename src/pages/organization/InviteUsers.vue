<template>
  <div>
    <base-button
      :text="$t('usersVue.invite_new_user')"
      variant="solid"
      class="px-3 py-1"
      :action="
        () => {
          showInviteModal = true;
        }
      "
    />
    <modal
      v-if="showInviteModal"
      modal-classes="bg-white max-w-2xl shadow"
      :title="$t('usersVue.invite_user')"
      closeable
      @close="
        () => {
          usersToInvite = [];
          showInviteModal = false;
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="my-3">
          {{ $t('inviteTeammates.invite_teammates_instructions') }}
        </div>
        <div>
          <tag-input
            v-model="emails"
            :tags="usersToInvite"
            :placeholder="$t('usersVue.emails')"
            :add-on-key="[13, ',']"
            @before-adding-tag="
              obj => {
                let emailMatch = obj.tag.text
                  .toLowerCase()
                  .match(
                    /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/,
                  );
                if (emailMatch) {
                  obj.tag.text = emailMatch[0];
                  obj.addTag();
                }
              }
            "
            :separators="[';', ',', ', ']"
            @tags-changed="newTags => (usersToInvite = newTags)"
          />
        </div>
      </div>
      <div slot="footer" class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              showInviteModal = false;
            }
          "
        />
        <base-button
          variant="solid"
          :action="inviteUsers"
          :text="$t('usersVue.invite_users')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script>
import User from '@/models/User';
import { getErrorMessage } from '../../utils/errors';

export default {
  name: 'InviteUsers',
  data() {
    return {
      emails: '',
      usersToInvite: [],
      showInviteModal: false,
    };
  },
  methods: {
    async inviteUsers() {
      try {
        const emails = this.usersToInvite.map(value => value.text);
        await Promise.all(emails.map(email => User.api().inviteUser(email)));
        await this.$toasted.success(
          this.$t('inviteTeammates.invites_sent_success'),
        );
        this.showInviteModal = false;
        this.usersToInvite = [];
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>
