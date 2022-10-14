<template>
  <div class="worksite-notes">
    <div class="flex items-center justify-between">
      <label
        v-if="worksite.notes && worksite.notes.length > 0"
        class="my-1 text-base font-semibold block"
        >{{ $t('formLabels.notes') }}</label
      >

      <base-button
        v-if="worksite.notes && worksite.notes.length"
        icon="caret-down"
        type="link"
        :text="
          showingAllNotes ? $t('actions.some_notes') : $t('actions.all_notes')
        "
        :action="
          () => {
            showingAllNotes = !showingAllNotes;
          }
        "
      />
    </div>
    <template v-for="(note, index) in sortedNotes">
      <div
        v-if="index < 4 || showingAllNotes"
        :key="`${note.id}`"
        class="my-1 p-1 flex items-start bg-opacity-50 rounded"
        :class="
          note.is_survivor
            ? 'bg-crisiscleanup-yellow-100'
            : 'bg-crisiscleanup-light-grey'
        "
        @click="
          () => {
            expandedNotes[note.id] = !expandedNotes[note.id];
            expandedNotes = { ...expandedNotes };
          }
        "
      >
        <span class="text-crisiscleanup-grey-700 mr-3 notes-time w-40"
          >{{ note.created_at | moment('from', 'now') }}:</span
        ><span
          class="font-hairline w-64 cursor-pointer"
          :class="expandedNotes[note.id] ? '' : 'max-lines'"
          >{{ note.note }}</span
        >
      </div>
    </template>
    <div v-if="canAdd" class="flex items-center justify-between">
      <base-button
        v-if="!addingNotes"
        class="my-1 text-primary-dark"
        type="link"
        :text="$t('caseView.add_note')"
        :alt="$t('caseView.add_note_alt')"
        :action="() => (addingNotes = true)"
      >
        <ccu-icon
          type="sticky-note-solid"
          class="text-primary-dark filter-yellow mr-1"
          size="sm"
        />
        <span>{{ $t('caseView.add_note') }}</span>
      </base-button>

      <div class="flex my-1">
        <badge
          width="16px"
          height="16px"
          class="text-white bg-crisiscleanup-yellow-100 bg-opacity-50 mx-1"
          :title="$t('adminOrganization.org_verified')"
        />
        <div class="text-xs opacity-25">
          {{ $t('formLabels.survivor_notes') }}
        </div>
      </div>
    </div>
    <div v-if="addingNotes">
      {{ $t('caseView.note') }}
      <base-input
        text-area
        :value="currentNote"
        :rows="3"
        @input="
          (value) => {
            currentNote = value;
            $emit('input', value);
          }
        "
      />
      <div class="flex items-center justify-between">
        <base-button
          class="my-1"
          type="bare"
          :text="$t('actions.cancel')"
          :action="cancelNote"
        />
        <base-button
          class="my-1 text-primary-dark"
          type="link"
          :text="$t('actions.add')"
          :action="saveNote"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'WorksiteNotes',
  props: {
    worksite: {
      type: Object,
      default: () => {
        return {};
      },
    },
    canAdd: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      addingNotes: false,
      addingTime: false,
      expandedNotes: {},
      showingAllNotes: false,
      currentNote: '',
    };
  },
  computed: {
    sortedNotes() {
      if (!this.worksite.notes) {
        return [];
      }
      return [...this.worksite.notes].sort((a, b) => {
        return (
          this.$moment(b.created_at).unix() - this.$moment(a.created_at).unix()
        );
      });
    },
  },
  methods: {
    async saveNote() {
      this.$emit('saveNote', this.currentNote);
      this.$emit('input', '');
      this.addingNotes = false;
      this.currentNote = '';
    },
    cancelNote() {
      this.addingNotes = false;
      this.$emit('input', '');
      this.currentNote = '';
    },
  },
};
</script>
<style lang="postcss" scoped>
.notes-time {
  color: #848f99;
}

.worksite-notes {
  &__button {
  }
}
</style>
