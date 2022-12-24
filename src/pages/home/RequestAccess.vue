<template>
  <Home>
    <div class="grid--main overflow-auto">
      <div class="w-2/3">
        <div class="text-5xl">
          {{ $t('requestAccess.join_organization') }}
        </div>
        <div class="text-2xl font-light">
          <div v-if="route.query.organization">
            {{
              $t('requestAccess.org_already_has_account', {
                organization: route.query.organization,
              })
            }}
          </div>
          <base-text
            v-if="route.query.orphan"
            variant="body"
            weight="700"
            class="mt-4 mb-1"
          >
            {{ $t('requestAccess.already_removed_enter_email_for_new_org') }}
          </base-text>
          <base-text v-else variant="body" weight="700" class="mt-4 mb-1">
            {{ $t('requestAccess.enter_existing_user_email_msg') }}
          </base-text>
        </div>
      </div>
      <form ref="form" class="w-108 flex flex-col" autocomplete="off">
        <base-input
          v-model="requestedTo"
          size="large"
          class="input"
          type="search"
          :placeholder="$t('requestAccess.existing_member_email')"
          required
        ></base-input>
        <fieldset v-if="!route.query.orphan">
          <base-text variant="body" weight="700" class="mt-4 mb-2 pt-8">
            {{ $t('requestAccess.complete_form_request_access') }}
          </base-text>
          <base-input
            v-model="email"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('requestAccess.your_email')"
            required
          />
          <base-input
            v-model="firstName"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.first_name_placeholder')"
            required
          />
          <base-input
            v-model="lastName"
            type="search"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.last_name_placeholder')"
            required
          />
          <base-input
            v-model="title"
            type="title"
            autocomplete="title"
            class="input"
            size="large"
            placeholder="Title"
          />
          <base-input
            v-model="mobile"
            type="search"
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
            autocomplete="new-password"
            required
          />
          <base-input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            class="input"
            size="large"
            :placeholder="$t('invitationSignup.pw2_placeholder')"
            required
          />
          <base-select
            class=""
            size="large"
            :value="selectedLanguage"
            :options="languages"
            item-key="id"
            label="name_t"
            :placeholder="$t('requestAccess.primary_language')"
            select-classes="bg-white border text-xs p-1 profile-select"
            @input="(value) => (primaryLanguage = value)"
          />
        </fieldset>
        <base-button
          size="large"
          class="px-5 py-2 m-1 flex-grow"
          variant="solid"
          :text="$t('actions.request_access')"
          :alt="$t('actions.request_access')"
          :action="requestAccess"
        />
      </form>
      <base-text variant="body" weight="700" class="mt-10 mb-8">
        {{ $t('requestAccess.request_will_be_sent') }}
      </base-text>
      <modal
        v-if="showSuccessModal"
        modal-classes="bg-white w-1/2 h-108 shadow p-3"
        closeable
        @close="$router.push('/login')"
      >
        <div class="flex flex-col items-center justify-center mt-32">
          <img src="" />
          <base-text variant="h1" class="mb-6">{{
            $t('info.success')
          }}</base-text>
          <base-text
            v-if="wasPreapproved"
            class="w-3/4 text-center"
            variant="body"
            wieght="300"
          >
            {{
              $t('requestAccess.you_are_approved_login', {
                organization: requestedToOrg,
                requested_to: requestedTo,
              })
            }}
          </base-text>
          <base-text
            v-else
            class="w-3/4 text-center"
            variant="body"
            wieght="300"
          >
            {{
              $t('requestAccess.request_sent_to_org', {
                organization: requestedToOrg,
                requested_to: requestedTo,
              })
            }}
          </base-text>
          <base-button
            :text="$t('actions.got_it')"
            :alt="$t('actions.got_it')"
            size="large"
            variant="solid"
            class="mt-10"
            :action="
              () => {
                router.push('/login');
              }
            "
          ></base-button>
        </div>
        <div slot="footer"></div>
      </modal>
    </div>
  </Home>
</template>

<script lang="ts">
import {
  computed,
  onMounted,
  reactive,
  toRefs,
  ref,
  defineComponent,
} from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import Home from '@/layouts/Home.vue';
import InvitationRequest from '@/models/InvitationRequest';
import Language from '@/models/Language';
import { getErrorMessage } from '@/utils/errors';

export default defineComponent({
  name: 'RequestAccess',
  components: { Home },
  setup() {
    const route = useRoute();
    const $toasted = useToast();
    const form = ref<HTMLFormElement | null>(null);

    const state = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      requestedTo: '',
      title: '',
      showSuccessModal: false,
      toggleOpen: false,
      primaryLanguage: null,
      requestedToOrg: null,
      wasPreapproved: false,
    });

    const languages = computed(() => {
      return Language.all();
    });

    const selectedLanguage = computed(() => {
      if (Language.browserLanguage && !state.primaryLanguage) {
        return Language.browserLanguage.id;
      }
      return state.primaryLanguage;
    });

    async function requestAccess() {
      let response;
      try {
        if (route.query.orphan) {
          response = await InvitationRequest.api().post(
            `/invitation_requests`,
            {
              requested_to: state.requestedTo,
            },
          );
        } else {
          const isValid = form?.value?.reportValidity();
          if (!isValid) {
            return;
          }
          response = await InvitationRequest.api().post(
            `/invitation_requests`,
            {
              first_name: state.firstName,
              last_name: state.lastName,
              email: state.email,
              title: state.title,
              password1: state.password,
              password2: state.confirmPassword,
              mobile: state.mobile,
              requested_to: state.requestedTo,
              primary_language: selectedLanguage.value,
            },
          );
        }
        state.requestedToOrg = response.response.data.requested_to_organization;
        if (response.response.data.approved_at) {
          state.wasPreapproved = true;
        }
        state.showSuccessModal = true;
      } catch (error) {
        // this.$log.error(error);
        await $toasted.error(getErrorMessage(error));
      }
    }

    onMounted(async () => {
      await Language.api().get('/languages', {
        dataKey: 'results',
      });
    });

    return {
      ...toRefs(state),
      languages,
      selectedLanguage,
      requestAccess,
      form,
      route,
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
  @apply m-1;
}
</style>
