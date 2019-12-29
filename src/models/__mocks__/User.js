const MockUsers = [
  { id: 1, first_name: "First", last_name: "Last" },
  { id: 2, first_name: "Test", last_name: "Last" }
];

export default {
  all: jest.fn(() => MockUsers),
  find: jest.fn(() => MockUsers[0])
};
