<template>
  <div>
    <table>
      <tr>
        <th>Phone Number</th>
        <th>Case #</th>
        <th>Call Status</th>
        <th>Notes</th>
        <th>Call Completed</th>
      </tr>
    </table>
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
.table {
  display: grid;
}
</style>
