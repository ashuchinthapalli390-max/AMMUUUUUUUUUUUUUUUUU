import fs from 'node:fs';
import path from 'node:path';

const sitePath = path.resolve('data/site.json');
const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));

site.flyingNotes = [
  { id: 'note-1', message: "You're mine, only mine... my favourite little chaos! 💗", butterflyColor: 'blush-pink', theme: 'heart-seal', probability: 25, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-2', message: "No one can replace you in our little collection of memories.", butterflyColor: 'lavender', theme: 'gold-ribbon', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-3', message: "You're one of the loveliest people I've ever known, Pottiiiiiiii.", butterflyColor: 'rose-gold', theme: 'flower-sticker', probability: 25, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-4', message: "Your smile deserves its own little universe.", butterflyColor: 'pearl-white', theme: 'heart-seal', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-5', message: "Some people become memories. You make every memory better.", butterflyColor: 'soft-blue', theme: 'gold-ribbon', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-6', message: "Your tiny reactions are cuter than a thousand butterflies.", butterflyColor: 'blush-pink', theme: 'flower-sticker', probability: 25, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-7', message: "Even our silly fights somehow become good stories.", butterflyColor: 'lavender', theme: 'heart-seal', probability: 15, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-8', message: "You're my favourite partner for movies, madness and midnight conversations.", butterflyColor: 'rose-gold', theme: 'gold-ribbon', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-9', message: "Stay the same wonderfully chaotic Ammuuuu.", butterflyColor: 'pearl-white', theme: 'flower-sticker', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-10', message: "The world is lucky to have someone like you.", butterflyColor: 'soft-blue', theme: 'heart-seal', probability: 25, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-11', message: "You deserve all the softest, happiest little moments.", butterflyColor: 'blush-pink', theme: 'gold-ribbon', probability: 25, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-12', message: "If smiles were stars, your sky would never get dark.", butterflyColor: 'lavender', theme: 'flower-sticker', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-13', message: "Nobody can copy your particular brand of cuteness.", butterflyColor: 'rose-gold', theme: 'heart-seal', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-14', message: "Our friendship has more chapters waiting to be written.", butterflyColor: 'pearl-white', theme: 'gold-ribbon', probability: 20, sceneVisibility: 'all', isEnabled: true },
  { id: 'note-15', message: "You are special without even trying to be.", butterflyColor: 'soft-blue', theme: 'flower-sticker', probability: 25, sceneVisibility: 'all', isEnabled: true }
];

site.hiddenCompliments = [
  { id: 'c-cur-1', category: 'cursor', text: "You found a little secret heartbeat! Pottiiii, you brighten every room. 💗" },
  { id: 'c-cur-2', category: 'cursor', text: "Tiny cursor kiss! Keep smiling, Ammuuuu." },
  { id: 'c-scrap-1', category: 'scrapbook', text: "Little folded scrap: 'Always choose the dessert first, Pottiii!' 🍰" },
  { id: 'c-scrap-2', category: 'scrapbook', text: "Handwritten scrap: 'Best adventure partner since day one.'" },
  { id: 'c-star-1', category: 'stars', text: "Star whisper: 'When you laugh, the midnight stars shine brighter.'" },
  { id: 'c-star-2', category: 'stars', text: "Star whisper: 'A wish made on this star belongs entirely to Ammu.'" },
  { id: 'c-flw-1', category: 'flowers', text: "A glowing rose blooms: 'May every year bring you gentleness, joy and peace.'" },
  { id: 'c-flw-2', category: 'flowers', text: "A wild daisy whispers: 'Your heart is so genuinely pure and kind.'" },
  { id: 'c-mag-1', category: 'magazine', text: "Secret ribbon note: 'Front page news: Ammu is officially the birthday star of the century!'" },
  { id: 'c-mag-2', category: 'magazine', text: "Bookmark whisper: 'Editor’s pick: Cutest smile in the galaxy.'" },
  { id: 'c-gift-1', category: 'gift', text: "Membership perk unlocked: Lifetime smiles and infinite support from Ashu guaranteed!" },
  { id: 'c-gift-2', category: 'gift', text: "A lifetime gift for the sweetest buddy in the universe. Never forget how loved you are!" }
];

fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), 'utf8');
console.log('Successfully seeded site.json with flyingNotes and hiddenCompliments.');
