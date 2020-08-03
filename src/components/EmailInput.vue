<template>
  <div>
    <tag-input
      v-model="emails"
      :tags.sync="users"
      :placeholder="$t('usersVue.emails')"
      :validation="validation"
      :add-on-key="[13, 32, ',']"
      :separators="[';', ',', ', ']"
      @tags-changed="
        (newTags) => {
          users = newTags;
          emitUsers();
        }
      "
    />
  </div>
</template>
<script>
import { createTags } from '@johmun/vue-tags-input';
import _ from 'lodash';

const EMAIL_REGEX = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;

export default {
  name: 'EmailInput',
  data() {
    return {
      emails: '',
      users: [],
      validation: [
        {
          classes: 'email',
          rule: /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/,
          disableAdd: true,
        },
      ],
    };
  },
  methods: {
    async emitUsers() {
      let tags = _.defaultTo(this.users.slice(), []);
      if (this.emails) {
        const emailList = this.emails.match(EMAIL_REGEX);
        let extTags = _.attempt(createTags, emailList);
        if (_.isError(extTags)) {
          extTags = [];
        }
        tags = _.uniqBy(tags.concat(extTags), 'text');
      }
      if (_.isEmpty(tags)) {
        return;
      }
      const emails = tags.map((value) => value.text);
      this.$emit('input', emails);
    },
  },
};
</script>

<style>
.vue-tags-input {
  @apply w-108 mb-2 !important;
  height: auto !important;
}

.vue-tags-input .ti-input {
  height: auto !important;
}
</style>
