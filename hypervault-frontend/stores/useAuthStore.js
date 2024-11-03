import { create } from 'zustand';
import { isLoggedIn as ili, logoutBlacklist } from "@/calls";

const useAuthStore = create(set => ({
    isLoggedIn: ili(),
    login: () => set({ isLoggedIn: true }),
    logout: () => {
        logoutBlacklist();
        set({ isLoggedIn: false })
    },
}));

export default useAuthStore;