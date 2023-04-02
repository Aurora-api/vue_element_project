import { constantRouterMap, asyncRouterMap } from "@/router/route.config";

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        // return roles.some(role => route.meta.roles.includes(role))
        if (route.meta.roles.indexOf(roles) >= 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
    const res = [];
    routes.forEach((route) => {
        const tmp = { ...route };
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRoutes(tmp.children, roles);
            }
            res.push(tmp);
        }
    });
    return res;
}

const state = {
    routes: [],
    addRoutes: [],
};

const mutations = {
    SET_ROUTES: (state, routes) => {
        state.addRoutes = routes;
        state.routes = constantRouterMap.concat(routes);
    },
};

const actions = {
    //根据角色权限过滤生成动态路由
    generateRoutes({ commit }, roles) {
        return new Promise((resolve) => {
            let accessedRoutes;
            accessedRoutes = filterAsyncRoutes(asyncRouterMap, roles);
            commit("SET_ROUTES", accessedRoutes);
            resolve(accessedRoutes);
        });
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};