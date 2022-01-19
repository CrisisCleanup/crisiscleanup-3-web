<template>
  <div class="flex flex-col justify-between">
    <section>
      <base-input
        v-model="url"
        class="w-full"
        :placeholder="$t('arcGisUploader.arcgis_url')"
      ></base-input>
      <form-select
        :value="incident"
        class="my-2"
        :options="incidents"
        searchable
        select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-10"
        item-key="id"
        label="name"
        :placeholder="$t('arcGisUploader.select_incident')"
        @input="incident = $event"
      />
      <base-input
        v-model="prefix"
        class="w-full"
        :placeholder="$t('arcGisUploader.unique_id_prefix')"
      ></base-input>
    </section>
    <base-button
      variant="solid"
      :action="importGis"
      :text="$t('actions.import')"
      class="p-3 px-6 text-xs"
    />
  </div>
</template>

<script>
import Incident from '@/models/Incident';
import { getErrorMessage } from '@/utils/errors';

export default {
  name: 'ArcGisUploader',
  computed: {
    incidents() {
      return Incident.query().orderBy('id', 'desc').get();
    },
  },
  methods: {
    async importGis() {
      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/arcgis_import`,
          {
            url: this.url,
            prefix: this.prefix,
            incident: this.incident,
          },
        );
        await this.$toasted.success(
          this.$t('arcGisUploader.gis_import_success'),
        );
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
  data() {
    return {
      url: '',
      prefix: '',
      incident: null,
    };
  },
};
</script>

<style scoped></style>
