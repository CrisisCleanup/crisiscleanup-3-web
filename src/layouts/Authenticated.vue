<template>
    <div class="flex layout overflow-hidden">
        <div class="w-32 sidebar">
            <div class="logo flex justify-center p-1">
                <img class="w-24 h-16" src="@/assets/crisiscleanup_logo.png">
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
                <router-link to="/organization" class="menu-item router-link p-2 border-b border-gray-800">
                    <div key="organization" class="flex flex-col items-center">
                        <ccu-icon type="organization" size="large"/>
                        <div class="menu-text mt-1">My Organization</div>
                    </div>
                </router-link>
            </div>
        </div>
        <div class="flex flex-col w-full">
            <div class="shadow p-1 bg-white">
                <div class="flex justify-between h-full items-center">
                    <div class="flex items-center ml-2">
                        <div class="h-10 w-10 rounded-full bg-blue-500">

                        </div>
                        <div class="flex flex-col ml-2">
                            <base-select
                                    placeholder="Select an Incident"
                                    icon="caret-down"
                                    v-if="incidents"
                                    v-model="this.currentIncidentId"
                                    class="incident-select"
                                    :class="{ 'border-0': true }"
                                    style="width: 250px"
                                    :change="handleChange"
                            >
                                <template v-slot:options>
                                    <a-select-option :key="incident.id" v-for="incident in incidents" :value="incident.id">{{incident.name}}</a-select-option>
                                </template>
                            </base-select>
                            <div class="flex ml-3 font-bold">
                                <span>{{selectedRoute}}</span>
                            </div>
                        </div>
                    </div>
                    <router-link to="/profile" class="router-link">
                        <div>
                            <a-avatar src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80" />
                            <span class="p-3">{{name}}</span>
                        </div>
                    </router-link>
                </div>
            </div>
            <div v-if="this.ready" class="h-full flex-grow content">
                <slot />
            </div>
            <div v-else style="z-index: 1001;" class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center">
                <div class="flex flex-col items-center">
                    <spinner message="Loading..."/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Incident from "@/models/Incident";
    import User from "@/models/User";
    import WorkType from "@/models/WorkType";
    import Organization from "@/models/Organization";
    import Status from "@/models/Status";
    import { mapActions, mapMutations, mapState } from "vuex";

    export default {
        name: 'Authenticated',
        data() {
          return {
              loading: false,
              ready: false
          }
        },
        async mounted() {
            this.loading = true;
            await Promise.all([
                User.api().get('/users/me', {}),
                Incident.api().get('/incidents?fields=id,name,short_name,geofence&limit=150&ordering=-start_at', {
                    dataKey: 'results'
                }),
                WorkType.api().get('/work_types?limit=100', {
                    dataKey: 'results'
                }),
                Status.api().get('/statuses?limit=100', {
                    dataKey: 'results'
                }),
                Organization.api().get(`/organizations/${this.user.user_claims.organization.id}`)
            ]);
            let incidentId = Incident.query().orderBy('id', 'desc').first().id;
            if(this.currentUser.states && this.currentUser.states.incident) {
                incidentId = this.currentUser.states.incident;
            }
            this.setCurrentIncidentId(incidentId);
            await Incident.api().fetchById(incidentId);
            this.loading = false;
            this.ready = true;
        },
        methods: {
            async handleChange(value) {
                this.setCurrentIncidentId(value);
                await Incident.api().fetchById(value);
                User.api().updateUserState({
                    incident: value
                })
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
                return this.$route.name
            },
            currentUser() {
                return User.find(this.$store.getters['auth/userId'])
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
            ...mapState('auth', [
                'user',
            ]),
        },
    }
</script>

<style>
    body {
        font-family: 'Nunito Sans', sans-serif;
    }

    .layout {
        height: 100vh;
    }

    .content {
        max-height: 100%;
    }

    .sidebar {
        background-color: #2d2d2d;
    }

    #app .router-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
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

    .incident-select .ant-select-selection {
        border: 0;
        box-shadow: none;
    }
</style>
