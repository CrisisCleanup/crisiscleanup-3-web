<template>
  <div class="grid h-full grid-rows-2 p-4">
    <div class="grid grid-cols-3 h-1/2 gap-5">
      <div class="col-span-1">
        <div class="mb-1 flex items-center justify-between">
          <div v-if="currentLocalization.id" class="text-xl font-semibold mb-3">
            {{ currentLocalization.id }} : {{ currentLocalization.group_label }}
          </div>
          <div v-else class="text-xl font-semibold mb-3">
            {{ $t('~~New Localization') }}
          </div>
          <div class="flex items-center gap-2">
            <base-button
              :action="saveLocalization"
              variant="solid"
              class="px-2 py-1"
              >{{ $t('~~Save') }}
            </base-button>
            <base-button
              :action="saveAndClear"
              variant="solid"
              class="px-2 py-1"
              >{{ $t('~~Save and Clear') }}
            </base-button>
          </div>
        </div>
        <base-input
          v-model="currentLocalization.group"
          :placeholder="$t('~~Group')"
          class="mb-2"
        />
        <base-input
          v-model="currentLocalization.label"
          :placeholder="$t('~~Label')"
          class="mb-2"
        />
        <base-input
          v-model="currentLocalization.group_label"
          :placeholder="$t('~~Group Label')"
          class="mb-2"
        />
        <base-checkbox v-model="currentLocalization.is_front_end" class="mb-2">
          {{ $t('~~Available in frontend') }}
        </base-checkbox>
      </div>
      <div class="col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xl font-semibold">{{ $t('~~Text Items') }}</span>
          <div class="flex items-center gap-2">
            <base-button
              :action="addNewText"
              variant="outline"
              class="px-2 py-1"
              >{{ $t('~~Add new') }}
            </base-button>
            <base-button
              v-if="!currentLocalization.id"
              :action="autoTranslate"
              variant="outline"
              class="px-2 py-1"
              >{{ $t('~~Generate Translations') }}
            </base-button>
          </div>
        </div>
        <div
          v-for="text in localizationTexts"
          :key="text"
          class="flex gap-2 items-center mb-1"
        >
          <base-select
            :key="text.language"
            v-model="text.language"
            class="flex-1"
            :options="languages"
            item-key="id"
            label="name_t"
            size="large"
            select-classes="bg-white border text-xs p-1"
          />
          <base-input
            v-model="text.text"
            class="w-full flex-1"
            type="search"
            :placeholder="$t('Text')"
          ></base-input>
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="small"
            type="trash"
            class="flex-initial w-6"
            @click="
              () => {
                deleteLocalizationText(text);
              }
            "
          />
          <ccu-icon
            :alt="$t('actions.edit')"
            size="small"
            type="edit"
            class="flex-initial w-6"
            @click="
              () => {
                editLocalizationTextAdvanced(text);
              }
            "
          />
          <font-awesome-icon
            :alt="$t('actions.preview')"
            size="small"
            icon="eye"
            class="flex-initial w-6"
            @click="
              () => {
                previewLocalizationText(text);
              }
            "
          />
        </div>
      </div>
    </div>
    <div>
      <base-input
        :placeholder="$t('actions.search')"
        @update:modelValue="
          (value) => {
            tableQuery.search = value;
            tableQuery = { ...tableQuery };
          }
        "
      />
      <AjaxTable
        :url="tableUrl"
        :columns="columns"
        :query="tableQuery"
        @rowClick="
          (translation) => {
            currentLocalization = translation;
            loadLocalizationTexts(translation).then(() => {});
          }
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import AjaxTable from '@/components/AjaxTable.vue';
import { makeTableColumns } from '@/utils/table';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import Language from '@/models/Language';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { getErrorMessage } from '@/utils/errors';
import { formatCmsItem } from '@/utils/helpers';
import CmsViewer from '@/components/cms/CmsViewer.vue';
import useDialogs from '@/hooks/useDialogs';
import Editor from '@/components/Editor.vue';
import useTranslation from '@/hooks/useTranslation';

interface Localization {
  id?: string;
  group: string;
  label: string;
  group_label: string;
  is_front_end: boolean;
}

interface LocalizationText {
  id?: string;
  localization: string;
  text: string;
  language: string;
}

export default defineComponent({
  name: 'AdminLocalizations',
  components: { BaseButton, BaseInput, BaseCheckbox, AjaxTable },
  setup() {
    const languages = Language.all();
    const { t } = useI18n();
    const { component } = useDialogs();

    const $toasted = useToast();

    const { translate } = useTranslation();

    const tableUrl = `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/admins/localizations`;
    const columns = makeTableColumns([
      ['id', '1fr', 'Id'],
      ['group', '1fr', 'Group'],
      ['group_label', '1fr', 'Group Label'],
      ['is_front_end', '1fr', 'Frontend'],
    ]);

    const tableQuery = ref({
      search: '',
    });

    const currentLocalization = ref<Localization>({
      group: '',
      label: '',
      group_label: '',
      is_front_end: true,
    });

    const localizationTexts = ref<LocalizationText[]>([
      {
        localization: '',
        text: '',
        language: '',
      },
    ]);

    async function autoTranslate() {
      const englishLanguage = Language.query().where('subtag', 'en-US').first();
      const englishLocalization = localizationTexts.value.find(
        (i) => i.language === englishLanguage?.id,
      );

      if (englishLocalization) {
        localizationTexts.value = [englishLocalization];
        for (const lang of Language.all()) {
          if (lang.id === englishLanguage?.id) {
            continue;
          }
          const translation = await translate(
            englishLocalization.text,
            'en-US',
            lang.subtag,
          );
          localizationTexts.value.push({
            localization: '',
            text: translation,
            language: lang.id,
          });
        }
      } else {
        await $toasted.error('English translation required for generation');
      }
    }

    async function editLocalizationTextAdvanced(text: LocalizationText) {
      await component({
        title: t('~~Edit Text'),
        component: Editor,
        classes: 'w-full overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          modelValue: text.text,
        },
        listeners: {
          'update:modelValue': (value: string) => {
            text.text = value;
          },
        },
      });
    }

    async function previewLocalizationText(text: LocalizationText) {
      await component({
        title: t('~~Preview Text'),
        component: CmsViewer,
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          content: formatCmsItem(text.text),
        },
      });
    }

    async function deleteLocalizationText(text: LocalizationText) {
      if (text.id) {
        return axios.delete(
          `${import.meta.env.VITE_APP_API_BASE_URL}/admins/localizations_text/${
            text.id
          }`,
        );
      } else {
        localizationTexts.value = localizationTexts.value.filter(function (
          item,
        ) {
          return item !== text;
        });
      }
    }

    async function saveAndClear() {
      try {
        await saveLocalization();
        currentLocalization.value = {
          group: '',
          label: '',
          group_label: '',
          is_front_end: true,
        };
        localizationTexts.value = [
          {
            localization: '',
            text: '',
            language: '',
          },
        ];
      } catch {
        /* empty */
      }
    }

    async function saveLocalization() {
      let response;
      try {
        if (currentLocalization.value.id) {
          response = await axios.put(
            `${tableUrl}/${currentLocalization.value.id}`,
            currentLocalization.value,
          );
        } else {
          response = await axios.post(tableUrl, currentLocalization.value);
        }
        currentLocalization.value = response.data;
        await saveLocalizationTexts();
        await $toasted.success('~~Success');
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
        throw error;
      }
    }

    async function saveLocalizationTexts() {
      await Promise.all(
        localizationTexts.value.map((text) => {
          if (text.id) {
            return axios.put(
              `${
                import.meta.env.VITE_APP_API_BASE_URL
              }/admins/localizations_text/${text.id}`,
              text,
            );
          } else {
            return axios.post(
              `${
                import.meta.env.VITE_APP_API_BASE_URL
              }/admins/localizations_text`,
              { ...text, localization: currentLocalization.value.id },
            );
          }
        }),
      );
      await loadLocalizationTexts(currentLocalization.value);
    }

    function addNewText() {
      localizationTexts.value.push({
        localization: '',
        text: '',
        language: '',
      });
    }

    async function loadLocalizationTexts(localization: Localization) {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/admins/localizations_text`,
        {
          params: {
            localization: localization.id,
          },
        },
      );
      localizationTexts.value = response.data.results;
      return;
    }

    return {
      currentLocalization,
      tableUrl,
      columns,
      localizationTexts,
      loadLocalizationTexts,
      languages,
      addNewText,
      saveLocalization,
      saveAndClear,
      tableQuery,
      deleteLocalizationText,
      editLocalizationTextAdvanced,
      previewLocalizationText,
      autoTranslate,
    };
  },
});
</script>

<style scoped></style>
