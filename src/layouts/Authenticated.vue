<template>
  <Loader :loading="loading" :class="loading && 'flex layout h-full'">
    <template #content>
      <div class="layout" :class="{ 'layout--mobile': $mq === 'sm' }">
        <router-link v-if="$mq !== 'sm'" :to="logoRoute.to" class="logo--grid">
          <div class="logo flex justify-center p-3">
            <img src="@/assets/crisiscleanup_logo.png" style="height: 53px" />
          </div>
        </router-link>
        <NavMenu
          v-if="$mq !== 'sm'"
          :routes="routes"
          :logo-route="logoRoute"
          class="sidebar--grid"
          :key="JSON.stringify(currentUser && currentUser.permissions)"
        />
        <Slide width="150" v-else>
          <NavMenu
            :routes="routes"
            :logo-route="logoRoute"
            class="flex flex-col text-sm"
            :key="JSON.stringify(currentUser && currentUser.permissions)"
          />
        </Slide>
        <Header
          :current-incident="currentIncident"
          :incidents="incidents"
          @update:incident="handleChange"
          @auth:logout="
            () => {
              logoutByPhoneNumber();
              $store.dispatch('auth/logout');
            }
          "
        />
        <div
          v-if="ready"
          class="main--grid"
          :class="!$route.meta.noscroll ? 'overflow-auto' : ''"
        >
          <slot />
        </div>
        <div v-if="showAcceptTermsModal">
          <TermsandConditionsModal @acceptedTerms="acceptTermsAndConditions" />
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
      </div>
    </template>
  </Loader>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import detectBrowserLanguage from 'detect-browser-language';
import { size } from 'lodash';
import Incident from '@/models/Incident';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Language from '@/models/Language';
import Role from '@/models/Role';
import { i18nService } from '@/services/i18n.service';
import NavMenu from '@/components/navigation/NavMenu';
import Loader from '@/components/Loader';
import TermsandConditionsModal from '@/components/TermsandConditionsModal';
import { Slide } from 'vue-burger-menu';
import { parsePhoneNumber } from 'libphonenumber-js';
import Header from '@/components/header/Header.vue';
import PhoneStatus from '../models/PhoneStatus';
import CompletedTransferModal from '../components/CompletedTransferModal';
import { AuthService } from '../services/auth.service';

const VERSION_3_LAUNCH_DATE = '2020-03-25';

export default {
  name: 'Authenticated',
  components: {
    CompletedTransferModal,
    NavMenu,
    Loader,
    TermsandConditionsModal,
    Slide,
    Header,
  },
  data() {
    return {
      loading: false,
      ready: false,
      showAcceptTermsModal: false,
      transferRequest: null,
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    currentOrganization() {
      return Organization.find(this.currentUser.organization.id);
    },
    incidents() {
      return Incident.query().orderBy('id', 'desc').get();
    },
    currentIncident() {
      return Incident.find(this.currentIncidentId);
    },
    routes() {
      return [
        {
          key: 'dashboard',
          text: this.$t('nav.dashboard'),
          to: `/incident/${this.currentIncidentId}/dashboard`,
        },
        {
          key: 'cases',
          to: `/incident/${this.currentIncidentId}/cases/new`,
        },
        {
          key: 'phone',
          icon: 'phone',
          text: this.$t('nav.phone'),
          to: '/phone',
          disabled: !this.$can || !this.$can('phone_agent'),
        },
        {
          key: 'caller',
          icon: 'phone',
          text: this.$t('nav.phone_beta'),
          to: '/caller',
          disabled: true,
        },
        {
          key: 'connect_first',
          icon: 'phone',
          text: this.$t('nav.phone_alpha'),
          to: '/connect_first',
          disabled:
            !this.$can ||
            !this.$can('phone_agent') ||
            !this.$can('beta_feature.connect_first_integration'),
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
          text: this.$t('nav.reports'),
          to: '/reports',
        },
        {
          key: 'training',
          text: this.$t('nav.training'),
          icon: {
            type: 'info',
            invertColor: true,
          },
          to: '/training',
        },
        {
          key: 'admin',
          icon: 'admin',
          text: this.$t('nav.admin'),
          to: '/admin',
          disabled: !(this.currentUser && this.currentUser.isAdmin),
        },
      ];
    },
    logoRoute() {
      return {
        key: 'dashboard',
        text: this.$t('nav.dashboard'),
        to: `/incident/${this.currentIncidentId}/dashboard`,
      };
    },
    ...mapState('incident', ['currentIncidentId']),
    ...mapState('auth', ['user']),
  },
  watch: {
    '$route.params.incident_id': {
      handler(value) {
        if (value && Number(this.currentIncidentId) !== Number(value)) {
          this.handleChange(value);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  async mounted() {
    this.loading = true;
    this.setCurrentIncidentId(null);
    let user;
    try {
      await User.api().get('/users/me', {});
      user = User.find(this.$store.getters['auth/userId']);
      AuthService.updateUser(user.$toJson());
    } catch {
      await AuthService.removeUser();
      await this.$store.dispatch('auth/logout');
      return;
    }
    await Promise.all([
      Incident.api().get(
        '/incidents?fields=id,name,short_name,geofence,locations,turn_on_release&limit=150&ordering=-start_at',
        {
          dataKey: 'results',
        },
      ),
      Organization.api().get(
        `/organizations/${this.user.user_claims.organization.id}`,
      ),
      Language.api().get('/languages', {
        dataKey: 'results',
      }),
      Role.api().get('/roles', {
        dataKey: 'results',
      }),
      PhoneStatus.api().get('/phone_statuses', {
        dataKey: 'results',
      }),
    ]);
    await this.getUserTransferRequests();
    await this.setupLanguage();
    this.setAcl(this.$router);

    let incidentId = this.$route.params.incident_id;
    if (!incidentId) {
      const incident = Incident.query().orderBy('id', 'desc').first();
      if (incident) {
        incidentId = incident.id;
      }
    }

    if (this.currentUser.states && this.currentUser.states.incident) {
      incidentId = this.currentUser.states.incident;
    }

    if (incidentId) {
      this.setCurrentIncidentId(incidentId);
    }

    if (
      !this.currentUser.accepted_terms_timestamp ||
      this.$moment(VERSION_3_LAUNCH_DATE).isAfter(
        this.$moment(this.currentUser.accepted_terms_timestamp),
      )
    ) {
      this.showAcceptTermsModal = true;
    }

    try {
      await Incident.api().fetchById(incidentId);
    } catch (e) {
      this.setCurrentIncidentId(null);
      User.api().updateUserState({
        incident: null,
      });
      const incident = Incident.query().orderBy('id', 'desc').first();
      if (incident) {
        this.setCurrentIncidentId(incident.id);
      }
      await this.$router.push(`/`).catch(() => {});
    }

    this.loading = false;
    this.ready = true;
  },
  methods: {
    async handleChange(value) {
      await Incident.api().fetchById(value);
      await User.api().updateUserState({
        incident: value,
      });
      this.setCurrentIncidentId(value);
      await this.$router.push({
        name: this.$route.name,
        params: { ...this.$route.params, incident_id: value },
        query: { ...this.$route.query },
      });
    },
    async setupLanguage() {
      let currentLanguage = detectBrowserLanguage();
      const userLanguage =
        Language.find(this.currentUser.primary_language) ||
        Language.find(this.currentUser.secondary_language);
      if (userLanguage) {
        currentLanguage = userLanguage.subtag;
      }

      this.setLanguage(currentLanguage);
      if (currentLanguage !== this.$i18n.locale) {
        try {
          const data = await i18nService.getLanguage(currentLanguage);
          const { translations } = data;
          if (size(translations) > 0) {
            this.$i18n.setLocaleMessage(currentLanguage, translations);
            this.$i18n.locale = currentLanguage;
            this.$http.defaults.headers.common['Accept-Language'] =
              currentLanguage;
            document
              .querySelector('html')
              .setAttribute('lang', currentLanguage);
          }
        } catch (e) {
          this.$log.error(e);
        }
      }

      this.$moment.locale(currentLanguage.split('-')[0]);
    },
    ...mapActions('auth', ['login']),
    ...mapMutations('auth', ['setAcl']),
    ...mapMutations('incident', ['setCurrentIncidentId']),
    ...mapMutations('loading', ['setWorksitesLoading']),
    ...mapMutations('locale', ['setLanguage']),
    ...mapMutations('enums', ['setStatuses', 'setWorkTypes']),
    async acceptTermsAndConditions() {
      await User.api().acceptTerms();
      this.showAcceptTermsModal = false;
    },
    async getUserTransferRequests() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/transfer_requests`,
      );
      this.transferRequest = response.data.results.find((request) => {
        return request.user === this.currentUser.id;
      });
    },
    async logout() {
      await this.logoutByPhoneNumber();
      await this.$store.dispatch('auth/logout');
    },
    async logoutByPhoneNumber() {
      const parsedNumber = parsePhoneNumber(this.currentUser.mobile, 'US');
      if (this.currentUser && this.currentUser.mobile) {
        await Promise.all(
          this.$phoneService.queueIds.map((queueId) =>
            this.$phoneService
              .apiLoginsByPhone(
                parsedNumber.formatNational().replace(/[^\d.]/g, ''),
                queueId,
              )
              .then(async ({ data }) => {
                if (data.length) {
                  await Promise.all(
                    data.map((login) =>
                      this.$phoneService.apiLogoutAgent(login.agentId),
                    ),
                  );
                }
                return null;
              })
              .catch(() => {}),
          ),
        );
      }
    },
  },
};
</script>

<style>
body {
  font-family: 'Nunito Sans', sans-serif;
  overflow: hidden;
}

.content {
  max-height: 100%;
}

#app .router-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.router-link:hover {
  text-decoration: none !important;
}

.router-link:active {
  text-decoration: none !important;
}

.router-link {
  text-decoration: none !important;
}

.incident-select .ant-select-selection {
  border: 0;
  box-shadow: none;
}

.menu-popover {
  @apply bg-white text-black outline-none w-full border mt-4 shadow w-48;
  left: 0.75rem !important;
  z-index: 100;
}

.layout {
  height: 100vh;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 8rem auto;
  grid-template-rows: 4.5rem auto;
  grid-template-areas:
    'logo header'
    'sidebar main';
}

.layout.layout--mobile {
  grid-template-columns: auto !important;
  grid-template-rows: 4.5rem auto 1px;
  grid-template-areas:
    'header'
    'main';
}

.logo--grid {
  grid-area: logo;
  background-color: #2d2d2d;
}

.sidebar--grid {
  grid-area: sidebar;
}

.header--grid {
  grid-area: header;
}

.main--grid {
  grid-area: main;
}

.bm-burger-button {
  cursor: pointer;
  height: 20px;
  left: 15px;
  position: absolute;
  top: 30px;
  width: 25px;
}

.bm-item-list > * {
  display: flex;
  padding: 0;
  text-decoration: none;
}

.bm-item-list {
  margin-left: 0;
}

.bm-menu {
  z-index: 1005;
  padding-top: 0;
  background-color: #2d2d2d;
}
</style>
