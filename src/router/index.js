
import Vue from "vue";
import Router from "vue-router";
import { constantRouterMap } from "@/router/route.config";

// 【优化】访问online功能测试 浏览器控制台抛出异常
try {
    // 保存原来的push函数
    const originalPush = Router.prototype.push;
    // 重写push函数
    Router.prototype.push = function push(location, onResolve, onReject) {
        if (onResolve || onReject)
            return originalPush.call(this, location, onResolve, onReject);
        // 调用原来的push函数，并捕获异常
        return originalPush.call(this, location).catch((err) => err);
    };
} catch (e) {
    console.log(e);
}

Vue.use(Router);

const createRouter = () =>
    new Router({
        mode: "history", //hash、history两种模式
        base: process.env.BASE_URL,
        routes: constantRouterMap,
        scrollBehavior: () => ({ y: 0 }),
    });

const router = createRouter();

/**
 * 重置注册的路由导航map
 * 主要是为了通过addRoutes方法动态注入新路由时，避免重复注册相同name路由
 *
 * 修改用户角色、用户退出时调用
 */
export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher; // reset router
}

export default router;
