<template>
    <div class="flex items-center justify-center" :style="{padding: '24px'}">
        <div>
            <a-card :title="name" v-if="isEditing">
                <a-form :form="form" @submit="handleSubmit" layout="vertical">
                    <div class="flex m-auto p-3 justify-start">
                        <div class="flex flex-col p-8">
                            <img class="rounded-full mx-auto p-1"
                                 src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80">
                            <a href="https://google.com" class="text-center pb-4">Change Photo</a>
                            <a-button type="primary" class="flex-grow-0">View ID Badge</a-button>
                        </div>
                        <div style="min-width: 700px;" class="p-8 w-1/2">
                            <div class="user-details">
                                <div class="flex">
                                    <a-form-item class="input-container m-1 mb-3">
                                        <label>First Name</label>
                                        <a-input size="small" style="border: 0;"
                                                 v-decorator="['first_name', {initialValue: this.currentUser.first_name, rules: [{ required: true, message: 'First name is required' }]}]"/>
                                    </a-form-item>
                                    <a-form-item class="input-container m-1 mb-3">
                                        <label>Phone Number</label>
                                        <a-input size="small"
                                                 v-decorator="['phone_number', {initialValue: this.currentUser.mobile}]"/>
                                    </a-form-item>
                                </div>
                                <div class="flex">
                                    <a-form-item class="input-container m-1 mb-3">
                                        <label>Last Name</label>
                                        <a-input size="small"
                                                 v-decorator="['last_name', {initialValue: this.currentUser.last_name, rules: [{ required: true, message: 'Last name is required' }]}]"/>
                                    </a-form-item>
                                    <a-form-item class="input-container m-1 mb-3">
                                        <label>Email</label>
                                        <a-input size="small"
                                                 v-decorator="['email', {initialValue: this.currentUser.email, rules: [{ required: true, message: 'Email address is required' }]}]"/>
                                    </a-form-item>
                                </div>
                            </div>
                            <hr class="p-2 m-auto">
                            <div class="flex">
                                <div class="p-1 flex-grow">
                                    <a-form-item label="">
                                        <a-select size="large"
                                                v-decorator="['role', {rules: [{ required: true, message: 'Please select your role!' }]}]"
                                                placeholder="Role" @change="handleSelectChange">
                                            <a-select-option value="male">
                                                male
                                            </a-select-option>
                                            <a-select-option value="female">
                                                female
                                            </a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </div>
                                <div class="p-1 flex-grow">
                                    <a-form-item label="">
                                        <a-select
                                                size="large"
                                                v-decorator="['equipment', {rules: [{ required: true, message: 'Please select your equipment!' }]}]"
                                                placeholder="Equipment" mode="tags" @change="handleSelectChange">
                                            <a-select-option value="male">
                                                male
                                            </a-select-option>
                                            <a-select-option value="female">
                                                female
                                            </a-select-option>
                                        </a-select>
                                    </a-form-item>
                                </div>
                            </div>
                            <div>
                                <h3>Linked Account</h3>
                                <div class="flex py-3 items-center">
                                    <div class="w-1/5 flex items-center">
                                        <img src="https://simpleicons.org/icons/facebook.svg" class="w-8 mr-2">
                                        <label class="pr-3">Facebook</label>
                                    </div>
                                    <a-input size="medium" class="w-1/2"
                                             v-decorator="['email', {rules: [{ required: true, message: 'Please input your note!' }]}]"/>
                                </div>
                                <div class="flex py-3 items-center">
                                    <div class="w-1/5 flex items-center">
                                        <img src="https://simpleicons.org/icons/twitter.svg" class="w-8 mr-2">
                                        <label class="pr-3">Twitter</label>
                                    </div>
                                    <a-input size="medium" class="w-1/2"
                                             v-decorator="['email', {rules: [{ required: true, message: 'Please input your note!' }]}]"/>
                                </div>
                            </div>
                            <hr class="p-4 m-auto">
                            <div>
                                <h3>Organization</h3>
                                <div class="py-3">
                                    <a-avatar size="medium"/>
                                    <span class="px-4">{{currentUser.organization.name}}</span>
                                </div>
                                <a-form-item>
                                    <a-button type="primary">
                                        Change Organization
                                    </a-button>
                                </a-form-item>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2>Saved Reports</h2>
                        <div class="flex flex-wrap py-3 w-3/4">
                            <a-card style="width: 300px" class="m-2">
                                <p>Card content</p>
                                <p>Card content</p>
                                <p>Card content</p>
                            </a-card>
                            <a-card style="width: 300px" class="m-2">
                                <p>Card content</p>
                                <p>Card content</p>
                                <p>Card content</p>
                            </a-card>
                        </div>
                    </div>
                    <div class="flex">
                        <h2 class="w-10">Settings</h2>
                        <div class="mx-20">
                            <div class="pb-4">
                                <a-switch class="mr-6" checkedChildren="ON" unCheckedChildren="OFF"/>
                                <span>Share Location while logged in</span>
                            </div>
                            <div class="pb-4">
                                <a-switch class="mr-6" checkedChildren="ON" unCheckedChildren="OFF"/>
                                <span>Reminders</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex">
                        <h2 class="w-10">Notification</h2>
                        <div class="mx-20">
                            <a-radio-group @change="onChange" v-model="value">
                                <a-radio :style="radioStyle" :value="1">Notification on</a-radio>
                                <a-radio :style="radioStyle" :value="2">Notification off</a-radio>
                                <a-radio :style="radioStyle" :value="4">
                                    Restrict to time intervals
                                    <a-input v-if="value === 4" :style="{ width: 100, marginLeft: 10 }"/>
                                </a-radio>
                            </a-radio-group>
                        </div>
                    </div>
                </a-form>
            </a-card>
            <a-card v-else>
                <div class="flex profile-actions text-gray-500" slot="extra">
                    <a-icon type="edit" @click="startEditing"/>
                    <a-icon type="share-alt"/>
                    <a-icon type="printer"/>
                    <a-icon type="delete"/>
                </div>
                <div class="flex m-auto p-3 justify-start">
                    <div class="flex flex-col p-8">
                        <img class="rounded-full mx-auto p-1"
                             src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80">
                        <a href="https://google.com" class="text-center pb-4">Change Photo</a>
                        <a-button type="primary" class="flex-grow-0">View ID Badge</a-button>
                    </div>
                    <div style="min-width: 700px;" class="p-8 w-1/2">
                        <h1 class="text-2xl">{{name}}</h1>
                        <div class="text-gray-500">{{currentUser.roles[0].name_t}}</div>
                        <div class="flex mt-4">
                            <img src="https://simpleicons.org/icons/facebook.svg" class="w-8 mr-2">
                            <img src="https://simpleicons.org/icons/twitter.svg" class="w-8 mr-2">
                        </div>
                        <div class="mt-4 text-gray-700">
                            <div class="py-1">
                                <font-awesome-icon size="lg" class="mr-3" icon="phone-alt" />
                                {{currentUser.mobile}}
                            </div>
                            <div class="py-1">
                                <font-awesome-icon size="lg" class="mr-3" icon="envelope" />
                                {{currentUser.email}}
                            </div>
                        </div>
                        <div class="mt-4">
                            <h3>Assets</h3>
                            <div class="mt-2">
                                <a-tag>Van</a-tag>
                                <a-tag>Trailer</a-tag>
                                <a-tag>Compressor</a-tag>
                                <a-tag>Bulldozer</a-tag>
                            </div>
                        </div>
                        <div class="mt-8">
                            <h3>Organization</h3>
                            <div class="py-3">
                                <a-avatar size="medium"/>
                                <span class="px-4">{{currentUser.organization.name}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </a-card>
        </div>
    </div>
</template>

<script>
    import User from "@/models/User";

    export default {
        name: "Profile",
        data() {
            return {
                formLayout: 'inline',
                form: this.$form.createForm(this),
                value: 1,
                radioStyle: {
                    display: 'block',
                    height: '30px',
                    lineHeight: '30px',
                },
                isEditing: false
            };
        },
        computed: {
            name() {
                if (this.currentUser) {
                    return `${this.currentUser.first_name} ${this.currentUser.last_name}`
                }
                return '';
            },
            currentUser() {
                return User.find(this.$store.getters['auth/userId'])
            },

        },
        methods: {
            handleSubmit(e) {
                e.preventDefault();
                this.form.validateFields((err, values) => {
                    if (!err) {
                        this.$log.debug('Received values of form: ', values);
                    }
                });
            },
            handleSelectChange(value) {
                this.form.setFieldsValue({
                    note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
                });
            },
            startEditing() {
                this.isEditing = true
            }
        },
    }
</script>

<style scoped>
    .profile-actions .anticon {
        font-size: 20px;
        padding-left: 0.5em;
    }
    .ant-btn-primary {
        color: black
    }
    .user-details .input-container {
        border: 1px solid lightgray;
        padding: 0 8px;
        width: 50%;
    }
    .user-details label {
        color: #a0a0a0;
        font-weight: 200;
        font-size: small;
    }
    .user-details .ant-input {
        border: 0;
        padding: 0;
    }
</style>