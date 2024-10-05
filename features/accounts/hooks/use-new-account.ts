import {create} from "zustand";

type NewAccountState = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

export const useNewAccount = create<NewAccountState>((set) => ({
    isOpen: false,
    onOpen: () => set((state) => ({isOpen: true})),
    onClose: () => set((state) => ({isOpen: false})),
}));