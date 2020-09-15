import { hash } from '@/utils/promise';
import _ from 'lodash';

export const TrainingMixin = {
  data() {
    return {
      trainings: [],
      userTrainings: [],
    };
  },
  methods: {
    async loadTrainingData({ force = false } = {}) {
      if (!this.trainings.length || force) {
        const pageData = await hash({
          trainings: this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/trainings`,
          ),
          userTrainings: this.$http.get(
            `${process.env.VUE_APP_API_BASE_URL}/user_trainings`,
          ),
        });
        this.userTrainings = pageData.userTrainings.data.results;
        this.trainings = pageData.trainings.data.results.filter((training) =>
          [2, 3].includes(training.id),
        );
      }
    },
    getTrainingThumbnail({ settings: { videos } }) {
      const video = _.first(videos);
      if (video) {
        const videoId = _.last(video.url.split('/'));
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return '';
    },
  },
  computed: {
    outstandingTrainings() {
      return this.trainings.filter((training) => {
        return !this.userTrainings.find(
          (userTraining) => userTraining.training === training.id,
        );
      });
    },
    allTrainingCompleted() {
      return !this.outstandingTrainings.length;
    },
  },
};
