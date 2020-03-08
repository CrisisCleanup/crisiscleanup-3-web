import HomeLayout from '@/layouts/Home';

export default {
  title: 'Layouts|HomeLayout',
  component: HomeLayout,
  parameters: {
    backgrounds: [],
  },
};

export const withBasicContent = () => ({
  components: { HomeLayout },
  template: `
   <HomeLayout>
    <template #grid-content>
      <div class="grid--main h-screen">
        <h1>I am in a HomeLayout</h1>
      </div>
    </template>
   </HomeLayout>
  `,
});

export const withOverlay = () => ({
  components: { HomeLayout },
  template: `
    <HomeLayout>
      <template #grid-overlay>
        <div class="grid--overlay homegrid-backdrop" />
      </template>
      <template #grid-content>
        <div class="grid--main h-screen">
          <h1>Home Container!</h1>
        </div>
      </template>
    </HomeLayout>
  `,
});

export const withDefaultOverride = () => ({
  components: { HomeLayout },
  template: `
    <HomeLayout>
      <template #grid-logo>
        <div class="grid--logo border-2">
          <p>This is grid--logo</p>
        </div>
      </template>
      <template #grid-survivors>
        <div class="grid--survivors border-2">
          <p>This is grid--survivors</p>
        </div>
      </template>
      <template #grid-content>
        <div class="grid--main w-screen h-screen border-2">
          <p>This is grid--main</p>
        </div>
      </template>
    </HomeLayout>
  `,
});

export const withAll = () => ({
  components: { HomeLayout },
  template: `
    <HomeLayout>
      <template #grid-overlay>
        <div class="grid--overlay homegrid-backdrop"/>
      </template>
      <template #grid-content>
        <div class="grid--nav border-2">
          <h1>I am in grid--nav</h1>
        </div>
        <div class="grid--actions border-2">
          <h1>I am in grid--actions</h1>
        </div>
        <div class="grid--main h-screen border-2">
          <h1>I am in grid--main</h1>
        </div>
      </template>
    </HomeLayout>
  `,
});
