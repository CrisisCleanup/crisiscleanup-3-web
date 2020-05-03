<template>
  <div>
    <div class="flex flex-col justify-around">
      <div class="m-5">
        <div class="flex flex-row items-center">
          <base-text variant="body" weight="700">{{
            $t('~~Estimated Commercial Value of Services')
          }}</base-text>
          <img src="@/assets/greylockss.jpg" class="h-8 px-3" />
          <!-- <img src="@/assets/outlinestarss.jpg" class="ml-auto h-8" /> -->
        </div>
        <base-text variant="bodysm">
          This report calculates the estimated commercial value of services
          rendered based on the type of work being performed on each property.
          For more details on how theses calculations are performed,
          <a
            href="http://blog.crisiscleanup.org/2017/10/how-we-calculate-value-of-services.html"
            class="text-crisiscleanup-yellow-900 underline"
            >click here</a
          >
        </base-text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EstCommercialValue',
};
</script>
