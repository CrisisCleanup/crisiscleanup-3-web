<template>
    <div>
        <form class="login" @submit.prevent="userLogin">
            <h1>Sign in</h1>
            <label>Email</label>
            <input required v-model="email" type="email" placeholder="Name"/>
            <label>Password</label>
            <input required v-model="password" type="password" placeholder="Password"/>
            <hr/>
            <button type="submit">Login</button>
        </form>
    </div>
</template>

<script>
    import { mapActions } from "vuex";

    export default {
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
            }
        }
    }
</script>

<style scoped>

</style>