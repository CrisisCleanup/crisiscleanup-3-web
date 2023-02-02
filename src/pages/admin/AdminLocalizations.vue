<template>
  <div class="grid h-full grid-rows-2 p-4">
    <div class="grid grid-cols-3 h-1/2 gap-5">
      <div class="col-span-1">
        <div class="mb-1 flex items-center justify-between">
          <div
            v-if="currentLocalization && currentLocalization.id"
            class="text-xl font-semibold mb-3"
          >
            {{ currentLocalization.id }} : {{ currentLocalization.group_label }}
          </div>
          <div v-else class="text-xl font-semibold mb-3">
            {{ $t('adminLocalizations.new_localization') }}
          </div>
          <div class="flex items-center gap-2">
            <base-button
              :action="saveLocalization"
              variant="solid"
              class="px-2 py-1"
              >{{ $t('actions.save') }}
            </base-button>
            <base-button
              :action="saveAndClear"
              variant="solid"
              class="px-2 py-1"
              >{{ $t('actions.save_and_clear') }}
            </base-button>
          </div>
        </div>
        <base-input
          v-model="currentLocalization.group"
          :placeholder="$t('adminLocalizations.group')"
          class="mb-2"
        />
        <base-input
          v-model="currentLocalization.label"
          :placeholder="$t('adminLocalizations.label')"
          class="mb-2"
        />
        <base-input
          v-model="currentLocalization.group_label"
          :placeholder="$t('adminLocalizations.group_label')"
          class="mb-2"
        />
        <base-checkbox v-model="currentLocalization.is_front_end" class="mb-2">
          {{ $t('adminLocalizations.available_frontend') }}
        </base-checkbox>
      </div>
      <div class="col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xl font-semibold">{{ $t('adminLocalizations.text_items') }}</span>
          <div class="flex items-center gap-2">
            <base-button
              :action="addNewText"
              variant="outline"
              class="px-2 py-1"
              >{{ $t('actions.new') }}
            </base-button>
            <base-button
              :action="autoTranslate"
              variant="outline"
              class="px-2 py-1"
              >{{ $t('actions.generate_translations') }}
            </base-button>
          </div>
        </div>
        <div
          v-for="text in localizationTexts"
          :key="text"
          class="flex gap-2 items-center mb-1"
        >
          <form-select
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
            :placeholder="$t('adminLocalizations.text')"
          ></base-input>
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="small"
            type="trash"
            class="flex-initial w-6"
            @click.native="
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
            @click.native="
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
        @input="
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
import { ref, defineComponent } from '@vue/composition-api';
import AjaxTable from '@/components/AjaxTable.vue';
import { makeTableColumns } from '@/utils/table';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import Language from '@/models/Language';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';
import { getErrorMessage } from '@/utils/errors';
import { formatCmsItem } from '@/utils/helpers';
import Editor from '@/components/Editor.vue';
import usei18n from '@/use/usei18n';
import useToasted from '@/use/useToasted';
import useHttp from '@/use/useHttp';
import useDialogs from '@/use/useDialogs';
import CmsViewer from '@/components/CmsViewer.vue';
import useTranslation from '@/use/useTranslation';

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
    const { $t } = usei18n();
    const { $http } = useHttp();
    const { component } = useDialogs();

    const { $toasted } = useToasted();
    const { translate } = useTranslation();

    const tableUrl = `${process.env.VUE_APP_API_BASE_URL}/admins/localizations`;
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

    async function editLocalizationTextAdvanced(text: LocalizationText) {
      await component({
        title: $t('actions.edit'),
        component: Editor,
        classes: 'w-full overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          value: text.text,
        },
        listeners: {
          input: (value: string) => {
            text.text = value;
          },
        },
      });
    }

    async function previewLocalizationText(text: LocalizationText) {
      await component({
        title: $t('actions.preview'),
        component: CmsViewer,
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          content: formatCmsItem(text.text),
        },
      });
    }

    async function loadLocalizationTexts(localization: Localization) {
      const response = await $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/admins/localizations_text`,
        {
          params: {
            localization: localization.id,
          },
        },
      );
      localizationTexts.value = response.data.results;
    }

    async function deleteLocalizationText(text: LocalizationText) {
      if (text.id) {
        await $http.delete(
          `${process.env.VUE_APP_API_BASE_URL}/admins/localizations_text/${text.id}`,
        );
        return loadLocalizationTexts(currentLocalization.value);
      }
      localizationTexts.value = localizationTexts.value.filter(function (item) {
        return item !== text;
      });
      return Promise.resolve();
    }

    async function saveLocalizationTexts() {
      await Promise.all(
        localizationTexts.value.map((text) => {
          if (text.id) {
            return $http.put(
              `${process.env.VUE_APP_API_BASE_URL}/admins/localizations_text/${text.id}`,
              text,
            );
          }
          return $http.post(
            `${process.env.VUE_APP_API_BASE_URL}/admins/localizations_text`,
            { ...text, localization: currentLocalization.value.id },
          );
        }),
      );
      await loadLocalizationTexts(currentLocalization.value);
    }

    async function saveLocalization() {
      let response;
      try {
        if (currentLocalization.value.id) {
          response = await $http.put(
            `${tableUrl}/${currentLocalization.value.id}`,
            currentLocalization.value,
          );
        } else {
          response = await $http.post(tableUrl, currentLocalization.value);
        }
        currentLocalization.value = response.data;
        await saveLocalizationTexts();
        await $toasted.success($t('info.success'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
        throw error;
      }
    }

    async function autoTranslate() {
      const englishLanguage = Language.query().where('subtag', 'en-US').first();
      const englishLocalization = localizationTexts.value.find(
        (i) => i.language === englishLanguage?.id,
      );

      if (englishLocalization) {
        // eslint-disable-next-line no-restricted-syntax
        for (const lang of Language.all()) {
          if (lang.id === englishLanguage?.id) {
            continue;
          }
          translate(englishLocalization.text, 'en-US', lang.subtag).then(
            (translation) => {
              const existingLang = localizationTexts.value.find(
                (t) => t.language === lang.id,
              );
              if (existingLang) {
                existingLang.text = translation;
              } else {
                localizationTexts.value.push({
                  localization: '',
                  text: translation,
                  language: lang.id,
                });
              }
            },
          );
        }
      } else {
        await $toasted.error($t('adminLocalizations.english_required'));
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

    function addNewText() {
      localizationTexts.value.push({
        localization: '',
        text: '',
        language: '',
      });
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
      tableQuery,
      deleteLocalizationText,
      editLocalizationTextAdvanced,
      previewLocalizationText,
      saveAndClear,
      autoTranslate,
    };
  },
});
</script>

<style scoped></style>
