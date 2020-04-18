<template>
  <div class="attribute-container part-id">
    <table>
      <tr>
        <th>
          <!-- {{ phone }} -->
          <base-text variant="bodysm" weight="300">601-123-4567</base-text>
        </th>
        <th>
          <!-- {{ name }} -->
          <base-text variant="bodysm" weight="300">Julie Smith</base-text>
        </th>
        <th>
          <!-- {{ caseNumber }} -->
          <base-text variant="bodysm" weight="300">C11</base-text>
        </th>
        <th>
          <!-- {{ callStatus }} -->
          <base-text variant="bodysm" weight="300">Call Status</base-text>
        </th>
        <th>
          <!-- {{ notes }} -->
          <base-text variant="bodysm" weight="300"
            >Lorem ipsum adshnasdsoih alsdfgnx ad aldsk asdiigh</base-text
          >
        </th>
        <th>
          <!-- {{ callCompleted }} -->
          <base-text variant="bodysm" weight="300">10 mins ago</base-text>
        </th>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'CallSummary',
};
</script>

<style scoped>
.table {
  display: grid;
}
/* .atttribute-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--column-width-min), 1fr));
}
.part-id {
  --column-width-min: 10em;
}
.attribute {
  display: grid;
  grid-template-columns: minmax(9em, 30%) 1fr;
}
.attribute::before {
  content: attr(data-name);
}
.collection-container > li:first-child {
  display: none;
} */
</style>
