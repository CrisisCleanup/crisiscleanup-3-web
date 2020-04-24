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
        <div class="flex flex-row">
          <!-- {{ caseNumber }} -->
          <base-text variant="bodysm" weight="300">C11</base-text>
          <img src="@/assets/redlobster.jpg" class="h-6 ml-1" />
          <img src="@/assets/yellowboot.jpg" class="h-6 ml-1" />
        </div>
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
          <span v-if="readMore">
            alsdfgnx ad aldsk asdiigh
          </span>
          <!-- Read More Button -->
          <button
            @click="readMore = !readMore"
            class="text-crisiscleanup-dark-blue text-xs"
          >
            <span v-if="readMore">Less</span>
            <span v-else>...More</span>
          </button>
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
  min-width: 775px;
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
