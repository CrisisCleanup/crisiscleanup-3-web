<template>
  <HomeLayout>
    <template #grid-content>
      <div class="grid--main h-screen">
        <OrganizationActivity
          :organization-info="test"
          :organization-image="testImage"
        />
        <div class="cover-image"></div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import OrganizationActivity from '@/pages/unauthenticated/OrganizationActivity.vue';
export default {
  name: 'NotFound',
  components: { HomeLayout, OrganizationActivity },
  data() {
    return {
      test: {
        name: 'Southeastern WI COAD',
        orgType: 'Humanitarian Service',
        availability: 'Works in all 50 States',
        address: '3132 Brinkley Road, Temple Hills, Maryland 20748',
        type: '501(c)(3) Charity',
        role: 'COAD',
        cases: 45,
        claimed: 15,
        calls: 25200,
        value: 2700000,
        financialAssistance: [5, 4, 4, 3, 3, 5],
        sbaLoans: [1, 3, 5, 7, 7, 5],
        incidents: [
          {
            name: 'Hurricane Florence',
            cases: 45,
            claimed: 103,
            calls: 25200,
            value: 2700000,
          },
          {
            name: 'Hurricane Irma',
            cases: 45,
            claimed: 103,
            calls: 25200,
            value: 2700000,
          },
          {
            name: 'Flint Michigan Water Crisis',
            cases: 45,
            claimed: 103,
            calls: 25200,
            value: 2700000,
          },
        ],
        capabilityInfo: {
          businessFinancialAssistance: [true, false, true, true, false, false],
          sbaLoans: [true, false, true, true, false, false],
          communityMonitoring: [true, false, true, true, false, false],
          contingencyPlanning: [true, false, true, true, false, false],
          grantWriting: [true, false, true, true, false, false],
          preparation: [true, false, true, true, false, false],
          relationshipBuilding: [true, false, true, true, false, false],
          systemsMonitoring: [true, false, true, true, false, false],
          vulnerabilityAssessment: [true, false, true, true, false, false],
        },
      },
      testImage:
        'https://assets.fireside.fm/file/fireside-images/podcasts/images/b/bc7f1faf-8aad-4135-bb12-83a8af679756/cover.jpg?v=3',
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'main main main main main main'
      'main main main main main main'
      'main main main main main main';
  }

  .cover-image {
    background-image: url(https://source.unsplash.com/random);
    background-size: cover;
    background-repeat: no-repeat;
    @apply w-full h-full;
  }
}
</style>
