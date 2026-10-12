import type { Schema } from '@/shared/api/generated/helpers'

export type CalendarConnectionStatus =
  Schema<'GoogleCalendarStatusConnectedDto'>['status']

export type CalendarConnectionDisconnected =
  Schema<'GoogleCalendarStatusDisconnectedDto'>

export type CalendarConnectionDetails = Schema<'GoogleCalendarStatusConnectedDto'>

export type CalendarConnection =
  | CalendarConnectionDisconnected
  | CalendarConnectionDetails

export type CalendarConnectionSummary =
  Schema<'GoogleCalendarConnectionListItemDto'>

export type CalendarAuthorization = Schema<'GoogleAuthorizationUrlDto'>
