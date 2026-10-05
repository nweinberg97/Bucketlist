import type { AppState, Notification } from '../types';
import { SEED_PEOPLE } from './people';
import { seedGoals } from './goals';

export const STATE_VERSION = 4;

const H = 3_600_000;
const D = 24 * H;

export function createSeedState(now = Date.now()): AppState {
  const people = structuredClone(SEED_PEOPLE);
  const goals = seedGoals(now);

  // A few named recent backers so social proof has faces, not just counts.
  goals['sarah-mural'].funding!.backers = [
    { personId: 'rosa', name: 'Rosa Martínez', amount: 20, at: now - 30 * H },
    { personId: 'hana', name: 'Hana Kim', amount: 50, at: now - 9 * H },
    { personId: 'olivia', name: 'Olivia Tremblay', amount: 25, at: now - 3 * H },
  ];
  goals['sarah-mural'].funding!.baseBackers = 14;
  goals['maya-film'].funding!.backers = [
    { personId: 'ines', name: 'Inês Carvalho', amount: 40, at: now - 50 * H },
    { personId: 'sam', name: 'Sam Whitford', amount: 25, at: now - 6 * H },
  ];
  goals['maya-film'].funding!.baseBackers = 29;
  goals['priya-garden'].funding!.backers = [
    { personId: 'sam', name: 'Sam Whitford', amount: 50, at: now - 20 * H },
    { personId: 'marcus', name: 'Marcus Lee', amount: 10, at: now - 4 * H },
  ];
  goals['priya-garden'].funding!.baseBackers = 39;

  const n = (x: Omit<Notification, 'id' | 'read'> & { read?: boolean }, i: number): Notification => ({
    id: `seed-n-${i}`,
    read: false,
    ...x,
  });

  const notifications: Notification[] = [
    // Alex
    { to: 'alex', kind: 'help', actorId: 'noah', goalId: 'alex-wct', text: 'Noah offered to help with your West Coast Trail hike.', quote: "Did it twice. Happy to lend my bear canister and go through your gear list over a beer.", at: now - 5 * H },
    { to: 'alex', kind: 'completed', actorId: 'elena', goalId: 'elena-aurora', text: "Elena completed 'See the Northern Lights from the ground.'", at: now - 26 * H },
    { to: 'alex', kind: 'nearby', text: '3 new goals near Kitsilano this week.', at: now - 30 * H, read: true },
    { to: 'alex', kind: 'completed', actorId: 'sarah', goalId: 'sarah-half', text: "Sarah completed 'Run a half marathon.'", at: now - 2 * D, read: true },
    // Sarah
    { to: 'sarah', kind: 'help', actorId: 'jamie', goalId: 'sarah-surf', text: 'Jamie offered to help with your surfing goal.', quote: "I teach in Tofino most weekends — come out and I'll get you standing up.", at: now - 8 * H },
    { to: 'sarah', kind: 'fund', actorId: 'olivia', goalId: 'sarah-mural', text: 'Olivia backed your mural with $25.', at: now - 3 * H },
    { to: 'sarah', kind: 'milestone', goalId: 'sarah-mural', text: 'Your mural is more than halfway funded.', at: now - 10 * H, read: true },
    // Maya
    { to: 'maya', kind: 'fund', actorId: 'sam', goalId: 'maya-film', text: 'Sam backed your short film with $25.', at: now - 6 * H },
    { to: 'maya', kind: 'shared', actorId: 'theo', goalId: 'maya-film', text: 'Theo shared your short film with his followers.', at: now - 40 * H, read: true },
    // Businesses — local matching works for them too
    { to: 'westside', kind: 'nearby', goalId: 'sarah-mural', text: "Someone 2.6 km away needs exterior paint: 'Paint a community mural.'", at: now - 4 * H },
    { to: 'westside', kind: 'nearby', goalId: 'rosa-residency', text: 'A residency in Strathcona is looking for studio support.', at: now - 3 * D, read: true },
    { to: 'jericho', kind: 'nearby', goalId: 'olivia-sup', text: "Olivia, 3.1 km away, wants to learn to paddleboard by August.", at: now - 2 * H },
    { to: 'reel', kind: 'sponsor-accepted', actorId: 'maya', goalId: 'maya-film', text: 'Maya accepted your sponsorship offer.', at: now - 4 * D, read: true },
  ].map(n);

  return {
    version: STATE_VERSION,
    me: 'alex',
    people,
    goals,
    intros: [
      { id: 'seed-i-1', goalId: 'sarah-surf', fromId: 'jamie', mode: 'self', message: "I teach in Tofino most weekends — come out and I'll get you standing up.", at: now - 8 * H },
      { id: 'seed-i-2', goalId: 'alex-wct', fromId: 'noah', mode: 'self', message: 'Did it twice. Happy to lend my bear canister.', at: now - 5 * H },
    ],
    sponsorOffers: [
      { id: 'seed-s-1', goalId: 'maya-film', fromId: 'reel', products: 'Cinema camera package (body, 3 primes, monitor) for 4 shoot days', status: 'accepted', at: now - 4 * D },
    ],
    promotions: [
      { id: 'seed-p-1', goalId: 'maya-film', promoterId: 'theo', caption: "Maya cut half the films I've played on. Now it's her turn — help her make this one.", status: 'approved', at: now - 40 * H },
    ],
    notifications,
  };
}
