<template>
  <div class="homegrid grid-container">
    <slot name="grid-overlay" />
    <slot name="grid-top" />
    <slot name="grid-logo">
      <div class="grid--logo logo my-8">
        <a href="/">
          <img src="@/assets/ccu-logo-black-500w.png" alt="Crisis Cleanup" />
        </a>
      </div>
    </slot>
    <slot name="grid-survivors">
      <div class="grid--survivors">
        <div class="homegrid-survivors">
          <base-text font="display" variant="h1">{{ lang.survive }}</base-text>
          <base-text font="display" variant="h2" class="help-contact">
            <div v-if="!incidentList">
              <spinner />
            </div>
            <div
              v-for="incident in filterNumbers(incidentList.data.results)"
              :key="incident.id"
              class="ml-2"
            >
              {{ incident.short_name }}:
              {{ getIncidentPhoneNumbers(incident) }}
            </div>
          </base-text>
        </div>
      </div>
    </slot>
    <slot name="grid-content" />
  </div>
</template>

<script>
import SideNav from '@/components/home/SideNav.vue';
import Footer from '@/components/home/Footer.vue';
import Actions from '@/components/home/Actions.vue';
import { formatNationalNumber } from '@/filters';

export const HomeNav = SideNav;
export const HomeFooter = Footer;
export const HomeActions = Actions;

export default {
  name: 'HomeLayout',
  data() {
    return {
      lang: {
        survive: this.$t('homeVue.survivors_call'),
      },
      incidentList: [],
    };
  },
  methods: {
    getIncidentPhoneNumbers(incident) {
      if (Array.isArray(incident.active_phone_number)) {
        return incident.active_phone_number
          .map((number) => formatNationalNumber(String(number)))
          .join(', ');
      }
      return formatNationalNumber(String(incident.active_phone_number));
    },
    filterNumbers(item) {
      return item.filter((filterItem) => filterItem.active_phone_number);
    },
  },
  async mounted() {
    this.incidentList = await this.$http.get(
      `${process.env.VUE_APP_API_BASE_URL}/incidents?fields=id,name,short_name,active_phone_number&limit=200&sort=-start_at`,
    );
  },
};
</script>

<style scoped lang="scss">
h1 {
  @apply text-2xl font-bold mt-3;
}
h2 {
  @apply text-xl font-bold mt-3;
}

h3 {
  @apply text-lg font-semibold mt-3;
}

h4 {
  @apply text-base mt-3;
}

h5 {
  @apply text-sm mt-3;
}

h6 {
  @apply text-xs mt-3;
}

p {
  @apply my-2;
}

ul {
  @apply mt-3 list-disc;
  list-style-position: inside;
}

ol {
  @apply mt-3 list-decimal;
  list-style-position: inside;
}

strong {
  @apply font-bold;
}

u {
  @apply underline;
}

em {
  @apply italic;
}

a {
  @apply text-primary-dark underline;
  &:hover {
    text-decoration: none;
  }
}

$areas: main nav logo actions overlay survivors globe footer top;
.homegrid {
  overflow: auto;
  &.grid-container {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 20% auto;
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main main'
      'nav . main main main main'
      'actions actions main main main main';

    @apply w-full h-full;
    margin-left: auto;
    margin-right: auto;

    .grid {
      @each $area in $areas {
        &--#{$area} {
          grid-area: $area;
        }
      }

      &--logo.logo {
        max-width: 200px;
        margin-left: 2.8rem;
      }

      &--overlay {
        grid-row: 1 / span 4;
        grid-column: 1 / span 3;
      }

      &--survivors {
        @apply mx-6 my-4;
      }

      &--actions {
        button {
          @apply text-h1;
        }
        display: flex;
        flex-direction: column;
        margin-left: 2.8rem;
        margin-right: 2.8rem;
        align-content: center;
        letter-spacing: 0.35px;
        justify-content: start;
        grid-gap: 1rem;
      }
    }

    .homegrid {
      &-backdrop {
        @apply bg-crisiscleanup-light-grey;
      }
      &-survivors {
        @apply bg-crisiscleanup-yellow-700 my-4 text-center p-4;
        min-width: 205px;

        p {
          letter-spacing: 0.35px;
          &:first-child {
            font-weight: 700;
            @apply text-2xl;
          }
          &:last-child {
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>

<style>
.homegrid-survivors a {
  @apply underline;
}
</style>
