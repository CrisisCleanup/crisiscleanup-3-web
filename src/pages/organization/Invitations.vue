<template>
    <div class="flex h-full w-3/4 m-auto">
        <div class="p-12 w-full">
            <div class="flex justify-between items-center my-6">
                <div>
                    <div class="text-base">Current Requests</div>
                    <div class="text-xs">Sub sections</div>
                </div>
                <div class="flex">
                    <base-button size="small" text="Download" class="mx-2 shadow bg-white px-4 p-2 text-xs"
                                 icon="download"/>
                    <base-button size="small" text="Print" class="mx-2 shadow bg-white px-4 p-2 text-xs" icon="print"/>
                </div>
            </div>
            <Table class="border text-xs" :data="invitationRequests" :columns="currentRequestsColumns" :loading="false">
                <template #actions="slotProps">
                    <div class="flex mr-2">
                        <base-button size="small" class="flex-grow m-1 mx-2 text-xs px-3" :action="() => {}"
                                     text="Ignore"/>
                        <base-button size="small" type="bare"
                                     class="flex-grow m-1 mx-2 border-2 border-black text-black text- px-3"
                                     :action="() => { rejectInvitationRequest(slotProps.item) }"
                                     text="Reject"/>
                        <base-button size="small" type="primary" class="flex-grow m-1 mx-2 text-black text-xs px-3"
                                     :action="() => { acceptInvitationRequest(slotProps.item) }"
                                     text="Accept"/>
                    </div>
                </template>
            </Table>


            <div class="flex justify-between items-center my-6">
                <div class="flex items-center">
                    <div class="text-base">Incomplete Invitations</div>
                    <div class="mx-5 flex items-center bg-white border p-1 px-4 cursor-pointer" @click="() => { }">
                        Filters
                        <font-awesome-icon icon="sort" class="ml-20"/>
                    </div>
                </div>
                <div class="flex">
                    <base-button size="small" text="Download" class="mx-2 shadow bg-white px-4 p-2 text-xs"
                                 icon="download"/>
                    <base-button size="small" text="Print" class="mx-2 shadow bg-white px-4 p-2 text-xs" icon="print"/>
                    <base-button size="small" text="Delete Expired" class="mx-2 shadow bg-white px-4 p-2 text-xs" icon="trash"/>
                </div>
            </div>
            <Table class="border text-xs mt-4" :data="invitations" :columns="invitationsColumns" :loading="false">
                <template #actions="slotProps">
                    <div class="flex mr-2">
                        <base-button size="small" type="primary" class="flex-grow m-1 mx-2 text-black text-xs px-3"
                                     :action="() => { resendInvitation(slotProps.item) }"
                                     text="Re-Invite"/>
                    </div>
                </template>
                <template #delete="slotProps">
                    <div class="flex mr-2">
                        <ccu-icon alt="Delete Invitation" type="trash" size="small" @click.native="() => { deleteInvitation(slotProps.item) }"/>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
    import Table from '@/components/Table'
    import InvitationRequest from "@/models/InvitationRequest";
    import Invitation from "@/models/Invitation";

    export default {
        name: "Invitations",
        components: {Table},
        data() {
            return {
                currentRequestsColumns: [{
                    title: 'Requestor',
                    dataIndex: 'requestor',
                    key: 'full_name',
                    width: '2fr',
                }, {
                    title: 'Phone',
                    dataIndex: 'phone',
                    key: 'mobile',
                    width: '2fr',
                }, {
                    title: 'Request Date',
                    dataIndex: 'requested_at_moment',
                    key: 'requested_at_moment',
                    width: '2fr',
                }, {
                    title: '',
                    dataIndex: 'actions',
                    key: 'actions',
                    width: '3fr',
                }],
                invitationsColumns: [{
                    title: 'Email',
                    dataIndex: 'email',
                    key: 'invitee_email',
                    width: '250px',
                }, {
                    title: 'Invited By',
                    dataIndex: 'invited_by',
                    key: 'invited_by',
                    width: '1fr',
                }, {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: '1fr',
                }, {
                    title: 'Invitation Date',
                    dataIndex: 'invitation_date',
                    key: 'invitation_date',
                    width: '1fr',
                }, {
                    title: '',
                    dataIndex: 'actions',
                    key: 'actions',
                    width: '1.5fr',
                }, {
                    title: '',
                    dataIndex: 'delete',
                    key: 'delete',
                    width: '0.5fr',
                }]
            }
        },
        async mounted() {
            await Promise.all([
                this.loadAllInvitationRequests(),
                this.loadAllInvitations()
            ])
        },
        methods: {
            async loadAllInvitationRequests() {
                await InvitationRequest.api().get(`/invitation_requests`, {
                    dataKey: 'results'
                });
            },
            async loadAllInvitations() {
                await Invitation.api().get(`/invitations`, {
                    dataKey: 'results'
                });
            },
            async acceptInvitationRequest(request) {
                await InvitationRequest.api().acceptInvitationRequest(request);
                await this.loadAllInvitationRequests();
                await this.$message.success('Invitation Request Accepted');
            },
            async rejectInvitationRequest(request) {
                await InvitationRequest.api().rejectInvitationRequest(request);
                await this.loadAllInvitationRequests();
                await this.$message.success('Invitation Request Rejected');
            },
            async resendInvitation(invitation) {
                await Invitation.api().resendInvitation(invitation);
                await this.loadAllInvitations();
                await this.$message.success('Invitation Resent');
            },
            async deleteInvitation(invitation) {
                await Invitation.api().delete(`/invitations/${invitation.id}`, {
                    delete: invitation.id
                });
                await this.$message.success('Invitation Deleted');
            }
        },
        computed: {
            invitationRequests() {
                return InvitationRequest.query().where('approved_at', null).where('rejected_at', null).get()
            },
            invitations() {
                return Invitation.all()
            }
        }
    }
</script>

<style scoped>

</style>