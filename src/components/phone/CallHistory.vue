<template>
  <div>
    <table>
      <tr>
        <th>
          <base-text
            variant="bodysm"
            weight="900"
            class="text-crisiscleanup-dark-300"
          >
            Phone Number
          </base-text>
        </th>
        <th>
          <base-text
            variant="bodysm"
            weight="900"
            class="text-crisiscleanup-dark-300"
          >
            Case #
          </base-text>
        </th>
        <th>
          <base-text
            variant="bodysm"
            weight="900"
            class="text-crisiscleanup-dark-300"
          >
            Call Status
          </base-text>
        </th>
        <th>
          <base-text
            variant="bodysm"
            weight="900"
            class="text-crisiscleanup-dark-300"
          >
            Notes
          </base-text>
        </th>
        <th>
          <base-text
            variant="bodysm"
            weight="900"
            class="text-crisiscleanup-dark-300"
          >
            Call Completed
          </base-text>
        </th>
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
  min-width: 100vw;
  width: auto;
  flex: 1;
  border-collapse: collapse;
  grid-template-columns:
    minmax(150px, 3.33fr)
    minmax(150px, 1.67fr)
    minmax(150px, 1.67fr)
    minmax(150px, 3.33fr)
    minmax(150px, 1fr);
}
th {
  /* position: sticky;
  top: 0;
  text-align: left;
  font-weight: normal;
  position: relative;
  padding: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; */
  padding: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
