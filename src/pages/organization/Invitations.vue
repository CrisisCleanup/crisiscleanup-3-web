<template>
    <div class="flex h-full items-center justify-center">
        <div class="p-12">
            <div class="flex justify-between my-6">
                <div>
                    <div class="text-base">Current Requests</div>
                    <div class="text-xs">Sub sections</div>
                </div>
                <div class="flex">
                    <base-button size="small" title="Download" class="mx-2 shadow bg-white px-3 text-xs" icon="download"></base-button>
                    <base-button size="small" title="Print" class="mx-2 shadow bg-white px-3 text-xs" icon="print"></base-button>
                </div>
            </div>
            <Table class="border text-xs" :data="invitationRequests" :columns="currentRequestsColumns" :loading="false">
                <template #actions="slotProps">
                    <div class="flex mr-2">
                        <base-button size="small" class="flex-grow m-1 mx-2 text-xs px-3" :action="() => {}"
                                     title="Ignore"></base-button>
                        <base-button size="small" type="bare"
                                     class="flex-grow m-1 mx-2 border-2 border-black text-black text- px-3"
                                     :action="() => { rejectInvitationRequest(slotProps.item) }"
                                     title="Reject"></base-button>
                        <base-button size="small" type="primary" class="flex-grow m-1 mx-2 text-black text-xs px-3"
                                     :action="() => { acceptInvitationRequest(slotProps.item) }"
                                     title="Accept"></base-button>
                    </div>
                </template>
            </Table>

            <Table class="border text-xs mt-4" :data="invitations" :columns="invitationsColumns" :loading="false">
                <template #actions="slotProps">
                    <div class="flex mr-2">
                        <base-button size="small" type="primary" class="flex-grow m-1 mx-2 text-black text-xs px-3"
                                     :action="() => { resendInvitation(slotProps.item) }"
                                     title="Re-Invite"></base-button>
                    </div>
                </template>
                <template #delete="slotProps">
                    <div class="flex mr-2">
                        <ccu-icon type="trash" size="small" @click.native="() => { deleteInvitation(slotProps.item) }"></ccu-icon>
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
            await this.loadAllInvitationRequests()
            await this.loadAllInvitations()
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
                await InvitationRequest.api().acceptInvitationRequest(request)
                await this.loadAllInvitationRequests()
                await this.$message.success('Invitation Accepted');
            },
            async rejectInvitationRequest(request) {
                await InvitationRequest.api().rejectInvitationRequest(request)
                await this.loadAllInvitationRequests()
                await this.$message.success('Invitation Rejected');
            },
            async resendInvitation(invitation) {

            },
            async deleteInvitation(invitation) {

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