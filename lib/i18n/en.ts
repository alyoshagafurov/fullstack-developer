/*
 * Every word on the public site, in English.
 *
 * Written plain on purpose — the owner asked for words anyone gets on the
 * first read: who he is, what he builds, what it does for the client. No
 * "full-stack", no "solutions", no "synergy". Facts (prices, durations,
 * numbers, his bio) are his own; only the wording is new.
 *
 * ru.ts has exactly this shape. Change a sentence here, change it there too.
 * `{n}`-style placeholders are filled with `fill()` from lib/i18n.
 */

import type { BriefCopy } from '@/lib/content/brief';

/** The request form in English. Values sent stay the Russian ones in lib/content/brief.ts. */
const briefEn: BriefCopy = {
  name: { question: 'What’s your name?', hint: 'Just your first name is fine.', placeholder: 'Alex' },
  contact: {
    question: 'Where should I reply?',
    hint: 'Pick what’s easiest for you and leave your contact.',
  },
  methods: {
    Telegram: { label: 'Telegram', placeholder: '@username' },
    WhatsApp: { label: 'WhatsApp', placeholder: '+1 555 000 0000' },
    Instagram: { label: 'Instagram', placeholder: '@username' },
    Email: { label: 'Email', placeholder: 'name@gmail.com' },
    Телефон: { label: 'Phone', placeholder: '+1 555 000 0000' },
  },
  projectType: {
    question: 'What do you need?',
    hint: 'Pick the closest one. Not sure? Pick something similar — we’ll sort it out.',
  },
  options: {
    Сайт: { label: 'Website' },
    'Landing Page': { label: 'Landing page' },
    'Корпоративный сайт': { label: 'Company website' },
    'Интернет-магазин': { label: 'Online store' },
    'Web-приложение': { label: 'Web app' },
    'CRM-система': { label: 'CRM system' },
    Автоматизация: { label: 'Automation' },
    Редизайн: { label: 'Redesign' },
    'MVP стартапа': { label: 'Startup first version (MVP)' },
    'Android-приложение': { label: 'Android app' },
    'iOS-приложение': { label: 'iPhone app' },
    'Telegram-бот': { label: 'Telegram bot' },
    'Telegram Mini App': { label: 'Telegram Mini App' },
    'Поддержка и развитие': { label: 'Support and updates' },
  },
  details: { question: 'Tell me what you need', hint: 'In your own words. Short is fine.' },
  fields: {
    details: {
      label: 'What you need',
      placeholder: 'For example: a website for my coffee shop so people can order online',
    },
    questions: { label: 'Your questions', placeholder: 'Anything you’d like to ask' },
    budget: { label: 'Budget', placeholder: 'For example: $500' },
  },
  optional: 'optional',
  note: 'By sending this, you agree that I can contact you about your project.',
  errors: {
    name: 'What’s your name?',
    method: 'Pick where I should reply',
    required: 'Leave your contact',
    email: 'Looks like there’s a typo in the email',
    phone: 'Check the number — it’s too short',
    short: 'That’s too short for a username',
    type: 'Pick what you need',
    details: 'Write at least a few words about what you need',
    check: 'Please check this answer',
    failed: 'Couldn’t send it. Please try again.',
    offline: 'Looks like you’re offline. Check your connection and try again.',
  },
  next: 'Next',
  back: 'Back',
  send: 'Send request',
  sending: 'Sending…',
  honeypot: 'Don’t fill this in',
  done: {
    title: 'Thank you! Your request is in.',
    message: 'I’m already on your project: I’ll read everything carefully and get back to you within a day.',
    prices: 'See prices',
    work: 'See my work',
    refLabel: 'Request number',
    codeLabel: 'Code for the bot',
    track: 'You can check the status with my Telegram bot',
    trackChat: 'I sent the number and code to your chat.',
  },
};

export const en = {
  meta: {
    siteTitle: 'Alisher Gafurov — I build websites, online stores and apps',
    siteDescription:
      'I’m Alisher Gafurov (aly), a web developer from Dushanbe, Tajikistan. I build websites, online stores, apps and Telegram bots for businesses — from idea to launch, on my own, with no middlemen.',
    titleTemplate: '%s — Alisher Gafurov (aly)',
    ogLocale: 'en_US',
    keywords: [
      'Alisher Gafurov',
      'aly gafurov',
      'web developer Dushanbe',
      'web developer Tajikistan',
      'freelance web developer',
      'website for business',
      'online store development',
      'Telegram bot developer',
      'Алишер Гафуров',
    ],
  },

  person: {
    name: 'Alisher Gafurov',
    role: 'Web developer',
    location: 'Dushanbe, Tajikistan',
    photoAlt: 'Alisher Gafurov at work',
  },

  common: {
    skipToContent: 'Skip to content',
    getQuote: 'Get a quote',
    seeWork: 'See my work',
    learnMore: 'Learn more',
    seeServices: 'See services',
    backHome: 'Back to home',
    /** Used inside a sentence: "I reply within a day." */
    replyWithin: 'I reply within a day.',
    responseTime: 'Within a day',
    hours: 'Mon–Sat, roughly 10:00–23:00, Dushanbe time (UTC+5).',
    legal: '© 2026 aly. All rights reserved.',
    priceOnRequest: 'By agreement',
    inRussianOnly: 'This description is in Russian for now.',
  },

  nav: {
    work: 'Work',
    services: 'Services',
    prices: 'Prices',
    reviews: 'Reviews',
    about: 'About me',
    contacts: 'Contact',
    process: 'How it works',
    start: 'Get a quote',
  },

  header: {
    home: 'aly — home',
    menu: 'Menu',
    close: 'Close',
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    sections: 'Site sections',
    language: 'Language',
    menuWrite: 'Write to me',
    menuNote: 'Dushanbe · UTC+5',
  },

  footer: {
    statement: 'Websites, stores, apps and bots for your business.',
    colophon: 'Alisher Gafurov · Алишер Гафуров · Web developer, Dushanbe, Tajikistan',
    work: 'Work',
    talk: 'Get in touch',
    contact: 'Contact',
  },

  hero: {
    eyebrow: 'Web developer · Dushanbe',
    lines: ['I build', 'websites', 'for business'],
    lede: 'Online stores, apps and Telegram bots too. I do it all myself — design, code and launch. You deal with one person from start to finish.',
    photoAlt: 'Alisher Gafurov, web developer',
  },

  marquee: [
    'Websites for your business',
    'From idea to launch',
    'No middlemen',
    'Clients all over the world',
  ],

  manifesto: {
    label: 'In short',
    statement:
      'You tell me what your business needs. I build it — a website, an online store, an app or a bot. It looks good, works on every phone, and your clients get it right away.',
    stats: [
      { value: '50+', label: 'projects done' },
      { value: '10+', label: 'technologies I work with' },
      { value: '2 years', label: 'working as a developer' },
    ],
  },

  vitrine: {
    aria: 'My work',
    caseLabel: 'My work',
    serviceLabel: 'What I build',
    previous: 'Previous',
    next: 'Next',
    allWork: 'All projects',
    viewProject: 'View project',
    tapToOpen: 'Tap the picture to open it',
  },

  about: {
    label: 'About me',
    difference:
      'I build the whole thing myself: idea, design, code, server and launch. Nothing gets handed off to “another guy”.',
    why: [
      'Because I don’t just do the task — I want to understand why your business needs it. I look at the project like an owner: what should change after launch, how the site will sell, and why people should trust it. That’s why I often suggest things clients didn’t even think of, but that really move the result.',
      'Because I build things that look more expensive than they cost, and I treat your project like my own business. I care about the result, not just handing over files.',
    ],
    more: 'More about me',
    facts: [
      { label: 'Experience', value: '3–4 years' },
      { label: 'Based in', value: 'Tajikistan' },
      { label: 'Clients', value: 'All over the world — Upwork, Kwork and direct' },
      { label: 'Team', value: 'Just me — you talk straight to the person doing the work' },
    ],
    origin:
      'It started with plain curiosity — I always liked figuring out how things work and whether I could build them myself. One day I made my first website and got hooked. At first it was just fun. Then I realised I wanted to build real things and turn ideas into products people actually use.',
    bio: 'I wasn’t always a developer. Before this I worked as a courier at Obi Dushanbe and as an English teacher at Faridun 3. My English is good and I talk with people from other countries all the time, so working with clients abroad is easy for me. I’ve been training MMA, grappling and BJJ for about four years — sport shaped my character and taught me discipline. Now I’m growing as a developer, building my own projects and always trying something new.',
    offDuty:
      'I read Haruki Murakami, train MMA and walk around Dushanbe at night listening to Cigarettes After Sex.',
    principle:
      'When people ask me to drop the price because “it’s simple, just add some pictures, make it cheaper” — I don’t like that, and I don’t drop the price anyway.',
    refuse: [
      'I don’t take jobs where a website is needed just “to have one” instead of as a tool that should change something. If the result after launch doesn’t matter to you, we’re not a match.',
      'I try not to take projects where everything was decided without me and all that’s needed is a pair of hands. I’m not a coder for hire — I want a say in what the product becomes.',
    ],
    clientsSay: [
      'They recommend me to others.',
      'They say they don’t get why I charge so little for this kind of work.',
    ],
    education: [
      'Second-year student at the Technical University of Tajikistan named after Academician Osimi.',
      'Learned web development mostly on my own, plus two years at IT-RUN: practice, real projects and constant learning.',
      'English — five years at Faridun 3, then kept improving by talking with people from other countries.',
      'MMA, grappling and BJJ — about four years of training.',
    ],
    languages: [
      { name: 'Russian', level: 'fluent' },
      { name: 'English', level: 'fluent' },
      { name: 'Tajik', level: 'fluent' },
    ],
    storyLabels: {
      learned: 'What I learned',
      languages: 'Languages',
      why: 'Why work with me',
      refuse: 'What I don’t take on',
      clients: 'What clients say',
    },
    spreads: [
      { title: 'At the laptop', when: 'August 2026', alt: 'Alisher Gafurov working on a laptop on the sofa' },
      { title: 'Fight gym', when: 'April 2026', alt: 'At the fight gym, next to the cage' },
      { title: 'Suit and city', when: 'April 2026', alt: 'In a suit on a terrace above the city' },
      { title: 'Bag and mirror', when: 'June 2026', alt: 'At the gym, reflected in a mirror next to a punching bag' },
      { title: 'Laptop and phone', when: 'August 2026', alt: 'At the laptop with a phone in hand' },
      { title: 'Park, flagpole', when: 'May 2026', alt: 'In a park next to a flagpole' },
      { title: 'Lobby', when: 'October 2025', alt: 'In a suit in a lobby' },
      { title: 'Mountains', when: '', alt: 'In the mountains above a green valley' },
      { title: 'Reflection', when: 'May 2026', alt: 'Reflection in a mirror' },
    ],
  },

  reviews: {
    title: 'Reviews',
    all: 'All {n}',
    cardLabel: 'What clients say',
    workedWithMe: 'Worked with me?',
    leave: 'Leave a review',
    projectLink: 'Project',
    rated: 'Rated {n} out of 5',
  },

  process: {
    title: 'How it works',
    share: 'This step is about {n} percent of the total time.',
    stages: [
      {
        title: 'We talk',
        duration: '1–2 days',
        body: 'You tell me your idea and what you need. I ask questions so I understand exactly what you want.',
      },
      {
        title: 'Plan and price',
        duration: '1–2 days',
        body: 'I suggest the best way to do it. Together we agree on what’s included, how long it takes and what it costs.',
      },
      {
        title: 'Design',
        duration: '3–10 days',
        body: 'I show you how it will look. You approve it or tell me what to change — then I start building.',
      },
      {
        title: 'Build',
        duration: '1–4 weeks',
        body: 'I build everything and make it work on phones, tablets and computers. You see the progress as I go and can say what you think.',
      },
      {
        title: 'Testing',
        duration: '2–5 days',
        body: 'I check everything on different devices and fix every problem I find.',
      },
      {
        title: 'Launch',
        duration: '1 day',
        body: 'I put it online, connect your domain, set everything up and hand it over to you.',
      },
    ],
    terms: [
      {
        label: 'Payment',
        value:
          '50/50. I show you a first draft in 1–3 days. You pay 50% upfront and the rest when it’s done.',
      },
      { label: 'Support', value: 'Three rounds of changes within a month after launch — included.' },
      {
        label: 'After that',
        value: 'More changes are priced separately, depending on how big they are.',
      },
    ],
  },

  closing: {
    label: 'Start',
    invite: 'Got an idea? Let’s build it.',
    hint: 'Takes two minutes. No strings attached. I reply within a day.',
    reply: 'Reply',
    email: 'Email',
    telegram: 'Telegram',
  },

  services: {
    metaTitle: 'Services',
    metaDescription:
      'What I do: websites, landing pages, company websites, online stores, web apps, Telegram bots and more. Built to order by a web developer in Dushanbe, Tajikistan.',
    eyebrow: 'Services',
    title: 'What I do',
    count: '{n} services',
    whatItIs: 'What it is',
    youGet: 'What you get',
    forWho: 'Who it’s for',
    timeline: 'Timeline',
    budget: 'Budget',
    items: {
      sites: {
        title: 'Websites from scratch',
        tagline: 'A full website built from zero: idea, design, code and launch.',
        who: 'Businesses, experts, personal brands and companies.',
        deliverable:
          'A finished website online: design, phone version, animations, forms, all the features you need, connected to the services you use.',
        duration: '1–2 weeks',
        budget: 'From 3,000 TJS',
      },
      landing: {
        title: 'Landing pages',
        tagline:
          'A one-page site that quickly explains your product and gets people to contact you or buy.',
        who: 'Businesses, experts, new products, ad campaigns and events.',
        deliverable:
          'A unique design, phone version, animations, request forms, analytics set up, and the page live online.',
        duration: '4–6 days',
        budget: 'From 1,500 TJS',
      },
      corporate: {
        title: 'Company websites',
        tagline:
          'A full site for your company: what you do, your services, your team — so new clients find you and trust you.',
        who: 'Companies and organisations that need a serious presence online.',
        deliverable:
          'Home page, service pages, about, team, projects, contacts, a blog if you need one, an admin panel to edit things yourself, and anything else you need.',
        duration: '1–3 weeks',
        budget: 'From 5,000 TJS',
      },
      ecommerce: {
        title: 'Online stores',
        tagline: 'A shop where your customers pick products, place an order and pay online.',
        who: 'Shops, brands and anyone who wants to sell online.',
        deliverable:
          'Catalog, categories, search, product pages, cart, checkout, customer accounts if needed, an admin panel to run it all, and a phone version.',
        duration: '1–3 weeks',
        budget: 'From 5,000 TJS',
      },
      'web-apps': {
        title: 'Web apps',
        tagline: 'An online service people use like a real product — not just a site to read.',
        who: 'Startups and business owners with an idea for a service.',
        deliverable:
          'The screens people use, all the code behind them, a database, sign-in, user accounts, roles and the features you need.',
        duration: 'From 2–5 weeks',
        budget: 'From 7,000 TJS',
      },
      crm: {
        title: 'CRM systems',
        tagline:
          'One place to see all your clients, requests and deals — built around how your business actually works.',
        who: 'Companies and sales teams with lots of clients and requests.',
        deliverable:
          'Clients, requests, deals, statuses, staff, roles, tasks, notifications, reports and whatever else you need.',
        duration: '2–3 weeks',
        budget: 'From 5,000 TJS',
      },
      automation: {
        title: 'Automation',
        tagline:
          'I take boring, repeat work off your team and connect your tools so they work together.',
        who: 'Businesses where people do the same things by hand every day.',
        deliverable:
          'Automatic requests, notifications, data handling, connected services, bots — whatever fits your process.',
        duration: 'A few days to a week',
        budget: 'From 1,500 TJS',
      },
      redesign: {
        title: 'Redesign',
        tagline: 'I take your existing site or app and make it modern and easy to use.',
        who: 'Businesses with an old, clunky or plain-looking site.',
        deliverable:
          'A new design, clearer structure, phone version, a modern look — and a rebuilt site if needed.',
        duration: '1–2 weeks',
        budget: 'From 3,000 TJS',
      },
      mvp: {
        title: 'Startup first version (MVP)',
        tagline: 'I turn your startup idea into a first working version you can show to real people.',
        who: 'Startup founders who want to test an idea on real users.',
        deliverable: 'A working product with the main features you need to launch and test the idea.',
        duration: 'From 2–4 weeks',
        budget: 'From 7,000 TJS',
      },
      support: {
        title: 'Support and updates',
        tagline: 'After launch I keep working on your project: fixing, improving and adding new things.',
        who: 'Owners of websites, apps and online products.',
        deliverable:
          'Fixes, updates, new features, speed-ups, tech support and the next steps for your project.',
        duration: 'Ongoing or per task',
        budget: 'Priced per task',
      },
      android: {
        title: 'Android apps',
        tagline: 'I build Android apps from scratch.',
        who: 'Businesses, startups and services that need their own mobile app.',
        deliverable:
          'A finished Android app with the features, design and server connection you need — ready to publish.',
        duration: 'From 2 weeks',
        budget: 'From 7,000 TJS',
      },
      ios: {
        title: 'iPhone apps',
        tagline: 'I build apps for iPhone and iPad.',
        who: 'Businesses, startups and services that need an app for Apple users.',
        deliverable:
          'A finished iOS app with a server connection and the features you need — ready for the App Store.',
        duration: 'From 2 weeks',
        budget: 'From 7,000 TJS',
      },
      'telegram-bots': {
        title: 'Telegram bots',
        tagline: 'Telegram bots that talk to your customers and do jobs for you automatically.',
        who: 'Businesses, services, communities and entrepreneurs.',
        deliverable:
          'A bot with commands, menus, requests, a database, notifications, connections to your tools and the logic you need.',
        duration: '3 days to 2 weeks',
        budget: 'From 1,500 TJS',
      },
      'telegram-mini-apps': {
        title: 'Telegram Mini Apps',
        tagline: 'Full mini apps that open right inside Telegram — nothing to download.',
        who: 'Startups, businesses and services that want to give people a real app inside Telegram.',
        deliverable:
          'The app screens, all the code behind them, a database, Telegram sign-in and the features you need.',
        duration: 'From 1–2 weeks',
        budget: 'From 3,000 TJS',
      },
    } as Record<
      string,
      { title: string; tagline: string; who: string; deliverable: string; duration: string; budget: string }
    >,
  },

  prices: {
    metaTitle: 'Prices',
    metaDescription:
      'How much a website, online store, web app or Telegram bot costs. Starting prices from Alisher Gafurov, web developer in Dushanbe.',
    eyebrow: 'Prices',
    title: 'What it costs',
    lede: 'These are starting prices. The final price depends on the size of the job — I’ll tell you the exact amount after we talk.',
  },

  work: {
    metaTitle: 'Projects',
    metaDescription:
      'Work I built from start to finish: websites, online stores and web apps, made in Dushanbe.',
    eyebrow: 'Projects',
    title: 'Work I built from start to finish',
    emptyTitle: 'Projects are coming soon.',
    emptyBody:
      'I add them together with my clients and only show what I’m allowed to. For now, see what I do — or write to me and I’ll tell you about my work.',
    breadcrumb: 'Projects',
    task: 'The problem',
    solution: 'What I did',
    result: 'The result',
    tech: 'Built with',
    screens: 'Screens',
    screenAlt: '{title}: screen {n}',
    open: 'Open the project',
  },

  aboutPage: {
    metaTitle: 'About me',
    metaDescription:
      'Alisher Gafurov (aly) — web developer from Dushanbe, Tajikistan. How I got into development, what I studied, who I work with and what I don’t take on.',
    eyebrow: 'About me',
  },

  contacts: {
    metaTitle: 'Contact',
    metaDescription: 'Contact Alisher Gafurov, web developer in Dushanbe: {email}, Telegram @{telegram}.',
    eyebrow: 'Contact',
    title: 'Write to me directly',
    channels: {
      telegram: { label: 'Telegram', note: 'The fastest way to reach me' },
      email: { label: 'Email', note: 'For emails and documents' },
      whatsapp: { label: 'WhatsApp', note: 'If you prefer it' },
      phone: { label: 'Phone', note: 'Calls during working hours' },
      instagram: { label: 'Instagram', note: 'What I’m working on right now' },
      github: { label: 'GitHub', note: 'Code and projects' },
    },
  },

  reviewsPage: {
    metaTitle: 'Reviews',
    metaDescription: 'What clients say about working with Alisher Gafurov, web developer in Dushanbe.',
    eyebrow: 'Reviews',
    title: 'What clients say',
    newMetaTitle: 'Leave a review',
    newMetaDescription: 'Five quick questions: name, company, review, rating and photo.',
    newTitle: 'Leave a review',
  },

  reviewForm: {
    questions: {
      name: { question: 'What’s your name?', placeholder: 'Name' },
      company: {
        question: 'What company are you from?',
        hint: 'You can skip this',
        placeholder: 'Company name',
      },
      text: {
        question: 'How did the work go?',
        hint: 'Tell me what you needed and what aly built for you. A couple of sentences is enough.',
        placeholder: 'What you needed and what came out of it',
      },
      rating: { question: 'How many stars would you give?' },
      gender: { question: 'Which photo should go next to it?', hint: 'One of two standard photos' },
    } as Record<string, { question: string; hint?: string; placeholder?: string }>,
    genders: { male: 'Man', female: 'Woman' },
    errors: {
      nameShort: 'What’s your name?',
      nameLong: 'That name is too long',
      companyLong: 'Too long',
      textShort: 'Tell me a bit more — at least a couple of sentences',
      textLong: 'Too long — 1200 characters max',
      rating: 'Pick a rating',
      gender: 'Pick a photo',
      check: 'Please check this answer',
      failed: 'Couldn’t send it. Please try again.',
      offline: 'Looks like you’re offline. Check your connection and try again.',
    },
    next: 'Next',
    back: 'Back',
    send: 'Send review',
    sending: 'Sending…',
    afterCheck: 'Your review appears after I check it.',
    done: 'Thank you! Your review will appear on the site after I check it.',
    ratingLegend: 'Rating from 1 to 5',
    ratingOf: '{n} out of 5',
    photoLegend: 'Photo next to the review',
    honeypot: 'Don’t fill this in',
  },

  start: {
    metaTitle: 'Get a quote',
    eyebrow: 'Get a quote',
    howItWorks: 'How it works',
    steps: [
      {
        title: 'You fill in the form',
        body: 'Four short steps, about a minute. No tech words needed.',
      },
      {
        title: 'I read it and reply',
        body: 'Within a day. By email or Telegram — whichever you prefer.',
      },
      {
        title: 'We have a call',
        body: 'I ask questions and suggest the best way to do it. No commitment.',
      },
      {
        title: 'I send you an offer',
        body: 'What we’ll do, how much it costs and how long it takes. Then it’s your call.',
      },
    ],
    unsure:
      'Not sure what to write? Write it however you can — a couple of words is enough. We’ll figure out the rest together.',
    writeDirectly: 'Write to me directly',
  },

  brief: briefEn,

  thanks: {
    metaTitle: 'Request sent',
    openBot: 'Open the bot',
  },

  notFound: {
    metaTitle: 'Page not found',
    title: 'This page doesn’t exist',
    body: 'The link may be old, or there’s a typo in the address. The rest of the site is right where it was.',
  },
};

export type Dictionary = typeof en;
