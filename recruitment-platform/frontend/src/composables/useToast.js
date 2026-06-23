import { reactive } from 'vue'

const state = reactive({
  toasts: []
})

let idCounter = 0

function addToast(message, type = 'info', duration = 3000) {
  const id = ++idCounter
  state.toasts.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

function removeToast(id) {
  const idx = state.toasts.findIndex(t => t.id === id)
  if (idx !== -1) {
    state.toasts.splice(idx, 1)
  }
}

export function useToast() {
  return {
    toasts: state.toasts,
    success(msg, duration) { return addToast(msg, 'success', duration) },
    error(msg, duration) { return addToast(msg, 'error', duration) },
    info(msg, duration) { return addToast(msg, 'info', duration) },
    warning(msg, duration) { return addToast(msg, 'warning', duration) },
    remove: removeToast
  }
}
