import {create} from "zustand";

type OpenAccountState = {
    id?:string;
    isOpen: boolean;
    onOpen: (id: string) => void;
    onClose: () => void;
};

export const useOpenAccount = create<OpenAccountState>((set) => ({
    id:undefined,
    isOpen: false,
    onOpen: (id: string) => set((state) => ({isOpen: true, id})),
    onClose: () => set((state) => ({isOpen: false, id:undefined})),
}));