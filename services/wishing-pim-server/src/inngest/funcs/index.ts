import * as webhookHandlers from './webhookHandlers'

export const allFunctions = [
  ...Object.values(webhookHandlers)
]