<template>
    <div class="p-6 bg-gray-100 h-full">
        <div v-if="!loading">
            <div class="flex">
                <div class="w-1/4 m-4 p-6 shadow text-base bg-white">
                    <div>My Claimed Cases</div>
                    <div class="font-bold">{{claimedWorksites.length}}</div>
                </div>
                <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
                    <div>Total Claimed</div>
                    <div class="font-bold">{{totalClaimed}} ({{totalClaimed/totalWorksites | numeral('0%')}})</div>
                    <div class="bottom-0 left-0 absolute border-b-4 border-blue-600"
                         :style="{width: `${(totalClaimed/totalWorksites) * 100}%`}"></div>
                </div>
                <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
                    <div>In Progress</div>
                    <div class="font-bold">{{totalInProgess}} ({{totalInProgess/totalWorksites | numeral('0%')}})</div>
                    <div class="bottom-0 left-0 absolute border-b-4 border-blue-600"
                         :style="{width: `${(totalInProgess/totalWorksites) * 100}%`}"></div>
                </div>
                <div class="w-1/4 m-4 p-6 shadow text-base bg-white relative">
                    <div>Closed</div>
                    <div class="font-bold">{{totalClosed}} ({{totalClosed/totalWorksites | numeral('0%')}})</div>
                    <div class="bottom-0 left-0 absolute border-b-4 border-green-600"
                         :style="{width: `${(totalClosed/totalWorksites) * 100}%`}"></div>
                </div>
            </div>
            <div class="flex">
                <div class="w-1/2 m-4 pt-2 shadow bg-white flex-shrink">
                    <div class="py-4 px-4 text-gray-500 border-b">MY CASES</div>
                    <div class="p-4">
                        <template v-for="worksite in claimedWorksites">
                            <template v-for="work_type in worksite.work_types">
                                <div :key="work_type.id" class="flex items-center border-b last:border-b-0 py-2"
                                     v-if="work_type.claimed_by === currentUser.organization.id">
                                    <div class="badge-holder flex items-center w-32">
                                        <a-badge :status="getStatusBadge(work_type.status)" :title="work_type.status"/>
                                        {{worksite.case_number}}
                                    </div>
                                    <span class="w-48 font-bold">{{work_type.work_type | getWorkTypeName}}</span>
                                    <span>{{worksite.name}}</span>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
                <div class="w-1/2 m-4 p-6 shadow bg-white">
                    <div class="flex flex-col items-center justify-around">
                        <div class="text-center text-2xl w-2/3 my-3">Invite Additional Members to Crisiscleanup</div>
                        <div class="text-justify w-5/6 my-3">
                            <div class="my-3">Enter a comma-seperated list of email addresses to invite. Each email
                                address entered here will
                                receive and email with instructions to create a new account and join your organization
                            </div>
                            <a-input v-model="usersToInvite" size="large" class="flex-grow my-3"></a-input>
                        </div>
                        <base-button title="Send Invites" type="primary" class="px-8 py-3"
                                     :action="inviteUsers"></base-button>
                    </div>
                </div>
            </div>
        </div>
        <a-spin tip="Loading..." v-if="loading" :spinning="loading" class="p-6 bg-gray-100 h-full w-full flex flex-col items-center justify-center" />
    </div>
</template>


<script>
    import Worksite from "@/models/Worksite";
    import User from "@/models/User";
    import Status from "@/models/Status";
    import { mapState } from "vuex";
    import { getQueryString } from "@/utils/urls";
    import { getStatusBadge } from '@/filters';
    import BaseButton from "@/components/BaseButton";
    import { getErrorMessage } from "@/utils/errors";

    export default {
        name: "Dashboard",
        components: {BaseButton},
        data() {
            return {
                usersToInvite: '',
                totalWorksites: 0,
                totalClaimed: 0,
                totalClosed: 0,
                totalInProgess: 0,
                loading: false,
                getStatusBadge,
            }
        },
        async mounted() {
            this.loading = true;
            await this.reloadDashBoard();
            this.loading = false;
        },
        methods: {
            async reloadDashBoard() {
                await Promise.all([
                    this.getClaimedWorksites(),
                    this.getReportedWorkSites(),
                    this.getWorksiteCount(),
                    this.getClaimedCount(),
                    this.getInProgessCount(),
                    this.getClosedCount(),
                ]);
            },
            async inviteUsers() {
                try {
                    let emails = this.usersToInvite.split(',');
                    await Promise.all(emails.map(email => User.api().inviteUser(email)));
                    await this.$message.success('Invitations sent');
                } catch (error) {
                    await this.$message.error(getErrorMessage(error));
                }
            },
            async getClaimedWorksites() {
                const params = {
                    incident: this.currentIncidentId,
                    work_type__claimed_by: this.currentUser.organization.id,
                    fields: 'id,name,address,case_number,work_types,city,state,county,flags,blurred_location,incident,postal_code,reported_by',
                };

                Worksite.api().get(`/worksites?${getQueryString(params)}`, {
                    dataKey: 'results'
                })
            },
            async getReportedWorkSites() {
                const params = {
                    incident: this.currentIncidentId,
                    reported_by: this.currentUser.organization.id,
                    fields: 'id,name,address,case_number,work_types,city,state,county,flags,blurred_location,incident,postal_code,reported_by',
                };

                Worksite.api().get(`/worksites?${getQueryString(params)}`, {
                    dataKey: 'results'
                })
            },
            async getWorksiteCount() {
                let response = await this.$http
                    .get("http://api.staging.crisiscleanup.io/worksites", {
                        params: {
                            incident: this.currentIncidentId,
                            limit: 1,
                        }
                    });
                this.totalWorksites = response.data.count;
            },
            async getClaimedCount() {
                let response = await this.$http
                    .get("http://api.staging.crisiscleanup.io/worksites", {
                        params: {
                            incident: this.currentIncidentId,
                            limit: 1,
                            work_type__claimed_by__isnull: false,
                            fields: 'id',
                        }
                    });
                this.totalClaimed = response.data.count;
            },
            async getInProgessCount() {
                let openStatuses = Status.query().where('primary_state', 'open').get()

                let response = await this.$http
                    .get("http://api.staging.crisiscleanup.io/worksites", {
                        params: {
                            incident: this.currentIncidentId,
                            limit: 1,
                            work_type__status__in: openStatuses.map(status => status.status).join(','),
                            fields: 'id',
                        }
                    });
                this.totalInProgess = response.data.count;
            },
            async getClosedCount() {
                let closedStatuses = Status.query().where('primary_state', 'closed').get()

                let response = await this.$http
                    .get("http://api.staging.crisiscleanup.io/worksites", {
                        params: {
                            incident: this.currentIncidentId,
                            limit: 1,
                            work_type__status__in: closedStatuses.map(status => status.status).join(','),
                            fields: 'id',
                        }
                    });
                this.totalClosed = response.data.count;
            }
        },
        computed: {
            currentUser() {
                return User.query().first()
            },
            ...mapState('incident', [
                'currentIncidentId',
            ]),
            claimedWorksites() {
                return Worksite.query().where((worksite) => {
                    return worksite.work_types.find(work_type => work_type.claimed_by === this.currentUser.organization.id)
                }).get()
            }
        },
        watch: {
            currentIncidentId: async function () {
                await Worksite.deleteAll();
                this.loading = true;
                await this.reloadDashBoard();
                this.loading = false;
            }
        },
    }
</script>

<style scoped>

</style>