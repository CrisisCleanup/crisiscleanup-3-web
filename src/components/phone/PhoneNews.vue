<template>
  <tabs class="" ref="tabs" tab-details-classes="h-full overflow-auto">
    <tab :name="$t('phoneDashboard.news')">
      <ul>
        <li
          v-for="newItem in news"
          :key="newItem.id"
          class="hover:bg-crisiscleanup-light-grey cursor-pointer border-b-2"
          @click="() => showDetails(newItem)"
        >
          <div class="p-2 flex">
            <img
              v-if="newItem.thumbnail_file"
              :src="newItem.thumbnail_file.blog_url"
              class="w-20 h-20 mr-2"
              :alt="newItem.thumbnail_file"
            />
            <img
              v-else
              src="@/assets/cc-logo.svg"
              class="w-20 h-20 mr-2"
              alt="crisis-cleanup-logo"
            />
            <div class="h-20 overflow-y-hidden">
              <div
                class="text-xl sm:text-sm my-1 font-bold truncate"
                v-html="$t(formatCmsItem(newItem.title))"
              ></div>
              <p
                class="text-xs line-clamp-3"
                v-html="$t(formatCmsItem(newItem.content))"
              ></p>
            </div>
          </div>
        </li>
      </ul>
    </tab>
  </tabs>
</template>

<script>
import { formatCmsItem } from '@/utils/helpers';
import { DialogsMixin, UserMixin } from '@/mixins';
export default {
  name: 'PhoneNews',
  mixins: [DialogsMixin, UserMixin],
  data() {
    return {
      news: [],
      unreadCount: 0,
      newsInterval: undefined,
      formatCmsItem,
    };
  },
  created() {
    this.newsInterval = setInterval(this.getNews, 10000);
  },
  beforeDestroy() {
    if (this.newsInterval) {
      clearInterval(this.newsInterval);
      this.newsInterval = undefined;
    }
  },
  async mounted() {
    await this.getNews();
  },
  props: {
    cmsTag: {
      type: String,
      default: 'phone-news',
    },
    stateKey: {
      type: String,
      default: 'news_last_seen',
    },
  },
  methods: {
    async getNews() {
      if (this.currentUser.states[this.stateKey]) {
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/cms?tags=${
            this.cmsTag
          }&publish_at__gt=${
            this.currentUser.states[this.stateKey]
          }&publish_at__lt=${this.$moment().toISOString()}&limit=1`,
        );
        this.unreadCount = response.data.count;
        this.$emit('unreadCount', response.data.count);
      }
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/cms?tags=${this.cmsTag}&sort=-publish_at&limit=10`,
      );
      this.news = response.data.results;
    },
    async showDetails(newItem) {
      await this.$component({
        title: formatCmsItem(newItem.title),
        component: 'CmsViewer',
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          title: formatCmsItem(newItem.title),
          content: formatCmsItem(newItem.content),
          image: newItem.thumbnail_file?.blog_url,
        },
      });
    },
  },
};
</script>

<style scoped>
p {
  max-width: 400px;
}
</style>
