import { create } from 'zustand'

const OPEN_STATE_KEY = 'ami_live_chat_open'

type LiveChatOpenState = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export const useLiveChatOpenStore = create<LiveChatOpenState>((set) => ({
    isOpen:
        typeof window !== 'undefined'
            ? sessionStorage.getItem(OPEN_STATE_KEY) === 'true'
            : false,
    setIsOpen: (open) => {
        sessionStorage.setItem(OPEN_STATE_KEY, String(open))
        set({ isOpen: open })
    },
}))
