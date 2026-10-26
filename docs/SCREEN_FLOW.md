# COMPLETE WEBSITE SCREEN FLOW

Desktop design size 1440 × 900, with secondary responsive mobile layout. One continuous scroll journey with anchored page sections and interaction popups, not 94 independent URLs. Never publish unreviewed AI facial representations. Display sender label **From Ashu** and friend name **Ammuuuuuuuuuuuuuuuuu**.

| Order | Page / Interaction Screen | Exact labels and flow |
|---:|---|---|
| 01 | Birthday countdown | Days, Hours, Minutes, Seconds, Private Preview, Open My Surprise (after 17-11 00:00 IST) |
| 02 | Private preview | Private Preview → Enter code → Unlock Preview |
| 03 | Cinematic gift reveal | One little present for Ammuuuu → Untie Your Ribbon |
| 04 | Pink curtains | Curtains slide apart, petals appear, hero revealed |
| 05 | Hero | Happiest Birthday Ammuuuu → Start Our Journey / Cut Your Cake |
| 06 | Chapter 1 | CodeXa Girls → Next chapter |
| 07 | Chapter 2 | Marvel, K-dramas, Anime → Next chapter |
| 08 | Chapter 3 | Discord games and movies → Next chapter |
| 09 | Chapter 4 | DMs, reels and midnight conversations → Next |
| 10 | Chapter 5 | Deepak / Gayu Solo Leveling rewatch memory → Next |
| 11 | Chapter 6 | Tony Stark / Iron Man MCU recap → Next |
| 12 | Chapter 7 | 9:30 PM Spider-Man ticket drama → Next |
| 13 | Chapter 8 | Irumudi: first movie → Next |
| 14 | Chapter 9 | Paradise, Doraemon, 418 and Ranabali plan → Next |
| 15 | Chapter 10 | NRT pani puri, waffles, Domino's → Next |
| 16 | Chapter 11 | Seahorse sticker, hand signs, laptop and cute things → Next |
| 17 | Chapter 12 | Fights, patchups and still us → Next chapter |
| 18 | Polaroid gallery | All / Aesthetic / Candid / Cute / Traditional / Memories → Show More |
| 19 | Photo lightbox | Previous / Next / Close → Caption |
| 20 | Editorial magazine | The Ammuuu Issue → Turn the Page |
| 21 | Letters library | Choose a letter → Open → Read Next Letter |
| 22 | Open When letters | Sad / Smile / Miss Our Chats / Future You |
| 23 | Ashu's birthday wishes | Three wishes displayed on large cards |
| 24 | Ammu's wishes form | 3 wish inputs; what Ashu should change; how he can improve; Send / Maybe Later |
| 25 | Wishes confirmation | Saved and optionally emailed (depending on setup) |
| 26 | Cake style | Pink Dream / Chocolate / Cream → Make A Wish |
| 27 | Cake wish | Optional private wish → I've Made My Wish |
| 28 | Cake candle lighting | Light Candles → flames flicker |
| 29 | Cake candle blowing | Tap to Blow / Use Microphone → candles go out |
| 30 | Cake cutting angle | Pointer drag sets freely chosen radial direction |
| 31 | Cake first slice | First drag cuts one line, second completes wedge, inner sponge exposed |
| 32 | Cake plate serving | First piece to Ammu / Ashu / Both / Save For Later |
| 33 | Cake celebration | Confetti → Cut It Again / Open My Gifts |
| 34 | Three gifts intro | Open Gift One / Open Gift Two / Start Shopping |
| 35 | Gift One luxury boxes | iPhone 18 Duo / Iron Man Suit / Villa / BMWs → Claim |
| 36 | Gift One funny reveal | Reality Check popup (not actual gifts), Next Gift / Real Gift |
| 37 | Gift Two memberships | Accept Lifetime Support / Accept My Chaos / Claim Vouchers |
| 38 | Gift Two coupon | Claim POTTI1703 / Copy Code → Go Shopping |
| 39 | Gift Three marketplace | Search / categories / sort / Add To Cart |
| 40 | Shopping guide 1 | Earrings → Select OR Skip → Next |
| 41 | Shopping guide 2 | Necklace → Select OR Skip → Next |
| 42 | Shopping guide 3 | Bracelet → Select OR Skip → Next |
| 43 | Shopping guide 4 | Bangles → Select OR Skip → Next |
| 44 | Shopping guide 5 | Ring → Select OR Skip → Next |
| 45 | Shopping guide 6 | Vaddanam → Select OR Skip → Next |
| 46 | Shopping guide 7 | Dress → Select OR Skip → Next |
| 47 | Shopping guide 8 | Pants → Select OR Skip → Next |
| 48 | Shopping guide 9 | Slippers → Select OR Skip → Next |
| 49 | Shopping guide 10 | Shoes → Select OR Skip → Next |
| 50 | Shopping guide 11 | Toys / Marvel collectibles → Select OR Skip → Next |
| 51 | Shopping guide 12 | Keychains → Select OR Skip → Finish & View Cart |
| 52 | Cart view | Add / Remove / increase-decrease quantity / secret coupon |
| 53 | Coupon apply | POTTI1703 → all symbolic prices display 0.00 |
| 54 | Confirm request | Name / optional email → Place My Gift Request |
| 55 | Order created | Unique request number; save; email queue; Track My Gifts |
| 56 | Status tracking | Placed → Processing → Shipped → Out for Delivery → Awaiting Verification |
| 57 | Recipient verification | Send OTP to Ammu's configured email only → Verify |
| 58 | Delivered | Valid OTP → Complete; Ashu receives notification if configured |
| 59 | Cinematic movie ticket archive | Irumudi / Paradise / Doraemon / 418 / Ranabali / Spider-Man Plans |
| 60 | Midnight universe | Touch stars to reveal night-chat memories |
| 61 | Bestie quiz | Five personal questions → score and replay |
| 62 | Memory match | Flip cards → match pairs → win |
| 63 | Catch hearts | Collect all 18 hearts → celebrate |
| 64 | Birthday certificate | Generate and download a personalised certificate PNG |
| 65 | Video montage | Play optional locally supplied personal video |
| 66 | 100 reasons jar | Pick A Note, repeated |
| 67 | Virtual hugs | Tap for a Hug, repeat |
| 68 | Silly actions | Annoy Ashu / Seahorse Sticker popup |
| 69 | Final birthday letter | After Everything, Still Us → Back to Home / Open Gifts Again |

## Admin screens (separate `/admin` path)

1. First-run admin login: random password generated on server and printed only to terminal.
2. Overview: counts, birthday release and preview controls.
3. Journey editor: add/edit/remove chapters, photos and descriptions.
4. Gallery manager: upload, caption, categorize, hide/unhide photos.
5. Product manager: add products; assign one of 12 shopping stages; symbolic prices, optional external retailer link.
6. Gift editor: edit pranks, vouchers, coupon, membership copy.
7. Letters editor: add/edit/delete personal messages and Ashu's three displayed wishes.
8. Wishes inbox: view Ammu's submitted wishes and improvement suggestions privately.
9. Order manager: processing, shipped, out for delivery; only recipient's OTP can mark delivered.
10. Email log: sent, failed or not configured with exact timestamps.
11. Website settings: birthday date, title, name, hero image, code.
12. Movies, stars and reasons editor: maintain interactive extra memories.
13. Security setup: private config file; never show secret credentials to site visitors.

## Backend contract

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/bootstrap` | Current server time, birthday lock and editable public content only when unlocked |
| POST | `/api/preview` | Private preview code; sets HttpOnly cookie |
| POST | `/api/wishes` | Privately save wish form and notify Ashu if configured |
| POST | `/api/membership` | Save voucher claim |
| POST | `/api/orders` | Save personal gift request, validate coupon server-side |
| GET | `/api/orders/:id?token=...` | Authorized order tracking via high-entropy token |
| POST | `/api/orders/:id/otp/request` | Send OTP to fixed configured Ammu email |
| POST | `/api/orders/:id/otp/verify` | Verify OTP to complete delivery |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/data` | Admin-only site data, wishes, orders and notification log |
| PUT | `/api/admin/site` | Admin-only edits to site content |
| POST | `/api/admin/upload` | Admin-only compressed JPEG/PNG upload |
| PUT | `/api/admin/orders/:id` | Admin order status change, excluding delivered |

Use the README for configuration and known production limitations.


## Additional experiences in v1.1
- Interactive desktop birthday magazine between Gallery and Letters; 12 editable pages with 6 two-page spreads, animation, fullscreen and contents selector.
- Flip-and-download Bestie Birthday ID card next to the magazine, editable in the private admin dashboard.
