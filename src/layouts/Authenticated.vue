<template>
  <Loader :loading="loading" :class="loading && 'flex layout h-full'">
    <template #content>
      <div class="layout" :class="{ 'layout--mobile': $mq === 'sm' }">
        <NavMenu
          v-if="$mq !== 'sm'"
          :routes="routes"
          class="sidebar--grid"
          :key="currentUser && currentUser.permissions"
        />
        <Slide width="150" v-else>
          <NavMenu
            :routes="routes"
            class="flex flex-col text-sm"
            :key="currentUser && currentUser.permissions"
          />
        </Slide>
        <div class="shadow header--grid bg-white">
          <div class="flex justify-between h-full items-center">
            <div class="flex items-center ml-2">
              <div class="h-10 w-10 flex items-center">
                <DisasterIcon
                  v-show="$mq !== 'sm'"
                  v-if="currentIncident && currentIncident.incidentImage"
                  :current-incident="currentIncident"
                />
              </div>
              <div class="flex flex-col ml-2 md:w-84 lg:w-84">
                <form-select
                  :key="currentIncidentId"
                  :value="currentIncident"
                  :options="incidents"
                  :clearable="false"
                  searchable
                  select-classes="h-12"
                  item-key="id"
                  label="name"
                  @input="handleChange"
                />
                <div class="flex ml-2 font-bold">
                  <span>{{ selectedRoute }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center overflow-hidden">
              <v-popover
                popover-class="menu-popover"
                placement="bottom-end"
                data-cy="auth.userprofile"
              >
                <div class="flex cursor-pointer items-center">
                  <img
                    :src="currentUser && currentUser.profilePictureUrl"
                    class="rounded-full w-10 h-10"
                  />
                  <span class="p-3">
                    {{ name }}
                    <font-awesome-icon
                      class="cursor-pointer"
                      icon="caret-down"
                    />
                  </span>
                </div>
                <div slot="popover" class="flex flex-col">
                  <router-link
                    to="/profile"
                    class="router-link text-base p-2 hover:bg-crisiscleanup-light-grey"
                    >Profile</router-link
                  >
                  <div
                    data-cy="auth.userprofile.logout"
                    class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
                    @click="
                      () => {
                        $store.dispatch('auth/logout');
                      }
                    "
                  >
                    Logout
                  </div>
                </div>
              </v-popover>
            </div>
          </div>
        </div>
        <div v-if="ready" class="main--grid overflow-auto">
          <slot />
        </div>
        <div v-if="showAcceptTermsModal">
          <TermsandConditionsModal @acceptedTerms="acceptTermsAndConditions" />
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
import DisasterIcon from '../components/DisasterIcon';
import PhoneStatus from '../models/PhoneStatus';
import { hash } from '../utils/promise';

const VERSION_3_LAUNCH_DATE = '2020-03-25';

export default {
  name: 'Authenticated',
  components: { DisasterIcon, NavMenu, Loader, TermsandConditionsModal, Slide },
  data() {
    return {
      loading: false,
      ready: false,
      showAcceptTermsModal: false,
    };
  },
  computed: {
    name() {
      if (this.currentUser) {
        return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      }
      return '';
    },
    selectedRoute() {
      return this.$t(this.$route.name);
    },
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
          key: 'my_organization',
          icon: 'organization',
          iconSize: 'large',
          to: '/organization/invitations',
        },
        {
          key: 'phone',
          icon: 'phone',
          text: this.$t('nav.phone'),
          to: '/phone',
          disabled:
            !this.$can('phone_agent') || process.env.NODE_ENV === 'production',
        },
        {
          key: 'caller',
          icon: 'phone',
          text: this.$t('nav.phone_beta'),
          to: '/caller',
          disabled: !this.$can('phone_agent'),
        },
        {
          key: 'admin',
          icon: 'history',
          to: '/admin',
          disabled: !this.currentUser.isAdmin,
        },
      ];
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
    await Promise.all([
      User.api().get('/users/me', {}),
      Incident.api().get(
        '/incidents?fields=id,name,short_name,geofence,locations&limit=150&ordering=-start_at',
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
      this.getEnums(),
    ]);
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
      await this.$router.push(`/`);
    }

    this.loading = false;
    this.ready = true;
  },
  methods: {
    async getEnums() {
      const enums = await hash({
        statuses: this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/statuses`,
        ),
        workTypes: await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/work_types`,
        ),
      });
      this.setStatuses(enums.statuses.data.results);
      this.setWorkTypes(enums.workTypes.data.results);
    },
    async handleChange(value) {
      this.ready = false;
      await Incident.api().fetchById(value);
      this.ready = true;
      User.api().updateUserState({
        incident: value,
      });
      this.setCurrentIncidentId(value);
      await this.$router.push({
        name: this.$route.name,
        params: { ...this.$route.params, incident_id: value },
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
            this.$http.defaults.headers.common[
              'Accept-Language'
            ] = currentLanguage;
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
    'sidebar header'
    'sidebar main';
}

.layout.layout--mobile {
  grid-template-columns: auto !important;
  grid-template-rows: 4.5rem auto 1px;
  grid-template-areas:
    'header'
    'main';
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
