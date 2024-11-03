import { create } from 'zustand';
import { isLoggedIn as ili, logoutBlacklist } from "@/calls";

const useAuthStore = create(set => ({
    isLoggedIn: true,
    login: () => set({ isLoggedIn: true }),
    logout: () => {
        logoutBlacklist();
        set({ isLoggedIn: false })
    },
    setIsLoggedIn: (val) => set({isLoggedIn: val}),
}));

export default useAuthStore;
