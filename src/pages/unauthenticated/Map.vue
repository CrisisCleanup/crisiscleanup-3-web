<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div class="grid--nav">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.route || '#'"
          class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
        >
          {{ lang.nav[item.key] }}
        </router-link>
      </div>
      <div class="grid--actions">
        <base-text
          font="display"
          variant="h2"
          :weight="300"
          class="text-crisiscleanup-dark-500"
          >{{ lang.relief_org }}</base-text
        >
        <base-button variant="solid" size="large">
          {{ lang.register }}
        </base-button>
      </div>
      <div class="grid--main">
        <div class="text-4xl">
          {{ $t('~~Visualize the Disaster in Real Time') }}
        </div>
        <div class="text-xl">
          {{ $t('~~Choose an incident from the drop down to see cases') }}
        </div>

        <form-select
          :value="selectedIncident"
          class="form-field"
          :options="incidents"
          searchable
          select-classes="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-72"
          item-key="id"
          label="name"
          :placeholder="$t('~~Disaster')"
          @input="
            value => {
              selectedIncident = value;
              setLocations(value);
            }
          "
        />

        <div class="w-full h-full border bg-crisiscleanup-light-grey">
          <PublicMap
            v-if="selectedIncident"
            ref="publicMap"
            @onSelectmarker="displayWorksite"
            :incident="selectedIncident"
            :work-types="workTypeMap"
            :locations="locations"
          ></PublicMap>
        </div>

        <div class="text-lg my-1">
          {{
            $t(
              '~~Personal information has been hidden, and the location has been blurred to 400 meters',
            )
          }}
        </div>
      </div>
      <div class="grid--footer self-center text-right">
        <router-link
          v-for="item in footer"
          :key="item.key"
          :to="item.route || '#'"
          class="font-body font-display text-h2 text-crisiscleanup-dark-300 mx-3"
        >
          {{ lang.footer[item.key] }}
        </router-link>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import * as L from 'leaflet';
import HomeLayout from '@/layouts/Home';
import PublicMap from '../../components/PublicMap';
import { FooterNavigation, HomeNavigation } from '../Login';

export default {
  name: 'Map',
  components: { PublicMap, HomeLayout },
  data() {
    return {
      incidents: [],
      locations: [],
      workTypeMap: {},
      selectedIncident: null,
      lang: {
        register: this.$t('actions.register'),
        relief_org: this.$t('publicNav.relief_orgs_only'),
        nav: {
          home: this.$t('publicNav.home'),
          aboutUs: this.$t('publicNav.about_us'),
          blog: this.$t('publicNav.blog'),
          map: this.$t('publicNav.map'),
          training: this.$t('publicNav.training'),
          contact: this.$t('publicNav.contact'),
        },
        footer: {
          demo: this.$t('publicNav.demo'),
          contact: this.$t('publicNav.contact'),
          terms: this.$t('publicNav.terms'),
          privacy: this.$t('publicNav.privacy'),
        },
      },
      navigation: HomeNavigation,
      footer: FooterNavigation,
    };
  },
  async mounted() {
    const incidentsResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents_list?fields=id,name,short_name,geofence,locations&limit=150`,
    );
    const workTypesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/work_types`,
    );
    this.incidents = incidentsResponse.data.results;
    this.workTypeMap = workTypesResponse.data.results.reduce(function(
      map,
      obj,
    ) {
      map[obj.key] = obj.name_t;
      return map;
    },
    {});
    this.selectedIncident = this.incidents[this.incidents.length - 1].id;
    await this.setLocations(this.incidents[this.incidents.length - 1].id);
  },
  methods: {
    async setLocations(incidentId) {
      const incident = this.incidents.find(i => i.id === incidentId);
      if (incident.locations.length) {
        const locationIds = incident.locations.map(
          location => location.location,
        );
        const locationsResponse = await this.$http.get(
          `${
            process.env.VUE_APP_API_BASE_URL
          }/locations?id__in=${locationIds.join(',')}`,
        );
        this.locations = locationsResponse.data.results;
      }
    },
    displayWorksite(worksite) {
      const popup = L.popup({ className: 'pixi-popup' });
      let popupContent = `<b>${worksite.name} (${worksite.case_number}</b>)`;

      worksite.work_types.forEach(worktype => {
        popupContent += `<div>${this.workTypeMap[worktype.work_type]}</div>`;
      });

      popup
        .setLatLng([
          worksite.location.coordinates[1],
          worksite.location.coordinates[0],
        ])
        .setContent(popupContent)
        .openOn(this.$refs.publicMap.map);
    },
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav main main main main .'
      'nav main main main main .'
      'nav main main main main .'
      'actions . . . . .'
      '. . . . . .'
      '. . . . footer footer';
  }

  .grid {
    &--overlay {
      grid-row: 1 / span 7 !important;
      grid-column: 1 / span 2 !important;
    }
  }
}

.input {
  @apply m-2;
}
</style>
