<template>
  <div class="flex flex-col justify-between">
    <section>
      <base-input
        v-model="url"
        data-testid="testUrlTextInput"
        class="w-full"
        :placeholder="$t('arcGisUploader.arcgis_url')"
      ></base-input>
      <base-select
        :model-value="incident"
        data-testid="testIncidentSelect"
        class="my-2"
        :options="incidents"
        searchable
        select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-10"
        item-key="id"
        label="name"
        :placeholder="$t('arcGisUploader.select_incident')"
        @update:modelValue="incident = $event"
      />
      <base-input
        v-model="prefix"
        data-testid="testPrefixTextInput"
        class="w-full"
        :placeholder="$t('arcGisUploader.unique_id_prefix')"
      ></base-input>
    </section>
    <base-button
      variant="solid"
      data-testid="testImportGisButton"
      :action="importGis"
      :text="$t('actions.import')"
      :alt="$t('actions.import')"
      class="p-3 px-6 text-xs"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import { getErrorMessage } from '../../utils/errors';
import Incident from '../../models/Incident';

export default defineComponent({
  name: 'ArcGisUploader',

  setup() {
    const { t } = useI18n();
    const $toasted = useToast();

    const url = ref<string>('');
    const prefix = ref<string>('');
    const incident = ref('');
    const incidents = computed(() =>
      Incident.query().orderBy('id', 'desc').get(),
    );

    const importGis = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/arcgis_import`,
          {
            url: url.value,
            prefix: prefix.value,
            incident: incident.value,
          },
        );
        await $toasted.success(t('arcGisUploader.gis_import_success'));
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
