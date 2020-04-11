import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions('rc', ['authenticate']),
  },
};
