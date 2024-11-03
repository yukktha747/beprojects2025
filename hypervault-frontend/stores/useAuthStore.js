import { create } from 'zustand';
import { isLoggedIn as ili, deleteToken } from "@/calls";

const useAuthStore = create(set => ({
    isLoggedIn: ili(),
    login: () => set({ isLoggedIn: true }),
    logout: () => {
        deleteToken();
        set({ isLoggedIn: false })
    },
}));

export default useAuthStore;