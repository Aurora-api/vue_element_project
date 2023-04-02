const state = {
    showText:'hello world',
}
const mutations = {
    SET_SHOW_TEXT(state,showText){
        state.showText=showText
    }
}
const actions = {}
export default {
    namespaced: true,
    state,
    mutations,
    actions
}
