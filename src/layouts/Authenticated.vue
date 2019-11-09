<template>
    <a-layout id="components-layout-demo-custom-trigger">
        <a-layout-sider width="110">
            <div class="logo">
                <img src="@/assets/crisiscleanup_logo.png">
            </div>
            <div class="menu">
                <router-link to="/dashboard" class="menu-item router-link p-2 border-b border-t border-gray-800">
                    <div key="dashboard" class="flex flex-col items-center">
                        <ccu-icon type="dashboard"/>
                        <div class="menu-text mt-1">Dashboard</div>
                    </div>
                </router-link>
                <router-link to="/cases" class="menu-item router-link p-2 border-b border-gray-800">
                    <div key="cases" class="flex flex-col items-center">
                        <ccu-icon type="cases"/>
                        <div class="menu-text mt-1">Cases</div>
                    </div>
                </router-link>
            </div>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0" class="shadow">
                <div class="flex justify-between h-full items-center">
                    <BaseSelect size="large" v-if="incidents" :defaultValue="this.currentIncident && this.currentIncident.id" class="m-6" style="width: 250px" :change="handleChange">
                        <template v-slot:options>
                            <a-select-option :key="incident.id" v-for="incident in incidents" :value="incident.id">{{incident.name}}</a-select-option>
                        </template>
                    </BaseSelect>
                    <router-link to="/profile" class="router-link">
                        <div>
                            <a-avatar src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80" />
                            <span class="p-3">{{name}}</span>
                        </div>
                    </router-link>
                </div>
            </a-layout-header>
            <a-layout-content>
                <slot />
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script>
    import User from "@/models/User";
    import Incident from "@/models/Incident";
    import { mapActions, mapMutations, mapState } from "vuex";
    import BaseSelect from "@/components/BaseSelect";
    import BaseIcon from "@/components/BaseIcon";

    export default {
        name: 'Authenticated',
        components: {BaseIcon, BaseSelect},
        methods: {
            async handleChange(value) {
                this.setCurrentIncidentId(value)
                await Incident.api().fetchById(value);
            },
            ...mapActions('auth', [
                'login',
            ]),
            ...mapMutations('incident', [
                'setCurrentIncidentId',
            ]),
            ...mapMutations('loading', [
                'setWorksitesLoading',
            ]),
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
                return Incident.query().orderBy('id', 'desc').get()
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
        font-family: 'Nunito Sans', sans-serif;
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

    .ant-menu-item {
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

    .menu-text {
        line-height: 15px;
        color: white;
        text-decoration: none !important;
    }

    .router-link:hover {
        text-decoration: none !important;
    }

    .router-link:active {
        text-decoration: none !important;
    }

    .router-link {
        text-decoration: none !important;
    }

    .router-link-active.menu-item {
        background-color: transparent;
        border-left: solid 3px #FECE09;
    }
</style>
