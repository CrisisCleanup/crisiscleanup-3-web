<template>
  <div>
    <div class="wrapper ml-3">
      <div class="box a">
        <!-- {{ phone }} -->
        <base-text variant="bodysm" weight="300">601-123-4567</base-text>
      </div>
      <div class="box b">
        <!-- {{ name }} -->
        <base-text variant="bodysm" weight="300">Julie Smith</base-text>
      </div>
      <div class="box c">
        <!-- {{ caseNumber }} -->
        <base-text variant="bodysm" weight="300">C11</base-text>
      </div>
      <div class="box d">
        <!-- {{ callStatus }} -->
        <base-text variant="bodysm" weight="300">Call Status</base-text>
      </div>
      <div class="box e">
        <!-- {{ notes }} -->
        <base-text
          variant="bodysm"
          weight="300"
          class="text-crisiscleanup-dark-300"
          >Lorem ipsum adshnasddfx
          <span
            ><base-button
              @click="readMore === true"
              class="text-crisiscleanup-dark-blue text-sm"
              >...More
            </base-button>
          </span>
        </base-text>
        <base-text
          v-if="(readMore === true)"
          variant="bodysm"
          weight="300"
          class="text-crisiscleanup-dark-300"
        >
          alsdfgnx ad aldsk asdiigh
        </base-text>
      </div>
      <div class="box f">
        <!-- {{ callCompleted }} -->
        <base-text
          variant="bodysm"
          weight="300"
          class="text-crisiscleanup-dark-300"
          >10 mins ago</base-text
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallSummary',
  data() {
    return {
      readMore: false,
    };
  },
};
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(6, minmax(50px, 1fr));
  /* max-width: 800px; */
  min-width: 700px;
}
.row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(6, minmax(50px, 1fr));
}
.box {
  border-radius: 5px;
  padding: 5px;
}
</style>
