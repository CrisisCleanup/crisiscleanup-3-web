<template>
  <div class="attribute-container part-id">
    <table>
      <tr>
        <td>
          <!-- {{ phone }} -->
          <base-text variant="bodysm" weight="300">601-123-4567</base-text>
        </td>
        <td>
          <!-- {{ name }} -->
          <base-text variant="bodysm" weight="300">Julie Smith</base-text>
        </td>
        <td>
          <!-- {{ caseNumber }} -->
          <base-text variant="bodysm" weight="300">C11</base-text>
        </td>
        <td>
          <!-- {{ callStatus }} -->
          <base-text variant="bodysm" weight="300">Call Status</base-text>
        </td>
        <td>
          <!-- {{ notes }} -->
          <base-text variant="bodysm" weight="300"
            >Lorem ipsum adshnasdsoih alsdfgnx ad aldsk asdiigh</base-text
          >
        </td>
        <td>
          <!-- {{ callCompleted }} -->
          <base-text variant="bodysm" weight="300">10 mins ago</base-text>
        </td>
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
tr {
  display: contents;
}
td {
  padding: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
