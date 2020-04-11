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
              (obj) => {
                let emailMatch = getEmailMatch(obj.tag.text);
                if (emailMatch) {
                  obj.tag.text = emailMatch;
                  obj.addTag();
                }
              }
            "
            :separators="[';', ',', ', ']"
            @tags-changed="(newTags) => (usersToInvite = newTags)"
          />
        </div>
        <div v-if="isAdmin">
          <OrganizationSearchInput
            @selectedOrganization="selectedOrganization = $event.id"
            class="w-108"
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
          :text="$t('actions.submit_invites')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script>
import User from '@/models/User';
import Organization from '@/models/Organization';
import { createTag } from '@johmun/vue-tags-input';
import OrganizationSearchInput from '@/components/OrganizationSearchInput';
import { getErrorMessage } from '../../utils/errors';

export default {
  name: 'InviteUsers',
  components: { OrganizationSearchInput },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      emails: '',
      usersToInvite: [],
      showInviteModal: false,
      selectedOrganization: null,
      organizationResults: [],
    };
  },
  methods: {
    getEmailMatch(text) {
      const emailMatch = text
        .toLowerCase()
        .match(
          /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/,
        );
      if (emailMatch) {
        return emailMatch[0];
      }
      return null;
    },
    async onOrganizationSearch(value) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
    async inviteUsers() {
      try {
        if (this.emails) {
          const email = createTag(this.getEmailMatch(this.emails));
          if (email) {
            this.usersToInvite.push(email);
          }
        }
        const emails = this.usersToInvite.map((value) => value.text);
        await Promise.all(
          emails.map((email) =>
            User.api().inviteUser(email, this.selectedOrganization),
          ),
        );
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

<style>
.vue-tags-input {
  @apply h-8 w-108 mb-2;
}

.vue-tags-input .ti-input {
  @apply h-8;
}
</style>
