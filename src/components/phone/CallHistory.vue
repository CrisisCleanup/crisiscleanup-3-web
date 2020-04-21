<template>
  <div>
    <div class="wrapper">
      <div class="box a">
        <base-text
          variant="bodysm"
          weight="900"
          class="text-crisiscleanup-dark-300"
        >
          Phone Number
        </base-text>
      </div>
      <div class="box b" />
      <div class="box c">
        <base-text
          variant="bodysm"
          weight="900"
          class="text-crisiscleanup-dark-300"
        >
          Case #
        </base-text>
      </div>
      <div class="box d">
        <base-text
          variant="bodysm"
          weight="900"
          class="text-crisiscleanup-dark-300"
        >
          Call Status
        </base-text>
      </div>
      <div class="box e">
        <base-text
          variant="bodysm"
          weight="900"
          class="text-crisiscleanup-dark-300"
        >
          Notes
        </base-text>
      </div>
      <div class="box f">
        <base-text
          variant="bodysm"
          weight="900"
          class="text-crisiscleanup-dark-300"
        >
          Call Completed
        </base-text>
      </div>
    </div>
    <call-summary
      v-for="(detail, idx) in details"
      :key="idx"
      :phone="detail.phone"
    ></call-summary>
    <call-summary />
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
  max-width: auto;
}
.row {
  grid-column: auto;
  display: grid;
  grid-template-columns: repeat(6, minmax(50px, 1fr));
}
.box {
  border-radius: 5px;
  padding: 5px;
}
</style>
