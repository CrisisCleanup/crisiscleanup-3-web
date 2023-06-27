import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Chat from '@/components/chat/Chat.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

class MockWebSocket {
  addEventListener() {
    return undefined;
  }

  removeEventListener() {
    return undefined;
  }

  send() {
    expect(true);
  }

  close() {
    return undefined;
  }
}

describe('Chat.vue', () => {
  beforeEach(() => {
    global.WebSocket = MockWebSocket as any;
  });
  it('should render messages', async () => {
    const mockChat = {
      id: '1',
      name: 'General Chat',
    };

    const wrapper = mount(Chat, {
      props: {
        chat: mockChat,
      },
    });

    await flushPromises();

    // Check if messages are rendered
    expect(wrapper.html()).toContain('Hello, how can I help you?');
  });

  it('should send a message', async () => {
    expect.assertions(1);
    const mockChat = {
      id: '1',
      name: 'General Chat',
    };

    const wrapper = mount(Chat, {
      props: {
        chat: mockChat,
      },
      components: {
        BaseInput,
        BaseButton,
      },
    });

    await flushPromises();

    const messageInput = wrapper.find('textarea');
    const sendMessageButton = wrapper.find('button');

    await messageInput.setValue('Test message');
    await sendMessageButton.trigger('click');
    await flushPromises();
  });
});
