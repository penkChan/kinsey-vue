import { defineStore } from 'pinia'

export const useGlobalVariables = defineStore('globalVariables', () => {
  const animations = {
    timeScale: {
      preloader: 1.0,
    },
  }
  return {
    animations,
  }
})
