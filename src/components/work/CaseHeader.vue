<template>
  <div>
    <div v-if="showCaseTabs" class="h-12 flex items-center justify-start px-2">
      <div
        class="flex items-center cursor-pointer"
        @click="() => $emit('closeWorksite')"
      >
        <ccu-icon :alt="$t('casesVue.new_case')" type="active" size="small" />
        <span class="px-1 mt-0.5">{{ $t('casesVue.new_case') }}</span>
      </div>
      <div
        v-if="worksite && worksite.id"
        class="h-full p-3 flex items-center justify-center border-b-2 border-primary-light"
      >
        Case {{ worksite && worksite.case_number }}
        <ccu-icon
          :alt="$t('actions.cancel')"
          size="xs"
          type="cancel"
          class="ml-2"
          @click="$emit('closeWorksite')"
        />
      </div>
    </div>
    <div class="flex items-start justify-between p-1">
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
          {{ momentFromNow(worksite.updated_at) }}
        </div>
      </div>
      <div v-if="worksite && worksite.id" class="flex items-center">
        <ccu-icon
          :alt="$t('actions.flag')"
          size="small"
          class="p-1 py-2"
          type="flag"
          @click="$emit('onFlagCase')"
        />
        <ccu-icon
          :alt="$t('actions.jump_to_case')"
          size="small"
          class="p-1 py-2"
          type="go-case"
          @click="$emit('onJumpToCase')"
        />
        <ccu-icon
          :alt="$t('actions.history')"
          size="small"
          class="p-1 py-2"
          type="history"
          @click="$emit('onShowHistory')"
        />
        <ccu-icon
          :alt="$t('actions.download')"
          size="small"
          class="p-1 py-2"
          type="download"
          @click="$emit('onDownloadWorksite')"
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
          @click="$emit('onPrintWorksite')"
          data-cy="cases.icons.print"
        />
        <ccu-icon
          v-if="isViewingWorksite && canEdit"
          :alt="$t('actions.edit')"
          class="border p-2 bg-primary-light"
          size="small"
          type="edit"
          @click="$emit('onEditCase')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { templates } from '../../icons/icons_templates';
import Worksite from '../../models/Worksite';
import { useStore } from 'vuex';
import { momentFromNow } from '../../filters';

export default defineComponent({
  name: 'CaseHeader',
  setup(props, { emit }) {
    const store = useStore();
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
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
      emit('reloadMap');
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
      emit('reloadMap');
    }

    return {
      currentIncidentId,
      highPrioritySvgInactive,
      highPrioritySvgActive,
      favoriteSvgInactive,
      favoriteSvgActive,
      toggleFavorite,
      toggleHighPriority,
      momentFromNow,
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
      default: false,
    },
    isViewingWorksite: { type: Boolean, default: null, required: false },
    showCaseTabs: { type: Boolean, default: false, required: false },
  },
});
</script>

<style>
.svg-container svg {
  width: 18px !important;
  height: 18px !important;
}
</style>
