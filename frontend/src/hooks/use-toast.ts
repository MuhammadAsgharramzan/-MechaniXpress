"use client"

// Simplified Toast hook for MVP
import { useState, useEffect } from "react"

type ToastProps = {
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type ToasterToast = ToastProps & {
    id: string,
    open: boolean,
    onOpenChange: (open: boolean) => void
}

const listeners: Array<(state: any) => void> = []

let memoryState: { toasts: ToasterToast[] } = { toasts: [] }

function dispatch(action: any) {
    switch (action.type) {
        case "ADD_TOAST":
            memoryState = {
                toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
            }
            break
        case "UPDATE_TOAST":
            memoryState = {
                toasts: memoryState.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }
            break
        case "DISMISS_TOAST":
            // Simple removal for now
            memoryState = {
                toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
            }
            break
    }
    listeners.forEach((listener) => listener(memoryState))
}

export function useToast() {
    const [state, setState] = useState<{ toasts: ToasterToast[] }>(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast: (props: ToastProps) => {
            const id = genId()
            const update = (props: ToasterToast) =>
                dispatch({
                    type: "UPDATE_TOAST",
                    toast: { ...props, id },
                })
            const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

            dispatch({
                type: "ADD_TOAST",
                toast: {
                    ...props,
                    id,
                    open: true,
                    onOpenChange: (open: boolean) => {
                        if (!open) dismiss()
                    },
                },
            })

            return {
                id: id,
                dismiss,
                update,
            }
        },
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}
