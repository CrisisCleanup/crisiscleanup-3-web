import Modal from '@/components/Modal';

export default {
  title: 'Basics|Modal',
  component: Modal,
};

export const basicModal = () => ({
  data() {
    return {
      isShowingModal: false,
    };
  },
  template: `
    <div>
      <base-button variant="outline" :action="() => (isShowingModal = true )" text="Show Modal"></base-button>
      <modal v-if="isShowingModal" title="Basic Modal" modal-classes="w-108" @ok="isShowingModal = false" @close="isShowingModal = false">
        A simple modal with a title
      </modal>
    </div>
  `,
});

export const modalWithCustomHeaderAndFooter = () => ({
  data() {
    return {
      isShowingModal: false,
    };
  },
  template: `
    <div>
      <base-button variant="outline" :action="() => (isShowingModal = true )" text="Show Modal"></base-button>
      <modal v-if="isShowingModal" title="Basic Modal" modal-classes="w-108" @ok="isShowingModal = false" @close="isShowingModal = false">
        <div slot="header" class="flex p-1 justify-center bg-black text-white">
          Custom Header
        </div>
        Modal with custom header and footer
        <div slot="footer" class="flex p-1 justify-center">
          <base-button variant="outline" :action="() =>  (isShowingModal = false)" text="Custom Close"></base-button>
        </div>
      </modal>
    </div>
  `,
});
