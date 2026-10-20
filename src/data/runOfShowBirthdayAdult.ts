import type { RunOfShowSlot } from '../types/event';

export const BIRTHDAY_ADULT_TEEN_TEMPLATE: readonly RunOfShowSlot[] = [
  {
    startTime: '17:30',
    durationMin: 45,
    activity: 'Venue setup and audiovisual check',
    owner: 'Venue Manager',
    bufferMin: 15,
  },
  {
    startTime: '18:45',
    durationMin: 45,
    activity: 'Guest arrival and welcome drinks with appetizers',
    owner: 'Coordinator',
    bufferMin: 15,
  },
  {
    startTime: '20:00',
    durationMin: 45,
    activity: 'Milestone tribute trivia and memory activities',
    owner: 'Entertainer',
    bufferMin: 15,
  },
  {
    startTime: '21:15',
    durationMin: 60,
    activity: 'Dinner service and celebratory toasts',
    owner: 'Caterer',
    bufferMin: 15,
  },
  {
    startTime: '22:45',
    durationMin: 20,
    activity: 'Birthday cake presentation and toast',
    owner: 'Host',
    bufferMin: 10,
  },
  {
    startTime: '23:20',
    durationMin: 30,
    activity: 'Social music lounge and guest farewells',
    owner: 'Coordinator',
    bufferMin: 0,
  },
];

export const BIRTHDAY_SURPRISE_TEMPLATE: readonly RunOfShowSlot[] = [
  {
    startTime: '16:45',
    durationMin: 45,
    activity: 'Venue dressing and audio check',
    owner: 'Venue Manager',
    bufferMin: 15,
  },
  {
    startTime: '18:00',
    durationMin: 30,
    activity: 'Secret guest arrival and coordination briefing',
    owner: 'Coordinator',
    bufferMin: 10,
  },
  {
    startTime: '18:45',
    durationMin: 15,
    activity: 'Guest quiet hiding and staging in position',
    owner: 'Host',
    bufferMin: 5,
  },
  {
    startTime: '19:10',
    durationMin: 15,
    activity: 'Guest of honor arrival and surprise reveal moment',
    owner: 'Host',
    bufferMin: 10,
  },
  {
    startTime: '19:45',
    durationMin: 45,
    activity: 'Celebration toast and cocktail hour',
    owner: 'Caterer',
    bufferMin: 15,
  },
  {
    startTime: '21:00',
    durationMin: 60,
    activity: 'Celebration dinner buffet service',
    owner: 'Caterer',
    bufferMin: 15,
  },
  {
    startTime: '22:30',
    durationMin: 25,
    activity: 'Birthday cake presentation and tribute speeches',
    owner: 'Host',
    bufferMin: 10,
  },
  {
    startTime: '23:15',
    durationMin: 30,
    activity: 'Celebration music wind-down and guest departures',
    owner: 'Coordinator',
    bufferMin: 0,
  },
];
