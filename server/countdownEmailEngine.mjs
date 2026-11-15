/**
 * Countdown Email System Engine (V16)
 * Handles all 26 countdown milestones, responsive email templates,
 * unique poster themes, personalized copy, and idempotency logic.
 */

export const COUNTDOWN_MILESTONES = [
  {
    id: '2-days',
    name: '2 Days to Go',
    targetIST: '2026-11-15T00:00:00+05:30',
    relativeLabel: '2 DAYS TO GO',
    countdownValue: '2 Days Left',
    tierRequired: 'daily',
    photoAsset: '/assets/countdown/posters/02_days_left.jpg',
    posterTheme: 'Cinematic Scrapbook Countdown',
    badgeText: 'CHAPTER 01 · 48 HOURS REMAINING',
    ribbonColor: '#b75b7e',
    subject: '🌸 Only 2 Little Days Left Until Our Ammuuu’s Birthday! 💗',
    heading: 'Two Sweet Days Before The Magic Begins!',
    message: 'Pottiiiiiiii, only two little days remain before the grandest celebration of the year! Every corner of this birthday universe is getting its final touches of sparkle and love. Get ready for your special day!',
    compliment: 'Your laugh has a way of turning the most ordinary afternoon into something unforgettable.',
    accentStyle: 'scrapbook'
  },
  {
    id: '24-hours',
    name: '24 Hours / 1 Day to Go',
    targetIST: '2026-11-16T00:00:00+05:30',
    relativeLabel: '24 HOURS / 1 DAY TO GO',
    countdownValue: '1 Day Left (24 Hours)',
    tierRequired: 'daily',
    photoAsset: '/assets/countdown/posters/24_hours_left.jpg',
    posterTheme: 'Luxurious Pink & Gold Editorial',
    badgeText: 'SPECIAL EDITORIAL · 24 HOURS TO GO',
    ribbonColor: '#9e3f65',
    subject: '✨ Exactly 24 Hours To Go, Ammuuuu! 💗',
    heading: 'One Whole Day! The Birthday Universe Is Almost Ready!',
    message: 'One single day left, Pottiiiiiiii! The stars are aligned, the butterflies have packed their little love letters, and tomorrow belongs entirely to you. You are about to enter a world made purely for you.',
    compliment: 'No one in this world can replicate your particular brand of adorable chaos.',
    accentStyle: 'editorial'
  },
  {
    id: '12-hours',
    name: '12 Hours to Go',
    targetIST: '2026-11-16T12:00:00+05:30',
    relativeLabel: '12 HOURS TO GO',
    countdownValue: '12 Hours Left',
    tierRequired: 'major',
    photoAsset: '/assets/countdown/posters/12_hours_left.jpg',
    posterTheme: 'Midnight Moonlight & Butterflies',
    badgeText: 'HALFWAY THROUGH THE FINAL DAY · 12 HOURS',
    ribbonColor: '#7a2e50',
    subject: '🌙 Only 12 Hours Until Our Ammuuu’s Special Day! 💗',
    heading: 'The World’s Loveliest Buddieeeee Is Almost Having Her Birthday!',
    message: 'Pottiiiiiiii, just 12 little hours left before the world celebrates someone as wonderfully cute and special as you. Another year of your smiles, your chaos, your little reactions and all the beautiful things that make you, you!',
    compliment: 'Your tiny reactions are genuinely cuter than a thousand butterflies.',
    accentStyle: 'moonlight'
  },
  {
    id: '10-hours',
    name: '10 Hours to Go',
    targetIST: '2026-11-16T14:00:00+05:30',
    relativeLabel: '10 HOURS TO GO',
    countdownValue: '10 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/10_hours_left.jpg',
    posterTheme: 'Vintage Love-Letter Themed Poster',
    badgeText: 'DOUBLE DIGIT COUNTDOWN · 10 HOURS',
    ribbonColor: '#8f335b',
    subject: '💌 10 Hours Left: A Sweet Note Floating Toward You...',
    heading: 'Ten Hours Until Ammu’s Universe Awakens!',
    message: 'The clock is ticking closer, Ammuuuu! Ten tiny hours until midnight. The miniature envelopes are sealed with wax hearts and waiting to fly your way.',
    compliment: 'Some people become memories. You make every memory better.',
    accentStyle: 'vintage'
  },
  {
    id: '9-hours',
    name: '9 Hours to Go',
    targetIST: '2026-11-16T15:00:00+05:30',
    relativeLabel: '9 HOURS TO GO',
    countdownValue: '9 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/09_hours_left.jpg',
    posterTheme: 'Cinematic Film-Strip Countdown',
    badgeText: 'SINGLE DIGITS · 9 HOURS TO GO',
    ribbonColor: '#8a2b53',
    subject: '🎬 9 Hours To Go! Single Digits Remain, Pottiiiiiiii!',
    heading: 'Entering The Single Digits!',
    message: 'We are officially in single digits! Nine hours until your birthday arrives. Every frame of our little cinema archive is lined up to celebrate our favourite superstar.',
    compliment: 'You’re my favourite partner for movies, madness and midnight conversations.',
    accentStyle: 'filmstrip'
  },
  {
    id: '8-hours',
    name: '8 Hours to Go',
    targetIST: '2026-11-16T16:00:00+05:30',
    relativeLabel: '8 HOURS TO GO',
    countdownValue: '8 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/08_hours_left.jpg',
    posterTheme: 'Floral Secret-Garden Countdown',
    badgeText: 'TEA TIME IN THE GARDEN · 8 HOURS',
    ribbonColor: '#9b3c64',
    subject: '🌸 8 Hours To Go: Flowers Are Blooming In Your Honor!',
    heading: 'Eight Little Hours In The Secret Garden!',
    message: 'The roses and cherry blossoms are getting ready to shower you with petals. Just 8 hours before midnight, Pottiiiiiiii!',
    compliment: 'You deserve all the softest, happiest, and warmest little moments.',
    accentStyle: 'garden'
  },
  {
    id: '7-hours',
    name: '7 Hours to Go',
    targetIST: '2026-11-16T17:00:00+05:30',
    relativeLabel: '7 HOURS TO GO',
    countdownValue: '7 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/07_hours_left.jpg',
    posterTheme: 'Luxury Magazine-Cover Countdown',
    badgeText: 'THE BIRTHDAY EDITORIAL · 7 HOURS',
    ribbonColor: '#782649',
    subject: '📖 7 Hours Left! The Birthday Magazine Front Cover Is Yours!',
    heading: 'Seven Hours Until The Headline Unfolds!',
    message: 'Seven hours left before the birthday girl takes center stage on the world’s most exclusive magazine cover: The Ammu Times!',
    compliment: 'Nobody can copy your particular brand of cuteness and elegance.',
    accentStyle: 'magazine'
  },
  {
    id: '6-hours',
    name: '6 Hours to Go',
    targetIST: '2026-11-16T18:00:00+05:30',
    relativeLabel: '6 HOURS TO GO',
    countdownValue: '6 Hours Left',
    tierRequired: 'major',
    photoAsset: '/assets/countdown/posters/06_hours_left.jpg',
    posterTheme: 'Butterfly Fairyland Countdown',
    badgeText: 'EVENING GLOW · 6 HOURS REMAINING',
    ribbonColor: '#8c2d56',
    subject: '🦋 6 Hours To Go! The Butterflies Are Getting Restless!',
    heading: 'Half A Dozen Hours Until Midnight Magic!',
    message: 'Just six hours left! The evening twilight is settling in, and a flurry of blush-pink and pearl-white butterflies are preparing for their midnight flight.',
    compliment: 'If smiles were stars, your sky would never get dark for even a second.',
    accentStyle: 'fairyland'
  },
  {
    id: '5-hours',
    name: '5 Hours to Go',
    targetIST: '2026-11-16T19:00:00+05:30',
    relativeLabel: '5 HOURS TO GO',
    countdownValue: '5 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/05_hours_left.jpg',
    posterTheme: 'Rose-Gold Royal Birthday Countdown',
    badgeText: 'ROYAL COUNTDOWN · 5 HOURS TO GO',
    ribbonColor: '#96375f',
    subject: '👑 5 Hours Left: The Royal Birthday Stage Is Setting!',
    heading: 'Five Hours Until The Queen Of Chaos Celebrates!',
    message: 'Just five hours until the world’s cutest birthday girl gets her grand surprise! Crown polished, sparkles ready, stage set.',
    compliment: 'You’re mine, only mine... my favourite little chaos! 💗',
    accentStyle: 'royal'
  },
  {
    id: '4-hours',
    name: '4 Hours to Go',
    targetIST: '2026-11-16T20:00:00+05:30',
    relativeLabel: '4 HOURS TO GO',
    countdownValue: '4 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/04_hours_left.jpg',
    posterTheme: 'Warm Polaroid Memories',
    badgeText: 'POLAROID ARCHIVE · 4 HOURS',
    ribbonColor: '#6f2142',
    subject: '📷 4 Hours Left: Flipping Through Our Loveliest Memories...',
    heading: 'Four Hours Until The New Chapter Begins!',
    message: 'Looking through all our candid snapshots, silly arguments, and warm laughs. Four short hours until your new age officially kicks off!',
    compliment: 'Even our silly fights somehow become the best stories we tell.',
    accentStyle: 'polaroid'
  },
  {
    id: '3-hours',
    name: '3 Hours to Go',
    targetIST: '2026-11-16T21:00:00+05:30',
    relativeLabel: '3 HOURS TO GO',
    countdownValue: '3 Hours Left',
    tierRequired: 'major',
    photoAsset: '/assets/countdown/posters/03_hours_left.jpg',
    posterTheme: 'Starry Birthday Universe',
    badgeText: 'THE NIGHT AWAKENS · 3 HOURS REMAINING',
    ribbonColor: '#5c1b37',
    subject: '🌌 3 Hours Left: The Stars Are Lining Up For You, Ammuuuu!',
    heading: 'Three Hours Until The Starry Universe Opens!',
    message: 'Three little hours, Pottiiiiiiii! Look up at the night sky. The stars in your midnight universe are twinkling with secret messages.',
    compliment: 'Your smile deserves its very own little constellation.',
    accentStyle: 'starry'
  },
  {
    id: '2-hours',
    name: '2 Hours to Go',
    targetIST: '2026-11-16T22:00:00+05:30',
    relativeLabel: '2 HOURS TO GO',
    countdownValue: '2 Hours Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/02_hours_left.jpg',
    posterTheme: 'Glowing Birthday Stage',
    badgeText: 'THE SPOTLIGHTS ON · 2 HOURS',
    ribbonColor: '#752447',
    subject: '🕯️ 2 Hours Left: The Candles Are Waiting To Be Lit!',
    heading: 'Two Hours Until Midnight Magic Strikes!',
    message: 'Only two hours left before November 17 arrives! The 3D cake studio is warmed up and waiting for you to make your first wish.',
    compliment: 'You are special without even trying to be.',
    accentStyle: 'stage'
  },
  {
    id: '1-hour',
    name: '1 Hour to Go',
    targetIST: '2026-11-16T23:00:00+05:30',
    relativeLabel: '1 HOUR TO GO',
    countdownValue: '1 Hour Left (60 Minutes)',
    tierRequired: 'major',
    photoAsset: '/assets/countdown/posters/01_hour_left.jpg',
    posterTheme: 'Grand Red Curtain & Spotlight',
    badgeText: 'FINAL HOUR · 60 MINUTES TO MIDNIGHT',
    ribbonColor: '#882b52',
    subject: '🎭 ONE HOUR LEFT! The Red Velvet Curtains Are Trembling! 💗',
    heading: 'The Stage Is Ready, Ammuuuu!',
    message: 'The final hour has arrived! The stage is ready, the butterflies are waiting on the curtain ropes, and your birthday universe is about to awaken!',
    compliment: 'You’re one of the loveliest people I have ever known, Pottiiiiiiii.',
    accentStyle: 'curtain'
  },
  {
    id: '30-minutes',
    name: '30 Minutes to Go',
    targetIST: '2026-11-16T23:30:00+05:30',
    relativeLabel: '30 MINUTES TO GO',
    countdownValue: '30 Minutes Left',
    tierRequired: 'major',
    photoAsset: '/assets/countdown/posters/30_minutes_left.jpg',
    posterTheme: 'Golden Clock & Floating Flowers',
    badgeText: 'HALF AN HOUR · 30 MINUTES',
    ribbonColor: '#94355d',
    subject: '⏳ 30 Minutes To Go! Golden Minutes Slipping By...',
    heading: 'Half An Hour Before Your Birthday World Unlocks!',
    message: 'Thirty minutes! The golden clock is winding down its final turn. Get ready to step into your celebration world!',
    compliment: 'Stay the same wonderfully chaotic, radiant Ammuuuu.',
    accentStyle: 'goldenclock'
  },
  {
    id: '20-minutes',
    name: '20 Minutes to Go',
    targetIST: '2026-11-16T23:40:00+05:30',
    relativeLabel: '20 MINUTES TO GO',
    countdownValue: '20 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/20_minutes_left.jpg',
    posterTheme: 'Moonlit Countdown',
    badgeText: 'MOONLIGHT WATCH · 20 MINUTES',
    ribbonColor: '#6d1e40',
    subject: '🌙 20 Minutes Left: The Moonlit Path Is Open!',
    heading: 'Twenty Minutes Remaining!',
    message: 'Just twenty little minutes! The music is cueing up and the lights are dimming for your grand entrance.',
    compliment: 'Our friendship has more beautiful chapters waiting to be written.',
    accentStyle: 'moonlight'
  },
  {
    id: '10-minutes',
    name: '10 Minutes to Go',
    targetIST: '2026-11-16T23:50:00+05:30',
    relativeLabel: '10 MINUTES TO GO',
    countdownValue: '10 Minutes Left',
    tierRequired: 'major',
    photoAsset: '/assets/countdown/posters/10_minutes_left.jpg',
    posterTheme: 'Dramatic Cinematic Final Reveal',
    badgeText: 'FINAL TEN MINUTES · T-MINUS 10',
    ribbonColor: '#a13665',
    subject: '🔥 TEN MINUTES LEFT! The Final Reveal Begins! 💗',
    heading: 'Ten Tiny Minutes Before Your Special World Opens!',
    message: 'Ten minutes! Ammuuu, your heartbeat should be skipping with excitement. We are about to enter November 17!',
    compliment: 'The world is extraordinarily lucky to have someone like you in it.',
    accentStyle: 'dramatic'
  },
  {
    id: '9-minutes',
    name: '9 Minutes to Go',
    targetIST: '2026-11-16T23:51:00+05:30',
    relativeLabel: '9 MINUTES TO GO',
    countdownValue: '9 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/09_minutes_left.jpg',
    posterTheme: 'Velvet Rose Countdown',
    badgeText: 'COUNTDOWN CLIMAX · 9 MINUTES',
    ribbonColor: '#b03b6e',
    subject: '🌹 9 Minutes Left: Velvet Rose Countdown!',
    heading: 'Nine Minutes Left!',
    message: 'Nine minutes left! The silk ribbon is beginning to untie around your birthday gate.',
    compliment: 'No one can replace you in our little collection of memories.',
    accentStyle: 'rose'
  },
  {
    id: '8-minutes',
    name: '8 Minutes to Go',
    targetIST: '2026-11-16T23:52:00+05:30',
    relativeLabel: '8 MINUTES TO GO',
    countdownValue: '8 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/08_minutes_left.jpg',
    posterTheme: 'Golden Hour Spark',
    badgeText: 'COUNTDOWN CLIMAX · 8 MINUTES',
    ribbonColor: '#b84275',
    subject: '⚡ 8 Minutes Left: Golden Sparks In The Air!',
    heading: 'Eight Minutes Left!',
    message: 'Eight minutes! Every single candle is waiting for your wish, Pottiiiiiiii.',
    compliment: 'Your presence lights up rooms effortlessly.',
    accentStyle: 'spark'
  },
  {
    id: '7-minutes',
    name: '7 Minutes to Go',
    targetIST: '2026-11-16T23:53:00+05:30',
    relativeLabel: '7 MINUTES TO GO',
    countdownValue: '7 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/07_minutes_left.jpg',
    posterTheme: 'Champagne Sparkle',
    badgeText: 'COUNTDOWN CLIMAX · 7 MINUTES',
    ribbonColor: '#962b5a',
    subject: '🥂 7 Minutes Left: Pure Excitement!',
    heading: 'Seven Minutes Left!',
    message: 'Seven minutes until midnight strikes! The entire website is holding its breath.',
    compliment: 'You bring unmatched energy to everything you touch.',
    accentStyle: 'champagne'
  },
  {
    id: '6-minutes',
    name: '6 Minutes to Go',
    targetIST: '2026-11-16T23:54:00+05:30',
    relativeLabel: '6 MINUTES TO GO',
    countdownValue: '6 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/06_minutes_left.jpg',
    posterTheme: 'Starlight Shimmer',
    badgeText: 'COUNTDOWN CLIMAX · 6 MINUTES',
    ribbonColor: '#85214c',
    subject: '💫 6 Minutes Left: Starlight Gathering!',
    heading: 'Six Minutes Left!',
    message: 'Six minutes remaining! The stars are forming the letters of your name across the sky.',
    compliment: 'You make life so much more fun just by being yourself.',
    accentStyle: 'starlight'
  },
  {
    id: '5-minutes',
    name: '5 Minutes to Go',
    targetIST: '2026-11-16T23:55:00+05:30',
    relativeLabel: '5 MINUTES TO GO',
    countdownValue: '5 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/05_minutes_left.jpg',
    posterTheme: 'Rose Garden Bloom',
    badgeText: 'FINAL FIVE MINUTES · T-MINUS 5',
    ribbonColor: '#a63365',
    subject: '🌸 5 MINUTES TO MIDNIGHT! Can You Feel The Excitement? 💗',
    heading: 'Five Minutes Left Before Birthday Midnight!',
    message: 'Five minutes, Pottiiiiiiii! Open your hands, the first petals are beginning to float down.',
    compliment: 'You deserve the happiest year of your life ahead.',
    accentStyle: 'bloom'
  },
  {
    id: '4-minutes',
    name: '4 Minutes to Go',
    targetIST: '2026-11-16T23:56:00+05:30',
    relativeLabel: '4 MINUTES TO GO',
    countdownValue: '4 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/04_minutes_left.jpg',
    posterTheme: 'Butterfly Flight',
    badgeText: 'FINAL FOUR MINUTES · T-MINUS 4',
    ribbonColor: '#b43b70',
    subject: '🦋 4 Minutes Left: The Butterflies Take Flight!',
    heading: 'Four Minutes Left!',
    message: 'Four minutes! The butterflies carrying your secret letters have lifted into the air.',
    compliment: 'Every memory we made this year was better because you were in it.',
    accentStyle: 'flight'
  },
  {
    id: '3-minutes',
    name: '3 Minutes to Go',
    targetIST: '2026-11-16T23:57:00+05:30',
    relativeLabel: '3 MINUTES TO GO',
    countdownValue: '3 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/03_minutes_left.jpg',
    posterTheme: 'Heartbeat Cadence',
    badgeText: 'FINAL THREE MINUTES · T-MINUS 3',
    ribbonColor: '#c0447a',
    subject: '💓 3 Minutes Left: The Final Countdown!',
    heading: 'Three Minutes Left!',
    message: 'Three minutes! Almost there, Ammuuuu. Almost there!',
    compliment: 'You’re irreplaceable, today and always.',
    accentStyle: 'heartbeat'
  },
  {
    id: '2-minutes',
    name: '2 Minutes to Go',
    targetIST: '2026-11-16T23:58:00+05:30',
    relativeLabel: '2 MINUTES TO GO',
    countdownValue: '2 Minutes Left',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/02_minutes_left.jpg',
    posterTheme: 'Grand Overture',
    badgeText: 'FINAL TWO MINUTES · T-MINUS 2',
    ribbonColor: '#962b5a',
    subject: '🎉 2 MINUTES LEFT! Hold Your Breath, Pottiiiiiiii!',
    heading: 'Two Minutes Left!',
    message: 'Two tiny minutes before the clock strikes twelve! Ready your biggest smile!',
    compliment: 'You are loved so much more than you know.',
    accentStyle: 'overture'
  },
  {
    id: '1-minute',
    name: '1 Minute to Go',
    targetIST: '2026-11-16T23:59:00+05:30',
    relativeLabel: '1 MINUTE TO GO',
    countdownValue: '1 Minute Left (60 Seconds)',
    tierRequired: 'all_hourly_and_minute',
    photoAsset: '/assets/countdown/posters/01_minute_left.jpg',
    posterTheme: 'The Final Breath Before Magic',
    badgeText: 'FINAL 60 SECONDS · THE GATE IS ABOUT TO UNLOCK',
    ribbonColor: '#781d45',
    subject: '⏳ ONE LAST MINUTE, AMMUUUUUU! YOUR UNIVERSE IS OPENING! 💗',
    heading: 'One Last Little Minute, Ammuuuuu!',
    message: 'One last little minute, Pottiiiiiiii! The velvet curtains are parting. November 17 is here! Your birthday universe is officially about to open!',
    compliment: 'Happy Birthday in advance by 60 seconds to my favourite person ever! 💗',
    accentStyle: 'final'
  },
  {
    id: '0-midnight',
    name: 'HAPPY BIRTHDAY — UNLOCKED!',
    targetIST: '2026-11-17T00:00:00+05:30',
    relativeLabel: 'HAPPY BIRTHDAY — UNLOCKED',
    countdownValue: 'HAPPY BIRTHDAY! (NOW UNLOCKED)',
    tierRequired: 'daily',
    isCritical: true,
    photoAsset: '/assets/countdown/posters/birthday_unlock_now.jpg',
    posterTheme: 'Grand Midnight Celebration & Universe Unlocked',
    badgeText: 'THE UNIVERSE IS OFFICIALLY OPEN · 17 NOVEMBER',
    ribbonColor: '#8a234f',
    subject: '🎂 HAPPIEST BIRTHDAYYYYY AMMUUUUUUU! YOUR LITTLE UNIVERSE IS OPEN! 🎂💗',
    heading: 'The World’s Loveliest Birthday Girl Finally Has Her Day!',
    message: 'Pottiiiiiiii, it’s finally your birthdayyyyy! Every little flower, memory, butterfly, letter, and surprise in this tiny universe was put together with love. Your birthday world is officially waiting for you. Walk in, cut your cake, open your surprises, and celebrate being the most wonderful human being!',
    compliment: 'Happy Birthday, Ammuuu! Today the entire universe celebrates you, and so do I with all my heart.',
    accentStyle: 'unlocked'
  }
];

export function getJobIdempotencyKey(milestoneId, recipientEmail) {
  return `countdown:${milestoneId}:${String(recipientEmail).trim().toLowerCase()}`;
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render responsive HTML email for a given milestone
 */
export function renderEmailHtml({
  milestone,
  recipientEmail = '',
  baseUrl = 'https://ammu-birthday.vercel.app',
  unsubscribeToken = '',
  customMessage = null,
  customCompliment = null
}) {
  const safeBaseUrl = (baseUrl || 'https://ammu-birthday.vercel.app').replace(/\/$/, '');
  const messageText = customMessage || milestone.message;
  const complimentText = customCompliment || milestone.compliment;
  const photoUrl = milestone.photoAsset.startsWith('http')
    ? milestone.photoAsset
    : `${safeBaseUrl}${milestone.photoAsset}`;
  const actionUrl = `${safeBaseUrl}/`;
  const unsubUrl = `${safeBaseUrl}/api/countdown/unsubscribe?token=${encodeURIComponent(unsubscribeToken || 'demo')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(milestone.subject)}</title>
  <style>
    body { margin:0; padding:0; background-color:#fcf3f6; font-family:'Georgia',serif; color:#4a1e31; }
    table { border-collapse:collapse; }
    .email-container { max-width:620px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #eed0dc; box-shadow:0 12px 36px rgba(138,40,78,0.08); }
    .header-bar { background:linear-gradient(135deg, #781d45, #aa3363); padding:26px 30px; text-align:center; color:#ffffff; }
    .badge { display:inline-block; font-size:11px; letter-spacing:2px; font-weight:bold; background:rgba(255,255,255,0.2); padding:5px 14px; border-radius:12px; margin-bottom:8px; text-transform:uppercase; }
    .countdown-headline { font-size:28px; line-height:1.25; margin:6px 0; font-family:'Georgia',serif; }
    .poster-card { background:#fff9fa; border:1px solid #f1d7e2; border-radius:14px; margin:24px 30px; padding:20px; text-align:center; }
    .photo-frame { width:100%; max-width:440px; height:auto; border-radius:12px; border:4px solid #ffffff; box-shadow:0 8px 24px rgba(120,29,69,0.12); margin-bottom:16px; }
    .poster-theme-title { font-size:12px; letter-spacing:2px; color:#9c3861; text-transform:uppercase; font-weight:bold; margin-bottom:6px; }
    .content-body { padding:10px 34px 24px; font-size:16px; line-height:1.8; color:#42172a; }
    .compliment-box { background:#fbf0f4; border-left:4px solid #b3396a; padding:16px 20px; border-radius:0 12px 12px 0; margin:22px 0; font-style:italic; color:#6b2043; font-size:15px; }
    .btn-visit { display:inline-block; background:linear-gradient(135deg, #a12d5d, #72163e); color:#ffffff !important; text-decoration:none; padding:14px 34px; border-radius:30px; font-weight:bold; font-size:16px; letter-spacing:1px; box-shadow:0 6px 18px rgba(114,22,62,0.25); margin:18px 0 10px; }
    .signature-box { padding:20px 34px 30px; text-align:center; border-top:1px dashed #efd3df; font-size:15px; color:#7d2d53; }
    .footer-note { background:#fcf3f6; padding:18px 20px; text-align:center; font-size:12px; color:#9e6a81; }
    .footer-note a { color:#82264e; text-decoration:underline; }
  </style>
</head>
<body>
  <div style="padding:24px 10px;">
    <div class="email-container">
      <!-- HEADER -->
      <div class="header-bar">
        <div class="badge">${escapeHtml(milestone.badgeText)}</div>
        <div class="countdown-headline">${escapeHtml(milestone.relativeLabel)}</div>
      </div>

      <!-- POSTER COMPOSITION -->
      <div class="poster-card">
        <div class="poster-theme-title">${escapeHtml(milestone.posterTheme)}</div>
        <img src="${escapeHtml(photoUrl)}" alt="Ammu Special Memory" class="photo-frame" />
        <div style="font-size:13px; color:#853054; font-weight:bold;">${escapeHtml(milestone.countdownValue)}</div>
      </div>

      <!-- MAIN MESSAGE -->
      <div class="content-body">
        <h2 style="font-size:22px; color:#681a3d; margin-top:0;">${escapeHtml(milestone.heading)}</h2>
        <p>${escapeHtml(messageText)}</p>

        <div class="compliment-box">
          “${escapeHtml(complimentText)}”
        </div>

        <div style="text-align:center;">
          <a href="${escapeHtml(actionUrl)}" class="btn-visit" target="_blank">
            ${milestone.id === '0-midnight' ? 'OPEN YOUR BIRTHDAY UNIVERSE 💗' : 'VISIT YOUR BIRTHDAY UNIVERSE 💗'}
          </a>
        </div>
      </div>

      <!-- SIGNATURE -->
      <div class="signature-box">
        <p style="margin:0 0 4px; font-weight:bold;">With all my heart,</p>
        <p style="font-size:20px; margin:0; color:#8a234f; font-family:'Georgia',serif;">Ashuuuuuuuuuuu 💗</p>
      </div>

      <!-- FOOTER -->
      <div class="footer-note">
        <p style="margin:0 0 6px;">You are receiving this countdown love letter because you opted in to Ammu's Birthday Universe.</p>
        <p style="margin:0;"><a href="${escapeHtml(unsubUrl)}">Update your preferences or unsubscribe</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
