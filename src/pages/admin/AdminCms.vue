<template>
  <div id="cms" class="bg-white p-3 cms">
    <base-input
      :placeholder="$t('adminCMS.title')"
      v-model="cmsItem.title"
      class="mb-2"
    />
    <template v-if="showHtml">
      <Editor class="mb-2" v-model="cmsItem.content" :key="cmsItem.id" />
    </template>
    <base-input
      v-else
      :placeholder="$t('adminCMS.content')"
      v-model="cmsItem.content"
      class="mb-2"
    />
    <div class="mb-2 flex items-center">
      <base-button
        :text="
          showHtml
            ? $t('adminCMS.toggle_regular_mode')
            : $t('adminCMS.toggle_advanced_mode')
        "
        variant="link"
        :action="
          () => {
            showHtml = !showHtml;
          }
        "
      />
      <ccu-icon
        v-tooltip="{
          // content: $t(`adminCMS.cms_help`), TODO: Figure out why this doesn't work
          trigger: 'click',
          classes: 'interactive-tooltip w-auto',
        }"
        :alt="$t('actions.help_alt')"
        type="help"
        size="large"
      />
    </div>
    <datepicker
      v-model="cmsItem.publish_at"
      auto-apply
      format="yyyy-MM-dd"
    ></datepicker>
    <base-input
      :placeholder="$t('adminCMS.list_order')"
      v-model="cmsItem.list_order"
      class="my-2 w-40"
      type="number"
    />
    <tag-input
      v-model="tags"
      v-model:tags="tagsToAdd"
      :placeholder="$t('actions.add_tags')"
      :autocomplete-items="tagsAutoComplete"
      :add-on-key="[13, 32, ',']"
      :separators="[';', ',', ', ']"
      @tags-changed="(newTags) => (tagsToAdd = newTags)"
      class="my-4"
    />
    <base-checkbox class="pb-2" v-model="cmsItem.is_active">{{
      $t('adminCMS.is_active')
    }}</base-checkbox>

    <div class="flex items-center">
      <DragDrop
        class="cursor-pointer py-2"
        container-class="items-start"
        :multiple="false"
        @files="
          (files) => {
            handleFileUpload(files);
          }
        "
      >
        <base-button
          class="cursor-pointer px-3 py-1"
          variant="solid"
          :text="$t('actions.upload_thumbnail')"
          :alt="$t('actions.upload_thumbnail')"
          :show-spinner="uploading"
          :disabled="uploading"
        />
      </DragDrop>

      <a
        v-if="cmsItem.thumbnail_file"
        :href="cmsItem.thumbnail_file.blog_url"
        target="_blank"
        :title="cmsItem.thumbnail_file.filename"
        class="truncate w-40 text-primary-dark ml-2"
        >{{ cmsItem.thumbnail_file.filename }}</a
      >
    </div>

    <div class="flex justify-end">
      <base-button
        type="bare"
        class="p-3 w-32 mr-3"
        variant="outline"
        :action="clearItem"
        :text="$t('actions.clear')"
      />
      <base-button
        type="bare"
        class="p-3 w-32 mr-3"
        variant="solid"
        :action="showPreview"
        :text="$t('actions.show_preview')"
      />
      <base-button
        type="bare"
        class="p-3 w-32"
        variant="solid"
        :action="saveItem"
        :text="$t('actions.save')"
      />
    </div>

    <AjaxTable
      :enable-search="true"
      :columns="columns"
      :url="tableUrl"
      :query="query"
      ref="table"
      class="mt-6 shadow-lg"
      @rowClick="(payload) => editItem(payload)"
    >
      <template #header-actions>
        <div class="px-4 py-2">
          <base-checkbox
            class="pb-2"
            @update:modelValue="
              (value) => {
                if (value) {
                  query = { ...query, is_active: true };
                } else {
                  delete query.is_active;
                  query = { ...query };
                }
              }
            "
            >{{ $t('adminCMS.active_only') }}
          </base-checkbox>
        </div>
      </template>
      <template
        #actions="slotProps"
        v-if="columns.some((c) => c.key === 'actions')"
      >
        <div class="flex mr-2 justify-center w-full">
          <ccu-icon
            :alt="$t('actions.delete')"
            size="small"
            type="trash"
            class="mx-2"
            @click="
              () => {
                deleteItem(slotProps.item.id);
              }
            "
          />
        </div>
      </template>
      <template #tags="slotProps">
        <tag
          v-for="tag in slotProps.item.tags"
          class="mx-1"
          :key="`${tag}:${slotProps.item.id}`"
          >{{ tag }}</tag
        >
      </template>
    </AjaxTable>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import moment from 'moment';
import { getErrorMessage } from '../../utils/errors';
import { makeTableColumns } from '../../utils/table';
import AjaxTable from '../../components/AjaxTable.vue';
import Editor from '../../components/Editor.vue';
import { formatCmsItem } from '../../utils/helpers';
import DragDrop from '../../components/DragDrop.vue';
import useDialogs from '../../hooks/useDialogs';
import CmsViewer from '../../components/cms/CmsViewer.vue';

export default {
  components: {
    DragDrop,
    Editor,
    AjaxTable,
  },
  setup() {
    const { component } = useDialogs();
    const { t } = useI18n();
    const $toasted = useToast();

    const name = ref('app');
    const cmsItem = ref({
      content: '',
      tags: '',
      title: '',
      publish_at: '',
      list_order: null,
      is_active: true,
      thumbnail: null,
      thumbnail_file: null,
    });
    const tagsToAdd = ref([]);
    const tags = ref('');
    const table = ref(null);
    const tagsAutoComplete = ref([]);
    const showHtml = ref(false);
    const query = ref({});
    const tableUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/admins/cms`;
    const columns = makeTableColumns([
      ['title', '30%', 'adminCMS.title', { sortKey: 'title', sortable: true }],
      [
        'publish_at',
        '20%',
        'adminCMS.publish_date',
        { sortKey: 'publish_at', sortable: true },
      ],
      [
        'list_order',
        '10%',
        'adminCMS.list_order',
        { sortKey: 'list_order', sortable: true },
      ],
      ['is_active', '10%', 'adminCMS.is_active'],
      ['tags', '20%', 'adminCMS.tags'],
      ['actions', '10%', ''],
    ]);
    const uploading = ref(null);

    async function loadTags() {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/admins/cms/tags`,
      );
      tagsAutoComplete.value = response.data.map((t) => t.replaceAll('"', ''));
    }
    async function showPreview() {
      await component({
        title: t(`adminCMS.preview`),
        component: CmsViewer,
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          title: formatCmsItem(cmsItem.value.title),
          content: formatCmsItem(cmsItem.value.content),
          image: cmsItem.value.thumbnail_file?.blog_url,
        },
      });
    }
    function editItem(payload) {
      cmsItem.value = {
        ...payload,
        publish_at: moment(payload.publish_at).format('YYYY-MM-DD'),
      };
      tagsToAdd.value = payload.tags.map((tag) => {
        return { text: tag };
      });
    }
    async function saveItem() {
      try {
        if (cmsItem.value.id) {
          await axios.put(
            `${import.meta.env.VITE_APP_API_BASE_URL}/admins/cms/${
              cmsItem.value.id
            }`,
            {
              ...cmsItem.value,
              publish_at: moment(cmsItem.value.publish_at).toISOString(),
              tags: tagsToAdd.value.map((a) => a.text),
            },
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_APP_API_BASE_URL}/admins/cms`,
            {
              ...cmsItem.value,
              tags: tagsToAdd.value.map((a) => a.text),
            },
          );
        }
        await $toasted.success(t('adminCMS.saved_item'));
        table.value.getData().catch(() => {});
        loadTags().catch(() => {});
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    async function deleteItem(id) {
      await axios.delete(
        `${import.meta.env.VITE_APP_API_BASE_URL}/admins/cms/${id}`,
      );
      await $toasted.success(t('adminCMS.deleted_item'));
      table.value.getData();
    }
    function clearItem() {
      cmsItem.value = {
        content: '',
        tags: '',
        title: '',
        publish_at: '',
        list_order: null,
        is_active: true,
        thumbnail: null,
        thumbnail_file: null,
      };
      showHtml.value = false;
      tagsToAdd.value = [];
    }
    async function handleFileUpload(fileList) {
      if (fileList.length === 0) {
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', 'fileTypes.other_file');
      uploading.value = true;
      try {
        const result = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        cmsItem.value.thumbnail = result.data.id;
        cmsItem.value.thumbnail_file = result.data;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        uploading.value = false;
      }
    }

    onMounted(async () => {
      await loadTags();
    });

    return {
      name,
      cmsItem,
      tags,
      tagsToAdd,
      tagsAutoComplete,
      showHtml,
      query,
      columns,
      tableUrl,
      loadTags,
      table,
      showPreview,
      editItem,
      saveItem,
      deleteItem,
      clearItem,
      handleFileUpload,
      uploading,
      moment,
    };
  },
};
</script>

<style scoped></style>

<style>
.cms .vue-tags-input .ti-input {
  @apply h-10;
}

.cms .vue-tags-input {
  @apply h-10;
}
</style>
