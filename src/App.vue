<template>
    <div id="app">
        <a-layout id="components-layout-demo-custom-trigger">
            <a-layout-sider width="110">
                <div class="logo">
                    <img src="@/assets/crisiscleanup_logo.png">
                </div>
                <a-menu theme="dark" mode="inline" :selectedKeys="selectedRoute">
                    <a-menu-item key="dashboard">
                        <router-link to="/dashboard" class="router-link">
                            <font-awesome-icon size="lg" icon="home" />
                            <div>Dashboard</div>
                        </router-link>
                    </a-menu-item>
                    <a-menu-item key="profile">
                        <router-link to="/profile" class="router-link">
                            <font-awesome-icon size="lg" icon="user" />
                            <div>Go to Profile</div>
                        </router-link>
                    </a-menu-item>
                    <a-menu-item key="cases">
                        <router-link to="/cases" class="router-link">
                            <font-awesome-icon size="lg" icon="briefcase" />
                            <div>Cases</div>
                        </router-link>
                    </a-menu-item>
                </a-menu>
            </a-layout-sider>
            <a-layout>
                <a-layout-header style="background: #fff; padding: 0" class="shadow">
                    <div class="flex justify-between h-full items-center">
                        <a-select v-if="incidents" :defaultValue="this.currentIncident && this.currentIncident.id" class="m-6" style="width: 250px" @change="handleChange">
                            <a-select-option :key="incident.id" v-for="incident in incidents" :value="incident.id">{{incident.name}}</a-select-option>
                        </a-select>
                        <div>
                            <a-avatar src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80" />
                            <span class="p-3">{{name}}</span>
                        </div>
                    </div>
                </a-layout-header>
                <a-layout-content>
                    <router-view></router-view>
                </a-layout-content>
            </a-layout>
        </a-layout>
    </div>
</template>

<script>
    import User from "@/models/User";
    import Incident from "@/models/Incident";
    import Worksite from "@/models/Worksite";
    import { mapActions, mapMutations, mapState } from "vuex";

    export default {
        name: 'app',
        components: {},
        methods: {
            handleChange(value) {
                this.setCurrentIncidentId(value)
                Incident.api().fetchById(value);
                Worksite.api().get(`/worksites?fields=id,name,address,case_number,work_types,city,state,county,flags,blurred_location,incident,postal_code&incident=${value}`, {
                    dataKey: 'results'
                });
            },
            ...mapActions('auth', [
                'login',
            ]),
            ...mapMutations('incident', [
                'setCurrentIncidentId',
            ]),
        },


        async mounted() {
            await this.login();
            await User.api().get('/users', {
                dataKey: 'results'
            });
            await Incident.api().get('/incidents?fields=id,name,short_name,geofence&limit=150', {
                dataKey: 'results'
            });
        },
        computed: {
            name() {
                if (this.currentUser) {
                    return `${this.currentUser.first_name} ${this.currentUser.last_name}`
                }
                return ''
            },
            selectedRoute() {
                return [this.$route.name]
            },
            currentUser() {
                return User.query().first()
            },
            incidents() {
                return Incident.all()
            },
            currentIncident() {
                return Incident.find(this.currentIncidentId)
            },
            ...mapState('incident', [
                'currentIncidentId',
            ]),
        },
    }
</script>

<style>
    body {
        height: 100vh;
        font-family: 'Montserrat', sans-serif;
    }
    #app {
        /*height: 100vh;*/
    }

    .ant-layout {
        height: 100vh;
    }

    .ant-layout-content {
        height: 100%;
    }

    #app .router-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .ant-menu-item .anticon {
        font-size: 20px !important;
        margin: 0 !important;
    }

    .ant-menu-item-selected .anticon {
        color: #FECE09 !important;
    }

    #app .ant-menu-item {
        width: 100px;
        height: 50px;
    }

    #app .ant-menu-item-selected {
        width: 100px;
        background-color: transparent;
        border-left: solid 3px #FECE09;
    }

    #components-layout-demo-custom-trigger .trigger {
        font-size: 18px;
        line-height: 64px;
        padding: 0 24px;
        cursor: pointer;
        transition: color .3s;
    }

    #components-layout-demo-custom-trigger .trigger:hover {
        color: #1890ff;
    }

    #components-layout-demo-custom-trigger .logo {
        height: 32px;
        margin: 10px 20px 20px;
    }
</style>
