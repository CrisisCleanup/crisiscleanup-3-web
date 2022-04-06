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
        @click.native="
          () => {
            $router.push(
              `/incident/${currentIncidentId}/cases/${$route.params.id}/flag`,
            );
          }
        "
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
      <router-link
        v-if="isViewingWorksite && canEdit"
        :to="`/incident/${currentIncidentId}/cases/${$route.params.id}/edit`"
      >
        <ccu-icon
          :alt="$t('actions.edit')"
          class="border p-2 bg-primary-light"
          size="small"
          type="edit"
          :linked="true"
        />
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { templates } from '@/icons/icons_templates';
import Worksite from '@/models/Worksite';

export default {
  name: 'CaseHeader',
  computed: {
    ...mapState('incident', ['currentIncidentId']),
    highPrioritySvgInactive() {
      const template = templates.important;
      return template
        .replace('{{fillColor}}', 'grey')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
    },
    highPrioritySvgActive() {
      const template = templates.important;
      const svg = template
        .replace('{{fillColor}}', 'red')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
      return svg;
    },
    favoriteSvgInactive() {
      const template = templates.favorite;
      return template
        .replace('{{fillColor}}', 'grey')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
    },
    favoriteSvgActive() {
      const template = templates.favorite;
      const svg = template
        .replace('{{fillColor}}', 'red')
        .replace('{{strokeColor}}', 'white')
        .replace('{{multiple}}', '');
      return svg;
    },
  },
  methods: {
    async toggleFavorite(toggle) {
      if (toggle) {
        await Worksite.api().favorite(this.worksite.id);
      } else {
        await Worksite.api().unfavorite(
          this.worksite.id,
          this.worksite.favorite.id,
        );
      }
      await Worksite.api().fetch(this.worksite.id);
    },
    async toggleHighPriority(isHighPriority) {
      if (isHighPriority) {
        await Worksite.api().addFlag(this.worksite.id, {
          reason_t: 'flag.worksite_high_priority',
          is_high_priority: true,
          notes: '',
          requested_action: '',
        });
      } else {
        const highPriorityFlags = this.worksite.flags.filter(
          (flag) => flag.is_high_priority,
        );
        await Promise.all(
          highPriorityFlags.map((f) =>
            Worksite.api().deleteFlag(this.worksite.id, f),
          ),
        );
      }
      await Worksite.api().fetch(this.worksite.id);
    },
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
};
</script>

<style scoped></style>