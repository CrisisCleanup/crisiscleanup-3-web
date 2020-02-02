<template>
  <div class="flex layout overflow-hidden">
    <NavMenu :routes="routes" />
    <div class="flex flex-col w-full overflow-hidden">
      <div class="shadow p-1 bg-white">
        <div class="flex justify-between h-full items-center">
          <div class="flex items-center ml-2">
            <div class="h-10 w-10 flex items-center">
              <DisasterIcon
                v-if="currentIncident && currentIncident.incidentImage"
                :current-incident="currentIncident"
              />
            </div>
            <div class="flex flex-col ml-2 w-84">
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
            <v-popover popover-class="menu-popover" placement="bottom-end">
              <div class="flex cursor-pointer items-center">
                <img
                  src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80"
                  class="rounded-full w-10 h-10"
                />
                <span class="p-3">
                  {{ name }}
                  <font-awesome-icon class="cursor-pointer" icon="caret-down" />
                </span>
              </div>
              <div slot="popover" class="flex flex-col">
                <router-link
                  to="/profile"
                  class="router-link text-base p-2 hover:bg-gray-100"
                  >Profile</router-link
                >
                <!--                <button v-can="['update_portal_settings']">New</button>-->
                <div
                  class="text-base p-2 hover:bg-gray-100 cursor-pointer"
                  @click="
                    () => {
                      $store.dispatch('auth/logout');
                      $router.push('/login');
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
      <div v-if="ready" class="h-full flex-grow content">
        <slot />
      </div>
      <div
        v-else
        style="z-index: 1001;"
        class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
      >
        <div class="flex flex-col items-center">
          <spinner :message="$t('info.loading')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import detectBrowserLanguage from 'detect-browser-language';
import { size } from 'lodash';
import Incident from '@/models/Incident';
import User from '@/models/User';
import WorkType from '@/models/WorkType';
import Organization from '@/models/Organization';
import Status from '@/models/Status';
import { i18nService } from '@/services/i18n.service';
import DisasterIcon from '../components/DisasterIcon';
import NavMenu from '@/components/navigation/NavMenu';

export default {
  name: 'Authenticated',
  components: { DisasterIcon, NavMenu },
  data() {
    return {
      loading: false,
      ready: false,
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
    incidents() {
      return Incident.query()
        .orderBy('id', 'desc')
        .get();
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
          to: '/organization',
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
    await Promise.all([
      User.api().get('/users/me', {}),
      Incident.api().get(
        '/incidents?fields=id,name,short_name,geofence&limit=150&ordering=-start_at',
        {
          dataKey: 'results',
        },
      ),
      WorkType.api().get('/work_types?limit=100', {
        dataKey: 'results',
      }),
      Status.api().get('/statuses?limit=100', {
        dataKey: 'results',
      }),
      Organization.api().get(
        `/organizations/${this.user.user_claims.organization.id}`,
      ),
    ]);

    const currentLanguage =
      this.currentUser.primary_language || detectBrowserLanguage();

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
          document.querySelector('html').setAttribute('lang', currentLanguage);
        }
      } catch (e) {
        this.$log.error(e);
      }
    }

    this.$moment.locale(currentLanguage.split('-')[0]);

    let incidentId = this.$route.params.incident_id;
    if (!incidentId) {
      const incident = Incident.query()
        .orderBy('id', 'desc')
        .first();
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

    try {
      await Incident.api().fetchById(incidentId);
    } catch (e) {
      this.setCurrentIncidentId(null);
      User.api().updateUserState({
        incident: null,
      });
      await this.$router.push(`/dashboard`);
    }

    this.loading = false;
    this.ready = true;
  },
  methods: {
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
    ...mapActions('auth', ['login']),
    ...mapMutations('incident', ['setCurrentIncidentId']),
    ...mapMutations('loading', ['setWorksitesLoading']),
    ...mapMutations('locale', ['setLanguage']),
  },
};
</script>

<style>
body {
  font-family: 'Nunito Sans', sans-serif;
  overflow: hidden;
}

.layout {
  height: 100vh;
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
</style>
