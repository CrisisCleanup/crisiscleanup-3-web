<template>
  <tabs ref="tabs" class="" tab-details-classes="h-full overflow-auto">
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
              src="../../assets/cc-logo.svg"
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

<script lang="ts">
import { onBeforeMount, onBeforeUnmount, ref, onMounted } from 'vue';
import axios from 'axios';
import moment from 'moment';
import { formatCmsItem } from '../../utils/helpers';
import useDialogs from '../../hooks/useDialogs';
import CmsViewer from '../cms/CmsViewer.vue';
import useCurrentUser from '../../hooks/useCurrentUser';

export default defineComponent({
  name: 'PhoneNews',
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
  setup(props, { emit }) {
    const { component } = useDialogs();
    const { currentUser } = useCurrentUser();

    const newsInterval = ref(undefined);
    const news = ref([]);
    const unreadCount = ref(0);

    async function getNews() {
      if (currentUser.states[props.stateKey]) {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/cms?tags=${
            props.cmsTag
          }&publish_at__gt=${
            currentUser.states[props.stateKey]
          }&publish_at__lt=${moment().toISOString()}&limit=1`,
        );
        unreadCount.value = response.data.count;
        emit('unreadCount', response.data.count);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/cms?tags=${
          props.cmsTag
        }&sort=-publish_at&limit=10`,
      );
      news.value = response.data.results;
    }

    async function showDetails(newItem) {
      await component({
        title: formatCmsItem(newItem.title),
        component: CmsViewer,
        classes: 'w-full h-96 overflow-auto p-3',
        modalClasses: 'bg-white max-w-3xl shadow',
        props: {
          title: formatCmsItem(newItem.title),
          content: formatCmsItem(newItem.content),
          image: newItem.thumbnail_file?.blog_url,
        },
      });
    }

    onBeforeMount(() => {
      newsInterval.value = setInterval(getNews, 10_000);
    });

    onBeforeUnmount(() => {
      if (newsInterval.value) {
        clearInterval(newsInterval.value);
        newsInterval.value = undefined;
      }
    });

    onMounted(() => {
      getNews();
    });

    return {
      news,
      unreadCount,
      newsInterval,
      formatCmsItem,
      showDetails,
    };
  },
});
</script>

<style scoped>
p {
  max-width: 400px;
}
</style>
