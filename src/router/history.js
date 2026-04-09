import { createWebHashHistory, createWebHistory } from 'vue-router'

const useHash = import.meta.env.VITE_ROUTER_MODE === 'hash'

export const routerHistory = useHash ? createWebHashHistory() : createWebHistory()
