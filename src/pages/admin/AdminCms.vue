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
          content: $t(`adminCMS.cms_help`),
          trigger: 'click',
          classes: 'interactive-tooltip w-auto',
        }"
        :alt="$t('actions.help_alt')"
        type="help"
        size="large"
      />
    </div>
    <datepicker
      input-class="h-10 p-1 outline-none w-56 border border-crisiscleanup-dark-100 text-sm mb-2"
      wrapper-class="flex-grow"
      :format="(date) => $moment(date).format('YYYY-MM-DD h:mm:ss')"
      :placeholder="$t('adminCMS.publish_at')"
      v-model="cmsItem.publish_at"
    ></datepicker>
    <base-input
      :placeholder="$t('adminCMS.list_order')"
      v-model="cmsItem.list_order"
      class="mb-2 w-40"
      type="number"
    />
    <tag-input
      v-model="tags"
      :tags.sync="tagsToAdd"
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
      @row:click="(payload) => editItem(payload)"
    >
      <template #header-actions>
        <div class="px-4 py-2">
          <base-checkbox
            class="pb-2"
            @input="
              (value) => {
                if (value) {
                  query = { ...query, is_active: true };
                } else {
                  delete query.is_active;
                  query = { ...query };
                }
              }
            "
            >{{ $t('~~Active Only') }}
          </base-checkbox>
        </div>
      </template>
      <template
        #actions="slotProps"
        v-if="columns.find((c) => c.key === 'actions')"
      >
        <div class="flex mr-2 justify-center w-full">
          <ccu-icon
            :alt="$t('actions.delete')"
            size="small"
            type="trash"
            class="mx-2"
            @click.native="
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
import { getErrorMessage } from '@/utils/errors';
import { makeTableColumns } from '@/utils/table';
import AjaxTable from '@/components/AjaxTable';
import Editor from '@/components/Editor';
import { DialogsMixin } from '@/mixins';
import { formatCmsItem } from '@/utils/helpers';

export default {
  data() {
    return {
      name: 'app',
      cmsItem: {
        content: '',
        tags: '',
        title: '',
        publish_at: null,
        list_order: null,
        is_active: true,
      },
      tags: '',
      tagsToAdd: [],
      tagsAutoComplete: [],
      showHtml: false,
      query: {},
    };
  },
  components: {
    Editor,
    AjaxTable,
  },
  mixins: [DialogsMixin],
  computed: {
    columns() {
      return makeTableColumns([
        [
          'title',
          '30%',
          'adminCMS.title',
          { sortKey: 'title', sortable: true },
        ],
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
    },
    tableUrl() {
      return `${process.env.VUE_APP_API_BASE_URL}/admins/cms`;
    },
  },
  async mounted() {
    await this.loadTags();
  },
  methods: {
    async loadTags() {
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/admins/cms/tags`,
      );
      this.tagsAutoComplete = response.data.map((t) => t.replaceAll('"', ''));
    },
    async showPreview() {
      await this.$component({
        title: `adminCMS.preview`,
        component: 'HtmlPreview',
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          title: formatCmsItem(this.cmsItem.title),
          content: formatCmsItem(this.cmsItem.content),
        },
      });
    },
    editItem(payload) {
      this.cmsItem = payload;
      this.tagsToAdd = payload.tags.map((tag) => {
        return { text: tag };
      });
    },
    async saveItem() {
      try {
        if (this.cmsItem.id) {
          await this.$http.put(
            `${process.env.VUE_APP_API_BASE_URL}/admins/cms/${this.cmsItem.id}`,
            {
              ...this.cmsItem,
              tags: this.tagsToAdd.map((a) => a.text),
            },
          );
        } else {
          await this.$http.post(
            `${process.env.VUE_APP_API_BASE_URL}/admins/cms`,
            {
              ...this.cmsItem,
              tags: this.tagsToAdd.map((a) => a.text),
            },
          );
        }
        await this.$toasted.success(this.$t('adminCMS.saved_item'));
        this.$refs.table.getData().catch(() => {});
        this.loadTags().catch(() => {});
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async deleteItem(id) {
      await this.$http.delete(
        `${process.env.VUE_APP_API_BASE_URL}/admins/cms/${id}`,
      );
      await this.$toasted.success(this.$t('adminCMS.deleted_item'));
      this.$refs.table.getData();
    },
    clearItem() {
      this.cmsItem = {
        content: '',
        tags: '',
        title: '',
        publish_at: null,
        list_order: null,
        is_active: true,
      };
      this.showHtml = false;
      this.tagsToAdd = [];
    },
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
