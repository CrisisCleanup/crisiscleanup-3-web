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

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';
import Incident from '@/models/Incident';
import { getErrorMessage } from '@/utils/errors';
import usei18n from '@/use/usei18n';
import useHttp from '@/use/useHttp';
import useToasted from '@/use/useToasted';

export default defineComponent({
  name: 'ArcGisUploader',

  setup() {
    const { $t } = usei18n();
    const { $http } = useHttp();
    const { $toasted } = useToasted();

    const url = ref<string>('');
    const prefix = ref<string>('');
    const incident = ref('');
    const incidents = computed(() =>
      Incident.query().orderBy('id', 'desc').get(),
    );

    const importGis = async () => {
      try {
        await $http.post(`${process.env.VUE_APP_API_BASE_URL}/arcgis_import`, {
          url: url.value,
          prefix: prefix.value,
          incident: incident.value,
        });
        await $toasted.success($t('arcGisUploader.gis_import_success'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    };

    return {
      url,
      prefix,
      incident,
      incidents,
      importGis,
    };
  },
});
</script>

<style scoped></style>
