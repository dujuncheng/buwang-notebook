<template>
    <div class="progress-bar-container">
        <div class="progress-bar" :style="progresStyle"></div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    export default {
        computed: {
            progresStyle () {

            },
            ...mapState({
                'preferLooseListItem': state => state.preferences.preferLooseListItem,

                'loading': state => state.notebook.loading
            }),
        }
    }
</script>

<style scoped lang="less">
    .progress-bar-container {
        width: 100%;
        height: 5px;
        background-color: wheat;
        position: absolute;
        bottom: 0;
        left: 0;
        .progress-bar {
            background-color: #488DF7;
            height: 100%;
        }
    }
</style>
