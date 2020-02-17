<template>
  <div class="p-6 bg-gray-100 h-full overflow-auto relative">
    <div v-if="!loading">
      <div class="flex">
        <!-- **** Example Block **** -->
        <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
          <h1>Example Block</h1>
          <!-- <my-custom-component /> -->
        </div>
        <!-- ******************** -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Phone',
};
</script>
