<template>
  <div
    class="rounded bg-gray-700 text-white grid grid-rows-5 justify-center items-center w-full sm:w-1/4"
  >
    <div class="grid grid-cols-4 pt-5 ml-3 row-span-1">
      <div class="flex items-center">
        <img
          :src="organizationImage"
          class="col-span-1 rounded-full w-20 justify-self-center"
        />
      </div>
      <div class="grid-rows-2 col-span-3 sm:ml-2">
        <div class="row-span-1 text-xl sm:text-sm">
          {{ organizationInfo.name }}
        </div>
        <div class="row-span-1 text-gray-500 text-lg sm:text-xs">
          {{ organizationInfo.orgType }} * {{ organizationInfo.availability }}
        </div>
      </div>
    </div>
    <div class="row-span-1 grid grid-rows-2 ml-3">
      <div class="row-span-1">
        <span>Test 2</span>
        <span>Test 2.1</span>
      </div>
      <div class="row-span-1 grid grid-cols-2">
        <div class="col-span-1"><span>Type: </span><span>Test 2.4</span></div>
        <div class="col-span-1"><span>Role: </span><span>Test 2.5</span></div>
      </div>
    </div>
    <div class="row-span-1 grid grid-cols-4 text-center">
      <div class="col-span-1">
        <div>CASES</div>
        <div>Test 3.1</div>
      </div>
      <div class="col-span-1">
        <div>CLAIMED</div>
        <div>Test 3.1</div>
      </div>
      <div class="col-span-1">
        <div>CALLS</div>
        <div>Test 3.1</div>
      </div>
      <div class="col-span-1">
        <div>VALUE</div>
        <div>Test 3.1</div>
      </div>
    </div>
    <div class="row-span-1">
      <div class="grid grid-cols-6">
        <div class="text-xs text-center">NORMAL</div>
        <div class="text-xs text-center">WARNING</div>
        <div class="text-xs text-center">IMPACT</div>
        <div class="text-xs text-center">RESCUE</div>
        <div class="text-xs text-center">CLEANUP</div>
        <div class="text-xs text-center">LONGTERM</div>
      </div>
      <div class="text-center">Business Services</div>
      <div class="ml-3">Business Financial Assistance</div>
      <div class="grid grid-cols-6">
        <div class="text-xs text-center">5</div>
        <div class="text-xs text-center">4</div>
        <div class="text-xs text-center">4</div>
        <div class="text-xs text-center">3</div>
        <div class="text-xs text-center">3</div>
        <div class="text-xs text-center">5</div>
      </div>
      <div class="ml-3">SBA Loans</div>
      <div class="grid grid-cols-6">
        <div class="text-xs text-center">5</div>
        <div class="text-xs text-center">4</div>
        <div class="text-xs text-center">4</div>
        <div class="text-xs text-center">3</div>
        <div class="text-xs text-center">3</div>
        <div class="text-xs text-center">5</div>
      </div>
    </div>
    <div class="row-span-1 text-center text-blue-500 underline">
      More
    </div>
  </div>
</template>
<script>
export default {
  name: 'OrganizationActivity',
  props: {
    organizationInfo: {
      type: Object,
      default: () => {},
    },
    organizationImage: {
      type: String,
      default:
        'https://assets.fireside.fm/file/fireside-images/podcasts/images/b/bc7f1faf-8aad-4135-bb12-83a8af679756/cover.jpg?v=3',
    },
  },
};
</script>
