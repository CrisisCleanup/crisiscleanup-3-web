<template>
    <div class="flex flex-col items-center justify-center h-full form-container">
        <div class="w-32 m-6">
            <img src="@/assets/ccu-logo-black-500w.png">
        </div>

        <form class="form" @submit.prevent="acceptInvite" ref="form">
            <base-input type="text" class="input" v-model="first_name" size="large" placeholder="First Name" required/>
            <base-input type="text" class="input" v-model="last_name" size="large" placeholder="Last Name" required/>
            <base-input type="text" class="input" v-model="mobile" size="large" placeholder="Mobile" required/>
            <base-input type="password" class="input" v-model="password" size="large" placeholder="Password" required/>
            <base-input type="password" ref="confirm_password" class="input" v-model="confirmPassword" size="large" placeholder="Confirm Password" required/>
            <base-button size="medium" class="px-5 py-2 m-1 flex-grow" type="primary" text="Accept Invite"/>
        </form>
    </div>
</template>

<script>
    import User from "@/models/User";

    export default {
        name: "InvitationSignup",
        data() {
            return {
                first_name: '',
                last_name: '',
                password: '',
                confirmPassword: '',
                mobile: ''
            }
        },
        methods: {
            async acceptInvite() {
                let { first_name, last_name, password, mobile } = this;
                if (this.validatePassword()) {
                    try {
                        await User.api().acceptInvite({
                            token: this.$route.params.token,
                            first_name,
                            last_name,
                            password,
                            mobile
                        });
                        await this.$router.push('/login?accepted=true')
                    } catch (e) {
                        await this.$message.error('Error accepting invite');
                    }
                }
            },
            validatePassword(){
                if(this.password !== this.confirmPassword) {
                    this.$message.error('Passwords dont match');
                    return false
                } else {
                    return true
                }
            }
        }
    }
</script>

<style scoped>
    .form-container {
        height: 100vh;
    }

    .form {
        width: 24rem;
        @apply flex flex-col
    }

    .input {
        @apply m-1;
    }
</style>