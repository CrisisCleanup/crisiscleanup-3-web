<template>
  <div>
    <div class="wrapper">
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
          >Lorem ipsum adshnasdsoih alsdfgnx ad aldsk asdiigh</base-text
        >
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

/* .box {
   border-radius: 5px;
   padding: 20px;
   font-size: 150%;
} */
</style>
