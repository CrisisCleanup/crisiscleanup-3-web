<template>
  <div class="layout" v-if="!loading">
    <div
      class="sidebar h-full overflow-auto"
      :class="{ 'slide-over': slideOverVisible }"
    >
      <div v-if="slideOverVisible" class="flex items-center justify-end p-1.5">
        <font-awesome-icon
          icon="times"
          class="menu-button mx-2 cursor-pointer text-white self-end"
          size="2xl"
          @click="toggle"
        />
      </div>
      <NavMenu
        :routes="routes"
        :logo-route="logoRoute"
        class="flex flex-col text-sm"
        :key="JSON.stringify(currentUser && currentUser.permissions)"
      />
    </div>
    <div class="header p-1 flex items-center">
      <font-awesome-icon
        icon="bars"
        class="menu-button mx-3 cursor-pointer"
        size="2xl"
        @click="toggle"
      />
      <Header
        :class="$mq === 'sm' ? '' : isLandscape() ? 'ml-16' : ''"
        :current-incident="currentIncident"
        :incidents="incidents"
        @update:incident="handleChange"
        @auth:logout="
          () => {
            logoutApp();
          }
        "
      />
    </div>
    <div class="main">
      <div class="h-full overflow-scroll">
        <slot />
      </div>
    </div>
    <div v-if="showAcceptTermsModal">
      <TermsandConditionsModal
        @acceptedTerms="acceptTermsAndConditions"
        :organization="currentOrganization"
      />
    </div>
    <div v-if="transferRequest">
      <CompletedTransferModal
        :transfer-request="transferRequest"
        @close="
          () => {
            transferRequest = null;
          }
        "
      />
    </div>
    <div v-if="showLoginModal">
      <modal modal-classes="bg-white max-w-lg shadow p-5" :closeable="false">
        <LoginForm :redirect="false" />
        <div slot="footer"></div>
      </modal>
    </div>
  </div>
  <Loader v-else :loading="loading" class="flex layout h-full" />
</template>

<script lang="ts">
import detectBrowserLanguage from 'detect-browser-language';
import { size } from 'lodash';
import { Slide } from 'vue-burger-menu';
import { parsePhoneNumber } from 'libphonenumber-js';
import { ref, computed, watch, onMounted } from '@vue/composition-api';
import {
  useState,
  useGetters,
  useMutations,
  useActions,
  useRouter,
} from '@u3u/vue-hooks';
import moment from 'moment';
import Incident from '@/models/Incident';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Language from '@/models/Language';
import Report from '@/models/Report';
import Role from '@/models/Role';
import { i18nService } from '@/services/i18n.service';
import NavMenu from '@/components/navigation/NavMenu.vue';
import Loader from '@/components/Loader.vue';
import TermsandConditionsModal from '@/components/TermsandConditionsModal.vue';
import Header from '@/components/header/Header.vue';
import PhoneStatus from '@/models/PhoneStatus';
import CompletedTransferModal from '@/components/CompletedTransferModal.vue';
import { AuthService } from '@/services/auth.service';
import LoginForm from '@/components/forms/LoginForm.vue';

const VERSION_3_LAUNCH_DATE = '2020-03-25';

export default {
  name: 'Authenticated',
  components: {
    LoginForm,
    CompletedTransferModal,
    NavMenu,
    Loader,
    TermsandConditionsModal,
    Slide,
    Header,
  },
  setup(props, context) {
    const { router, route } = useRouter();
    const { $http, $log, $t, $phoneService } = context.root;

    const { currentIncidentId } = useState('incident', ['currentIncidentId']);
    const { user, showLoginModal } = useState('auth', [
      'user',
      'showLoginModal',
    ]);
    const { portal } = useState('enums', ['portal']);
    const { userId } = useGetters('auth', ['userId']);

    const slideOverVisible = ref(false);
    const toggle = () => {
      slideOverVisible.value = !slideOverVisible.value;
    };

    const loading = ref(false);
    const ready = ref(false);
    const showAcceptTermsModal = ref(false);
    const transferRequest = ref(null);

    const currentUser = computed(() => User.find(userId.value));

    const currentOrganization = computed(() =>
      Organization.find(currentUser?.value?.organization?.id),
    );

    const incidents = computed(() =>
      Incident.query().orderBy('id', 'desc').get(),
    );

    const logoRoute = computed(() => ({
      key: 'pew',
      text: $t('nav.pew'),
      to: '/pew-pew',
    }));

    const currentIncident = computed(() =>
      Incident.find(currentIncidentId.value),
    );

    const routes = computed(() => [
      {
        key: 'dashboard',
        text: $t('nav.dashboard'),
        to: `/incident/${currentIncidentId.value}/dashboard`,
      },
      {
        key: 'work',
        to: `/incident/${currentIncidentId.value}/work`,
        icon: 'cases',
        text: $t('nav.work'),
      },
      {
        key: 'cases',
        to: `/incident/${currentIncidentId.value}/cases/new`,
      },
      {
        key: 'phone',
        icon: 'phone',
        text: $t('nav.phone'),
        to: '/phone',
        disabled: !context.root.$can || !context.root.$can('phone_agent'),
      },
      {
        key: 'caller',
        icon: 'phone',
        text: $t('nav.phone_beta'),
        to: '/caller',
        disabled: true,
      },
      {
        key: 'connect_first',
        icon: 'phone',
        text: $t('nav.phone_alpha'),
        to: '/connect_first',
        disabled:
          !context.root.$can ||
          !context.root.$can('phone_agent') ||
          !context.root.$can('beta_feature.connect_first_integration'),
      },
      {
        key: 'my_organization',
        icon: 'organization',
        iconSize: 'large',
        to: '/organization/invitations',
      },
      {
        key: 'other_organizations',
        icon: 'otherorg',
        iconSize: 'xl',
        to: '/other_organizations',
      },
      {
        key: 'reports',
        icon: 'reports',
        text: $t('nav.reports'),
        to: '/reports',
        newBadge: Report.query()
          .where('created_at', (created_at) => {
            const reportsAccessed =
              currentUser?.value?.states &&
              currentUser.value.states.reports_last_accessed;
            return reportsAccessed
              ? moment(created_at).isAfter(moment(reportsAccessed))
              : true;
          })
          .exists(),
      },
      {
        key: 'training',
        text: $t('nav.training'),
        icon: {
          type: 'info',
          invertColor: true,
        },
        to: '/training',
      },
      {
        key: 'admin',
        icon: 'admin',
        text: $t('nav.admin'),
        to: '/admin',
        disabled: !(currentUser.value && currentUser.value.isAdmin),
      },
    ]);

    const { setAcl } = useMutations('auth', ['setAcl']);
    const { setCurrentIncidentId } = useMutations('incident', [
      'setCurrentIncidentId',
    ]);
    const { setWorksitesLoading } = useMutations('loading', [
      'setWorksitesLoading',
    ]);
    const { setLanguage } = useMutations('locale', ['setLanguage']);
    const { setStatuses, setWorkTypes } = useMutations('enums', [
      'setStatuses',
      'setWorkTypes',
    ]);

    const { login, logout } = useActions('auth', ['login', 'logout']);

    const handleChange = async (value) => {
      await Incident.api().fetchById(value);
      await User.api().updateUserState({
        incident: value,
      });
      setCurrentIncidentId(value);
      await router.push({
        name: route.value.name as string,
        params: { ...route.value.params, incident_id: value },
        query: { ...route.value.query },
      });
    };

    const isLandscape = () => {
      return window.matchMedia(
        'only screen and (max-device-width: 1223px) and (orientation: landscape)',
      ).matches;
    };

    const setupLanguage = async () => {
      let currentLanguage = detectBrowserLanguage();
      if (
        currentUser?.value?.primary_language ||
        currentUser?.value?.secondary_language
      ) {
        const userLanguage =
          Language.find(currentUser?.value?.primary_language) ||
          Language.find(currentUser?.value?.secondary_language);

        if (userLanguage) {
          currentLanguage = userLanguage.subtag;
        }
      }

      setLanguage(currentLanguage);
      if (currentLanguage !== context.root.$i18n.locale) {
        try {
          const data = await i18nService.getLanguage(currentLanguage);
          const { translations } = data;
          if (size(translations) > 0) {
            context.root.$i18n.setLocaleMessage(currentLanguage, translations);
            context.root.$i18n.locale = currentLanguage;
            $http.defaults.headers.common['Accept-Language'] = currentLanguage;
            const htmlHtmlElement = document.querySelector('html');
            if (htmlHtmlElement) {
              htmlHtmlElement.setAttribute('lang', currentLanguage);
            }
          }
        } catch (e) {
          $log.error(e);
        }
      }
      moment.locale(currentLanguage.split('-')[0]);
    };

    const acceptTermsAndConditions = async () => {
      await User.api().acceptTerms();
      showAcceptTermsModal.value = false;
    };

    const getUserTransferRequests = async () => {
      const response = await $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/transfer_requests`,
      );
      transferRequest.value = response.data.results.find((request) => {
        return request.user === currentUser?.value?.id;
      });
    };

    const logoutByPhoneNumber = async () => {
      const parsedNumber = parsePhoneNumber(
        currentUser?.value?.mobile || '',
        'US',
      );
      if (
        currentUser.value &&
        currentUser?.value?.mobile &&
        $phoneService.queueIds
      ) {
        await Promise.all(
          $phoneService.queueIds.map((queueId) =>
            $phoneService
              .apiLoginsByPhone(
                parsedNumber.formatNational().replace(/[^\d.]/g, ''),
                queueId,
              )
              .then(async ({ data }) => {
                if (data.length) {
                  await Promise.all(
                    data.map((phoneLogin) =>
                      $phoneService.apiLogoutAgent(phoneLogin.agentId),
                    ),
                  );
                }
                return null;
              })
              .catch(() => {}),
          ),
        );
      }
    };

    const logoutApp = async () => {
      await logoutByPhoneNumber();
      await logout();
    };

    watch(
      () => route.value.params.incident_id,
      (value) => {
        if (value && Number(currentIncidentId.value) !== Number(value)) {
          handleChange(value);
        }
      },
    );

    onMounted(() => {
      if (route.value.params.incident_id) {
        handleChange(route.value.params.incident_id);
      }
    });

    onMounted(async () => {
      loading.value = true;
      setCurrentIncidentId(null);
      let u;
      try {
        await User.api().get('/users/me', {});
        u = User.find(userId.value);
        AuthService.updateUser(u.$toJson());
      } catch {
        await AuthService.removeUser();
        await logout();
        return;
      }
      await Promise.all([
        Incident.api().get(
          '/incidents?fields=id,name,short_name,geofence,locations,turn_on_release,active_phone_number&limit=250&ordering=-start_at',
          {
            dataKey: 'results',
          },
        ),
        Organization.api().get(
          `/organizations/${user.value.user_claims.organization.id}`,
        ),
        Language.api().get('/languages', {
          dataKey: 'results',
        }),
        Report.api().get('/reports', {
          dataKey: 'results',
        }),
      ]);
      try {
        Role.api().get('/roles', {
          dataKey: 'results',
        });
        PhoneStatus.api().get('/phone_statuses', {
          dataKey: 'results',
        });
      } catch (e) {
        // TODO(tobi): Empty for now make this better
      }
      await getUserTransferRequests();
      await setupLanguage();
      setAcl(router);

      let incidentId = route.value.params.incident_id;
      if (!incidentId) {
        const incident = Incident.query().orderBy('id', 'desc').first();
        if (incident) {
          incidentId = incident.id;
        }
      }

      if (currentUser?.value?.states && currentUser.value.states.incident) {
        incidentId = currentUser.value.states.incident;
      }

      if (incidentId) {
        setCurrentIncidentId(incidentId);
      }

      if (
        !currentUser?.value?.accepted_terms_timestamp ||
        context.root
          .$moment(VERSION_3_LAUNCH_DATE)
          .isAfter(moment(currentUser.value.accepted_terms_timestamp)) ||
        (portal.value.tos_updated_at &&
          context.root
            .$moment(portal.value.tos_updated_at)
            .isAfter(currentUser.value.accepted_terms_timestamp))
      ) {
        showAcceptTermsModal.value = true;
      }

      try {
        await Incident.api().fetchById(incidentId);
      } catch (e) {
        setCurrentIncidentId(null);
        User.api().updateUserState({
          incident: null,
        });
        const incident = Incident.query().orderBy('id', 'desc').first();
        if (incident) {
          setCurrentIncidentId(incident.id);
        }
        await router.push(`/`).catch(() => {});
      }

      loading.value = false;
      ready.value = true;
    });

    return {
      user,
      showLoginModal,
      currentIncidentId,
      portal,
      userId,
      loading,
      ready,
      showAcceptTermsModal,
      transferRequest,

      currentUser,
      currentOrganization,
      currentIncident,
      incidents,

      routes,
      logoRoute,

      setWorksitesLoading,
      login,
      setStatuses,
      setWorkTypes,
      acceptTermsAndConditions,
      logoutApp,
      logoutByPhoneNumber,
      handleChange,
      isLandscape,

      slideOverVisible,
      toggle,
    };
  },
};
</script>

<style scoped>
.layout {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-rows: 80px 1fr;
  grid-auto-columns: 1fr;
  grid-auto-rows: 1fr;
  grid-auto-flow: row;
  grid-template-areas:
    'header'
    'main';
  padding-bottom: env(safe-area-inset-bottom);
}

.sidebar {
  grid-area: sidebar;
  border: 1px solid #dfdfdf;
  display: none;
  z-index: 10000;
  background-color: #2d2d2d;
}

.sidebar.slide-over {
  display: block;
  position: fixed;
  left: 0;
  top: 0;
  width: 150px;
  height: 100%;
}

.header {
  grid-area: header;
}

.main {
  grid-area: main;
  min-height: 0;
  min-width: 0;
}

@media (min-width: 768px) {
  .layout {
    display: grid;
    grid-template-columns: 150px 1fr;
    grid-template-rows: 80px 1fr;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    grid-auto-flow: row;
    grid-template-areas:
      'sidebar header'
      'sidebar main';
  }

  .sidebar {
    display: block;
  }

  .menu-button {
    display: none;
  }
}
</style>
