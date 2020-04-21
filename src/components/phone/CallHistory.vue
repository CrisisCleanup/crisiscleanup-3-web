<template>
  <div>
    <div class="wrapper">
      <base-text
        variant="bodysm"
        weight="900"
        class="text-crisiscleanup-dark-300"
      >
        Phone Number
      </base-text>

      <base-text
        variant="bodysm"
        weight="900"
        class="text-crisiscleanup-dark-300"
      >
        Case #
      </base-text>

      <base-text
        variant="bodysm"
        weight="900"
        class="text-crisiscleanup-dark-300"
      >
        Call Status
      </base-text>

      <base-text
        variant="bodysm"
        weight="900"
        class="text-crisiscleanup-dark-300"
      >
        Notes
      </base-text>

      <base-text
        variant="bodysm"
        weight="900"
        class="text-crisiscleanup-dark-300"
      >
        Call Completed
      </base-text>
    </div>
    <call-summary
      v-for="(detail, idx) in details"
      :key="idx"
      :phone="detail.phone"
    ></call-summary>
  </div>
</template>
<script>
import CallSummary from '@/components/phone/CallSummary.vue';
export default {
  name: 'CallHistory',
  components: {
    CallSummary,
  },
  computed: {
    details() {
      return [
        {
          phone: this.$t('601-123-4567'),
          name: this.$t('John Doe'),
          caseNumber: this.$t('C11'),
          callStatus: this.$t('Call Status'),
          notes: this.$t('asldfjasdkfjasldfjd'),
          callCompleted: this.$t('10 mins ago'),
        },
      ];
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(6, minmax(50px, 1fr));
  max-width: 800px;
}
.row {
  grid-column: auto;
  display: grid;
  grid-template-columns: repeat(6, minmax(50px, 1fr));
}
</style>
