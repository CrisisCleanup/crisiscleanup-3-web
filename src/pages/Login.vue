<template>
    <div class="login flex flex-col items-center justify-start">
        <div class="logo m-20">
            <img src="@/assets/ccu-logo-black-500w.png">
        </div>

        <span v-if="acceptedInvite"> You acccepted an invitation, please login</span>

        <form class="flex flex-col login-form" @submit.prevent="userLogin" ref="form">
            <h1 class="text-3xl text-center">Sign in</h1>
            <a-input size="large" class="my-2" required v-model="email" type="email" placeholder="Email" autocomplete="email"/>
            <a-input size="large" class="my-2" required v-model="password" type="password" placeholder="Password" autocomplete="password"/>
            <base-button size="medium" class="px-5 py-2 m-1" type="primary" text="Login"/>
        </form>
    </div>
</template>

<script>
    import { mapActions } from "vuex";

    export default {
        data(){
            return {
                email : "",
                password : "",
                acceptedInvite: Boolean(this.$route.query.accepted)
            }
        },
        methods: {
            ...mapActions('auth', [
                'login',
            ]),
            async userLogin() {
                await this.login({email: this.email, password: this.password});
                await this.$router.push('/')
            }
        }
    }
</script>

<style scoped>
    .login {
        height: 100vh;
    }
    .logo img {
        height: 150px;
    }
    .login-form {
        width: 24rem;
    }
</style>