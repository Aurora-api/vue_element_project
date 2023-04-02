import Vue from "vue";
import router from "./router";
import store from "./store";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import {ACCESS_TOKEN} from "@/store/mutation-types";

NProgress.configure({showSpinner: false}); // NProgress Configuration

const whiteList = ['/login','/home'] // 页面路由白名单
//前置守卫
router.beforeEach(async (to, from, next) => {
    NProgress.start(); // start progress bar
    //判断是否是去登录页面，是,直接过
    if (to.path === '/login') {
        next()
        NProgress.done()
    } else {
        //不是去登录页面，判断用户是否登录过
        if (Vue.ls.get(ACCESS_TOKEN)) {
            const hasRoles = store.getters.userRoles && store.getters.userRoles.length > 0
            //登录了，判断是否有用户详细信息（如果有），比如角色权限，直接过
            if (hasRoles) {
                next()
            } else {
                //没有用户详细信息，代表用户刷新了，或者其他行为，重新获取一次用户信息，
                // 并根据该用户的角色权限，来获取用户权限范围内能看到的界面
                try {
                    //获取当前角色
                    const {roles} = await store.dispatch('app/getInfo')
                    //根据权限查询动态路由
                    const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
                    //添加动态路由
                    for (let i = 0; i < accessRoutes.length; i++) {
                        const element = accessRoutes[i]
                        router.addRoute(element)
                        // router.addRoute('globalLayout', {
                        //   path: element.path,
                        //   name: element.path.slice(1, 2).toUpperCase() + element.path.slice(2),
                        //   component: () => import('@/' + element.component),
                        //   // meta: {
                        //   //     // title: '',
                        //   //     roles: [roles],
                        //   // }
                        // })
                    }
                    // console.log(router.getRoutes())
                    //decodeURIComponent
                    const redirect = from.query.redirect || to.path
                    if (to.path === redirect) {
                        // 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
                        next({...to, replace: true})
                    } else {
                        // 跳转到目的路由
                        next({path: redirect})
                    }
                } catch (error) {
                    console.log(error)
                    await store.dispatch('app/Logout').then(() => {
                        next({path: '/login', query: {redirect: to.fullPath}})
                    })
                    NProgress.done()
                }
            }
        }
        else {
            //如果没有登录
            if (whiteList.indexOf(to.path) !== -1) {
                // 在免登录白名单，直接进入
                next()
            } else {
                //跳转到登录页面
                next({path: '/login', query: {redirect: to.fullPath}})
                NProgress.done()
            }
        }
    }
});