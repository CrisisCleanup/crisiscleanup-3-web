<template>
    <div id="app">
        <component :is="layout">
            <router-view></router-view>
        </component>
    </div>
</template>

<script>
    import User from "@/models/User";
    import Incident from "@/models/Incident";
    import { mapActions, mapGetters } from "vuex";
    import WorkType from "@/models/WorkType";

    const default_layout = 'authenticated';
    export default {
        name: 'app',
        methods: {
            ...mapActions('auth', [
                'login',
                'logout',
            ]),
            ...mapGetters('auth', [
                'isLoggedIn',
            ])
        },
        async mounted() {
            // await this.login();
            await User.api().get('/users', {
                dataKey: 'results'
            });
            await Incident.api().get('/incidents?fields=id,name,short_name,geofence&limit=150&ordering=-start_at', {
                dataKey: 'results'
            });
            await WorkType.api().get('/work_types?limit=100', {
                dataKey: 'results'
            });
        },
        computed: {
            layout() {
              return (this.$route.meta.layout || default_layout) + '-layout';
            }
        },
        created() {
            this.$http.interceptors.response.use(undefined, function (err) {
                return new Promise((resolve, reject) => {
                    if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
                        this.logout();
                        this.$router.push('/login');
                        resolve()
                    }
                    throw err;
                });
            });
        }
    }
</script>

<style>
    body {
        height: 100vh;
        font-family: 'Nunito Sans', sans-serif;
    }
</style>
