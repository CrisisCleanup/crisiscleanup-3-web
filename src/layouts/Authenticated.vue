<template>
  <div v-if="!loading && currentIncident" class="layout">
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
        :key="route"
        :routes="routes"
        :logo-route="logoRoute"
        class="flex flex-col text-sm"
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
      <div class="h-full overflow-auto">
        <slot />
      </div>
    </div>
    <template v-if="showAcceptTermsModal">
      <TermsandConditionsModal
        :organization="currentOrganization"
        @acceptedTerms="acceptTermsAndConditions"
      />
    </template>
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
  <div v-else class="flex h-screen items-center justify-center">
    <font-awesome-icon size="xl" icon="spinner" spin />
  </div>
</template>

<script lang="ts">
import detectBrowserLanguage from 'detect-browser-language';
import { size } from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import moment from 'moment';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import Incident from '../models/Incident';
import User from '../models/User';
import Organization from '../models/Organization';
import Language from '../models/Language';
import Report from '../models/Report';
import Role from '../models/Role';
import PhoneStatus from '../models/PhoneStatus';
import { i18nService } from '../services/i18n.service';
import NavMenu from '../components/navigation/NavMenu.vue';
import TermsandConditionsModal from '../components/modals/TermsandConditionsModal.vue';
import Header from '../components/header/Header.vue';
import CompletedTransferModal from '../components/modals/CompletedTransferModal.vue';
import { AuthService } from '../services/auth.service';
import LoginForm from '../components/LoginForm.vue';
import useSetupLanguage from '@/hooks/useSetupLanguage';

const VERSION_3_LAUNCH_DATE = '2020-03-25';

export default {
  name: 'Authenticated',
  components: {
    LoginForm,
    CompletedTransferModal,
    NavMenu,
    TermsandConditionsModal,
    Header,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const $http = axios;
    const { t, setLocaleMessage, locale } = useI18n();
    const store = useStore();

    // const { $log } = context.root;
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const user = computed(() => store.getters['auth/user']);
    const showLoginModal = computed(() => store.getters['auth/showLoginModal']);

    const portal = computed(() => store.getters['enums/portal']);
    const userId = computed(() => store.getters['auth/userId']);

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
      text: t('nav.pew'),
      to: '/pew-pew',
    }));

    const currentIncident = computed(() =>
      Incident.find(currentIncidentId.value),
    );

    const routes = computed(() => [
      {
        key: 'dashboard',
        text: t('nav.dashboard'),
        to: `/incident/${currentIncidentId.value}/dashboard`,
      },
      {
        key: 'work',
        to: `/incident/${currentIncidentId.value}/work`,
        icon: 'cases',
        text: t('nav.work'),
      },
      {
        key: 'phone',
        icon: 'phone',
        text: t('nav.phone'),
        to: '/phone',
        // disabled: !context.root.$can || !context.root.$can('phone_agent'),
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
        text: t('nav.reports'),
        to: '/reports',
        // newBadge: Report.query()
        //     .where('created_at', (created_at: string) => {
        //       const reportsAccessed =
        //           currentUser?.value?.states &&
        //           currentUser.value.states.reports_last_accessed;
        //       return reportsAccessed
        //           ? moment(created_at).isAfter(moment(reportsAccessed))
        //           : true;
        //     })
        //     .exists(),
      },
      {
        key: 'training',
        text: t('nav.training'),
        icon: {
          type: 'info',
          invertColor: true,
        },
        to: '/training',
      },
      {
        key: 'admin',
        icon: 'admin',
        text: t('nav.admin'),
        to: '/admin',
        disabled: !(currentUser.value && currentUser.value.isAdmin),
      },
    ]);

    // store.commit('auth/setShowLoginModal', false);

    const handleChange = async (value: string) => {
      await Incident.api().fetchById(value);
      await User.api().updateUserState({
        incident: value,
      });
      store.commit('incident/setCurrentIncidentId', value);
      await router.push({
        name: route.name as string,
        params: { ...route.params, incident_id: value },
        query: { ...route.query },
      });
    };

    const isLandscape = () => {
      return window.matchMedia(
        'only screen and (max-device-width: 1223px) and (orientation: landscape)',
      ).matches;
    };

    const { setupLanguage } = useSetupLanguage();

    const acceptTermsAndConditions = async () => {
      await User.api().acceptTerms();
      showAcceptTermsModal.value = false;
    };

    const getUserTransferRequests = async () => {
      const response = await $http.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/transfer_requests`,
      );
      transferRequest.value = response.data.results.find((request: any) => {
        return request.user === currentUser?.value?.id;
      });
    };

    const logoutApp = async () => {
      await store.dispatch('auth/logout');
      await router.push('/login');
    };

    watch(
      () => route.params.incident_id,
      (value) => {
        if (value && Number(currentIncidentId.value) !== Number(value)) {
          handleChange(value as string);
        }
      },
    );

    onMounted(() => {
      if (route.params.incident_id) {
        handleChange(route.params.incident_id as string);
      }
    });

    onMounted(async () => {
      loading.value = true;
      store.commit('incident/setCurrentIncidentId', 60);
      let u;
      try {
        await User.api().get('/users/me', {});
        u = User.find(userId.value);
        if (u) {
          AuthService.updateUser(u.$toJson());
        }
      } catch {
        await AuthService.removeUser();
        await logoutApp();
        return;
      }
      await Promise.all([
        Incident.api().get(
          '/incidents?fields=id,name,short_name,geofence,locations,turn_on_release,active_phone_number&limit=250&ordering=-start_at',
          {
            dataKey: 'results',
          },
        ),
        Organization.api().get(`/organizations/${user.value.organizations.id}`),
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
      } catch {
        // TODO(tobi): Empty for now make this better
      }
      await getUserTransferRequests();
      await setupLanguage();
      store.commit('acl/setUserAcl', user.value.user_claims.id);

      let incidentId = route.params.incident_id;
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
        store.commit('incident/setCurrentIncidentId', incidentId);
      }

      if (
        !currentUser?.value?.accepted_terms_timestamp ||
        moment(VERSION_3_LAUNCH_DATE).isAfter(
          moment(currentUser.value.accepted_terms_timestamp),
        ) ||
        (portal.value.tos_updated_at &&
          moment(portal.value.tos_updated_at).isAfter(
            currentUser.value.accepted_terms_timestamp,
          ))
      ) {
        showAcceptTermsModal.value = true;
      }

      try {
        await Incident.api().fetchById(incidentId);
      } catch {
        store.commit('incident/setCurrentIncidentId', null);
        User.api().updateUserState({
          incident: null,
        });
        const incident = Incident.query().orderBy('id', 'desc').first();
        if (incident) {
          store.commit('incident/setCurrentIncidentId', false);
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
      route,
      routes,
      logoRoute,
      // login,
      acceptTermsAndConditions,
      logoutApp,
      // logoutByPhoneNumber,
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
  z-index: 5000;
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
