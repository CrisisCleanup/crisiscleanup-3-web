<template>
  <div :class="classes">
    <div
      class="rounded-full w-full h-full overflow-hidden text-center bg-purple flex cursor-pointer"
      :class="innerClasses"
    >
      <span
        class="hidden group-hover:table-cell text-white font-bold align-middle"
        >{{ initials }}</span
      >
      <img
        :src="url"
        :alt="initials"
        data-testid="testAvatarIcon"
        class="object-cover object-center w-full h-full visible group-hover:hidden"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, defineComponent } from 'vue';
import useCurrentUser from '../hooks/useCurrentUser';

type AvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xl';

export default defineComponent({
  name: 'Avatar',
  props: {
    initials: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<AvatarSize>,
      default: '',
    },
    innerClasses: {
      type: String,
      default: 'shadow-inner',
    },
  },
  setup(props) {
    const { currentUser } = useCurrentUser();
    const classes = computed(() => {
      return {
        [props.size]: true,
      };
    });

    return {
      classes,
      currentUser,
    };
  },
});
</script>

<style scoped>
.xsmall {
  width: 50px;
  height: 50px;
}
.small {
  width: 60px;
  height: 60px;
}
.medium {
  width: 150px;
  height: 150px;
}
.large {
  width: 200px;
  height: 200px;
}
.xl {
  width: 300px;
  height: 300px;
}
</style>
