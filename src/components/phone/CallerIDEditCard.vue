<template>
  <div>
    <modal
      v-if="active"
      modal-classes="w-108"
      @ok="active = false"
      @close="active = false"
    >
      <div class="flex flex-col justify-around ml-12 mr-12 mt-8">
        <!-- Greeting -->
        <base-text
          variant="body"
          :weight="700"
          class="text-crisiscleanup-dark-500 text-center pb-3"
        >
          {{ lang.title }}
        </base-text>
        <base-text
          variant="body"
          :weight="300"
          class="text-crisiscleanup-dark-300 text-center pb-3"
        >
          {{ lang.body }}
        </base-text>
        <div class="flex flex-col justify-around">
          <!-- Phone # -->
          <base-input
            v-model="inputNumber"
            size="large"
            :action="() => {}"
            placeholder="+1 (123) 456-7890"
          />
        </div>
      </div>
      <!-- Footer -->
      <div class="flex justify-around"></div>
      <div slot="footer" class="flex p-1 justify-center mb-3">
        <base-button
          variant="solid"
          class="px-3 py-2"
          :action="() => updateUserMobile()"
          >{{ lang.confirm }}</base-button
        >
      </div>
    </modal>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { LangMixin, UserMixin } from '@/mixins';
import User from '@/models/User';

export default {
  name: 'EditCallerID',
  mixins: [UserMixin, LangMixin],
  data() {
    return {
      togglePhone: false,
      toggleLang: false,
      toggleStates: false,
      inputNumber: '',
    };
  },
  props: {
    active: VueTypes.bool.def(false),
  },
  methods: {
    validateNumber(number) {
      /**
       * @todo Create API endpoint to validate phone number
       * @body Functionality already exists in API, so prob should just use it.
       */
      return number;
    },
    async updateUserMobile() {
      if (this.validateNumber(this.inputNumber)) {
        await User.update({
          where: this.currentUser.id,
          data: {
            mobile: this.inputNumber,
          },
        });
      }
    },
  },
  computed: {
    lang() {
      return this.getLang({
        title: `~~Welcome ${this.currentUser.first_name}`,
        body: `~~To become a member of the Crisis Cleanup Virtual Call Center, please provide a valid phone number to receive calls at. Don't worry, your number will remain masked for any inbound or outbound calls.`,
        confirm: '~~Confirm',
      });
    },
  },
};
</script>
