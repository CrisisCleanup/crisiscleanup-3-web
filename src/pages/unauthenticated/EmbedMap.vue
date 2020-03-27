<template>
  <PublicMap
    v-if="selectedIncident"
    ref="publicMap"
    @onSelectmarker="displayWorksite"
    :incident="selectedIncident"
    :work-types="workTypeMap"
    :locations="locations"
    hide-legend
  ></PublicMap>
</template>

<script>
import * as L from 'leaflet';
import PublicMap from '@/components/PublicMap.vue';
import Incident from '@/models/Incident';

export default {
  name: 'EmbedMap',
  components: { PublicMap },
  data() {
    return {
      incidents: [],
      locations: [],
      workTypeMap: {},
      statusMap: {},
      selectedIncident: null,
    };
  },
  async mounted() {
    const workTypesResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/work_types`,
    );
    const statusResponse = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/statuses`,
    );
    this.workTypeMap = workTypesResponse.data.results.reduce(function(
      map,
      obj,
    ) {
      map[obj.key] = obj.name_t;
      return map;
    },
    {});
    this.statusMap = statusResponse.data.results.reduce(function(map, obj) {
      map[obj.status] = obj.status_name_t;
      return map;
    }, {});
    await Incident.api().fetchById(this.$route.params.incident_id);
    const incident = Incident.find(this.$route.params.incident_id);
    this.selectedIncident = incident.id;
    await this.setLocations(incident);
  },
  methods: {
    async setLocations(incident) {
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
      let popupContent = `<b>${worksite.address} (${worksite.case_number}</b>)`;

      worksite.work_types.forEach(worktype => {
        popupContent += `<div>${this.workTypeMap[worktype.work_type]}(${
          this.statusMap[worktype.status]
        })</div>`;
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
