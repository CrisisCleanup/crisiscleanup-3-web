<template>
    <div class="login flex flex-col items-center justify-start">
        <div class="logo m-20">
            <img src="@/assets/ccu-logo-black-500w.png">
        </div>

        <form class="flex flex-col w-1/5" @submit.prevent="userLogin" ref="form">
            <h1 class="text-3xl text-center">Sign in</h1>
            <a-input size="large" class="my-2" required v-model="email" type="email" placeholder="Email" autocomplete="email"/>
            <a-input size="large" class="my-2" required v-model="password" type="password" placeholder="Password" autocomplete="password"/>
            <base-button size="medium" class="px-5 py-2 m-1" type="primary" title="Login"></base-button>
        </form>
    </div>
</template>

<script>
    import { mapActions } from "vuex";
    import BaseButton from "@/components/BaseButton";

    export default {
        components: { BaseButton },
        data(){
            return {
                email : "",
                password : ""
            }
        },
        methods: {
            ...mapActions('auth', [
                'login',
            ]),
            async userLogin() {
                await this.login(this.email, this.password);
                await this.$router.push('/dashboard')
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
</style>