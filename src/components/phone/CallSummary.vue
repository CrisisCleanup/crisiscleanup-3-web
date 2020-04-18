<template>
  <div>
    <div class="flex flex-row justify-between">
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallSummary',
};
</script>
