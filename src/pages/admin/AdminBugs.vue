<template>
  <div class="m-3">
    <AjaxTable
      :key="tableQuery"
      class="border p-2"
      :url="tableUrl"
      :columns="columns"
      :query="tableQuery"
      :body-style="{ height: 'max-content' }"
      enable-search
      has-row-details
    >
      <template #rowDetails="slotProps">
        <AgentHistory
          v-if="slotProps.item.agent"
          class="w-full bg-white"
          :agent-id="slotProps.item.agent"
        />
        <div v-else class="p-2 text-crisiscleanup-grey-700 italic">
          {{ $t('adminBugs.no_agent_found') }}
        </div>
      </template>
      <template #created_at="slotProps">
        <div :title="slotProps.item.created_at">
          {{ momentFromNow(slotProps.item.created_at) }}
        </div>
      </template>
      <template #user="slotProps">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          <UserDetailsTooltip :user="slotProps.item.created_by">
          </UserDetailsTooltip>
        </h3>
      </template>
      <template
        v-if="columns.some((c) => c.key === 'actions')"
        #actions="slotProps"
      >
        <div class="flex mr-2 justify-center w-full">
          <base-button
            :action="
              () => {
                showAttr(slotProps.item);
              }
            "
            variant="solid"
            size="small"
            class="text-xs mx-2"
            :text="$t('actions.show_attr')"
            :alt="$t('actions.show_attr')"
          />
          <base-button
            :action="
              () => {
                showAttr(slotProps.item, 'states');
              }
            "
            variant="solid"
            size="small"
            class="text-xs mx-2"
            :text="$t('actions.show_states')"
            :alt="$t('actions.show_states')"
          />
          <base-button
            :action="
              () => {
                showPreview(slotProps.item);
              }
            "
            variant="solid"
            size="small"
            class="text-xs mx-2"
            :text="$t('actions.show_details')"
            :alt="$t('actions.show_details')"
          />
          <base-button
            size="small"
            class="px-2 py-1 mx-2 bg-crisiscleanup-green-700 text-white"
            :text="$t('actions.resolve')"
            :action="() => resolveBug(slotProps.item.id)"
          />
        </div>
      </template>
    </AjaxTable>
  </div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import moment from 'moment/moment';
import { momentFromNow } from '../../filters';
import { makeTableColumns } from '@/utils/table';
import CmsViewer from '@/components/cms/CmsViewer.vue';
import useDialogs from '@/hooks/useDialogs';
import AjaxTable from '@/components/AjaxTable.vue';
import JsonWrapper from '@/components/JsonWrapper.vue';
import UserDetailsTooltip from '@/components/user/DetailsTooltip.vue';
import User from '@/models/User';
import useCurrentUser from '@/hooks/useCurrentUser';
import AgentHistory from '@/components/admin/AgentHistory.vue';

export default defineComponent({
  name: 'AdminBugs',
  components: { AgentHistory, UserDetailsTooltip, AjaxTable },
  setup() {
    const { currentUser } = useCurrentUser();
    const tableUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/bug_reports`;
    const tableQuery = ref({
      resolved_at__isnull: true,
    });
    const columns = makeTableColumns([
      ['title', '0.75fr', 'Title'],
      ['created_at', '0.5fr', 'Created At'],
      ['user', '0.5fr', 'User'],
      ['actions', '1fr', ' '],
    ]);
    const { component } = useDialogs();
    const { t } = useI18n();

    async function showPreview(bug: { title: any; description: any }) {
      await component({
        title: t(`adminBugs.bug_details`),
        component: CmsViewer,
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          title: bug.title,
          content: bug.description,
          image: bug.files.length > 0 && bug.files[0].blog_url,
        },
      });
    }

    const showAttr = async (item: Record<string, any>, prop = 'attr') => {
      await component({
        title: `Bug attr for bug: ${item.id}`,
        component: JsonWrapper,
        classes: 'w-full h-96',
        props: {
          jsonData: item[prop],
        } as any,
      });
    };

    const getUser = (id: number) => {
      return User.find(id);
    };
    const resolveBug = async (id: number) => {
      await axios.patch(`${tableUrl}/${id}`, {
        resolved_by: currentUser.id,
        resolved_at: moment().toISOString(),
      });
      tableQuery.value = {
        ...tableQuery.value,
      };
    };

    return {
      tableUrl,
      columns,
      showPreview,
      showAttr,
      getUser,
      resolveBug,
      tableQuery,
    };
  },
  methods: { momentFromNow },
});
</script>

<style scoped></style>
