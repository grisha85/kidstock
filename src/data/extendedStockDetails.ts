import { LocalizedText, StockPastBehavior } from '../types';

export interface ExtendedStockDetails {
  superpower: LocalizedText;
  watchOut: LocalizedText;
  famousProducts: LocalizedText[];
  pastBehavior: StockPastBehavior;
}

export const EXTENDED_STOCK_DETAILS: Record<string, ExtendedStockDetails> = {
  // ================= 1. GAMING & TOYS =================
  RBLX: {
    superpower: {
      en: "Millions of kids build their own games on it, so Roblox gets endless new games for free without hiring thousands of programmers!",
      he: "מיליוני שחקנים וילדים בונים בעצמם את המשחקים, וכך לרובלוקס יש אינסוף משחקים חדשים בחינם מבלי לשכור אלפי מתכנתים!",
    },
    watchOut: {
      en: "Kids can get bored quickly if a new viral trend pops up, and Roblox spends huge money maintaining fast servers.",
      he: "ילדים עלולים לעבור מהר לטרנד הבא, והחברה מוציאה סכומי עתק על הפעלת שרתים מהירים ברחבי העולם.",
    },
    famousProducts: [
      { en: "Adopt Me! & Pet Simulator", he: "משחקי Adopt Me וחיות מחמד" },
      { en: "Robux Virtual Currency", he: "מטבעות רובאקס (Robux)" },
      { en: "Avatar Customizer & Outfits", he: "הלבשת אווטארים וכובעים" },
    ],
    pastBehavior: {
      headline: {
        en: "The Summer & Holiday Rollercoaster ☀️",
        he: "רכבת ההרים של החופש הגדול ☀️",
      },
      story: {
        en: "During school vacations and lockdown periods, Roblox played hours exploded by +50% and its stock price rocketed! But when kids returned to school and outside soccer practice, spending slowed down and the stock dipped.",
        he: "במהלך חופשות הקיץ והסגרים, שעות המשחק של ילדים ברובלוקס זינקו בלמעלה מ-50% והמניה טסה למעלה! אך כשהילדים חזרו לבתי הספר ולחוגים, קצב הרכישות נרגע והמניה ירדה.",
      },
      lesson: {
        en: "Stocks linked to playtime can swing with school seasons. Look for long-term growth across multiple years, not just one summer!",
        he: "מניות שקשורות לזמן מסך מושפעות מעונות השנה ומחופשות בית ספר. למד להסתכל על צמיחה של כמה שנים קדימה ולא רק על חודש בודד!",
      },
    },
  },
  NTDOY: {
    superpower: {
      en: "Unbeatable legendary characters like Mario, Pikachu, and Zelda that generations of parents and kids adore.",
      he: "דמויות מיתולוגיות שאין לאף מתחרה בעולם כמו מריו, פיקאצ'ו וזלדה, שהורים וילדים אוהבים כבר דורות.",
    },
    watchOut: {
      en: "Console cycles: when a Nintendo console gets old before the new one comes out, sales often drop for 1-2 years.",
      he: "מחזורי קונסולות: כשמכשיר משחקים מתיישן ולפני שהקונסולה הבאה מושקת, יש תקופה של שנה-שנתיים שבה המכירות נרגעות.",
    },
    famousProducts: [
      { en: "Nintendo Switch Console", he: "קונסולת Nintendo Switch" },
      { en: "Mario Kart & Smash Bros", he: "מריו קארט וסמאש ברוס" },
      { en: "Pokémon Games & Cards", he: "משחקי וקלפי פוקימון" },
    ],
    pastBehavior: {
      headline: {
        en: "The Switch Miracle Comeback 🍄",
        he: "קאמבק המאה של ה-Switch 🍄",
      },
      story: {
        en: "In 2013-2015, Nintendo's 'Wii U' console flopped and critics claimed mobile phones would kill Nintendo. Instead of giving up, Nintendo secretly designed the hybrid Switch in 2017—which sold over 140 million units and sent the stock surging +300%!",
        he: "בשנים 2013-2015 קונסולת ה-Wii U נכשלה ומומחים טענו שהסמארטפונים יחסלו את נינטנדו. במקום לוותר, נינטנדו המציאה את ה-Switch ששילב קונסולה ניידת וטלוויזיה, מכרה מעל 140 מיליון יחידות והמניה שלה זינקה במאות אחוזים!",
      },
      lesson: {
        en: "Great creative companies can bounce back even stronger after a failure if they stay focused on fun and innovation.",
        he: "חברות יצירתיות מעולות יכולות לחזור חזקות פי כמה גם אחרי כישלון זמני, כל עוד הן מתמקדות במוצרים שמשמחים אנשים.",
      },
    },
  },
  SONY: {
    superpower: {
      en: "The PlayStation brand has the fiercest loyal gaming community and exclusive blockbuster titles like Spider-Man.",
      he: "למותג פלייסטיישן יש את קהילת השחקנים הנאמנה בעולם ומשחקים בלעדיים מרהיבים כמו ספיידרמן.",
    },
    watchOut: {
      en: "Making giant AAA video games today takes 5 years and over $200 million each—so one delayed game hurts profits.",
      he: "פיתוח משחקי ענק לוקח כיום עד 5 שנים ועולה מאות מיליוני דולרים—עיכוב במשחק אחד עלול לפגוע ברווחי השנה.",
    },
    famousProducts: [
      { en: "PlayStation 5 (PS5)", he: "קונסולת פלייסטיישן 5" },
      { en: "Spider-Man & God of War", he: "משחקי ספיידרמן ו-God of War" },
      { en: "Sony Noise-Canceling Headphones", he: "אוזניות סוני מבטלות רעשים" },
    ],
    pastBehavior: {
      headline: {
        en: "The Great PS5 Chip Drought 🕹️",
        he: "משבר השבבים של הפלייסטיישן 5 🕹️",
      },
      story: {
        en: "When the PS5 launched in 2020, every kid on Earth wanted one, but global computer chip shortages meant Sony couldn't make enough! Store shelves were empty for two years. Once chip factories caught up in 2023, PS5 sales smashed records.",
        he: "כשה-PS5 הושק ב-2020 כולם רצו לקנות אותו, אך מחסור עולמי בשבבי מחשב מנע מסוני לייצר מספיק קונסולות והמדפים נשארו ריקים שנתיים. ברגע שהמפעלים התאוששו ב-2023, המכירות זינקו ושברו שיאים.",
      },
      lesson: {
        en: "Sometimes a company's stock drops not because nobody wants their product, but because demand is so high they can't make them fast enough!",
        he: "לפעמים מניה חווה עיכוב לא בגלל שאנשים לא רוצים את המוצר, אלא דווקא מרוב ביקוש עצום שהמפעלים לא עומדים בו!",
      },
    },
  },
  MSFT: {
    superpower: {
      en: "Practically every office, school, and government on Earth runs on Windows, Excel, Word, and Microsoft Cloud servers.",
      he: "כמעט כל משרד, בית ספר וממשלה בעולם פועלים על Windows, אופיס וענן המחשוב של מיקרוסופט.",
    },
    watchOut: {
      en: "They are so gigantic that growing quickly is tough, and AI supercomputers cost tens of billions of dollars to build.",
      he: "היא כל כך ענקית שקשה לה לצמוח באחוזים גבוהים בכל שנה, וחוות שרתי הבינה המלאכותית דורשות השקעות של מיליארדים.",
    },
    famousProducts: [
      { en: "Minecraft & Xbox Game Pass", he: "מיינקראפט ומנוי Xbox Game Pass" },
      { en: "Windows 11 & Office Suite", he: "מערכת ההפעלה Windows ותוכנות Office" },
      { en: "Copilot Artificial Intelligence", he: "בינה מלאכותית Copilot" },
    ],
    pastBehavior: {
      headline: {
        en: "The Cloud & Minecraft Transformation 🟩",
        he: "המהפכה של הענן ומיינקראפט 🟩",
      },
      story: {
        en: "Around 2012, Microsoft seemed like an old, boring PC software company. But new CEO Satya Nadella shifted everything to cloud computing, bought Minecraft for $2.5B, and invested early in OpenAI (ChatGPT)—multiplying the company's value by 10x!",
        he: "ב-2012 מיקרוסופט נראתה כמו חברת מחשבים ישנה ומשעממת. אך המנכ\"ל החדש העביר את כולה למחשוב ענן, רכש את מיינקראפט ב-2.5 מיליארד דולר והשקיע ב-OpenAI (יוצרת ChatGPT)—והקפיץ את שווי החברה פי 10!",
      },
      lesson: {
        en: "A massive Titan company with smart leadership can reinvent itself and create incredible long-term wealth.",
        he: "חברת ענק עם מנהיגות חכמה יכולה להמציא את עצמה מחדש ולהניב רווחי עתק למי שמחזיק בה בסבלנות לאורך שנים.",
      },
    },
  },
  EA: {
    superpower: {
      en: "Official exclusive licenses for global soccer (EA Sports FC), NFL football, and Formula 1 racing.",
      he: "זכויות ורישיונות בלעדיים לליגות הכדורגל בעולם (EA Sports FC), פוטבול ה-NFL ומרוצי פורמולה 1.",
    },
    watchOut: {
      en: "If gamers dislike a new edition of their favorite sports game, they leave harsh reviews and stop buying in-game packs.",
      he: "אם גיימרים מאוכזבים מהגרסה השנתית החדשה של משחק הספורט, הם משאירים ביקורות זועמות ומפסיקים לקנות חבילות שחקנים.",
    },
    famousProducts: [
      { en: "EA Sports FC (formerly FIFA)", he: "משחק הכדורגל EA Sports FC" },
      { en: "Madden NFL & Apex Legends", he: "משחקי פוטבול Madden ו-Apex Legends" },
      { en: "The Sims 4 Life Simulator", he: "משחק הדמיות החיים The Sims 4" },
    ],
    pastBehavior: {
      headline: {
        en: "The Ultimate Team Goldmine ⚽",
        he: "מכרה הזהב של חבילות השחקנים ⚽",
      },
      story: {
        en: "EA used to make money only once when you bought a disc. Then they invented 'Ultimate Team', letting kids open virtual card packs with real money. This recurring revenue turned EA from an up-and-down game maker into a money machine.",
        he: "בעבר EA הרוויחה כסף רק פעם אחת כשקנית דיסק בחנות. אז היא המציאה את 'Ultimate Team', שבו שחקנים פותחים חבילות קלפים וירטואליות. השיטה הזו הפכה את EA למכונת כסף יציבה לאורך כל ימות השנה.",
      },
      lesson: {
        en: "Companies that sell recurring add-ons tend to be much more financially stable than ones that rely on single one-time sales.",
        he: "חברות שמרוויחות תשלומים שוטפים וחוזרים יציבות פי כמה מחברות שמסתמכות רק על מכירה חד-פעמית של מוצר בודד.",
      },
    },
  },
  HAS: {
    superpower: {
      en: "Timeless toy franchises like Monopoly, Nerf, Transformers, and Magic: The Gathering that don't go out of style.",
      he: "מותגי צעצועים אלמותיים כמו מונופול, רובי נרף, רובוטריקים וקלפי מג'יק שלעולם אינם יוצאים מהאופנה.",
    },
    watchOut: {
      en: "Plastic toys face tough competition from smartphones and iPads, as older kids trade physical toys for digital screens.",
      he: "צעצועי פלסטיק מתמודדים עם תחרות עזה מצד טלפונים ומסכים, כשילדים בוגרים עוברים מהר יותר לטאבלטים.",
    },
    famousProducts: [
      { en: "Nerf Blasters & Foam Darts", he: "רובי נרף (Nerf) וחצי ספוג" },
      { en: "Monopoly Board Game", he: "משחק הלוח מונופול" },
      { en: "Play-Doh & Transformers", he: "בצק משחק פליידו ורובוטריקים" },
    ],
    pastBehavior: {
      headline: {
        en: "The Digital Magic Reshuffle 🎲",
        he: "מהפכת הקלפים של מג'יק 🎲",
      },
      story: {
        en: "When traditional toy sales slowed, Hasbro's card game division 'Wizards of the Coast' (Magic: The Gathering & Dungeons & Dragons) grew massively, contributing over half of the entire company's profits!",
        he: "כשמכירות הצעצועים הרגילים בחנויות נחלשו, חטיבת משחקי הקלפים והפנטזיה של הסברו (Magic ו-D&D) צמחה בטירוף והביאה יותר ממחצית מכל הרווחים של החברה כולה!",
      },
      lesson: {
        en: "Toy companies that pivot toward collectors and digital gaming can find brand new life even when basic toy sales slow down.",
        he: "חברות צעצועים שיודעות לפתח משחקים לאספנים ולעולם הדיגיטלי יכולות לפרוח גם כשצעצועי פעוטות נמכרים פחות.",
      },
    },
  },
  MAT: {
    superpower: {
      en: "Global toy icons like Barbie, Hot Wheels, and Uno that every child in the world grows up playing with.",
      he: "אייקוני תרבות עולמיים כמו ברבי, מכוניות הוט-ווילס ומשחק הקלפים טאקי/אונו שכל ילד בעולם גדל עליהם.",
    },
    watchOut: {
      en: "Toy manufacturing and shipping costs can rise quickly during global supply chain bottlenecks.",
      he: "עלויות הייצור והשילוח של צעצועים ממפעלים מעבר לים עלולות לעלות בעת משברים עולמיים בתובלה.",
    },
    famousProducts: [
      { en: "Barbie Dolls & Fashion", he: "בובות ברבי ואופנה" },
      { en: "Hot Wheels Die-Cast Cars", he: "מכוניות מרוץ Hot Wheels" },
      { en: "Uno Card Game & Fisher-Price", he: "משחק הקלפים Uno וצעצועי פישר-פרייס" },
    ],
    pastBehavior: {
      headline: {
        en: "The Barbie Movie Mega-Sparkle 💖",
        he: "האפקט הוורוד של סרט ברבי 💖",
      },
      story: {
        en: "In 2023, Mattel produced the worldwide hit 'Barbie' movie. It made over $1.4 billion at the box office, revived doll sales everywhere, and boosted Mattel's stock price by +25% in a single summer!",
        he: "בשנת 2023 מאטל הפיקה את הסרט שובר הקופות 'ברבי'. הסרט הכניס מעל 1.4 מיליארד דולר, גרם לכל העולם לקנות שוב מוצרי ברבי והקפיץ את מניית החברה בקיץ אחד ב-25%!",
      },
      lesson: {
        en: "Turning beloved toys into movies and shows can suddenly bring an older company back to center stage.",
        he: "הפיכת מותגי צעצועים אהובים לסרטי קולנוע יכולה להחזיר חברה ותיקה לאור הזרקורים ולהכניס מיליונים.",
      },
    },
  },

  // ================= 2. TECH & INNOVATION =================
  AAPL: {
    superpower: {
      en: "The Apple Ecosystem: Once someone has an iPhone, iPad, Apple Watch, and AirPods, they almost never switch to anything else!",
      he: "המערכת האקולוגית של אפל: ברגע שמישהו משתמש באייפון, אייפד, שעון ואוזניות, כמעט בלתי אפשרי עבורו לעזוב למתחרים!",
    },
    watchOut: {
      en: "People now keep their smartphones for 3 to 4 years before upgrading, which slows down new phone sales.",
      he: "אנשים שומרים על הטלפונים שלהם 3-4 שנים לפני שהם קונים מכשיר חדש, מה שמאט את קצב שדרוגי האייפונים.",
    },
    famousProducts: [
      { en: "iPhone 15 & 16", he: "מכשירי iPhone" },
      { en: "iPad & Apple Pencil", he: "מחשבי לוח iPad ועט מגע" },
      { en: "AirPods & Apple Watch", he: "אוזניות AirPods ושעון חכם" },
    ],
    pastBehavior: {
      headline: {
        en: "The Service Empire Rise 📱",
        he: "אימפריית השירותים והאפליקציות 📱",
      },
      story: {
        en: "Years ago, investors worried: 'What happens when everyone already has an iPhone?' Apple answered by building the App Store, iCloud, and Apple Music subscriptions. Today, Apple makes over $80 billion every year just from services!",
        he: "לפני כמה שנים משקיעים חששו: 'מה יקרה כשכולם כבר יחזיקו אייפון?' אפל ענתה ביצירת ה-App Store, אחסון iCloud ומנויי שירותים. כיום אפל מרוויחה מעל 80 מיליארד דולר בשנה רק מהשירותים האלו!",
      },
      lesson: {
        en: "Building great hardware is hard, but getting 1 billion happy users to subscribe to monthly services is the ultimate wealth builder.",
        he: "לייצר טלפונים טובים זה מעולה, אך לגרום למיליארד משתמשים לרכוש שירותים ומנויים מדי חודש זהו סוד העושר האמיתי.",
      },
    },
  },
  GOOGL: {
    superpower: {
      en: "Google Search and YouTube are the primary ways the human race finds information, learns skills, and watches video online.",
      he: "מנוע החיפוש גוגל ויוטיוב הם הדרכים המרכזיות שבהן האנושות לומדת, מחפשת מידע וצופה בסרטונים.",
    },
    watchOut: {
      en: "New AI chatbots (like ChatGPT) could change how people search the web instead of clicking Google search links.",
      he: "בוטים של בינה מלאכותית עלולים לשנות את האופן שבו אנשים שואלים שאלות באינטרנט במקום לחפש בגוגל.",
    },
    famousProducts: [
      { en: "YouTube & YouTube Kids", he: "אתר ואפליקציית YouTube" },
      { en: "Google Search & Maps", he: "חיפוש גוגל ומפות Google Maps" },
      { en: "Android & Chromebooks", he: "מערכת ההפעלה Android ומחשבי Chromebook" },
    ],
    pastBehavior: {
      headline: {
        en: "The $1.65 Billion YouTube Bargain 📺",
        he: "מציאת המאה: רכישת יוטיוב 📺",
      },
      story: {
        en: "In 2006, Google bought a 1-year-old video site named YouTube for $1.65 billion. Critics called it a crazy waste of money. Today, YouTube alone brings in over $30 billion every single year in advertising!",
        he: "בשנת 2006 גוגל קנתה אתר שיתוף וידאו צעיר בשם YouTube ב-1.65 מיליארד דולר. כולם אמרו שזה בזבוז כסף מטורף. כיום יוטיוב לבדה מייצרת לגוגל מעל 30 מיליארד דולר בכל שנה מפרסומות!",
      },
      lesson: {
        en: "Visionary acquisitions of platforms that people love can pay back their cost hundreds of times over.",
        he: "רכישה חכמה של מוצר שמיליוני אנשים אוהבים ומבלים בו שעות יכולה להחזיר את ההשקעה פי מאות מונים.",
      },
    },
  },
  AMZN: {
    superpower: {
      en: "Giant fulfillment warehouses and automated robots that can deliver practically any item on Earth to your doorstep tomorrow.",
      he: "מחסני ענק וצבא של רובוטים חכמים שיכולים להביא כמעט כל מוצר שקיים בעולם ישירות לדלת הבית שלך בתוך שעות.",
    },
    watchOut: {
      en: "Operating millions of trucks, airplanes, and warehouses is extremely expensive when fuel and labor prices climb.",
      he: "הפעלת צי של מאות מטוסים, משאיות ורובוטים דורשת הוצאות עתק על דלק ושכר עובדים כשהמחירים בעולם עולים.",
    },
    famousProducts: [
      { en: "Amazon Prime Delivery", he: "משלוחי אמזון פריים המהירים" },
      { en: "AWS Cloud Servers (Powers Netflix/Fortnite)", he: "שרתי הענן AWS (מפעילים את נטפליקס ופורטנייט)" },
      { en: "Kindle & Echo Alexa", he: "קורא הספרים Kindle ורמקול אלקסה" },
    ],
    pastBehavior: {
      headline: {
        en: "The Dot-Com Crash Survivor 📦",
        he: "השורדת הגדולה של משבר הדוט-קום 📦",
      },
      story: {
        en: "In the year 2000 tech crash, Amazon's stock collapsed by -90%! Many thought it would go bankrupt. But founder Jeff Bezos ignored the stock price and kept building customer trust. Patients investors who held on saw a +20,000% gain!",
        he: "במשבר הטכנולוגיה של שנת 2000, מניית אמזון צנחה ב-90%! רבים חשבו שהחברה תפשוט רגל. אך המייסד ג'ף בזוס התעלם מהמחיר והמשיך לבנות שירות מושלם ללקוחות. מי שהחזיק במניה בסבלנות הרוויח מעל 20,000%!",
      },
      lesson: {
        en: "Stock prices can plunge temporarily during market panic, but as long as customers keep ordering and loving the service, real value wins.",
        he: "מחירי מניות יכולים לצנוח בזמן פאניקה בשווקים, אך כל עוד הלקוחות ממשיכים להזמין ולאהוב את השירות, הערך האמיתי מנצח.",
      },
    },
  },
  NVDA: {
    superpower: {
      en: "Their specialized computer chips (GPUs) are the undisputed engines running every major Artificial Intelligence system in the world.",
      he: "שבבי המחשב הגרפיים שלהם (GPU) הם המנוע הבלעדי שמפעיל את כל מודלי הבינה המלאכותית (AI) המובילים בעולם.",
    },
    watchOut: {
      en: "Tech giants are trying to design their own in-house chips to reduce their dependence on NVIDIA.",
      he: "ענקיות הטכנולוגיה מנסות לייצר בעצמן שבבים פנימיים כדי לא להיות תלויות רק ברכישת שבבים מאנבידיה.",
    },
    famousProducts: [
      { en: "GeForce RTX Gaming Cards", he: "כרטיסי מסך לגיימינג GeForce RTX" },
      { en: "H100 & Blackwell AI Chips", he: "שבבי בינה מלאכותית H100 ו-Blackwell" },
      { en: "Omniverse 3D Simulator", he: "מערכת סימולציית רובוטיקה Omniverse" },
    ],
    pastBehavior: {
      headline: {
        en: "The AI Rocketship Surge ⚡",
        he: "זינוק הרקטה של עידן ה-AI ⚡",
      },
      story: {
        en: "For years NVIDIA was considered 'just for video gamers'. When ChatGPT proved how powerful AI was in 2023, every tech company rushed to buy thousands of NVIDIA chips, causing the stock to soar +1,000% into a $3 Trillion Titan!",
        he: "במשך שנים אנבידיה נחשבה לחברה שמייצרת כרטיסים למשחקי מחשב בלבד. כשהבינה המלאכותית התפוצצה ב-2023, כל חברות הענק עמדו בתור לרכוש את השבבים שלה, והמניה זינקה ביותר מ-1,000% לשווי של מעל 3 טריליון דולר!",
      },
      lesson: {
        en: "Investing in the fundamental 'picks and shovels' that everyone needs to build the future can create life-changing returns.",
        he: "מי שמשקיע בחברה שמספקת את 'כלי העבודה' הבסיסיים שכל שאר העולם חייב כדי לבנות את העתיד, קוצר רווחי ענק.",
      },
    },
  },

  // ================= 3. TREATS, DRINKS & SNACKS =================
  MCD: {
    superpower: {
      en: "Thousands of prime drive-thru locations worldwide with cheap, delicious, lightning-fast food that tastes identical in Tokyo, Paris, or New York.",
      he: "עשרות אלפי סניפים במיקומי פריים בעולם שמספקים אוכל מהיר וטעים באותו טעם מוכר בדיוק בטוקיו, בפריז או בתל אביב.",
    },
    watchOut: {
      en: "Healthy food trends and rising beef and potato costs can eat into restaurant profit margins.",
      he: "טרנדים של מזון בריאותי יותר ועליית מחירי הבשר והתפוחי אדמה עלולים להקטין את הרווח מכל ארוחה.",
    },
    famousProducts: [
      { en: "Happy Meal with Toy", he: "ארוחת ילדים Happy Meal עם צעצוע" },
      { en: "World-Famous Crispy Fries", he: "הצ'יפס הפריך המפורסם" },
      { en: "Big Mac & McFlurry", he: "המבורגר ביג מק וגלידת מקפלורי" },
    ],
    pastBehavior: {
      headline: {
        en: "The Rainy Day Safe Haven 🍟",
        he: "המקלט הבטוח בימים סוערים 🍟",
      },
      story: {
        en: "During tough financial recessions when families stop eating at fancy expensive steakhouses, they still treat their kids to Happy Meals and $2 burgers. McDonald's often stays flat or even rises when other stocks drop!",
        he: "במהלך משברים כלכליים שבהם משפחות מוותרות על מסעדות יוקרה יקרות, הן עדיין מפנקות את הילדים בארוחת ילדים והמבורגר מהיר. מניית מקדונלד'ס מפגינה עמידות מדהימה גם כשהשוק כולו נופל!",
      },
      lesson: {
        en: "Recession-resistant 'Turtle' stocks provide peace of mind and protect your portfolio when the economy gets rocky.",
        he: "מניות 'צב' יציבות וחסינות למשברים שומרות על קופת החיסכון שלך רגועה ובטוחה גם כשיש סערות בכלכלה.",
      },
    },
  },
  KO: {
    superpower: {
      en: "The most famous secret formula and red logo in human history, sold in over 200 countries with unmatched distribution.",
      he: "הנוסחה הסודית והלוגו האדום המוכרים ביותר בתולדות האנושות, הנמכרים בלמעלה מ-200 מדינות בעולם.",
    },
    watchOut: {
      en: "People drinking less sugary soda forces Coca-Cola to spend money buying tea, juice, and sparkling water brands.",
      he: "אנשים שמפחיתים שתייה ממותקת מאלצים את קוקה-קולה לרכוש חברות תה, מיצים ומים מינרליים כדי לשמור על צמיחה.",
    },
    famousProducts: [
      { en: "Coca-Cola & Coke Zero", he: "קוקה-קולה וקולה זירו" },
      { en: "Sprite & Fanta", he: "ספרייט ופאנטה" },
      { en: "Minute Maid & Powerade", he: "מיצי פריגת/מינוט מייד ומשקאות ספורט" },
    ],
    pastBehavior: {
      headline: {
        en: "Warren Buffett's Favorite Dividend Machine 🥤",
        he: "מכונת הדיבידנדים של וורן באפט 🥤",
      },
      story: {
        en: "Legendary investor Warren Buffett bought 400 million shares of Coca-Cola in 1988 and NEVER sold a single one. Why? Coca-Cola has increased its cash payout (dividend) to shareholders every single year for over 60 straight years!",
        he: "המשקיע האגדי וורן באפט קנה מניות קוקה-קולה ב-1988 ומעולם לא מכר אפילו מניה אחת. למה? כי קוקה-קולה מגדילה את חלוקת המזומנים (דיבידנד) שלה לבעלי המניות בכל שנה ברציפות כבר יותר מ-60 שנה!",
      },
      lesson: {
        en: "Owning a slice of a company that pays you real cash dividends every 3 months is like owning a money tree that keeps dropping fruit.",
        he: "להחזיק במניה שמחלקת לך מזומן אמיתי בכל כמה חודשים זה כמו להחזיק עץ כסף שממשיך להצמיח פירות לחשבון שלך.",
      },
    },
  },

  // ================= 4. FASHION & SNEAKERS =================
  NKE: {
    superpower: {
      en: "The swoosh logo and contracts with the greatest athletes in sports history (Michael Jordan, LeBron James, Cristiano Ronaldo).",
      he: "סמל ה-Swoosh המפורסם וחוזים עם הספורטאים הגדולים בהיסטוריה (מייקל ג'ורדן, לברון ג'יימס, כריסטיאנו רונאלדו).",
    },
    watchOut: {
      en: "Sneaker fashion trends change rapidly, and trendy new running brands (like On Running and Hoka) compete hard.",
      he: "טרנדים של אופנה ונעליים משתנים במהירות, ומותגי ריצה חדשים כמו On ו-Hoka נוגסים בחלק מהמכירות.",
    },
    famousProducts: [
      { en: "Air Jordan Sneaker Line", he: "סדרת נעלי אייר ג'ורדן" },
      { en: "Nike Dunk & Air Force 1", he: "נעלי נייקי דאנק ו-Air Force 1" },
      { en: "Pro Soccer & Basketball Gear", he: "ציוד ומדי כדורגל וכדורסל מקצועיים" },
    ],
    pastBehavior: {
      headline: {
        en: "The Michael Jordan Gamble 🏀",
        he: "ההימור ששינה הכל: מייקל ג'ורדן 🏀",
      },
      story: {
        en: "In 1984, Nike was a distant underdog behind Converse. They gambled their entire marketing budget to sign rookie Michael Jordan, hoping to sell $3M of shoes. In year one alone, the Air Jordan sold $126 Million—transforming Nike into the undisputed sneaker king!",
        he: "בשנת 1984 נייקי הייתה חברה קטנה מאחורי קונברס. הם הימרו על כל תקציב הפרסום שלהם כדי להחתים את מייקל ג'ורדן הצעיר, וקיוו למכור נעליים ב-3 מיליון דולר. בשנה הראשונה לבדה מכירות האייר ג'ורדן הגיעו ל-126 מיליון דולר!",
      },
      lesson: {
        en: "Iconic cultural branding can turn an ordinary product into something kids and teenagers collect and cherish like art.",
        he: "מיתוג תרבותי עוצמתי יכול להפוך מוצר רגיל כמו נעליים לפריט אספנות נחשק שילדים ומבוגרים עומדים בתור בשבילו.",
      },
    },
  },
  CROX: {
    superpower: {
      en: "Unbeatable lightweight comfort, washable foam material, and customizable Jibbitz charms that kids love collecting.",
      he: "נוחות שאין דומה לה, חומר עמיד וקל לשטיפה, וסיכות Jibbitz צבעוניות שילדים ובני נוער משתגעים לאסוף.",
    },
    watchOut: {
      en: "If foam clogs fall out of fashion with teenagers, sales can slow down until a new trend arrives.",
      he: "אם כפכפי הקצף יאבדו מהפופולריות שלהם בקרב נוער, קצב המכירות עלול להיחלש עד לפריצה הבאה.",
    },
    famousProducts: [
      { en: "Classic Clogs in 50+ Colors", he: "כפכפי קרוקס קלאסיים בעשרות צבעים" },
      { en: "Jibbitz Shoe Charms", he: "סיכות קישוט Jibbitz לנעליים" },
      { en: "HeyDude Casual Shoes", he: "נעלי הליכה קלות HeyDude" },
    ],
    pastBehavior: {
      headline: {
        en: "From 'Ugly Shoe' to Global Phenom 🐊",
        he: "מהנעל המוזרה לשיגעון עולמי 🐊",
      },
      story: {
        en: "In 2008, critics predicted Crocs would go extinct because people called them 'ugly'. But Crocs leaned into fun collaborations with pop stars (Justin Bieber, Post Malone) and anime shows, driving a +1,500% stock explosion over the decade!",
        he: "ב-2008 כולם צפו שקרוקס תיעלם כי אנשים חשבו שהיא נראית מוזר. אך החברה עשתה שיתופי פעולה מבריקים עם כוכבי פופ (ג'סטין ביבר) וסדרות אנימה, והמניה שלה התפוצצה ביותר מ-1,500% בעשור האחרון!",
      },
      lesson: {
        en: "Comfort and self-expression often beat traditional fashion rules. Don't underestimate products people genuinely love wearing.",
        he: "נוחות אמיתית וביטוי אישי מנצחים תמיד כללי אופנה ישנים. אל תזלזל במוצרים שאנשים פשוט נהנים לנעול כל יום.",
      },
    },
  },

  // ================= 5. MOVIES, PARKS & ENTERTAINMENT =================
  DIS: {
    superpower: {
      en: "The Vault of timeless stories: Mickey Mouse, Disney Princesses, Marvel Avengers, Pixar, and Star Wars.",
      he: "כספת הדמויות והסיפורים הגדולה בעולם: מיקי מאוס, נסיכות דיסני, הנוקמים של מארוול, פיקסאר ומלחמת הכוכבים.",
    },
    watchOut: {
      en: "Building and maintaining giant Disneyland theme parks and competing in streaming battles against Netflix requires enormous money.",
      he: "אחזקת פארקי דיסנילנד ענקיים והתחרות בשירותי הסטרימינג מול נטפליקס דורשות השקעות של מיליארדי דולרים.",
    },
    famousProducts: [
      { en: "Disneyland & Disney World Parks", he: "פארקי דיסנילנד ודיסני וורלד" },
      { en: "Disney+ Streaming Service", he: "שירות הסטרימינג Disney+" },
      { en: "Marvel & Star Wars Movies", he: "סרטי מארוול ומלחמת הכוכבים" },
    ],
    pastBehavior: {
      headline: {
        en: "The Streaming Launch & Park Rebound 🏰",
        he: "השקת דיסני פלוס והחזרה לפארקים 🏰",
      },
      story: {
        en: "When the pandemic closed theme parks in 2020, Disney launched Disney+ and gained 100 million subscribers in record time! When parks reopened, families rushed back with pent-up demand, showing how diversified Disney truly is.",
        he: "כשמגפת הקורונה סגרה את הפארקים ב-2020, דיסני השיקה את דיסני פלוס והגיעה ל-100 מיליון מנויים בזמן שיא! כשהפארקים נפתחו מחדש, הורים וילדים עמדו בתור, מה שהוכיח את החוזק הרב-גוני של דיסני.",
      },
      lesson: {
        en: "Having multiple engines (movies, toys, theme parks, streaming) protects a company when one engine temporarily stalls.",
        he: "חברה שמחזיקה בכמה מנועי רווח חזקים (סרטים, צעצועים, פארקים וסטרימינג) מגנה על עצמה גם אם אחד מהם נפגע זמנית.",
      },
    },
  },

  // ================= 6. FUTURE, CARS & RETAIL =================
  TSLA: {
    superpower: {
      en: "Leader in battery tech, self-driving AI supercomputing, and the fastest charging network across the continent.",
      he: "מובילה עולמית בסוללות חכמות, בינה מלאכותית לרכב אוטונומי ורשת טעינה מהירה שפרוסה בכל העולם.",
    },
    watchOut: {
      en: "Every traditional car company is now making electric cars, creating price wars and tighter profit margins.",
      he: "כל חברות הרכב המסורתיות מייצרות כיום רכבים חשמליים, מה שיוצר תחרות מחירים עזה.",
    },
    famousProducts: [
      { en: "Tesla Model Y & Model 3", he: "מכוניות טסלה מודל Y ומודל 3" },
      { en: "Cybertruck & Supercharger Network", he: "טנדר Cybertruck ורשת מטעני Supercharger" },
      { en: "Full Self-Driving (FSD) Software", he: "תוכנת נהיגה אוטונומית FSD" },
    ],
    pastBehavior: {
      headline: {
        en: "The Model 3 'Production Hell' Victory ⚡",
        he: "הניצחון ב'גיהנום הייצור' של מודל 3 ⚡",
      },
      story: {
        en: "In 2018, Tesla was weeks away from running out of money while trying to build robots to mass-produce the Model 3. Elon Musk slept on the factory floor. They figured it out, ramped up production, and the stock exploded +1,200% over the next two years!",
        he: "ב-2018 טסלה הייתה במרחק שבועות בודדים מסיום המזומנים בזמן שניסתה לייצר בייצור המוני את המודל 3. הם פתרו את בעיות המפעל, המכירות זינקו והמניה טסה ביותר מ-1,200% בתוך שנתיים בלבד!",
      },
      lesson: {
        en: "Cheetah stocks can be gut-wrenching rollercoasters with immense volatility, but solving impossible problems generates massive rewards.",
        he: "מניות 'צ'יטה' מהירות יכולות להיות רכבת הרים מסחררת ומפחידה, אך פתרון של אתגרים טכנולוגיים ענקיים מביא לתשואות חסרות תקדים.",
      },
    },
  },

  // ================= 7. MAGIC BASKETS (ETFS) =================
  SPY: {
    superpower: {
      en: "Automatic diversification: You own a slice of the 500 biggest corporations in America with zero effort.",
      he: "פיזור אוטומטי: אתה מחזיק בבת אחת נתח מ-500 החברות הגדולות והרווחיות ביותר באמריקה בלי שום מאמץ.",
    },
    watchOut: {
      en: "It follows the whole US economy—so if the stock market experiences a broad correction, SPY will drop along with it.",
      he: "הקרן עוקבת אחרי כל הכלכלה האמריקאית—אם השוק כולו חווה ירידות, היא תרד בהתאם לשוק הכללי.",
    },
    famousProducts: [
      { en: "Top 500 US Blue-Chip Companies", he: "500 החברות המובילות בארה\"ב" },
      { en: "Instant Mix of Tech, Food, Medicine & Banks", he: "תערובת מיידית של טכנולוגיה, מזון, רפואה ובנקים" },
      { en: "Self-Cleaning: Bad companies get kicked out automatically", he: "סל מתנקה מעצמו: חברה שנכשלת מוחלפת אוטומטית" },
    ],
    pastBehavior: {
      headline: {
        en: "100 Years of Inevitable American Growth 📈",
        he: "100 שנות צמיחה בלתי נמנעת 📈",
      },
      story: {
        en: "Over the last century, the S&P 500 lived through World War II, the Great Recession, and the 2020 pandemic. Every single time the market crashed, it eventually recovered and climbed to brand-new record highs, averaging ~10% gains per year!",
        he: "במהלך מאה השנים האחרונות מדד ה-S&P 500 עבר מלחמות עולם, משברים פיננסיים ומגפות. בכל פעם שהמדד צנח, הוא התאושש וכבש שיאים חדשים, עם ממוצע היסטורי של כ-10% תשואה בכל שנה!",
      },
      lesson: {
        en: "Don't look for a needle in a haystack—buy the whole haystack! Holding the S&P 500 lets human progress grow your wealth automatically.",
        he: "במקום לחפש מחט בערימת שחת, תקנה את כל הערימה! החזקת סל 500 החברות המובילות מאפשרת לקדמה האנושית להגדיל את כספך אוטומטית.",
      },
    },
  },
  QQQ: {
    superpower: {
      en: "Packed with the 100 most innovative tech giants pushing the frontier of artificial intelligence, software, and semiconductors.",
      he: "עמוס ב-100 חברות הטכנולוגיה והחדשנות המובילות בעולם שמובילות את מהפכת ה-AI, השבבים והתוכנה.",
    },
    watchOut: {
      en: "High-growth tech stocks swing with bigger drops during market dips than classic dividend companies.",
      he: "מניות צמיחה טכנולוגיות נוטות לרדת חזק יותר בזמן משברים מאשר חברות מזון ומשקאות מסורתיות.",
    },
    famousProducts: [
      { en: "Top 100 Tech Innovators (Apple, Nvidia, Google)", he: "100 ענקיות הטכנולוגיה (אפל, אנבידיה, גוגל)" },
      { en: "High-Octane Growth Focus", he: "מיקוד מקסימלי בצמיחה וטכנולוגיית עתיד" },
    ],
    pastBehavior: {
      headline: {
        en: "The Tech Revolution Outperformer 🚀",
        he: "הקטר שמוביל את מהפכת הטכנולוגיה 🚀",
      },
      story: {
        en: "Over the past 15 years, as smartphones, cloud servers, and video streaming took over daily life, QQQ delivered more than double the gains of ordinary market funds, turning small investments into fortunes for long-term tech believers.",
        he: "במהלך 15 השנים האחרונות, כשהטלפונים, הענן והסטרימינג השתלטו על חיינו, מדד ה-QQQ הניב יותר מפי 2 תשואה מהמדדים הרגילים והפך השקעות קטנות להון מרשים.",
      },
      lesson: {
        en: "Tech companies can deliver faster growth, but require nerves of steel during down years to hold through the dips.",
        he: "חברות טכנולוגיה מספקות צמיחה מהירה יותר, אך דורשות עצבי ברזל וסבלנות כדי לא להיבהל בירידות זמניות.",
      },
    },
  },
};

/**
 * Returns complete extended educational details for any stock,
 * falling back to intelligent dynamic profiles if not explicitly listed.
 */
export const getExtendedStockDetails = (
  ticker: string,
  stockName: string,
  category: string
): ExtendedStockDetails => {
  const custom = EXTENDED_STOCK_DETAILS[ticker.toUpperCase()];
  if (custom) return custom;

  // Fallback tailored to the category
  const isEtf = category === 'etfs';
  return {
    superpower: {
      en: isEtf
        ? "Instant diversification: Spreads your money across dozens or hundreds of companies so one failure can't hurt you."
        : `Strong brand recognition and customer loyalty in the ${category} industry.`,
      he: isEtf
        ? "פיזור סיכונים מיידי: מחלקת את כספך על פני עשרות או מאות חברות, כך שכישלון של חברה אחת לא מסכן אותך."
        : `מוניטין מותג חזק ונאמנות לקוחות גבוהה בתחום ה-${category}.`,
    },
    watchOut: {
      en: "Macroeconomic shifts and competition from younger, hungrier innovators.",
      he: "שינויים במצב הכלכלי העולמי ותחרות עזה מצד חברות צעירות וחדשניות.",
    },
    famousProducts: [
      { en: `${stockName} Core Services`, he: `מוצרי הדגל של ${stockName}` },
      { en: "Global Customer Brand", he: "מותג שירות בינלאומי" },
      { en: "Everyday Consumer Offerings", he: "מוצרים מוכרים לצרכן" },
    ],
    pastBehavior: {
      headline: {
        en: `The Long-Term Growth Pattern of ${stockName} 📊`,
        he: `דפוס הצמיחה ארוך הטווח של ${stockName} 📊`,
      },
      story: {
        en: `${stockName} has adapted through multiple economic cycles by creating products millions of consumers use every day. Even during market pullbacks, strong companies consistently reinvest in their future.`,
        he: `חברת ${stockName} הוכיחה יכולת התאוששות במחזורים כלכליים שונים בזכות מוצרים שמיליוני אנשים צורכים. גם בירידות שוק, חברות מובילות ממשיכות להשקיע בעתידן.`,
      },
      lesson: {
        en: "Patience and understanding how a business operates beats trying to guess daily price movements every time.",
        he: "סבלנות והבנת האופן שבו העסק עובד מנצחות תמיד ניסיונות לנחש מה יקרה למחיר מחר בבוקר.",
      },
    },
  };
};
