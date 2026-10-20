import type { RunOfShowSlot } from '../types/event';

export const BIRTHDAY_YOUNG_KIDS_TEMPLATE: readonly RunOfShowSlot[] = [
  {
    startTime: '10:00',
    durationMin: 30,
    activity: 'Toddler arrival and sensory play stations',
    owner: 'Host',
    bufferMin: 0,
  },
  {
    startTime: '10:30',
    durationMin: 45,
    activity: 'Interactive circle time and gentle games',
    owner: 'Entertainer',
    bufferMin: 0,
  },
  {
    startTime: '11:15',
    durationMin: 30,
    activity: 'Toddler snack and mini cake celebration',
    owner: 'Caterer',
    bufferMin: 0,
  },
  {
    startTime: '11:45',
    durationMin: 15,
    activity: 'Goodie bags and calm departure',
    owner: 'Host',
    bufferMin: 0,
  },
];

export const BIRTHDAY_KIDS_TEMPLATE: readonly RunOfShowSlot[] = [
  {
    startTime: '13:30',
    durationMin: 30,
    activity: 'Party room access and decorations setup',
    owner: 'Host',
    bufferMin: 10,
  },
  {
    startTime: '14:15',
    durationMin: 30,
    activity: 'Guest arrival and welcome craft stations',
    owner: 'Entertainer',
    bufferMin: 10,
  },
  {
    startTime: '15:00',
    durationMin: 45,
    activity: 'High-energy group party games',
    owner: 'Entertainer',
    bufferMin: 15,
  },
  {
    startTime: '16:15',
    durationMin: 35,
    activity: 'Kids party meal and snack service',
    owner: 'Caterer',
    bufferMin: 10,
  },
  {
    startTime: '17:10',
    durationMin: 20,
    activity: 'Birthday cake cutting and singing',
    owner: 'Host',
    bufferMin: 10,
  },
  {
    startTime: '17:50',
    durationMin: 40,
    activity: 'Interactive entertainer performance and magic show',
    owner: 'Entertainer',
    bufferMin: 10,
  },
  {
    startTime: '18:50',
    durationMin: 20,
    activity: 'Party favors distribution and guest farewells',
    owner: 'Host',
    bufferMin: 10,
  },
  {
    startTime: '19:30',
    durationMin: 30,
    activity: 'Room breakdown and venue handover',
    owner: 'Venue Manager',
    bufferMin: 0,
  },
];
