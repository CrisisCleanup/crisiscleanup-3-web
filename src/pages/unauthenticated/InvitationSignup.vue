<template>
  <Home>
    <form
      v-if="invitation && invitation.existing_user"
      ref="form"
      class="form w-108 flex flex-col"
      @submit.prevent="transfer"
    >
      <div class="text-2xl font-light">
        {{
          $t('invitationSignup.inviting_to_transfer_confirm', {
            user: invitation.inviter,
            fromOrg: getOrganizationName(invitation.existing_user.organization),
            toOrg: getOrganizationName(invitation.organization),
          })
        }}
      </div>
      <base-select
        v-model="transferOption"
        :options="[
          {
            key: 'users',
            label: $t('invitationSignup.yes_transfer_just_me'),
          },
          {
            key: 'all',
            label: $t('invitationSignup.yes_transfer_me_and_cases'),
          },
          {
            key: 'none',
            label: $t('invitationSignup.no_transfer'),
          },
        ]"
        :placeholder="$t('actions.choose_one_select')"
        select-classes="bg-white w-full h-12"
        item-key="key"
        label="label"
      />
      <base-button
        size="large"
        class="px-5 py-2 m-2 flex-grow"
        variant="solid"
        :text="$t('actions.transfer')"
        :alt="$t('actions.transfer')"
        :action="transfer"
        :disabled="!transferOption || transferOption === 'none'"
      />
    </form>
    <form
      v-else
      ref="form"
      class="form w-108 flex flex-col"
      @submit.prevent="acceptInvite"
    >
      <div v-if="invitation" class="text-2xl font-light">
        {{
          $t('invitationSignup.user_invited_join_ccu', {
            user: invitation.inviter,
          })
        }}
      </div>
      <base-input
        v-model="first_name"
        type="text"
        class="input"
        size="large"
        :placeholder="$t('invitationSignup.first_name_placeholder')"
        required
      />
      <base-input
        v-model="last_name"
        type="text"
        class="input"
        size="large"
        :placeholder="$t('invitationSignup.last_name_placeholder')"
        required
      />
      <base-input
        v-model="title"
        type="text"
        class="input"
        size="large"
        :placeholder="$t('invitationSignup.title_placeholder')"
      />
      <base-input
        v-model="mobile"
        type="text"
        class="input"
        size="large"
        :placeholder="$t('invitationSignup.mobile_placeholder')"
        required
      />
      <base-input
        v-model="password"
        type="password"
        class="input"
        size="large"
        :placeholder="$t('invitationSignup.pw1_placeholder')"
        required
      />
      <base-input
        ref="confirm_password"
        v-model="confirmPassword"
        type="password"
        class="input"
        size="large"
        :placeholder="$t('invitationSignup.pw2_placeholder')"
        required
      />
      <base-button
        size="large"
        class="px-5 py-2 m-2 flex-grow"
        variant="solid"
        :text="$t('actions.accept_invite')"
        :alt="$t('actions.accept_invite')"
        :action="acceptInvite"
      />
    </form>
  </Home>
</template>

<script lang="ts">
import { useToast } from 'vue-toastification';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import Invitation from '../../models/Invitation';
import Home from '../../layouts/Home.vue';
import { getErrorMessage } from '../../utils/errors';
import { getOrganizationName } from '../../filters';
import Organization from '@/models/Organization';
import PasswordResetRequest from '@/models/PasswordResetRequest';
import User from '@/models/User';
import useDialogs from '@/hooks/useDialogs';

export default defineComponent({
  name: 'InvitationSignup',
  components: { Home },
  setup() {
    const $toasted = useToast();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const { confirm } = useDialogs();

    const userInfo = reactive({
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      title: '',
    });
    const invitation = ref(null);
    const transferOption = ref(null);

    async function acceptInvite() {
      const { first_name, last_name, password, mobile, title } = userInfo;
      if (validatePassword()) {
        try {
          await User.api().acceptInvite({
            token: route.params.token,
            first_name,
            last_name,
            password,
            mobile,
            title,
          });
          await $toasted.success(
            t('invitationSignup.success_accept_invitation'),
          );
          await router.push('/login?accepted=true');
        } catch {
          await $toasted.error(t('invitationSignup.invitation_accept_error'));
        }
      }
    }
    async function transfer() {
      try {
        await axios.post(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/transfer_requests/invitation`,
          {
            invitation_token: route.params.token,
            transfer_action: transferOption.value,
          },
        );
        const result = await confirm({
          title: t('invitationSignup.move_completed'),
          content: t(`invitationSignup.congrats_move_complete`, {
            toOrg: getOrganizationName(invitation.value.organization),
          }),
          actions: {
            forgot: {
              text: t('invitationSignup.forgot_password'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            login: {
              text: t('actions.login'),
              type: 'solid',
            },
          },
        });
        if (result === 'login') {
          await router.push('/login?accepted=true');
        }
        if (result === 'forgot') {
          await PasswordResetRequest.api().post(`/password_reset_requests`, {
            email: invitation.value.invitee_email,
          });
          await $toasted.success(t('invitationSignup.success_reset_password'));
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function validatePassword() {
      if (userInfo.password !== userInfo.confirmPassword) {
        $toasted.error(t('invitationSignup.password_match_error'));
        return false;
      }
      return true;
    }

    onMounted(async () => {
      return;
      try {
        const results = await Invitation.api().fetchById(route.params.token);
        [invitation.value] = results.entities.invitations;
        if (invitation.value.existing_user) {
          await Organization.api().get(
            `/organizations?id__in=${[
              invitation.value.organization,
              invitation.value.existing_user.organization,
            ].join(',')}`,
            {
              dataKey: 'results',
            },
          );
        }
      } catch {
        await $toasted.error(t('invitationSignup.invitation_dead'));
        router.push('/login');
      }
    });

    return {
      invitation,
      transferOption,
      getOrganizationName,
      ...toRefs(userInfo),
      acceptInvite,
      transfer,
    };
  },
});
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      '. main main main main main'
      '. main main main main main'
      '. main main main main main';
  }
}

.input {
  @apply m-2;
}
</style>
