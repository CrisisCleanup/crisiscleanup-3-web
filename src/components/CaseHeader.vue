<template>
  <div class="flex items-start justify-between">
    <div>
      <div class="text-left text-black flex items-center">
        <div class="mt-1 mr-1">
          {{ worksite && worksite.case_number }}
        </div>
        <base-button class="mr-1">
          <div
            v-if="worksite && worksite.isFavorite"
            class="svg-container cursor-pointer"
            v-html="favoriteSvgActive"
            :title="$t('actions.not_member_of_my_org')"
            @click="() => toggleFavorite(false)"
          ></div>
          <div
            v-else
            class="svg-container cursor-pointer"
            v-html="favoriteSvgInactive"
            :title="$t('actions.member_of_my_org')"
            @click="() => toggleFavorite(true)"
          ></div>
        </base-button>
        <base-button class="mr-1">
          <div
            v-if="worksite && worksite.isHighPriority"
            class="svg-container cursor-pointer"
            v-html="highPrioritySvgActive"
            :title="$t('actions.unmark_high_priority')"
            @click="() => toggleHighPriority(false)"
          ></div>
          <div
            v-else
            class="svg-container cursor-pointer"
            v-html="highPrioritySvgInactive"
            :title="$t('actions.mark_high_priority')"
            @click="() => toggleHighPriority(true)"
          ></div>
        </base-button>
      </div>
      <div
        v-if="worksite && worksite.id"
        class="text-xs text-crisiscleanup-grey-700"
      >
        {{ $t('casesVue.updated') }}
        {{ worksite.updated_at | moment('from', 'now') }}
      </div>
    </div>
    <div v-if="worksite && worksite.id" class="flex items-center">
      <ccu-icon
        :alt="$t('actions.flag')"
        size="small"
        class="p-1 py-2"
        type="flag"
        @click.native="$emit('onFlagCase')"
      />
      <ccu-icon
        :alt="$t('actions.jump_to_case')"
        size="small"
        class="p-1 py-2"
        type="go-case"
        @click.native="$emit('onJumpToCase')"
      />
      <ccu-icon
        :alt="$t('actions.history')"
        size="small"
        class="p-1 py-2"
        type="history"
        @click.native="$emit('onShowHistory')"
      />
      <ccu-icon
        :alt="$t('actions.download')"
        size="small"
        class="p-1 py-2"
        type="download"
        @click.native="$emit('onDownloadWorksite')"
        data-cy="cases.icons.download"
      />
      <ccu-icon
        :alt="$t('actions.share')"
        size="small"
        class="p-1 py-2"
        type="share"
        data-cy="cases.icons.share"
      />
      <ccu-icon
        :alt="$t('actions.print')"
        size="small"
        class="p-1 py-2"
        type="print"
        @click.native="$emit('onPrintWorksite')"
        data-cy="cases.icons.print"
      />
      <ccu-icon
        v-if="isViewingWorksite && canEdit"
        :alt="$t('actions.edit')"
        class="border p-2 bg-primary-light"
        size="small"
        type="edit"
        @click.native="$emit('onEditCase')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useState } from '@u3u/vue-hooks';
import { defineComponent, computed } from '@vue/composition-api';
import { templates } from '@/icons/icons_templates';
import Worksite from '@/models/Worksite';

export default defineComponent({
  name: 'CaseHeader',
  setup(props) {
    const { currentIncidentId } = useState('incident', ['currentIncidentId']);
    const highPrioritySvgInactive = computed(() => {
      const template = templates.important;
      return template
        .replaceAll('{{fillColor}}', 'grey')
        .replaceAll('{{strokeColor}}', 'white')
        .replaceAll('{{multiple}}', '');
    });
    const highPrioritySvgActive = computed(() => {
      const template = templates.important;
      return template
        .replaceAll('{{fillColor}}', 'red')
        .replaceAll('{{strokeColor}}', 'white')
        .replaceAll('{{multiple}}', '');
    });
    const favoriteSvgInactive = computed(() => {
      const template = templates.favorite;
      return template
        .replaceAll('{{fillColor}}', 'grey')
        .replaceAll('{{strokeColor}}', 'white')
        .replaceAll('{{multiple}}', '');
    });

    const favoriteSvgActive = computed(() => {
      const template = templates.favorite;
      return template
        .replaceAll('{{fillColor}}', 'red')
        .replaceAll('{{strokeColor}}', 'white')
        .replaceAll('{{multiple}}', '');
    });

    async function toggleFavorite(toggle) {
      if (toggle) {
        await Worksite.api().favorite(props.worksite.id);
      } else {
        await Worksite.api().unfavorite(
          props.worksite.id,
          props.worksite.favorite.id,
        );
      }
      await Worksite.api().fetch(props.worksite.id);
    }
    async function toggleHighPriority(isHighPriority) {
      if (isHighPriority) {
        await Worksite.api().addFlag(props.worksite.id, {
          reason_t: 'flag.worksite_high_priority',
          is_high_priority: true,
          notes: '',
          requested_action: '',
        });
      } else {
        const highPriorityFlags = props.worksite.flags.filter(
          (flag) => flag.is_high_priority,
        );
        await Promise.all(
          highPriorityFlags.map((f) =>
            Worksite.api().deleteFlag(props.worksite.id, f),
          ),
        );
      }
      await Worksite.api().fetch(props.worksite.id);
    }

    return {
      currentIncidentId,
      highPrioritySvgInactive,
      highPrioritySvgActive,
      favoriteSvgInactive,
      favoriteSvgActive,
      toggleFavorite,
      toggleHighPriority,
    };
  },
  props: {
    worksite: {
      type: Object,
      default: () => {
        return {};
      },
    },
    canEdit: {
      type: Boolean,
      default: () => {
        return {};
      },
    },
    isViewingWorksite: { type: Boolean, default: null, required: false },
  },
});
</script>

<style scoped></style>
