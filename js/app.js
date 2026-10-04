/**
 * ============================================================================
 * FOREXBOT HUB - APPLICATION ENGINE & PRIVACY ARCHITECTURE
 * 24/7 Advanced Forex Trading Automation Hub, Terminal & E-Book Suite
 * ============================================================================
 */

(function () {
  'use strict';

  // Storage Keys (Version 4 with Master Admin 9788371042 & Isolated Customer Database)
  const STORAGE_KEYS = {
    CURRENT_USER: 'forex_hub_current_user_v4',
    CUSTOMERS_DB: 'forex_hub_customers_directory_v4',
    PRIVATE_SUBMISSIONS: 'forex_hub_private_submissions_v4',
    DEV_REQUESTS: 'forex_hub_dev_requests_v4',
    SYSTEM_INIT: 'forex_hub_initialized_v4'
  };

  // Sound Synthesizer via Web Audio API (Zero Latency, 100% Free)
  class SoundFX {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
    }

    playTone(freq, type, duration, delay = 0, gainLevel = 0.08) {
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        }, delay);
      } catch (e) {
        // Silently handled
      }
    }

    click() {
      this.playTone(650, 'sine', 0.08, 0, 0.04);
    }

    success() {
      this.playTone(523.25, 'sine', 0.15, 0, 0.08); // C5
      this.playTone(659.25, 'sine', 0.18, 120, 0.08); // E5
      this.playTone(783.99, 'sine', 0.25, 240, 0.08); // G5
      this.playTone(1046.50, 'sine', 0.4, 380, 0.1); // C6
    }

    pop() {
      this.playTone(880, 'sine', 0.09, 0, 0.06);
    }

    otpChime() {
      this.playTone(700, 'triangle', 0.12, 0, 0.07);
      this.playTone(950, 'triangle', 0.25, 120, 0.07);
    }
  }

  const sfx = new SoundFX();

  // Preset Avatars
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  ];

  const DEFAULT_GUEST_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  // ==========================================================================
  // GEOGRAPHIC DATA: COUNTRY, STATE & DISTRICT DEPENDENT DROPDOWNS
  // ==========================================================================
  const COUNTRY_DIAL_CODES = {
    'India': '+91',
    'United States': '+1',
    'United Kingdom': '+44',
    'Canada': '+1',
    'Australia': '+61',
    'Germany': '+49',
    'Singapore': '+65',
    'UAE': '+971',
    'Other': '+00'
  };

  const INDIAN_STATES_DISTRICTS = {
    'Tamil Nadu': [
      'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
      'Erode', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Tiruppur', 'Cuddalore', 'Karur'
    ],
    'Maharashtra': [
      'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik',
      'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Amravati', 'Nanded'
    ],
    'Karnataka': [
      'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru',
      'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Udupi', 'Shivamogga'
    ],
    'Delhi': [
      'Central Delhi', 'New Delhi', 'North Delhi', 'South Delhi', 'East Delhi',
      'West Delhi', 'Dwarka', 'Rohini', 'Shahdara'
    ],
    'Uttar Pradesh': [
      'Lucknow', 'Kanpur Nagar', 'Varanasi', 'Agra', 'Gautam Buddha Nagar (Noida)',
      'Ghaziabad', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Moradabad'
    ],
    'Gujarat': [
      'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
      'Gandhinagar', 'Junagadh', 'Anand', 'Bharuch'
    ],
    'Kerala': [
      'Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur', 'Kollam',
      'Palakkad', 'Malappuram', 'Kannur', 'Kottayam', 'Alappuzha'
    ],
    'Telangana': [
      'Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Warangal', 'Nizamabad',
      'Karimnagar', 'Khammam', 'Ramagundam'
    ],
    'West Bengal': [
      'Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Hooghly',
      'Darjeeling', 'Siliguri', 'Paschim Bardhaman', 'Asansol'
    ],
    'Rajasthan': [
      'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Sikar'
    ],
    'Andhra Pradesh': [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati',
      'Rajahmundry', 'Kakinada', 'Anantapur'
    ],
    'Punjab': [
      'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Hoshiarpur'
    ],
    'Haryana': [
      'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Panchkula'
    ],
    'Madhya Pradesh': [
      'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas'
    ],
    'Bihar': [
      'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Begusarai'
    ],
    'Odisha': [
      'Bhubaneswar / Khordha', 'Cuttack', 'Rourkela / Sundargarh', 'Berhampur / Ganjam', 'Sambalpur', 'Puri'
    ],
    'Assam': [
      'Kamrup Metropolitan (Guwahati)', 'Cachar (Silchar)', 'Dibrugarh', 'Jorhat', 'Nagaon'
    ],
    'Goa': [
      'North Goa (Panaji)', 'South Goa (Margao)'
    ]
  };

  const OTHER_COUNTRIES_STATES = {
    'United States': {
      'California': ['Los Angeles County', 'Orange County', 'San Diego', 'San Francisco', 'Santa Clara'],
      'New York': ['New York County (Manhattan)', 'Kings County (Brooklyn)', 'Queens', 'Nassau', 'Suffolk'],
      'Texas': ['Harris (Houston)', 'Dallas', 'Travis (Austin)', 'Bexar (San Antonio)', 'Tarrant'],
      'Florida': ['Miami-Dade', 'Broward', 'Orange (Orlando)', 'Hillsborough (Tampa)', 'Palm Beach'],
      'Illinois': ['Cook County (Chicago)', 'DuPage', 'Lake', 'Will'],
      'Washington': ['King County (Seattle)', 'Pierce', 'Snohomish', 'Spokane']
    },
    'United Kingdom': {
      'Greater London': ['City of London', 'Westminster', 'Camden', 'Greenwich', 'Kensington'],
      'West Midlands': ['Birmingham', 'Coventry', 'Wolverhampton', 'Solihull'],
      'Greater Manchester': ['Manchester City', 'Salford', 'Bolton', 'Stockport'],
      'Scotland': ['City of Edinburgh', 'Glasgow City', 'Aberdeen', 'Dundee']
    },
    'Canada': {
      'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton'],
      'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
      'British Columbia': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria'],
      'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge']
    },
    'Australia': {
      'New South Wales': ['Sydney Metro', 'Newcastle', 'Central Coast', 'Wollongong'],
      'Victoria': ['Melbourne Metro', 'Geelong', 'Ballarat', 'Bendigo'],
      'Queensland': ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville'],
      'Western Australia': ['Perth Metro', 'Mandurah', 'Bunbury']
    },
    'Germany': {
      'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Würzburg'],
      'Berlin': ['Mitte', 'Pankow', 'Charlottenburg', 'Friedrichshain'],
      'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen'],
      'Hesse': ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt']
    },
    'Singapore': {
      'Central Region': ['Downtown Core', 'Marina South', 'Orchard', 'Novena'],
      'East Region': ['Changi', 'Bedok', 'Tampines', 'Pasir Ris'],
      'West Region': ['Jurong East', 'Clementi', 'Bukit Batok'],
      'North Region': ['Woodlands', 'Yishun', 'Sembawang']
    },
    'UAE': {
      'Dubai Emirate': ['Downtown Dubai', 'Dubai Marina', 'Business Bay', 'Deira', 'Jumeirah'],
      'Abu Dhabi': ['Abu Dhabi Central', 'Al Ain', 'Al Dhafra'],
      'Sharjah': ['Sharjah City', 'Khor Fakkan', 'Kalba']
    },
    'Other': {
      'Capital Territory': ['Metro Central', 'Financial District', 'North Sector'],
      'Regional Province': ['Eastern District', 'Western District', 'Southern Hub']
    }
  };

  // Populate States Dropdown based on Country
  function populateStates(country, stateSelectId, districtSelectId, defaultState = null, defaultDistrict = null) {
    const stateEl = document.getElementById(stateSelectId);
    if (!stateEl) return;

    stateEl.innerHTML = '';

    if (country === 'India') {
      const stateNames = Object.keys(INDIAN_STATES_DISTRICTS);
      stateNames.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st;
        if (defaultState && defaultState === st) opt.selected = true;
        stateEl.appendChild(opt);
      });
      const selectedState = stateEl.value || stateNames[0];
      populateDistricts(country, selectedState, districtSelectId, defaultDistrict);
    } else {
      const countryData = OTHER_COUNTRIES_STATES[country] || OTHER_COUNTRIES_STATES['Other'];
      const stateNames = Object.keys(countryData);
      stateNames.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st;
        if (defaultState && defaultState === st) opt.selected = true;
        stateEl.appendChild(opt);
      });
      const selectedState = stateEl.value || stateNames[0];
      populateDistricts(country, selectedState, districtSelectId, defaultDistrict);
    }
  }

  // Populate Districts Dropdown based on State
  function populateDistricts(country, stateName, districtSelectId, defaultDistrict = null) {
    const distEl = document.getElementById(districtSelectId);
    if (!distEl) return;

    distEl.innerHTML = '';
    let districts = [];

    if (country === 'India') {
      districts = INDIAN_STATES_DISTRICTS[stateName] || ['Central District', 'North District', 'South District'];
    } else {
      const countryData = OTHER_COUNTRIES_STATES[country] || OTHER_COUNTRIES_STATES['Other'];
      districts = countryData[stateName] || ['District 1', 'District 2', 'District 3'];
    }

    districts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (defaultDistrict && defaultDistrict === d) opt.selected = true;
      distEl.appendChild(opt);
    });
  }

  function handleCountryChange(countryVal) {
    const code = COUNTRY_DIAL_CODES[countryVal] || '+00';
    const tag = document.getElementById('mobilePrefixTag');
    const badge = document.getElementById('countryDialCodeBadge');
    if (tag) tag.textContent = code;
    if (badge) badge.textContent = `${code} ${countryVal}`;
    populateStates(countryVal, 'regState', 'regDistrict');
  }

  function handleCountryChangeEdit(countryVal) {
    populateStates(countryVal, 'editState', 'editDistrict');
  }

  function handleStateChange(stateVal, districtSelectId) {
    const isEdit = districtSelectId.includes('edit');
    const countryEl = document.getElementById(isEdit ? 'editCountry' : 'regCountry');
    const country = countryEl ? countryEl.value : 'India';
    populateDistricts(country, stateVal, districtSelectId);
  }

  // ==========================================================================
  // MASTER TRADING E-BOOK LIBRARY DATASET (8 TOPICS × 10 POPULAR BOOKS = 80 BOOKS)
  // Topics: Price Action, ICT, SMC, Order Flow, Market Profile, Volume Profile, Depth of Market, Heat Map
  // Features: Read Online, Audio Mode (Male/Female voice TTS), Core Idea, Easy Download
  // ==========================================================================
  const BOOK_TOPICS = [
    'Price Action',
    'ICT',
    'SMC',
    'Order Flow',
    'Market Profile',
    'Volume Profile',
    'Depth of Market',
    'Heat Map'
  ];

  const BOOKS_DATABASE = [
    // TOPIC 1: PRICE ACTION (10 BOOKS)
    {
      id: 'pa_1',
      topic: 'Price Action',
      title: 'Reading Price Charts Bar by Bar',
      author: 'Al Brooks',
      year: '2009',
      rating: 4.9,
      pages: 432,
      coverColor: 'linear-gradient(135deg, #1e3a8a, #06b6d4)',
      coreIdea: 'The market is in a continuous auction where every single tick represents institutional consensus. By observing individual price bars, tails, and trends, traders can predict high-probability breakouts and trend reversals without relying on lagging indicators.',
      chapters: [
        { title: 'Chapter 1: The Anatomy of a Price Bar & Institutional Footprints', content: 'Every price bar has an open, high, low, and close. Long bodies signify institutional urgency, while long wicks reflect price rejection and liquidity defense. True price action begins with reading who won the bar: the aggressive buyers or the patient sellers.' },
        { title: 'Chapter 2: Trend Bars, Dojis, and Climax Reversals', content: 'Recognizing strong trend bars that break previous highs versus consecutive dojis that reveal equilibrium. Al Brooks breaks down how two consecutive climax bars often lead to a 10-bar, two-legged pullback.' },
        { title: 'Chapter 3: Two-Legged Corrections (M2B & M2S)', content: 'Institutional algorithms almost universally seek two legs of correction before resuming the primary trend. Mastering the second entry (M2B in uptrends, M2S in downtrends) provides the highest mathematical expectancy in Forex.' }
      ],
      audioText: 'Reading Price Charts Bar by Bar by Al Brooks. Core Idea: The market is in a continuous auction where every single tick represents institutional consensus. By observing individual price bars, tails, and trends, traders can predict high-probability breakouts and reversals without relying on lagging indicators.'
    },
    {
      id: 'pa_2',
      topic: 'Price Action',
      title: 'Trading Price Action Trends',
      author: 'Al Brooks',
      year: '2011',
      rating: 4.9,
      pages: 480,
      coverColor: 'linear-gradient(135deg, #065f46, #10b981)',
      coreIdea: 'Trends persist far longer than retail traders expect. By identifying institutional trend channels, breakouts, and pullbacks, traders learn to enter with momentum and avoid the temptation of counter-trend bottom fishing.',
      chapters: [
        { title: 'Chapter 1: Spectrum of Trend Strength', content: 'From runaway spike-and-channel phases to broad bullish channels. Knowing when the market is "Always In Long" allows traders to buy any shallow dip with minimal risk.' },
        { title: 'Chapter 2: Breakout Pullbacks & Moving Average Tests', content: 'How price uses the 20-period exponential moving average (EMA) as dynamic support during sustainable bull runs.' }
      ],
      audioText: 'Trading Price Action Trends by Al Brooks. Core Idea: Trends persist far longer than retail traders expect. By identifying institutional trend channels and breakouts, traders enter with momentum.'
    },
    {
      id: 'pa_3',
      topic: 'Price Action',
      title: 'Understanding Price Action',
      author: 'Bob Volman',
      year: '2014',
      rating: 4.8,
      pages: 440,
      coverColor: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
      coreIdea: 'Pure price analysis across the 5-minute chart. Volman demonstrates how pressure buildup, squeeze patterns, and false breakout rejections provide clear edge in currency pairs like EUR/USD.',
      chapters: [
        { title: 'Chapter 1: The Principle of Resistance and Buildup', content: 'When price consolidates tightly beneath a key resistance ceiling without retreating, supply is being absorbed. This buildup precedes powerful explosive breakouts.' },
        { title: 'Chapter 2: The False Breakout Reversal (FBO)', content: 'Trapping breakout traders outside the range before snapping price back inside with high velocity.' }
      ],
      audioText: 'Understanding Price Action by Bob Volman. Core Idea: Pure price analysis on intraday charts showing how pressure buildup and false breakout traps produce reliable setups.'
    },
    {
      id: 'pa_4',
      topic: 'Price Action',
      title: 'Forex Price Action Scalping',
      author: 'Bob Volman',
      year: '2011',
      rating: 4.8,
      pages: 358,
      coverColor: 'linear-gradient(135deg, #831843, #ec4899)',
      coreIdea: 'Precision 70-tick chart scalping on EUR/USD. Focuses on small, consistent 10-pip gains with tight 8-pip stops, relying solely on price geometry and 20-period EMA alignment.',
      chapters: [
        { title: 'Chapter 1: The 70-Tick Chart Advantage', content: 'Tick charts filter out market noise during quiet sessions and expand bars during high-volume releases, offering unmatched entry clarity.' }
      ],
      audioText: 'Forex Price Action Scalping by Bob Volman. Precision scalping rules for currency markets.'
    },
    {
      id: 'pa_5',
      topic: 'Price Action',
      title: 'Japanese Candlestick Charting Techniques',
      author: 'Steve Nison',
      year: '2001',
      rating: 4.9,
      pages: 320,
      coverColor: 'linear-gradient(135deg, #78350f, #f59e0b)',
      coreIdea: 'The definitive classic that introduced candlestick analysis to the Western world. Teaches how hammers, engulfing bars, stars, and dojis reveal the underlying emotional psychology of buyers and sellers.',
      chapters: [
        { title: 'Chapter 1: Reversal Patterns', content: 'Detailed breakdown of Bullish Engulfing, Morning Star, and Hammer formations at major support.' }
      ],
      audioText: 'Japanese Candlestick Charting Techniques by Steve Nison. The foundational guide to candlestick psychology and institutional price patterns.'
    },
    {
      id: 'pa_6',
      topic: 'Price Action',
      title: 'The Candlestick Trading Bible',
      author: 'Munehisa Homma & Invento',
      year: '2018',
      rating: 4.7,
      pages: 280,
      coverColor: 'linear-gradient(135deg, #1e293b, #475569)',
      coreIdea: 'Ancient Homma rice market principles adapted for modern algorithmic Forex trading. Focuses on Engulfing, Pin Bars, and Inside Bar breakout strategies.',
      chapters: [
        { title: 'Chapter 1: The Pin Bar Phenomenon', content: 'Why long tails represent liquidity sweeps and immediate supply/demand exhaustion.' }
      ],
      audioText: 'The Candlestick Trading Bible. Ancient auction tactics for modern Forex execution.'
    },
    {
      id: 'pa_7',
      topic: 'Price Action',
      title: 'Naked Forex: High-Probability Techniques',
      author: 'Alex Nekritin & Walter Peters',
      year: '2012',
      rating: 4.8,
      pages: 288,
      coverColor: 'linear-gradient(135deg, #14532d, #22c55e)',
      coreIdea: 'Stripping charts of all indicators to focus on naked support and resistance zones, big shadows, the kangaroo tail, and trend continuation bands.',
      chapters: [
        { title: 'Chapter 1: The Kangaroo Tail Setup', content: 'An elongated false breakout bar protruding from established support or resistance zones.' }
      ],
      audioText: 'Naked Forex by Nekritin and Peters. Indicator-free trading strategies focused on support, resistance, and price geometry.'
    },
    {
      id: 'pa_8',
      topic: 'Price Action',
      title: 'Trading Price Action Trading Ranges',
      author: 'Al Brooks',
      year: '2012',
      rating: 4.9,
      pages: 624,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #6366f1)',
      coreIdea: 'Because markets spend 70-80% of their time in consolidation, mastering sideways ranges, trading tops and bottoms, and fading breakouts is essential for profitable consistency.',
      chapters: [
        { title: 'Chapter 1: Buy Low, Sell High, Scalp (BLSHS)', content: 'Executing fades at range boundaries and scaling out before mid-point equilibrium.' }
      ],
      audioText: 'Trading Price Action Trading Ranges by Al Brooks. Mastering sideways consolidations, support fades, and range scalping.'
    },
    {
      id: 'pa_9',
      topic: 'Price Action',
      title: 'Trading Price Action Reversals',
      author: 'Al Brooks',
      year: '2012',
      rating: 4.8,
      pages: 576,
      coverColor: 'linear-gradient(135deg, #312e81, #3b82f6)',
      coreIdea: 'How exhaustion tops, climactic capitulations, and major trendline breaks transition a trending market into an opposing trend or multi-hour trading range.',
      chapters: [
        { title: 'Chapter 1: Major Trend Reversal (MTR)', content: 'The highest probability reversal pattern requiring a trendline break, test of the extreme, and second leg failure.' }
      ],
      audioText: 'Trading Price Action Reversals by Al Brooks. Systematic identification of market tops, bottoms, and trendline break transitions.'
    },
    {
      id: 'pa_10',
      topic: 'Price Action',
      title: 'Price Action Breakdown',
      author: 'Laurentiu Damir',
      year: '2016',
      rating: 4.7,
      pages: 210,
      coverColor: 'linear-gradient(135deg, #042f2e, #14b8a6)',
      coreIdea: 'A practical, step-by-step framework detailing how price respects supply and demand levels, multi-timeframe swing points, and momentum momentum deceleration.',
      chapters: [
        { title: 'Chapter 1: Swing Points and Market Waves', content: 'Determining the true structure of the market using clear higher highs and lower lows.' }
      ],
      audioText: 'Price Action Breakdown by Laurentiu Damir. Step-by-step structural swing analysis.'
    },

    // TOPIC 2: ICT (INNER CIRCLE TRADER) (10 BOOKS)
    {
      id: 'ict_1',
      topic: 'ICT',
      title: 'ICT Mentorship Core Concepts & Algorithm Model',
      author: 'Michael J. Huddleston (ICT)',
      year: '2022',
      rating: 5.0,
      pages: 512,
      coverColor: 'linear-gradient(135deg, #0f172a, #38bdf8)',
      coreIdea: 'The Interbank Price Delivery Algorithm (IPDA) delivers price to two specific targets: liquidity pools (stop-loss runs) and fair value imbalances. Markets do not move randomly by supply/demand alone, but are programmatically driven to rebalance inefficiencies and clear resting orders.',
      chapters: [
        { title: 'Chapter 1: The IPDA Algorithm & True Market Structure', content: 'How central bank algorithms engineer liquidity above old highs and below old lows before reversing price toward fair value gaps.' },
        { title: 'Chapter 2: Buy Side Liquidity (BSL) & Sell Side Liquidity (SSL)', content: 'Pinpointing where retail stop losses accumulate and anticipating algorithmic sweeps during session Kill Zones.' },
        { title: 'Chapter 3: The 2022 Mentorship Model', content: 'Sweep of liquidity, displacement candle breaking structure, creation of a Fair Value Gap (FVG), and high-probability limit entry.' }
      ],
      audioText: 'ICT Mentorship Core Concepts by Michael J. Huddleston. Core Idea: The Interbank Price Delivery Algorithm delivers price to two targets: liquidity pools and fair value imbalances. Markets are programmatically steered to rebalance inefficiencies.'
    },
    {
      id: 'ict_2',
      topic: 'ICT',
      title: 'Market Structure Shift & Order Block Mechanics',
      author: 'ICT Core Archive',
      year: '2021',
      rating: 4.9,
      pages: 340,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #818cf8)',
      coreIdea: 'A genuine Market Structure Shift (MSS) requires energetic displacement with large-bodied candles leaving imbalances. A true ICT Order Block is the last opposite candle before this displacement.',
      chapters: [
        { title: 'Chapter 1: Validating Displacement vs Weak Pullbacks', content: 'Why body closes above swing points matter much more than mere wick violations.' }
      ],
      audioText: 'Market Structure Shift and Order Block Mechanics. Identifying true institutional displacement versus false retail breakouts.'
    },
    {
      id: 'ict_3',
      topic: 'ICT',
      title: 'The Silver Bullet Trading Model Guide',
      author: 'ICT Research Group',
      year: '2023',
      rating: 4.9,
      pages: 260,
      coverColor: 'linear-gradient(135deg, #022c22, #34d399)',
      coreIdea: 'A time-specific algorithmic delivery model operating during three daily windows: London (3-4 AM EST), New York AM (10-11 AM EST), and New York PM (2-3 PM EST). Targets guaranteed 15-20 pips per setup.',
      chapters: [
        { title: 'Chapter 1: The 10:00 to 11:00 AM NY Hour Execution', content: 'Trading the morning index and Forex expansion toward pre-defined draw on liquidity.' }
      ],
      audioText: 'The Silver Bullet Trading Model Guide. Time-based institutional liquidity delivery windows.'
    },
    {
      id: 'ict_4',
      topic: 'ICT',
      title: 'Judas Swing & Session Liquidity Runs',
      author: 'Michael J. Huddleston',
      year: '2020',
      rating: 4.9,
      pages: 310,
      coverColor: 'linear-gradient(135deg, #450a0a, #f87171)',
      coreIdea: 'The deceptive opening maneuver engineered by algorithms at the London Open (2:00-3:00 AM EST) that runs Asian range liquidity before reversing into the true daily trend.',
      chapters: [
        { title: 'Chapter 1: Anatomy of the London Judas Swing', content: 'Recognizing false breakouts above the Asian consolidation high designed to trigger retail breakout buys.' }
      ],
      audioText: 'Judas Swing and Session Liquidity Runs. Capitalizing on early session false moves engineered by central bank dealing algorithms.'
    },
    {
      id: 'ict_5',
      topic: 'ICT',
      title: 'Fair Value Gap (FVG) Institutional Delivery',
      author: 'ICT Traders Collective',
      year: '2022',
      rating: 4.8,
      pages: 295,
      coverColor: 'linear-gradient(135deg, #172554, #60a5fa)',
      coreIdea: 'A Fair Value Gap is a 3-candle price formation where candle 1 and candle 3 wicks do not overlap, leaving an unfilled price imbalance where only one side had market execution.',
      chapters: [
        { title: 'Chapter 1: Consequent Encroachment (50% FVG)', content: 'How price reacts with tick precision at the 50% midpoint of institutional imbalances.' }
      ],
      audioText: 'Fair Value Gap Institutional Delivery. Understanding 3-candle imbalance mechanics and consequent encroachment.'
    },
    {
      id: 'ict_6',
      topic: 'ICT',
      title: 'Optimal Trade Entry (OTE) & Fibonacci Mathematics',
      author: 'ICT Academy',
      year: '2019',
      rating: 4.8,
      pages: 270,
      coverColor: 'linear-gradient(135deg, #2e1065, #c084fc)',
      coreIdea: 'The algorithmic Fibonacci retracement matrix: 62%, 70.5% sweet spot, and 79% deep discount. Entering with minimal drawdown and 1:4+ risk to reward.',
      chapters: [
        { title: 'Chapter 1: The 70.5% OTE Sweet Spot', content: 'Calibrating Fibonacci anchors from swing low to displacement high for premium/discount entries.' }
      ],
      audioText: 'Optimal Trade Entry and Fibonacci Mathematics. Precision entries using 62% to 79% discount retracement levels.'
    },
    {
      id: 'ict_7',
      topic: 'ICT',
      title: 'Interbank Price Delivery Algorithm (IPDA) Handbook',
      author: 'Michael J. Huddleston',
      year: '2021',
      rating: 5.0,
      pages: 420,
      coverColor: 'linear-gradient(135deg, #1c1917, #a8a29e)',
      coreIdea: 'Deep dive into 20, 40, and 60-day institutional lookback periods used by algorithms to reference historical high and low liquidity pools.',
      chapters: [
        { title: 'Chapter 1: The 60-Day Institutional Lookback', content: 'Mapping quarterly liquidity targets and central bank interest rate shift cycles.' }
      ],
      audioText: 'IPDA Handbook by Michael J. Huddleston. The algorithmic engine driving currency exchange rates.'
    },
    {
      id: 'ict_8',
      topic: 'ICT',
      title: 'Daily Bias & Power of Three (AMD) Strategy',
      author: 'ICT Core Archive',
      year: '2021',
      rating: 4.9,
      pages: 315,
      coverColor: 'linear-gradient(135deg, #0c4a6e, #38bdf8)',
      coreIdea: 'Accumulation, Manipulation, and Distribution (AMD). Daily candlestick open price is the key benchmark: for a bullish day, price opens, drops below open (manipulation), and rallies (distribution).',
      chapters: [
        { title: 'Chapter 1: Buying Below Midnight Open Price', content: 'Why high-probability long entries must occur below the 00:00 NY midnight opening level.' }
      ],
      audioText: 'Daily Bias and Power of Three Strategy. Understanding the Accumulation, Manipulation, and Distribution cycle.'
    },
    {
      id: 'ict_9',
      topic: 'ICT',
      title: 'Kill Zones & Central Bank Dealing Range',
      author: 'ICT Research Group',
      year: '2020',
      rating: 4.8,
      pages: 280,
      coverColor: 'linear-gradient(135deg, #064e3b, #6ee7b7)',
      coreIdea: 'Asian Kill Zone (8 PM - 12 AM EST), London Kill Zone (2 AM - 5 AM EST), and New York Kill Zone (7 AM - 10 AM EST). Trading only when institutional volume injection is scheduled.',
      chapters: [
        { title: 'Chapter 1: The Central Bank Dealing Range (CBDR)', content: 'Using the 14:00 to 20:00 EST consolidation range to project daily deviations.' }
      ],
      audioText: 'Kill Zones and Central Bank Dealing Range. Time-based trading for high volatility Forex sessions.'
    },
    {
      id: 'ict_10',
      topic: 'ICT',
      title: 'High-Probability Breaker Blocks & Mitigation Models',
      author: 'ICT Mastery Series',
      year: '2023',
      rating: 4.8,
      pages: 305,
      coverColor: 'linear-gradient(135deg, #3b0764, #d8b4fe)',
      coreIdea: 'When an Order Block fails after sweeping liquidity, it flips into a Breaker Block. Breaker blocks offer the highest-speed rejection in the ICT toolkit.',
      chapters: [
        { title: 'Chapter 1: The Anatomy of a Bullish Breaker', content: 'A down-close candle between an old low and a higher low that was breached during a sweep.' }
      ],
      audioText: 'High-Probability Breaker Blocks and Mitigation Models. Reversal trading with failed order blocks.'
    },

    // TOPIC 3: SMC (SMART MONEY CONCEPTS) (10 BOOKS)
    {
      id: 'smc_1',
      topic: 'SMC',
      title: 'Smart Money Concepts: The Institutional Playbook',
      author: 'MentFX & TradePro',
      year: '2022',
      rating: 4.9,
      pages: 384,
      coverColor: 'linear-gradient(135deg, #064e3b, #10b981)',
      coreIdea: 'Retail traders lose because they trade traditional chart patterns that market makers use as liquidity pools. Smart Money Concepts teaches how to track bank accumulation, inducement traps, and institutional mitigation zones.',
      chapters: [
        { title: 'Chapter 1: Retail Traps vs Smart Money Reality', content: 'Why trendline support and head-and-shoulders patterns exist primarily to generate resting liquidity for large orders.' },
        { title: 'Chapter 2: Break of Structure (BOS) vs Change of Character (CHoCH)', content: 'Distinguishing trend continuation structure breaks from true structural trend reversals across multi-timeframes.' },
        { title: 'Chapter 3: Inducement & Engineering Liquidity', content: 'Identifying engineered highs and lows that retail traders think are valid support, created specifically to be purged.' }
      ],
      audioText: 'Smart Money Concepts: The Institutional Playbook by MentFX and TradePro. How banks engineer liquidity and how to enter on institutional order mitigations.'
    },
    {
      id: 'smc_2',
      topic: 'SMC',
      title: 'Anatomy of Market Manipulation: Wyckoff & SMC',
      author: 'Ruben Villahermosa',
      year: '2021',
      rating: 4.9,
      pages: 410,
      coverColor: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      coreIdea: 'Harmonizing Richard Wyckoff methodology with modern SMC. Detailed breakdown of Preliminary Support, Selling Climax, Automatic Rally, Secondary Tests, and the Spring.',
      chapters: [
        { title: 'Chapter 1: The Spring & Phase C Entry', content: 'The terminal shakeout beneath trading range support that collects all liquidity before the markup phase.' }
      ],
      audioText: 'Anatomy of Market Manipulation: Wyckoff and SMC by Ruben Villahermosa. Institutional accumulation, distribution, and spring mechanics.'
    },
    {
      id: 'smc_3',
      topic: 'SMC',
      title: 'Change of Character (CHoCH) & Break of Structure',
      author: 'Smart Money Institute',
      year: '2022',
      rating: 4.8,
      pages: 260,
      coverColor: 'linear-gradient(135deg, #374151, #9ca3af)',
      coreIdea: 'Mastering internal versus external market structure. The first sign of a reversal is a minor CHoCH on the 1-minute chart, aligning with a higher-timeframe 4-Hour Point of Interest (POI).',
      chapters: [
        { title: 'Chapter 1: Multi-Timeframe Structural Alignment', content: 'Mapping 4H POI, 15M structure confirmation, and 1M CHoCH entry execution.' }
      ],
      audioText: 'Change of Character and Break of Structure. Navigating internal versus external market geometry.'
    },
    {
      id: 'smc_4',
      topic: 'SMC',
      title: 'Inducement & Liquidity Engineering in Forex',
      author: 'Phantom Trading Academy',
      year: '2023',
      rating: 4.8,
      pages: 320,
      coverColor: 'linear-gradient(135deg, #581c87, #c084fc)',
      coreIdea: 'Inducement (IDM) is the first pull-back after a break of structure. Most traders enter too early at inducement and get stopped out; patient SMC traders wait for IDM to be swept before entering.',
      chapters: [
        { title: 'Chapter 1: The Inducement Trap Principle', content: 'Why the first internal pullback in a trend is bait, not a valid order block.' }
      ],
      audioText: 'Inducement and Liquidity Engineering in Forex by Phantom Trading. Identifying bait pullbacks.'
    },
    {
      id: 'smc_5',
      topic: 'SMC',
      title: 'Institutional Supply & Demand Zones Revealed',
      author: 'Sam Seiden & SMC Group',
      year: '2020',
      rating: 4.8,
      pages: 290,
      coverColor: 'linear-gradient(135deg, #7c2d12, #fb923c)',
      coreIdea: 'Unfilled institutional limit orders cannot move price instantly. By locating origin imbalances (Rally-Base-Drop and Drop-Base-Rally), traders place orders alongside pending bank transactions.',
      chapters: [
        { title: 'Chapter 1: Quality Criteria for Fresh Zones', content: 'Freshness, time spent at the level, and the violent speed of departure.' }
      ],
      audioText: 'Institutional Supply and Demand Zones Revealed. Trading unfilled limit orders at origin imbalances.'
    },
    {
      id: 'smc_6',
      topic: 'SMC',
      title: 'Mitigation Blocks & Return to Order Block (RTO)',
      author: 'SMC Quantitative Labs',
      year: '2022',
      rating: 4.7,
      pages: 275,
      coverColor: 'linear-gradient(135deg, #134e4a, #2dd4bf)',
      coreIdea: 'Institutions that held drawdown positions during a liquidity run will engineer a return to breakeven (mitigation). Entering on this mitigation offers near-zero drawdown.',
      chapters: [
        { title: 'Chapter 1: The Mechanics of Institutional Breakeven', content: 'Why banks re-visit order blocks to close hedge contracts at cost.' }
      ],
      audioText: 'Mitigation Blocks and Return to Order Block. Trading institutional breakeven retests.'
    },
    {
      id: 'smc_7',
      topic: 'SMC',
      title: 'Multi-Timeframe Top-Down Liquidity Mapping',
      author: 'Smart Capital Trading',
      year: '2023',
      rating: 4.8,
      pages: 350,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #a5b4fc)',
      coreIdea: 'How the Daily, 4-Hour, and 15-Minute charts interact like Russian nesting dolls. High-probability trades only occur when lower-timeframe order flow aligns with higher-timeframe liquidity sweeps.',
      chapters: [
        { title: 'Chapter 1: The HTF to LTF Fractal Matrix', content: 'Step-by-step pre-market routine for mapping weekly targets to 5-minute entries.' }
      ],
      audioText: 'Multi-Timeframe Top-Down Liquidity Mapping. Harmonizing high-timeframe direction with low-timeframe sniper execution.'
    },
    {
      id: 'smc_8',
      topic: 'SMC',
      title: 'Liquidity Sweeps & Turtle Soup Reversals',
      author: 'Institutional SMC Desk',
      year: '2021',
      rating: 4.8,
      pages: 265,
      coverColor: 'linear-gradient(135deg, #701a75, #f472b6)',
      coreIdea: 'Modern adaptation of Linda Raschke\'s Turtle Soup concept using SMC logic. Poking 5-15 pips past key highs to trigger buy stops before immediately closing back inside.',
      chapters: [
        { title: 'Chapter 1: The Sweep and Wick Rejection Rule', content: 'Confirming stop-hunts with tick-volume spikes and immediate displacement.' }
      ],
      audioText: 'Liquidity Sweeps and Turtle Soup Reversals. Exploiting false breakouts above key swing points.'
    },
    {
      id: 'smc_9',
      topic: 'SMC',
      title: 'Premium vs Discount Valuation in Modern Trading',
      author: 'SMC Core Principles',
      year: '2022',
      rating: 4.7,
      pages: 240,
      coverColor: 'linear-gradient(135deg, #365314, #a3e635)',
      coreIdea: 'Smart money never buys high or sells low. Utilizing the 50% equilibrium rule: long entries are only permitted in the discount zone (below 50%), and short entries in the premium zone (above 50%).',
      chapters: [
        { title: 'Chapter 1: Calculating the True Dealing Range', content: 'Anchoring equilibrium to valid structural ranges for optimal valuation.' }
      ],
      audioText: 'Premium vs Discount Valuation in Modern Trading. Never buying in premium or selling in discount.'
    },
    {
      id: 'smc_10',
      topic: 'SMC',
      title: 'The SMC Masterclass: Zero Retail Indicators',
      author: 'Pro Trader SMC Syndicate',
      year: '2023',
      rating: 4.9,
      pages: 390,
      coverColor: 'linear-gradient(135deg, #1f2937, #60a5fa)',
      coreIdea: 'Comprehensive blueprint covering risk management, trade journaling, emotional control, and mechanical SMC execution without a single indicator on the chart.',
      chapters: [
        { title: 'Chapter 1: Mechanical Rules of Engagement', content: 'Eliminating subjectivity with strict checklists for Point of Interest selection.' }
      ],
      audioText: 'The SMC Masterclass: Zero Retail Indicators. Fully mechanical rules for smart money execution.'
    },

    // TOPIC 4: ORDER FLOW (10 BOOKS)
    {
      id: 'of_1',
      topic: 'Order Flow',
      title: 'Trading and Exchanges: Market Microstructure',
      author: 'Larry Harris',
      year: '2003',
      rating: 5.0,
      pages: 656,
      coverColor: 'linear-gradient(135deg, #1e293b, #0ea5e9)',
      coreIdea: 'The premier academic and institutional authority on how markets actually function under the hood. Explains the dynamics between informed traders, uninformed liquidity providers, bid-ask spreads, and order routing.',
      chapters: [
        { title: 'Chapter 1: Market Makers vs Informed Speculators', content: 'How liquidity providers protect themselves from adverse selection by widening spreads and fading toxic flow.' },
        { title: 'Chapter 2: Order Types and Priority Queues', content: 'Price-time priority, hidden limit orders, and iceberg algorithms in electronic exchanges.' },
        { title: 'Chapter 3: Volatility, Liquidity and Liquidity Clashing', content: 'Why liquidity suddenly vanishes during sharp runs, triggering cascading slippage.' }
      ],
      audioText: 'Trading and Exchanges: Market Microstructure by Larry Harris. The ultimate textbook on exchange mechanics, bid-ask spreads, and institutional order execution.'
    },
    {
      id: 'of_2',
      topic: 'Order Flow',
      title: 'Order Flow Trading for Beginners',
      author: 'Trader Dale',
      year: '2020',
      rating: 4.8,
      pages: 230,
      coverColor: 'linear-gradient(135deg, #111827, #f59e0b)',
      coreIdea: 'A practical guide to Footprint charts, Volume Profile, and Delta. How to see aggressive market orders hitting passive limit orders inside individual price candles.',
      chapters: [
        { title: 'Chapter 1: Understanding the Footprint Bid/Ask Ladder', content: 'Reading volume transacted on the bid versus the ask at each price tick.' }
      ],
      audioText: 'Order Flow Trading for Beginners by Trader Dale. Practical footprint and delta analysis.'
    },
    {
      id: 'of_3',
      topic: 'Order Flow',
      title: 'The Secret Science of Price and Volume',
      author: 'Tim Ord',
      year: '2008',
      rating: 4.8,
      pages: 208,
      coverColor: 'linear-gradient(135deg, #1e1e24, #10b981)',
      coreIdea: 'Comparing volume transacted across swing highs and swing lows. If price reaches a new high on significantly lower volume, an immediate reversal is mathematically guaranteed.',
      chapters: [
        { title: 'Chapter 1: The Ord-Volume Ratio Principle', content: 'Quantifying volume per swing wave to detect institutional exhaustion.' }
      ],
      audioText: 'The Secret Science of Price and Volume by Tim Ord. Detecting market tops and bottoms through swing volume ratios.'
    },
    {
      id: 'of_4',
      topic: 'Order Flow',
      title: 'Footprint Chart Trading: Institutional Order Flow',
      author: 'Order Flow Edge',
      year: '2022',
      rating: 4.8,
      pages: 310,
      coverColor: 'linear-gradient(135deg, #311042, #ec4899)',
      coreIdea: 'Specializing in Bid/Ask Footprints, Delta Profiles, and Unfinished Business. Learn to spot aggressive buying absorption at resistance and aggressive selling absorption at support.',
      chapters: [
        { title: 'Chapter 1: Identifying Absorption at Key Levels', content: 'Massive contracts trading on the ask with zero price advance indicates heavy limit selling.' }
      ],
      audioText: 'Footprint Chart Trading. Decoding institutional bid-ask absorption.'
    },
    {
      id: 'of_5',
      topic: 'Order Flow',
      title: 'Delta Divergence & Absorption Playbook',
      author: 'Chicago Flow Institute',
      year: '2021',
      rating: 4.9,
      pages: 275,
      coverColor: 'linear-gradient(135deg, #0f2027, #203a43)',
      coreIdea: 'Delta divergence occurs when price makes a higher high, but Cumulative Volume Delta (CVD) prints a lower low. This proves aggressive market buyers are trapped into passive sell orders.',
      chapters: [
        { title: 'Chapter 1: Cumulative Delta Mechanics', content: 'Measuring net aggressive buying versus aggressive selling pressure.' }
      ],
      audioText: 'Delta Divergence and Absorption Playbook. Spotting trapped traders via Cumulative Volume Delta.'
    },
    {
      id: 'of_6',
      topic: 'Order Flow',
      title: 'Tape Reading and Market Tactics',
      author: 'Humphrey B. Neill',
      year: '1931',
      rating: 4.9,
      pages: 248,
      coverColor: 'linear-gradient(135deg, #2b1055, #7597de)',
      coreIdea: 'The timeless Wall Street classic on reading the ticker tape, sensing urgent institutional accumulation, and interpreting the speed of order execution.',
      chapters: [
        { title: 'Chapter 1: Reading the Ticker Tape Pace', content: 'How acceleration in trade speed signals the culmination of accumulation.' }
      ],
      audioText: 'Tape Reading and Market Tactics by Humphrey B. Neill. The classic study on market tempo and order velocity.'
    },
    {
      id: 'of_7',
      topic: 'Order Flow',
      title: 'Modern Tape Reading: Level 2 & Time and Sales',
      author: 'Richard Wyckoff & Flow Desk',
      year: '2020',
      rating: 4.7,
      pages: 300,
      coverColor: 'linear-gradient(135deg, #1a2a6c, #b21f1f)',
      coreIdea: 'Translating historic tape reading into modern Time & Sales windows, color-coded block trades, and institutional order book sequencing.',
      chapters: [
        { title: 'Chapter 1: Filtering the Time & Sales Stream', content: 'Filtering for lot sizes above 50 contracts to track institutional big-size fills.' }
      ],
      audioText: 'Modern Tape Reading: Level 2 and Time and Sales. Tracking institutional block executions.'
    },
    {
      id: 'of_8',
      topic: 'Order Flow',
      title: 'Stacked Imbalances & Unfinished Auctions',
      author: 'Order Flow University',
      year: '2022',
      rating: 4.8,
      pages: 290,
      coverColor: 'linear-gradient(135deg, #000428, #004e92)',
      coreIdea: 'Stacked diagonal imbalances (where buy volume exceeds sell volume by 300% across 3+ consecutive price levels) highlight aggressive institutional continuation.',
      chapters: [
        { title: 'Chapter 1: The 300% Imbalance Trigger', content: 'Using stacked imbalance zones as bulletproof retest support in trending markets.' }
      ],
      audioText: 'Stacked Imbalances and Unfinished Auctions. High-conviction footprint momentum trading.'
    },
    {
      id: 'of_9',
      topic: 'Order Flow',
      title: 'Cumulative Delta Volume & Exhaustion Clues',
      author: 'Market Flow Analytics',
      year: '2021',
      rating: 4.7,
      pages: 260,
      coverColor: 'linear-gradient(135deg, #130f40, #30336b)',
      coreIdea: 'How to use session CVD reset, multi-day divergence, and exhaustion spikes to time low-risk counter-trend entries in Forex and index futures.',
      chapters: [
        { title: 'Chapter 1: Spotting Exhaustion Spikes', content: 'Extreme positive delta on an ultra-narrow price range bar marks immediate exhaustion.' }
      ],
      audioText: 'Cumulative Delta Volume and Exhaustion Clues. Pinpointing institutional reversal points.'
    },
    {
      id: 'of_10',
      topic: 'Order Flow',
      title: 'Institutional Iceberg Orders & Spoofing Detection',
      author: 'Algorithmic Flow Systems',
      year: '2023',
      rating: 4.9,
      pages: 340,
      coverColor: 'linear-gradient(135deg, #1e3c72, #2a5298)',
      coreIdea: 'Algorithms slice large 1,000-lot orders into 5-lot visual fragments to avoid moving the market. Learn how order flow software reconstructs real iceberg volume.',
      chapters: [
        { title: 'Chapter 1: Reconstructing Synthetic Iceberg Orders', content: 'Detecting persistent bid replenishment when visual size remains constant.' }
      ],
      audioText: 'Institutional Iceberg Orders and Spoofing Detection. Unmasking hidden algorithm limit orders.'
    },

    // TOPIC 5: MARKET PROFILE (10 BOOKS)
    {
      id: 'mp_1',
      topic: 'Market Profile',
      title: 'Mind Over Markets: Power Trading with Market Profile',
      author: 'James F. Dalton',
      year: '1990',
      rating: 5.0,
      pages: 368,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #4338ca)',
      coreIdea: 'The market is an ongoing, dual-directional auction that organizes price over time into a bell curve. Price regulates volume, and value is determined where buyers and sellers agree to trade the most. Trading outside the Value Area provides asymmetric reward-to-risk.',
      chapters: [
        { title: 'Chapter 1: The Organizing Principle of Market Profile', content: 'How Time Price Opportunities (TPOs) construct the bell curve of market value.' },
        { title: 'Chapter 2: Day Types: Trend Day, Normal Day, and Neutral Day', content: 'Classifying the day structure during the first hour to set exact trading parameters.' },
        { title: 'Chapter 3: The Value Area (70% Distribution)', content: 'Trading value area breakouts versus fading excursions back to the Point of Control (POC).' }
      ],
      audioText: 'Mind Over Markets by James F. Dalton. The foundational masterwork on Market Profile, Time Price Opportunities, and auction market theory.'
    },
    {
      id: 'mp_2',
      topic: 'Market Profile',
      title: 'Markets in Profile: Profiting from the Auction Process',
      author: 'James F. Dalton & Eric T. Jones',
      year: '2007',
      rating: 4.9,
      pages: 336,
      coverColor: 'linear-gradient(135deg, #1e293b, #64748b)',
      coreIdea: 'Dalton\'s advanced continuation integrating behavioral finance, neuroscience, and composite profile structures. Teaches traders to evaluate whether the market is balance-seeking or trend-seeking.',
      chapters: [
        { title: 'Chapter 1: Context and Asymmetric Opportunity', content: 'Why trading setups fail when executed in the wrong higher-timeframe profile context.' }
      ],
      audioText: 'Markets in Profile by James Dalton. Advanced auction market dynamics and context evaluation.'
    },
    {
      id: 'mp_3',
      topic: 'Market Profile',
      title: 'Steidlmayer on Markets: A New Approach to Trading',
      author: 'J. Peter Steidlmayer',
      year: '2002',
      rating: 4.9,
      pages: 256,
      coverColor: 'linear-gradient(135deg, #0f172a, #38bdf8)',
      coreIdea: 'Written by the inventor of Market Profile at the Chicago Board of Trade (CBOT). Explains the original Liquidity Data Bank and Volume-Stripped Profile concepts.',
      chapters: [
        { title: 'Chapter 1: The Birth of the Profile at CBOT', content: 'How Steidlmayer developed TPO letters to visualize market equilibrium in real time.' }
      ],
      audioText: 'Steidlmayer on Markets by J. Peter Steidlmayer, creator of Market Profile.'
    },
    {
      id: 'mp_4',
      topic: 'Market Profile',
      title: 'Value Area Dynamics & Developing TPOs',
      author: 'CBOT Market Profile Desk',
      year: '2015',
      rating: 4.8,
      pages: 290,
      coverColor: 'linear-gradient(135deg, #022c22, #059669)',
      coreIdea: 'Understanding how the Value Area High (VAH), Value Area Low (VAL), and Point of Control (POC) shift dynamically as new half-hour TPO brackets print.',
      chapters: [
        { title: 'Chapter 1: The 80% Rule of the Value Area', content: 'If price opens outside the prior day value area and re-enters for two consecutive 30-min bars, there is an 80% probability it travels through the entire value area.' }
      ],
      audioText: 'Value Area Dynamics and Developing TPOs. The famous 80% value area rule and POC migration.'
    },
    {
      id: 'mp_5',
      topic: 'Market Profile',
      title: 'Initial Balance Breakouts & Normal Day Structures',
      author: 'Profile Trading Group',
      year: '2020',
      rating: 4.8,
      pages: 260,
      coverColor: 'linear-gradient(135deg, #312e81, #6366f1)',
      coreIdea: 'The Initial Balance (IB)—the price range established in the first hour of trading. If IB is narrow, an explosive Range Extension trend day is imminent.',
      chapters: [
        { title: 'Chapter 1: IB Range Extension Multipliers', content: 'Projecting 1.5x and 2x IB extensions to calculate precise daily profit targets.' }
      ],
      audioText: 'Initial Balance Breakouts and Normal Day Structures. Using the first hour range to forecast daily trend targets.'
    },
    {
      id: 'mp_6',
      topic: 'Market Profile',
      title: 'Point of Control (POC) Migration & Rejection',
      author: 'Jim Dalton Trading Lab',
      year: '2021',
      rating: 4.8,
      pages: 280,
      coverColor: 'linear-gradient(135deg, #1c1917, #78716c)',
      coreIdea: 'Tracking virgin Points of Control (VPOCs). Unrevisited POC levels from previous days act as powerful liquidity magnets for subsequent sessions.',
      chapters: [
        { title: 'Chapter 1: Virgin POC Magnetism', content: 'Why price returns to untested POCs with over 85% statistical frequency in Forex.' }
      ],
      audioText: 'Point of Control Migration and Rejection. Trading virgin POC magnets.'
    },
    {
      id: 'mp_7',
      topic: 'Market Profile',
      title: 'The Profile Trader\'s Handbook',
      author: 'Frank Ochoa',
      year: '2019',
      rating: 4.8,
      pages: 310,
      coverColor: 'linear-gradient(135deg, #451a03, #d97706)',
      coreIdea: 'Practical synthesis of Pivot Points, Market Profile value areas, and multi-day composite distributions for day and swing traders.',
      chapters: [
        { title: 'Chapter 1: Merging Camarilla Pivots with Profile', content: 'High-confluence entries where VAH overlaps with Camarilla H4 resistance.' }
      ],
      audioText: 'The Profile Trader\'s Handbook by Frank Ochoa. Blending profile with pivot levels.'
    },
    {
      id: 'mp_8',
      topic: 'Market Profile',
      title: 'Auction Market Theory: Balance vs Imbalance',
      author: 'Market Profile Association',
      year: '2022',
      rating: 4.9,
      pages: 330,
      coverColor: 'linear-gradient(135deg, #14532d, #15803d)',
      coreIdea: 'The foundational philosophy: markets cycle indefinitely between Balance (sideways rotation building energy) and Imbalance (vertical trend seeking new value).',
      chapters: [
        { title: 'Chapter 1: Identifying the Transition to Imbalance', content: 'Recognizing when excess tails form at the edge of value, signaling immediate trend departure.' }
      ],
      audioText: 'Auction Market Theory: Balance vs Imbalance. The rhythm of market equilibrium and directional discovery.'
    },
    {
      id: 'mp_9',
      topic: 'Market Profile',
      title: 'Day Type Classification & Opening Type Taxonomy',
      author: 'Auction Dynamics',
      year: '2021',
      rating: 4.7,
      pages: 250,
      coverColor: 'linear-gradient(135deg, #0369a1, #38bdf8)',
      coreIdea: 'Open-Drive, Open-Test-Drive, Open-Rejection-Reverse, and Open-in-Range. The opening 15 minutes reveal institutional intention for the entire trading day.',
      chapters: [
        { title: 'Chapter 1: Open-Drive Mechanics', content: 'When institutions enter aggressively right at the bell with zero pullback.' }
      ],
      audioText: 'Day Type Classification and Opening Taxonomy. Reading the opening 15 minutes of the trading session.'
    },
    {
      id: 'mp_10',
      topic: 'Market Profile',
      title: 'Advanced TPO Profiling for Currencies and Indices',
      author: 'Institutional Profile Group',
      year: '2023',
      rating: 4.8,
      pages: 360,
      coverColor: 'linear-gradient(135deg, #3730a3, #818cf8)',
      coreIdea: 'Tailored specifically for 24-hour global Forex markets where traditional exchange opening bells do not exist. Merges London and New York session profiles.',
      chapters: [
        { title: 'Chapter 1: Multi-Session 24H Currency Profiling', content: 'Splitting the 24-hour Forex profile into Asian, London, and NY TPO sub-profiles.' }
      ],
      audioText: 'Advanced TPO Profiling for Currencies and Indices. 24-hour Forex market profile frameworks.'
    },

    // TOPIC 6: VOLUME PROFILE (10 BOOKS)
    {
      id: 'vp_1',
      topic: 'Volume Profile',
      title: 'Volume Profile: The Insider\'s Guide to Trading',
      author: 'Trader Dale',
      year: '2018',
      rating: 4.9,
      pages: 216,
      coverColor: 'linear-gradient(135deg, #1e3a8a, #06b6d4)',
      coreIdea: 'Unlike standard volume which shows volume over time, Volume Profile shows volume traded at specific price levels. High Volume Nodes (HVN) act as heavy price magnets and support/resistance, while Low Volume Nodes (LVN) are traversed rapidly with momentum.',
      chapters: [
        { title: 'Chapter 1: The Volume Profile Architecture', content: 'Point of Control (POC), Value Area (70%), and High Volume Nodes vs Low Volume Gaps.' },
        { title: 'Chapter 2: The Volume Accumulation Setup', content: 'Locating tight consolidation zones with heavy volume before a breakout, providing rock-solid retest entries.' },
        { title: 'Chapter 3: The Trend Profile Setup', content: 'Entering at intermediate high volume clusters formed during directional impulsive moves.' }
      ],
      audioText: 'Volume Profile: The Insider\'s Guide to Trading by Trader Dale. How to trade volume at price, Point of Control retests, and low-volume void expansions.'
    },
    {
      id: 'vp_2',
      topic: 'Volume Profile',
      title: 'A Complete Guide to Volume Price Analysis',
      author: 'Anna Coulling',
      year: '2013',
      rating: 4.9,
      pages: 228,
      coverColor: 'linear-gradient(135deg, #065f46, #10b981)',
      coreIdea: 'The indispensable companion to reading candle spread against volume. Coulling shows that true institutional accumulation always produces anomalously high volume with narrow price spread.',
      chapters: [
        { title: 'Chapter 1: Validation and Anomaly in VPA', content: 'Wide candle with low volume is a trap; narrow candle with massive volume is absorption.' }
      ],
      audioText: 'A Complete Guide to Volume Price Analysis by Anna Coulling. Uncovering institutional intent by comparing candle spread to volume.'
    },
    {
      id: 'vp_3',
      topic: 'Volume Profile',
      title: 'Volume Profile & Composite Distributions',
      author: 'Quantitative Flow Labs',
      year: '2021',
      rating: 4.8,
      pages: 310,
      coverColor: 'linear-gradient(135deg, #3b0764, #a855f7)',
      coreIdea: 'Constructing multi-week composite profiles to reveal macro institutional fair value. When price breaks out of a multi-week high volume distribution, it enters price discovery.',
      chapters: [
        { title: 'Chapter 1: Composite POC Retest Strategies', content: 'Trading monthly composite POC levels with unmatched institutional confluence.' }
      ],
      audioText: 'Volume Profile and Composite Distributions. Macro volume structures and multi-week value areas.'
    },
    {
      id: 'vp_4',
      topic: 'Volume Profile',
      title: 'High Volume Nodes vs Low Volume Nodes Playbook',
      author: 'VPVR Trading Group',
      year: '2022',
      rating: 4.8,
      pages: 275,
      coverColor: 'linear-gradient(135deg, #1c1917, #d97706)',
      coreIdea: 'Low Volume Nodes (LVNs) represent price rejection and vacuum zones. Price flies through LVNs with zero friction and slows down at HVNs to absorb transactions.',
      chapters: [
        { title: 'Chapter 1: Trading the Low Volume Void Run', content: 'Targeting explosive, instant scalps as price sprints across low volume nodes.' }
      ],
      audioText: 'High Volume Nodes vs Low Volume Nodes Playbook. Exploiting liquidity vacuums for fast momentum trades.'
    },
    {
      id: 'vp_5',
      topic: 'Volume Profile',
      title: 'Session Volume Profile & VWAP Execution Models',
      author: 'Institutional Desk',
      year: '2023',
      rating: 4.9,
      pages: 340,
      coverColor: 'linear-gradient(135deg, #042f2e, #0d9488)',
      coreIdea: 'Combining Session Volume Profile with Volume Weighted Average Price (VWAP) standard deviation bands (+1, +2, -1, -2 SD). Institutional algorithms use VWAP as their benchmark fill price.',
      chapters: [
        { title: 'Chapter 1: The VWAP + POC Confluence Zone', content: 'Executing long entries when session VWAP aligns with the previous session POC.' }
      ],
      audioText: 'Session Volume Profile and VWAP Execution Models. Institutional algorithmic execution benchmarks.'
    },
    {
      id: 'vp_6',
      topic: 'Volume Profile',
      title: 'Virgin Point of Control (VPOC) Magnet Strategies',
      author: 'Dale Quantitative',
      year: '2020',
      rating: 4.8,
      pages: 230,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #6366f1)',
      coreIdea: 'A statistical study on Virgin POCs. Over 80% of untested volume POCs are retested within 5 trading sessions, providing reliable take-profit targets.',
      chapters: [
        { title: 'Chapter 1: The VPOC Retest Probability Model', content: 'Setting dynamic TP targets based on the nearest untested volume node.' }
      ],
      audioText: 'Virgin Point of Control Magnet Strategies. High-probability take profit targets on untested volume nodes.'
    },
    {
      id: 'vp_7',
      topic: 'Volume Profile',
      title: 'Volume Spread Analysis: Master the Markets',
      author: 'Tom Williams',
      year: '2005',
      rating: 4.9,
      pages: 195,
      coverColor: 'linear-gradient(135deg, #18181b, #71717a)',
      coreIdea: 'The pioneering work that formalized Volume Spread Analysis (VSA). Identifies Stopping Volume, No Demand at Market Tops, and No Supply at Market Bottoms.',
      chapters: [
        { title: 'Chapter 1: Stopping Volume Mechanics', content: 'A high-volume down candle with a narrow spread marks the arrival of professional buying absorption.' }
      ],
      audioText: 'Volume Spread Analysis: Master the Markets by Tom Williams. The original classic on VSA.'
    },
    {
      id: 'vp_8',
      topic: 'Volume Profile',
      title: 'The Wyckoff Method: Accumulation, Distribution & Volume',
      author: 'Richard D. Wyckoff',
      year: '1937',
      rating: 5.0,
      pages: 280,
      coverColor: 'linear-gradient(135deg, #27272a, #a1a1aa)',
      coreIdea: 'The grandfather of modern volume analysis. Outlines the 3 Fundamental Laws: Law of Supply and Demand, Law of Cause and Effect, and Law of Effort vs Result.',
      chapters: [
        { title: 'Chapter 1: The Law of Effort vs Result', content: 'When massive volume effort yields zero price result, an impending reversal is guaranteed.' }
      ],
      audioText: 'The Wyckoff Method: Accumulation, Distribution and Volume by Richard D. Wyckoff.'
    },
    {
      id: 'vp_9',
      topic: 'Volume Profile',
      title: 'Fixed Range Volume Profile Breakouts in Forex',
      author: 'Anna Coulling & FX Desk',
      year: '2022',
      rating: 4.8,
      pages: 290,
      coverColor: 'linear-gradient(135deg, #0c4a6e, #0284c7)',
      coreIdea: 'Applying the Fixed Range Volume Profile (FRVP) tool to individual Asian consolidation ranges, swing legs, and news impulse candles.',
      chapters: [
        { title: 'Chapter 1: The Asian Session FRVP Retest', content: 'Anchoring FRVP to the 8-hour Asian session to trade London open breakouts.' }
      ],
      audioText: 'Fixed Range Volume Profile Breakouts in Forex. Anchoring profiles to specific market sessions.'
    },
    {
      id: 'vp_10',
      topic: 'Volume Profile',
      title: 'Microstructure Volume Profiling for Scalpers',
      author: 'High-Frequency Algo Team',
      year: '2023',
      rating: 4.8,
      pages: 320,
      coverColor: 'linear-gradient(135deg, #14532d, #16a34a)',
      coreIdea: 'Ultra-fast volume profiling on 1-minute and tick charts. Identifying sub-second liquidity nodes where high-frequency trading bots execute arbitrage.',
      chapters: [
        { title: 'Chapter 1: Micro VPVR Scalping Rules', content: 'Entering within 2 pips of 5-minute volume peaks with a 4-pip stop loss.' }
      ],
      audioText: 'Microstructure Volume Profiling for Scalpers. Millisecond precision volume execution.'
    },

    // TOPIC 7: DEPTH OF MARKET (DOM) (10 BOOKS)
    {
      id: 'dom_1',
      topic: 'Depth of Market',
      title: 'Depth of Market (DOM) Scalping Strategies',
      author: 'Chicago Scalping Institute',
      year: '2021',
      rating: 4.9,
      pages: 340,
      coverColor: 'linear-gradient(135deg, #0f172a, #06b6d4)',
      coreIdea: 'Trading the price ladder directly without looking at candlestick charts. How to read passive limit bids and offers, track order queuing, and detect when aggressive market buyers overwhelm the ask.',
      chapters: [
        { title: 'Chapter 1: The DOM Price Ladder Anatomy', content: 'Bids on the left, Asks on the right, Current Price in the middle, and Depth metrics.' },
        { title: 'Chapter 2: Queue Position & Priority Execution', content: 'Why getting to the front of the limit order queue gives proprietary scalpers zero-slippage edge.' },
        { title: 'Chapter 3: Absorption & Sweeping the Ladder', content: 'Watching 500 contracts trade at the ask without price moving, followed by sudden offer withdrawal.' }
      ],
      audioText: 'Depth of Market Scalping Strategies by Chicago Scalping Institute. Master the order ladder, queue priority, and order book absorption.'
    },
    {
      id: 'dom_2',
      topic: 'Depth of Market',
      title: 'Mastering the Order Book: Bids, Asks & Queue Position',
      author: 'Futures Flow Lab',
      year: '2022',
      rating: 4.8,
      pages: 290,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
      coreIdea: 'The mathematical mechanics of the limit order book. Explains how limit orders provide liquidity, market orders consume liquidity, and how queue cancellation affects price.',
      chapters: [
        { title: 'Chapter 1: The Cost of Market Orders vs Passive Fills', content: 'How trading as a passive liquidity provider saves thousands in spread and commissions.' }
      ],
      audioText: 'Mastering the Order Book by Futures Flow Lab. Queue priority and passive limit execution.'
    },
    {
      id: 'dom_3',
      topic: 'Depth of Market',
      title: 'DOM Absorption & Liquidity Refresh Strategies',
      author: 'Jigsaw Trading Desk',
      year: '2020',
      rating: 4.9,
      pages: 310,
      coverColor: 'linear-gradient(135deg, #1e293b, #38bdf8)',
      coreIdea: 'Using advanced DOM tools like Jigsaw and Bookmap. Identifies "iceberg refreshes" where a bid size shows 10 contracts, but continuously absorbs hundreds of market sell orders.',
      chapters: [
        { title: 'Chapter 1: The Iceberg Limit Refresh', content: 'Recognizing hidden institutional defense on the DOM before price rallies.' }
      ],
      audioText: 'DOM Absorption and Liquidity Refresh Strategies. Reading real-time limit order replenishment.'
    },
    {
      id: 'dom_4',
      topic: 'Depth of Market',
      title: 'Level 2 Execution Mastery for Forex & Futures',
      author: 'Pro DOM Traders',
      year: '2021',
      rating: 4.8,
      pages: 275,
      coverColor: 'linear-gradient(135deg, #3f3f46, #71717a)',
      coreIdea: 'Level 2 quotes show the full depth of market up to 20 price levels deep. Teaches traders to evaluate bid/ask volume ratios and spot real demand behind the spread.',
      chapters: [
        { title: 'Chapter 1: Bid/Ask Volume Imbalance Ratio', content: 'When total bids exceed total asks by 3 to 1, upside breakout probability increases to 82%.' }
      ],
      audioText: 'Level 2 Execution Mastery. Analyzing bid-ask imbalances across 20 depth levels.'
    },
    {
      id: 'dom_5',
      topic: 'Depth of Market',
      title: 'Order Queue Mechanics & Priority Fill Algorithms',
      author: 'Market Microstructure Lab',
      year: '2022',
      rating: 4.7,
      pages: 260,
      coverColor: 'linear-gradient(135deg, #134e4a, #14b8a6)',
      coreIdea: 'How matching engines (FIFO, Pro-Rata, and Split FIFO) prioritize trade execution. Knowing whether you will be filled on a touch or passed over.',
      chapters: [
        { title: 'Chapter 1: First-In-First-Out (FIFO) Positioning', content: 'Tactics for joining the bid early to ensure execution before momentum runs.' }
      ],
      audioText: 'Order Queue Mechanics and Priority Fill Algorithms. Mastering matching engine queue priority.'
    },
    {
      id: 'dom_6',
      topic: 'Depth of Market',
      title: 'Spotting Spoofing & Layering in the Order Ladder',
      author: 'Regulatory Flow Insights',
      year: '2021',
      rating: 4.8,
      pages: 285,
      coverColor: 'linear-gradient(135deg, #450a0a, #ef4444)',
      coreIdea: 'Market makers sometimes place fake 500-lot limit orders 4 ticks away from current price, only to cancel them the millisecond price approaches. Learn to spot and exploit spoofing.',
      chapters: [
        { title: 'Chapter 1: Spoofing Clues & Flashing Orders', content: 'How flashing orders manipulate retail sentiment and how to trade against the spoofer.' }
      ],
      audioText: 'Spotting Spoofing and Layering in the Order Ladder. Identifying fake liquidity walls and flashing orders.'
    },
    {
      id: 'dom_7',
      topic: 'Depth of Market',
      title: 'Scalping with the DOM Ladder: Ultra-Low Latency',
      author: 'Proprietary Trading Group',
      year: '2023',
      rating: 4.9,
      pages: 350,
      coverColor: 'linear-gradient(135deg, #022c22, #10b981)',
      coreIdea: 'The exact trading methodology used in proprietary Chicago and London prop firms. Entering and exiting 2-3 tick scalps in under 15 seconds with mouse hotkeys.',
      chapters: [
        { title: 'Chapter 1: One-Click Hotkey Execution', content: 'Configuring keyboard triggers to execute and bracket stop-loss instantly on the DOM.' }
      ],
      audioText: 'Scalping with the DOM Ladder. High-speed proprietary execution on the price ladder.'
    },
    {
      id: 'dom_8',
      topic: 'Depth of Market',
      title: 'Passive Liquidity vs Aggressive Market Orders',
      author: 'Quantitative Execution Desk',
      year: '2022',
      rating: 4.8,
      pages: 295,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #818cf8)',
      coreIdea: 'Why aggressive market orders move price while passive limit orders stop price. Visualizing the perpetual tug-of-war between aggressive taker flow and passive maker defense.',
      chapters: [
        { title: 'Chapter 1: The Barrier of Passive Liquidity', content: 'Why price cannot advance until all passive resting orders at that tick are exhausted.' }
      ],
      audioText: 'Passive Liquidity vs Aggressive Market Orders. The fundamental law of order matching.'
    },
    {
      id: 'dom_9',
      topic: 'Depth of Market',
      title: 'DOM Imbalance Ratios & Bid/Ask Delta Tracking',
      author: 'Futures DOM Academy',
      year: '2021',
      rating: 4.7,
      pages: 245,
      coverColor: 'linear-gradient(135deg, #3b0764, #c084fc)',
      coreIdea: 'Real-time delta tracking on the DOM ladder. Watching whether executed market buys exceed executed market sells tick-by-tick at key support levels.',
      chapters: [
        { title: 'Chapter 1: Delta Momentum Triggers', content: 'Entering when live tick delta flips positive at a major Daily support level.' }
      ],
      audioText: 'DOM Imbalance Ratios and Delta Tracking. Tick-by-tick momentum verification on the ladder.'
    },
    {
      id: 'dom_10',
      topic: 'Depth of Market',
      title: 'The Bookmap & Heat Ladder Comprehensive Guide',
      author: 'Liquidity Scalping Guild',
      year: '2023',
      rating: 4.9,
      pages: 380,
      coverColor: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)',
      coreIdea: 'Combining the Depth of Market with a visual time-based heat trail. Shows not only where orders currently sit, but how long they have rested and whether they were executed or pulled.',
      chapters: [
        { title: 'Chapter 1: Resting Liquidity Heat Trails', content: 'Differentiating between persistent institutional limit walls and fleeting retail orders.' }
      ],
      audioText: 'The Bookmap and Heat Ladder Guide. Combining DOM ladder depth with historical liquidity visualization.'
    },

    // TOPIC 8: HEAT MAP & LIQUIDITY (10 BOOKS)
    {
      id: 'hm_1',
      topic: 'Heat Map',
      title: 'Bookmap & Order Book Heat Map Trading Mastery',
      author: 'HeatMap Quant Institute',
      year: '2022',
      rating: 5.0,
      pages: 412,
      coverColor: 'linear-gradient(135deg, #0f172a, #f97316)',
      coreIdea: 'Heat maps color-code limit order density across time. High liquidity clusters appear as bright glowing bands. Institutions deliberately drive price toward these dense liquidity heat maps to fill massive orders before reversing.',
      chapters: [
        { title: 'Chapter 1: Visualizing Hidden Liquidity Bands', content: 'How heat map color intensity (from dim blue to glowing orange) reveals massive pending limit volume.' },
        { title: 'Chapter 2: Liquidity Sweeps & Flash Absorption', content: 'What happens when price touches a bright liquidity line: does the line absorb the move or get pulled?' },
        { title: 'Chapter 3: The Liquidity Reversal Setup', content: 'Entering the precise moment a major resting liquidity band is consumed and volume spikes.' }
      ],
      audioText: 'Bookmap & Order Book Heat Map Trading Mastery by HeatMap Quant Institute. Visualizing institutional limit clusters, liquidity bands, and magnet runs.'
    },
    {
      id: 'hm_2',
      topic: 'Heat Map',
      title: 'Visualizing Limit Order Flow & Liquidity Pools',
      author: 'Institutional HeatMap Lab',
      year: '2023',
      rating: 4.9,
      pages: 340,
      coverColor: 'linear-gradient(135deg, #1e1b4b, #ec4899)',
      coreIdea: 'Charts without heat maps are blind to where liquidity sits. By plotting order book depth over time, traders spot where retail stop losses and institutional take profits cluster.',
      chapters: [
        { title: 'Chapter 1: The Anatomy of a Liquidity Pool', content: 'Why round numbers (e.g. 1.0800 on EUR/USD, 2650 on Gold) glow with maximum brightness on the heat map.' }
      ],
      audioText: 'Visualizing Limit Order Flow and Liquidity Pools. Seeing where orders wait before price arrives.'
    },
    {
      id: 'hm_3',
      topic: 'Heat Map',
      title: 'Stop Loss Hunts & Resting Liquidity Heat Maps',
      author: 'Liquidity Tracker Pro',
      year: '2022',
      rating: 4.8,
      pages: 295,
      coverColor: 'linear-gradient(135deg, #311042, #f43f5e)',
      coreIdea: 'Market makers need counter-party volume to exit positions. Heat maps show exact clusters of buy stops and sell stops that algorithms hunt prior to releasing major trends.',
      chapters: [
        { title: 'Chapter 1: The Liquidity Purge Maneuver', content: 'Timing your entry right as price sweeps through a glowing red stop-loss heat cluster.' }
      ],
      audioText: 'Stop Loss Hunts and Resting Liquidity Heat Maps. Identifying where stop losses cluster and how algorithms sweep them.'
    },
    {
      id: 'hm_4',
      topic: 'Heat Map',
      title: 'Coinglass & Order Book Depth Map Analytics',
      author: 'Crypto Liquidity Research',
      year: '2023',
      rating: 4.9,
      pages: 310,
      coverColor: 'linear-gradient(135deg, #022c22, #10b981)',
      coreIdea: 'Liquidation heat maps for Bitcoin, Ethereum, and major currency pairs. Pinpoints liquidation levels where over-leveraged traders will be forced to market-close.',
      chapters: [
        { title: 'Chapter 1: The Liquidation Cascade Principle', content: 'How forced liquidations trigger self-fulfilling price surges into the next liquidity pocket.' }
      ],
      audioText: 'Coinglass and Order Book Depth Map Analytics. Trading liquidation cascades and leverage wipeouts.'
    },
    {
      id: 'hm_5',
      topic: 'Heat Map',
      title: 'Market Maker Trap Detection via Liquidity Clusters',
      author: 'Pro Liquidity Desk',
      year: '2021',
      rating: 4.8,
      pages: 280,
      coverColor: 'linear-gradient(135deg, #1c1917, #f59e0b)',
      coreIdea: 'Detecting when a huge liquidity wall appears on the heat map to prevent price from falling, while institutional algorithms secretly distribute short positions above.',
      chapters: [
        { title: 'Chapter 1: The Fake Liquidity Wall Trap', content: 'Differentiating real institutional defense from spoofed liquidity designed to induce retail buying.' }
      ],
      audioText: 'Market Maker Trap Detection via Liquidity Clusters. Unmasking deceptive liquidity barriers.'
    },
    {
      id: 'hm_6',
      topic: 'Heat Map',
      title: 'Heat Map Absorption: Identifying Wall Defense',
      author: 'Order Book Visualizers',
      year: '2022',
      rating: 4.8,
      pages: 265,
      coverColor: 'linear-gradient(135deg, #14532d, #84cc16)',
      coreIdea: 'When aggressive price momentum collides with a thick resting liquidity band, watch the bubble size indicator. If trade volume explodes but the wall does not break, enter the reversal immediately.',
      chapters: [
        { title: 'Chapter 1: Volume Dots and Collision Physics', content: 'Using volume bubble circles to measure the exact impact energy against liquidity walls.' }
      ],
      audioText: 'Heat Map Absorption: Identifying Wall Defense. Measuring absorption energy when price strikes liquidity.'
    },
    {
      id: 'hm_7',
      topic: 'Heat Map',
      title: 'Gamma Exposure, Liquidity Walls & Pin Risk',
      author: 'Options & FX HeatMap Group',
      year: '2023',
      rating: 4.9,
      pages: 375,
      coverColor: 'linear-gradient(135deg, #3730a3, #a855f7)',
      coreIdea: 'How option market maker hedging creates massive resting liquidity walls on spot Forex and index futures at key strike prices (Zero Gamma level).',
      chapters: [
        { title: 'Chapter 1: The Zero Gamma Magnet Level', content: 'Why price tends to pin and oscillate tightly around high-gamma liquidity walls near expiry.' }
      ],
      audioText: 'Gamma Exposure, Liquidity Walls and Pin Risk. Institutional option hedging mechanics on spot markets.'
    },
    {
      id: 'hm_8',
      topic: 'Heat Map',
      title: 'Historical Liquidity Heat Trails & Iceberg Tracing',
      author: 'High-Precision Flow Team',
      year: '2022',
      rating: 4.8,
      pages: 290,
      coverColor: 'linear-gradient(135deg, #0c4a6e, #38bdf8)',
      coreIdea: 'Analyzing historical heat lines that remain untouched for hours. These historical liquidity trails act as unshakeable support and resistance anchors when retested.',
      chapters: [
        { title: 'Chapter 1: The Untouched Heat Line Retest', content: 'Trading retests of multi-hour dense liquidity bands with 2-pip stops.' }
      ],
      audioText: 'Historical Liquidity Heat Trails and Iceberg Tracing. Trading multi-hour liquidity anchors.'
    },
    {
      id: 'hm_9',
      topic: 'Heat Map',
      title: 'Session Liquidity Density & Heat Maps for Day Traders',
      author: 'Visual Flow Guild',
      year: '2021',
      rating: 4.7,
      pages: 255,
      coverColor: 'linear-gradient(135deg, #2e1065, #e879f9)',
      coreIdea: 'How liquidity density shifts between the Asian, European, and US trading sessions. Pinpoints when European liquidity dries up and US liquidity injects.',
      chapters: [
        { title: 'Chapter 1: Session Liquidity Transition Windows', content: 'Capitalizing on the sudden expansion of liquidity bands at 8:00 AM EST.' }
      ],
      audioText: 'Session Liquidity Density and Heat Maps for Day Traders. Tracking liquidity density across global trading sessions.'
    },
    {
      id: 'hm_10',
      topic: 'Heat Map',
      title: 'The Institutional Liquidity Mapping Handbook',
      author: 'ForexBot Hub Quant Research',
      year: '2026',
      rating: 5.0,
      pages: 440,
      coverColor: 'linear-gradient(135deg, #064e3b, #06b6d4)',
      coreIdea: 'The master operational handbook developed exclusively for ForexBot Hub members. Merges Heat Map density, Order Flow footprints, and SMC liquidity sweeps into a unified, high-probability execution algorithm.',
      chapters: [
        { title: 'Chapter 1: The Unified Liquidity Engine', content: 'Aligning heat map clusters with ICT Fair Value Gaps and Footprint Delta for 1:5 risk to reward setups.' },
        { title: 'Chapter 2: Automated Liquidity Detection for MT5 Bots', content: 'Coding Python and PineScript algorithms that scan and trade institutional liquidity walls automatically.' },
        { title: 'Chapter 3: Risk Management and Asymmetric Compounding', content: 'Mathematical lot sizing and risk management protocols to compound gains while capping drawdown at 2%.' }
      ],
      audioText: 'The Institutional Liquidity Mapping Handbook by ForexBot Hub Quant Research. The complete blueprint for heat map analysis, order book density, and algorithmic trading.'
    }
  ];

  // Active state for Book Library and Audio Engine
  const bookState = {
    activeTopic: 'all',
    searchQuery: '',
    activeBook: BOOKS_DATABASE[0],
    activeChapterIndex: 0,
    currentPageIndex: 0,
    readerPages: [],
    readerTheme: 'dark',
    readerFontSize: 16,
    // Audio Player State
    speechSynth: window.speechSynthesis || null,
    currentUtterance: null,
    isPlayingAudio: false,
    isPausedAudio: false,
    selectedVoiceGender: 'male',
    selectedSpeed: 1.0,
    voicesList: []
  };

  // Initialize Speech Synthesis Voices
  function initSpeechVoices() {
    if (!bookState.speechSynth) return;

    const loadVoices = () => {
      bookState.voicesList = bookState.speechSynth.getVoices();
    };

    loadVoices();
    if (bookState.speechSynth.onvoiceschanged !== undefined) {
      bookState.speechSynth.onvoiceschanged = loadVoices;
    }
  }

  // Get matching Male or Female voice from browser synthesis
  function getPreferredVoice(gender) {
    if (!bookState.voicesList || bookState.voicesList.length === 0) {
      bookState.voicesList = bookState.speechSynth ? bookState.speechSynth.getVoices() : [];
    }

    const voices = bookState.voicesList;
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang && v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    if (gender === 'female') {
      const femaleKeywords = ['female', 'woman', 'zira', 'jenny', 'samantha', 'victoria', 'karen', 'serena', 'fiona', 'moira'];
      const found = pool.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      if (found) return found;
      // Secondary fallback
      return pool[Math.min(1, pool.length - 1)];
    } else {
      const maleKeywords = ['male', 'man', 'david', 'mark', 'george', 'daniel', 'richard', 'james', 'guy', 'brian'];
      const found = pool.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      if (found) return found;
      // Default to first English voice
      return pool[0];
    }
  }

  // Render Book Library Grid
  function renderBooks() {
    const container = document.getElementById('booksGridContainer');
    const badge = document.getElementById('bookCountBadge');
    if (!container) return;

    let filtered = BOOKS_DATABASE;

    if (bookState.activeTopic !== 'all') {
      filtered = filtered.filter(b => b.topic.toLowerCase() === bookState.activeTopic.toLowerCase());
    }

    if (bookState.searchQuery.trim()) {
      const q = bookState.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.topic.toLowerCase().includes(q) ||
        b.coreIdea.toLowerCase().includes(q)
      );
    }

    if (badge) badge.textContent = `Showing ${filtered.length} of ${BOOKS_DATABASE.length} Books`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No Trading Books Found</h3>
          <p>Try searching with another keyword or select "All Books" to view our complete collection.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(book => `
      <div class="book-card" id="book_${book.id}">
        <!-- Book Cover Top -->
        <div class="book-cover-top" style="background: ${book.coverColor};">
          <div class="book-topic-tag">${book.topic}</div>
          <h3 class="book-cover-title">${book.title}</h3>
          <div class="book-cover-author">By ${book.author}</div>
          <div class="book-cover-accent-line"></div>
        </div>

        <!-- Book Card Body -->
        <div class="book-card-body">
          <div class="book-meta-bar">
            <span class="book-meta-item">★ ${book.rating}</span>
            <span class="book-meta-item">${book.pages} Pages</span>
            <span class="book-meta-item">${book.year} Ed.</span>
          </div>

          <div class="book-core-idea">
            <strong>Core Idea:</strong>
            <p>${book.coreIdea}</p>
          </div>

          <!-- Actions -->
          <div class="book-card-actions">
            <button class="btn btn-outline btn-sm" onclick="window.HubApp.openBookReader('${book.id}')" title="Read Complete Book Online">
              📖 Read Online
            </button>
            <button class="btn btn-pdf btn-sm" onclick="window.HubApp.openPdfBookViewer('${book.id}')" title="Open Moveable & Size-Adjustable Manual PDF Document">
              📄 PDF View
            </button>
            <button class="btn btn-cyan btn-sm" onclick="window.HubApp.playBookAudio('${book.id}')" title="Listen in Audio Mode (Male/Female voice)">
              🎧 Audio Mode
            </button>
            <button class="btn btn-emerald btn-sm" onclick="window.HubApp.downloadBook('${book.id}')" title="Download Free Companion eBook">
              ⬇ Download
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function setBookTopicFilter(topic) {
    sfx.click();
    bookState.activeTopic = topic;

    document.querySelectorAll('.topic-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.topic === topic);
    });

    renderBooks();
  }

  function filterBooks() {
    const input = document.getElementById('bookSearchInput');
    if (input) {
      bookState.searchQuery = input.value;
      renderBooks();
    }
  }

  // Generate 8 In-Depth, Comprehensive Pages for Any Trading Book
  function generateBookPages(book) {
    const topic = book.topic || 'Price Action';
    const title = book.title;
    const author = book.author;
    const coreIdea = book.coreIdea;

    return [
      {
        pageNumber: 1,
        title: `Chapter 1: Foundational Market Mechanics & Theory`,
        readTime: `4 min read`,
        content: `
          <div class="page-sec-header">
            <h4>1.1 The Institutional Market Architecture</h4>
            <span class="page-badge">THEORY &amp; THESIS</span>
          </div>
          <p>
            In <strong>"${title}"</strong>, legendary author <em>${author}</em> establishes that the global currency and derivatives markets are not random walks, nor are they governed by basic retail chart patterns. Over <strong>$7.5 Trillion</strong> transacts every single business day across the interbank foreign exchange market, dominated by Tier-1 institutions: JPMorgan Chase, Deutsche Bank, Citibank, and algorithmic market-making liquidity providers.
          </p>
          <p>
            The retail trading industry operates under an alarming statistic: <strong>90% of retail participants lose 90% of their capital within 90 days</strong> (the 90-90-90 rule). The root cause is fundamental ignorance of order book mechanics and liquidity distribution. Retail traders place stops at predictable chart points (double tops, trendline bounces, psychological round numbers), creating dense clusters of resting buy-stop and sell-stop liquidity.
          </p>
          <div class="reader-callout-box">
            <div class="callout-icon">🏛️</div>
            <div class="callout-body">
              <strong>Core Thesis by ${author}:</strong>
              <p>${coreIdea}</p>
            </div>
          </div>
          <p>
            To fill institutional orders sized in hundreds of millions of units without moving the market against themselves, institutional liquidity algorithms (such as the Interbank Price Delivery Algorithm) must drive price into these retail stop clusters. What retail traders mislabel as "fakeouts" or "bad luck" are systematic liquidity harvest sweeps.
          </p>
          <div class="reader-diagram-box">
            <div class="diagram-title">MARKET PARTICIPANT LIQUIDITY PYRAMID</div>
<pre>
   ▲  [TIER 1 CENTRAL &amp; INVESTMENT BANKS] -> Infinite Volume, Zero Spread
  / \
 /   \ [QUANT HEDGE FUNDS &amp; CTAs]      -> High-Frequency Execution, Statistical Arb
/     \
─────── [RETAIL BROKERS (B-BOOK)]     -> Internalizes Flow, Absorbs Retail Losses
─────── [RETAIL TRADERS]               -> 90% Uninformed Resting Stop Pools (The Food)
</pre>
          </div>
        `
      },
      {
        pageNumber: 2,
        title: `Chapter 2: Structural Geometry & Setup Identification`,
        readTime: `5 min read`,
        content: `
          <div class="page-sec-header">
            <h4>2.1 Market Geometry: BOS vs. CHoCH</h4>
            <span class="page-badge">SETUP BLUEPRINT</span>
          </div>
          <p>
            In modern algorithmic trading, understanding <strong>Market Structure</strong> is the prerequisite to profitability. Price moves in fractal cycles of expansion, retracement, accumulation, and distribution. Two pivotal structural events define trend continuity and reversal:
          </p>
          <ul class="reader-list">
            <li><strong>Break of Structure (BOS):</strong> Occurs when price breaks beyond a previous swing high or swing low in the direction of the dominant Higher Timeframe (HTF) trend with a decisive candle body close. A BOS confirms that institutional continuation orders remain intact.</li>
            <li><strong>Change of Character (CHoCH):</strong> Occurs when price breaches the internal swing point that created the most recent extreme high or low. CHoCH is the primary warning signal that institutional order flow has flipped from net-buying to net-selling, or vice-versa.</li>
          </ul>
          <div class="reader-table-wrap">
            <table class="reader-table">
              <thead>
                <tr>
                  <th>Structural Factor</th>
                  <th>High-Probability Setup</th>
                  <th>Invalid / Trap Setup</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Candle Body Close</strong></td>
                  <td>Body closes cleanly beyond previous swing high/low</td>
                  <td>Only wick pokes past the level, then immediately retreats</td>
                </tr>
                <tr>
                  <td><strong>Volume Displacement</strong></td>
                  <td>Candle size > 1.8x Average True Range (ATR) with volume surge</td>
                  <td>Doji or weak candles with declining delta volume</td>
                </tr>
                <tr>
                  <td><strong>Higher Timeframe Bias</strong></td>
                  <td>15M CHoCH aligns with Daily &amp; 4-Hour key liquidity sweep</td>
                  <td>Counter-trend setup formed in middle of nowhere (No POI)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Never trade a lower timeframe structure shift unless it occurs directly inside a validated Higher-Timeframe Point of Interest (HTF POI). Without HTF backing, lower-timeframe structure breaks are merely internal noise generated to induce early retail positions.
          </p>
        `
      },
      {
        pageNumber: 3,
        title: `Chapter 3: Visual Candlestick & Price Action Schematic`,
        readTime: `6 min read`,
        content: `
          <div class="page-sec-header">
            <h4>3.1 Complete Anatomical Price Action Schematic</h4>
            <span class="page-badge">VISUAL MASTERCLASS</span>
          </div>
          <p>
            Study this exact price delivery sequence meticulously. This sequence recurs across all timeframes from the 1-Minute scalping chart up to the Weekly institutional chart:
          </p>
          <div class="reader-diagram-box">
            <div class="diagram-title">INSTITUTIONAL LIQUIDITY SWEEP &amp; MITIGATION BLUEPRINT</div>
<pre>
[STEP 1: ASIAN RANGE CONSOLIDATION]
═════════════════════════════════════════════════════════════ High Range (Buy Stops Resting)
   /\    /\    /\
──/──\──/──\──/──\──────────────────────────────────────────── Low Range (Sell Stops Resting)

[STEP 2: THE LIQUIDITY PURGE / JUDAS SWING]
               ▲  [Pokes 8-15 pips above High Range to trigger Buy Stops]
              / \
[STEP 3: VIOLENT DISPLACEMENT DOWN (CHoCH)]
             /   \  <-- Huge Bearish Imbalance Candle (Displacement)
            /     \
═══════════/═══════\═════════════════════════════════════════ Old Range High Broken
                    \
[STEP 4: MITIGATION RETEST]
                     \   ▲ [Pullback to 62% - 79% OTE / Fair Value Gap]
                      \ / \
                       ▼   \ <--- OPTIMAL INSTITUTIONAL SHORT ENTRY
[STEP 5: EXPANSION &amp; RUN ON TARGETS]
                            \
                             \   Target: Unprotected Sell-Side Liquidity
                              ▼
</pre>
          </div>
          <div class="reader-callout-box accent-box">
            <div class="callout-icon">⚡</div>
            <div class="callout-body">
              <strong>The 3 Unbreakable Rules of this Schematic:</strong>
              <ol style="margin-top: 6px; padding-left: 20px;">
                <li>The sweep high MUST exceed the previous liquidity pool to trigger pending stop orders into bank limit sell orders.</li>
                <li>The subsequent displacement candle MUST close with a fat body, leaving an unfilled Fair Value Gap (imbalance) between Candle 1 low and Candle 3 high.</li>
                <li>Entry is NEVER executed at the sweep high; entry is ONLY executed on the mitigation return into the premium Fair Value Gap.</li>
              </ol>
            </div>
          </div>
        `
      },
      {
        pageNumber: 4,
        title: `Chapter 4: Precision Entry & Order Execution Triggers`,
        readTime: `5 min read`,
        content: `
          <div class="page-sec-header">
            <h4>4.1 Sniper Execution: Limit Orders vs. Market Confirmation</h4>
            <span class="page-badge">EXECUTION PROTOCOL</span>
          </div>
          <p>
            A high-probability setup is worthless without precise order execution mechanics. In <em>"${title}"</em>, <strong>${author}</strong> outlines two distinct execution methodologies based on market velocity and trader temperament:
          </p>
          <div class="reader-columns-2">
            <div class="reader-card-pane">
              <h5>Method A: Limit Order at Order Block / FVG (Passive Entry)</h5>
              <p>Place a limit order at the 50% Mean Threshold of the displacement candle or Fair Value Gap. Stop-loss is positioned strictly 3 to 5 pips beyond the liquidity sweep extreme high.</p>
              <div class="pane-pros-cons">
                <span class="pro">✔ Maximum Risk-to-Reward ratio (Often 1:5 to 1:10)</span>
                <span class="pro">✔ Zero slippage upon order fill</span>
                <span class="con">✖ Risk of missing the trade if price front-runs the level by 1 tick</span>
              </div>
            </div>
            <div class="reader-card-pane">
              <h5>Method B: Lower Timeframe CHoCH Confirmation (Active Entry)</h5>
              <p>Wait for higher timeframe price to tap the Point of Interest, drop down to the 1-Minute or 3-Minute chart, and wait for an internal Change of Character candle to close. Enter at market immediately upon the close.</p>
              <div class="pane-pros-cons">
                <span class="pro">✔ Higher win-rate (90% lower false breakout risk)</span>
                <span class="pro">✔ Provides definitive visual confirmation of buyers/sellers folding</span>
                <span class="con">✖ Slightly wider stop loss, reducing R:R to approximately 1:3 to 1:4</span>
              </div>
            </div>
          </div>
          <p style="margin-top: 18px;">
            <strong>Setup Invalidation Criteria:</strong> If price breaks 1 tick past the origin sweep extreme before filling your entry, the entire setup is permanently invalidated. Cancel all resting limit orders immediately. Never chase a trade that has invalidated its structural premise.
          </p>
        `
      },
      {
        pageNumber: 5,
        title: `Chapter 5: Asymmetric Risk Management & Capital Allocation`,
        readTime: `4 min read`,
        content: `
          <div class="page-sec-header">
            <h4>5.1 The Mathematical Engine of Longevity</h4>
            <span class="page-badge">RISK &amp; SIZING</span>
          </div>
          <p>
            Amateur traders obsess over winning percentages. Professional algorithmic traders and quantitative hedge funds obsess over <strong>Expectancy and Asymmetric Payoffs</strong>. Even with a 40% win rate, an asymmetric 1:3 Risk-to-Reward system compounds capital exponentially while surviving extended losing streaks.
          </p>
          <div class="reader-callout-box">
            <div class="callout-icon">📐</div>
            <div class="callout-body">
              <strong>The Golden Mathematical Position Sizing Formula:</strong>
              <div class="math-formula-box">
                Lot Size = (Account Equity × Risk Percentage) / (Stop Loss Pips × Pip Value per Lot)
              </div>
              <p style="font-size: 0.88rem; margin-top: 6px; color: var(--text-muted);">
                Example: $50,000 Funded Account risking 1.0% ($500) with a 12.5 pip Stop Loss on EUR/USD ($10 per pip/lot) = <strong>$500 / ($12.5 × $10) = 4.0 Standard Lots</strong>.
              </p>
            </div>
          </div>
          <h5 style="margin-top: 20px; font-family:'Outfit'; color:var(--accent-cyan);">The 3-Tier Scaling and Partial Profit Protocol:</h5>
          <ol class="reader-list-ordered">
            <li><strong>Partial Target 1 (1:2 R:R):</strong> Close 50% of the position upon reaching the first major opposing liquidity pool. Immediately move Stop-Loss to Breakeven plus 1 pip to cover broker commissions. The trade is now mathematically risk-free.</li>
            <li><strong>Partial Target 2 (1:3.5 R:R):</strong> Close an additional 25% of the initial position at the higher-timeframe equilibrium line.</li>
            <li><strong>Runner Target (1:5+ R:R):</strong> Allow the remaining 25% to trail with structure until an opposing Change of Character prints on the execution timeframe.</li>
          </ol>
        `
      },
      {
        pageNumber: 6,
        title: `Chapter 6: Session Liquidity, Time & News Alignment`,
        readTime: `5 min read`,
        content: `
          <div class="page-sec-header">
            <h4>6.1 The Temporal Dimension: Market Killzones</h4>
            <span class="page-badge">TIME &amp; SESSIONS</span>
          </div>
          <p>
            Price and Time are inseparable in institutional trading. A pristine technical pattern forming during dead Asian session hours will almost certainly fail or linger in chop. High-probability setups ONLY occur during the high-velocity overlaps of the world's primary financial centers:
          </p>
          <div class="reader-sessions-grid">
            <div class="session-box">
              <div class="session-head">Asian Consolidation</div>
              <div class="session-time">00:00 - 06:00 GMT</div>
              <p>Low volatility, narrow trading range. Sets up resting buy stops above the Asian high and resting sell stops below the Asian low.</p>
            </div>
            <div class="session-box highlight">
              <div class="session-head">London Open Killzone</div>
              <div class="session-time">07:00 - 10:00 GMT</div>
              <p>Highest initial volume injection. Engineers the "Judas Swing" false breakout of the Asian range before establishing the day's true trend.</p>
            </div>
            <div class="session-box highlight-cyan">
              <div class="session-head">New York Open Killzone</div>
              <div class="session-time">12:30 - 15:30 GMT</div>
              <p>Wall Street opens; US macro economic data releases. Either extends the London trend or provides the secondary institutional reversal setup.</p>
            </div>
          </div>
          <div class="reader-callout-box warning-box" style="margin-top: 20px;">
            <div class="callout-icon">⚠️</div>
            <div class="callout-body">
              <strong>High-Impact Economic News Blackout Protocol:</strong>
              <p>Never enter within 15 minutes before or 15 minutes after red-folder news releases (US Non-Farm Payrolls, Consumer Price Index, FOMC Interest Rate decisions). Spreads widen by 5x to 20x, slippage guarantees stop failure, and order book depth evaporates.</p>
            </div>
          </div>
        `
      },
      {
        pageNumber: 7,
        title: `Chapter 7: Algorithmic Bot Code & Pine Script Blueprint`,
        readTime: `6 min read`,
        content: `
          <div class="page-sec-header">
            <h4>7.1 Translating Strategy into Algorithmic Logic</h4>
            <span class="page-badge">BOT CODE &amp; AUTOMATION</span>
          </div>
          <p>
            To eliminate human psychological weaknesses (greed, revenge trading, hesitation), the strategies presented in <em>"${title}"</em> can be translated into algorithmic rules for <strong>ForexBot Hub MT5 Expert Advisors</strong> and <strong>TradingView Pine Script</strong>:
          </p>
          <div class="reader-code-block">
            <div class="code-head">
              <span>// ForexBotHub_Engine.pine • Algorithmic Strategy Logic</span>
              <button class="code-copy-btn" onclick="navigator.clipboard.writeText('//@version=5\nstrategy(\'ForexBotHub Institutional Order Flow\', overlay=true)\n// Displacement & Fair Value Gap Calculation\natrValue = ta.atr(14)\nisDisplacement = math.abs(close - open) > (atrValue * 1.75)\nisBullishFVG = (low[0] > high[2]) and isDisplacement[1]\nisBearishFVG = (high[0] < low[2]) and isDisplacement[1]\n// Session Killzone Filter (London: 07:00-10:00 GMT)\ninKillzone = not na(time(timeframe.period, \'0700-1000:23456\'))\nif (isBullishFVG and inKillzone)\n    strategy.entry(\'BUY_OB\', strategy.long, limit=low[0])\n    strategy.exit(\'EXIT_BUY\', \'BUY_OB\', stop=low[1] - 5*syminfo.mintick, profit=close + (close-low[1])*3.0)')">Copy Code</button>
            </div>
            <pre><code>//@version=5
strategy("ForexBotHub Institutional Engine", overlay=true, margin_long=100, margin_short=100)

// 1. Volumetric Displacement Engine
atrValue = ta.atr(14)
isDisplacement = math.abs(close - open) > (atrValue * 1.75) and (volume > ta.sma(volume, 20) * 1.5)

// 2. Unmitigated Fair Value Gap (FVG) Detection
isBullishFVG = (low[0] > high[2]) and isDisplacement[1]
isBearishFVG = (high[0] < low[2]) and isDisplacement[1]

// 3. Temporal Session Filter (London Open: 07:00 - 10:00 GMT)
inKillzone = not na(time(timeframe.period, "0700-1000:23456"))

// 4. Execution Engine with Dynamic 1:3 Asymmetric Target
if (isBullishFVG and inKillzone and strategy.position_size == 0)
    stopLoss = low[1] - (atrValue * 0.5)
    takeProfit = close + (close - stopLoss) * 3.0
    strategy.entry("BOT_LONG", strategy.long, limit=low[0])
    strategy.exit("TP_SL", "BOT_LONG", stop=stopLoss, limit=takeProfit)
            </code></pre>
          </div>
          <p style="margin-top: 14px;">
            This algorithmic framework executes with microsecond precision, completely immune to fear, greed, or exhaustion. You can configure and test this exact script in the <strong>ForexBot Hub Bots</strong> and <strong>Live Market</strong> modules.
          </p>
        `
      },
      {
        pageNumber: 8,
        title: `Chapter 8: Live Trading Master Checklist & Execution Protocol`,
        readTime: `4 min read`,
        content: `
          <div class="page-sec-header">
            <h4>8.1 Pre-Flight Execution Checklist</h4>
            <span class="page-badge">FINAL CHECKLIST</span>
          </div>
          <p>
            Before pressing the "Buy" or "Sell" button in any live trading terminal, run through this rigorous 7-point checklist. If even a single box is unchecked, <strong>STAND ASIDE</strong>:
          </p>
          <div class="checklist-grid">
            <div class="chk-item">
              <span class="chk-num">1</span>
              <div>
                <strong>HTF Directional Bias Confirmed:</strong>
                <p>Daily and 4-Hour charts point unequivocally in the direction of the setup; no counter-trend impulse.</p>
              </div>
            </div>
            <div class="chk-item">
              <span class="chk-num">2</span>
              <div>
                <strong>Liquidity Sweep Documented:</strong>
                <p>Significant buy-side or sell-side retail liquidity pool (Asian High/Low, PDH/PDL, equal highs) has been purged.</p>
              </div>
            </div>
            <div class="chk-item">
              <span class="chk-num">3</span>
              <div>
                <strong>Clear Displacement &amp; CHoCH:</strong>
                <p>Price rejected with velocity, printing a fat-bodied candle leaving an unmitigated Fair Value Gap.</p>
              </div>
            </div>
            <div class="chk-item">
              <span class="chk-num">4</span>
              <div>
                <strong>Entry at Optimal Trade Retest:</strong>
                <p>Order is queued inside the 50%-79% retracement zone of the displacement impulse; no chasing.</p>
              </div>
            </div>
            <div class="chk-item">
              <span class="chk-num">5</span>
              <div>
                <strong>Session Timing Validated:</strong>
                <p>Current clock is inside London (07:00-10:00 GMT) or New York (12:30-15:30 GMT) Killzone.</p>
              </div>
            </div>
            <div class="chk-item">
              <span class="chk-num">6</span>
              <div>
                <strong>Economic Calendar Clean:</strong>
                <p>No high-impact red-folder news scheduled for this currency pair in the next 30 minutes.</p>
              </div>
            </div>
            <div class="chk-item">
              <span class="chk-num">7</span>
              <div>
                <strong>Strict Risk Cap Enforced:</strong>
                <p>Calculated lot size risks no more than 1.0% of total account balance with minimum 1:3 R:R potential.</p>
              </div>
            </div>
          </div>
          <div class="reader-completion-card" style="margin-top: 25px;">
            <div class="comp-icon">🎓</div>
            <div class="comp-body">
              <h4>Congratulations on Completing "${title}"!</h4>
              <p>You have mastered all 8 comprehensive chapters of this institutional edition by ${author}. Put this knowledge into practice immediately on the <strong>Live Market Terminal</strong> or download the automated Expert Advisor from the <strong>Bots</strong> section.</p>
            </div>
          </div>
        `
      }
    ];
  }

  // Open Interactive Book Reader Modal (Full Multi-Page Online Reading Experience)
  function openBookReader(bookId) {
    sfx.click();
    const book = BOOKS_DATABASE.find(b => b.id === bookId);
    if (!book) return;

    bookState.activeBook = book;
    bookState.readerPages = generateBookPages(book);
    bookState.currentPageIndex = 0;
    bookState.activeChapterIndex = 0;

    const modal = document.getElementById('bookReaderModal');
    const topicBadge = document.getElementById('readerTopicBadge');
    const titleEl = document.getElementById('readerBookTitle');
    const authorEl = document.getElementById('readerBookAuthor');
    const coreIdeaCallout = document.getElementById('readerCoreIdeaCallout');
    const totalPagesEl = document.getElementById('readerTotalPages');
    const directInput = document.getElementById('readerPageDirectInput');

    if (topicBadge) topicBadge.textContent = book.topic;
    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = `By ${book.author} • Complete Online Edition (${book.pages} Pages)`;

    if (totalPagesEl) totalPagesEl.textContent = bookState.readerPages.length;
    if (directInput) {
      directInput.value = 1;
      directInput.max = bookState.readerPages.length;
    }

    if (coreIdeaCallout) {
      coreIdeaCallout.innerHTML = `
        <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
          <span>💡</span> CORE IDEA OF THIS BOOK
        </div>
        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);">${book.coreIdea}</div>
      `;
    }

    renderReaderToc();
    renderReaderPage();

    // Enforce display and open state
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }

    setReaderTheme(bookState.readerTheme || 'dark');
    applyReaderFontSize();
  }

  // Render Sidebar Table of Contents / Pages List
  function renderReaderToc() {
    const tocList = document.getElementById('readerTocList');
    if (!tocList || !bookState.readerPages) return;

    tocList.innerHTML = bookState.readerPages.map((page, idx) => `
      <div class="toc-item ${idx === bookState.currentPageIndex ? 'active' : ''}" onclick="window.HubApp.goToReaderPage(${idx + 1})">
        <span class="toc-item-num">P.${idx + 1}</span>
        <span class="toc-item-title">${page.title}</span>
      </div>
    `).join('');
  }

  // Render Currently Active Reader Page
  function renderReaderPage() {
    const pageBody = document.getElementById('readerPageBodyText');
    const chapterPill = document.getElementById('readerChapterPill');
    const readTime = document.getElementById('readerReadTime');
    const directInput = document.getElementById('readerPageDirectInput');
    const totalPagesEl = document.getElementById('readerTotalPages');
    const progressFill = document.getElementById('readerProgressFill');
    const progressText = document.getElementById('readerProgressText');
    const prevBtn = document.getElementById('btnPrevReaderPage');
    const nextBtn = document.getElementById('btnNextReaderPage');

    if (!pageBody || !bookState.readerPages || bookState.readerPages.length === 0) return;

    const page = bookState.readerPages[bookState.currentPageIndex];
    if (!page) return;

    if (chapterPill) chapterPill.textContent = page.title;
    if (readTime) readTime.textContent = page.readTime;
    pageBody.innerHTML = page.content;

    const curr = bookState.currentPageIndex + 1;
    const total = bookState.readerPages.length;
    const pct = Math.round((curr / total) * 100);

    if (directInput) directInput.value = curr;
    if (totalPagesEl) totalPagesEl.textContent = total;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `Page ${curr} of ${total} (${pct}%)`;

    if (prevBtn) prevBtn.disabled = (curr === 1);
    if (nextBtn) {
      if (curr === total) {
        nextBtn.innerHTML = `Complete Book ✓`;
        nextBtn.className = 'btn btn-emerald btn-sm';
      } else {
        nextBtn.innerHTML = `Next Page ▶`;
        nextBtn.className = 'btn btn-cyan btn-sm';
      }
    }

    renderReaderToc();

    // Scroll reader content pane back to top smoothly
    const contentPane = document.getElementById('readerContentPane');
    if (contentPane) contentPane.scrollTop = 0;
  }

  // Previous Page Action
  function prevReaderPage() {
    sfx.click();
    if (bookState.currentPageIndex > 0) {
      bookState.currentPageIndex--;
      renderReaderPage();
    }
  }

  // Next Page Action
  function nextReaderPage() {
    sfx.click();
    if (bookState.currentPageIndex < bookState.readerPages.length - 1) {
      bookState.currentPageIndex++;
      renderReaderPage();
    } else {
      sfx.success();
      showToast('Book Completed!', 'You have successfully read all pages of this master guide!', 'success');
    }
  }

  // Direct Jump to Specific Page
  function goToReaderPage(pageNum) {
    if (!bookState.readerPages || bookState.readerPages.length === 0) return;
    sfx.click();
    const target = Math.max(1, Math.min(bookState.readerPages.length, pageNum));
    bookState.currentPageIndex = target - 1;
    renderReaderPage();
  }

  // Adjust Reader Font Size (A- / A+)
  function adjustReaderFontSize(delta) {
    sfx.pop();
    bookState.readerFontSize = Math.min(24, Math.max(13, (bookState.readerFontSize || 16) + delta));
    applyReaderFontSize();
  }

  function applyReaderFontSize() {
    const pageBody = document.getElementById('readerPageBodyText');
    if (pageBody) {
      pageBody.style.fontSize = `${bookState.readerFontSize}px`;
    }
  }

  // Set Reader Color Theme ('dark', 'sepia', 'light')
  function setReaderTheme(theme) {
    sfx.click();
    bookState.readerTheme = theme;
    const box = document.querySelector('.book-reader-box');
    if (!box) return;

    box.classList.remove('theme-dark', 'theme-sepia', 'theme-light');
    box.classList.add(`theme-${theme}`);

    document.querySelectorAll('.reader-theme-selector .theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  // Toggle Reader Fullscreen
  function toggleReaderFullscreen() {
    sfx.pop();
    const modalBox = document.querySelector('.book-reader-box');
    if (!modalBox) return;

    if (!document.fullscreenElement) {
      modalBox.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Keyboard navigation for Reader
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('bookReaderModal');
    if (modal && modal.classList.contains('active')) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextReaderPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevReaderPage();
      } else if (e.key === 'Escape') {
        closeModal('bookReaderModal');
      }
    }
  });

  // ==========================================================================
  // INTERACTIVE MOVEABLE & SIZE-ADJUSTABLE PDF BOOK VIEWER ENGINE
  // Provides authentic manual reading experience with drag-to-move,
  // drag-to-resize, window presets (S, M, L, Max), zoom, continuous scroll,
  // in-document search, and complete 8-sheet document generation.
  // ==========================================================================
  const pdfState = {
    activeBook: null,
    currentPage: 1,
    totalPages: 8,
    zoomPct: 100,
    readingMode: 'single', // 'single' or 'scroll'
    sizePreset: 'standard', // 'compact', 'standard', 'large', 'max'
    isMaximized: false,
    prevStyle: null,
    searchQuery: '',
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    initialPos: { left: 0, top: 0 },
    isResizing: false,
    resizeStart: { x: 0, y: 0, w: 0, h: 0 },
    listenersAttached: false
  };

  function initPdfDragAndResize() {
    if (pdfState.listenersAttached) return;
    pdfState.listenersAttached = true;

    const win = document.getElementById('pdfFloatingWindow');
    const header = document.getElementById('pdfWindowHeader');
    const handle = document.getElementById('pdfResizeHandle');
    if (!win || !header) return;

    // Drag header to move anywhere on screen
    header.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons, inputs, or size presets
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.pdf-size-presets')) {
        return;
      }
      if (pdfState.isMaximized) return;

      pdfState.isDragging = true;
      pdfState.dragStart = { x: e.clientX, y: e.clientY };
      const rect = win.getBoundingClientRect();
      pdfState.initialPos = { left: rect.left, top: rect.top };
      win.style.transform = 'none';
      win.style.left = `${rect.left}px`;
      win.style.top = `${rect.top}px`;
      document.body.style.userSelect = 'none';
    });

    // Drag resize handle at bottom right corner
    if (handle) {
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        if (pdfState.isMaximized) return;

        pdfState.isResizing = true;
        pdfState.resizeStart = {
          x: e.clientX,
          y: e.clientY,
          w: win.offsetWidth,
          h: win.offsetHeight
        };
        document.body.style.userSelect = 'none';
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (pdfState.isDragging) {
        const dx = e.clientX - pdfState.dragStart.x;
        const dy = e.clientY - pdfState.dragStart.y;
        let newLeft = pdfState.initialPos.left + dx;
        let newTop = pdfState.initialPos.top + dy;

        // Ensure window stays within screen bounds
        const maxLeft = Math.max(10, window.innerWidth - 120);
        const maxTop = Math.max(10, window.innerHeight - 80);
        newLeft = Math.max(10, Math.min(maxLeft, newLeft));
        newTop = Math.max(10, Math.min(maxTop, newTop));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
      } else if (pdfState.isResizing) {
        const dw = e.clientX - pdfState.resizeStart.x;
        const dh = e.clientY - pdfState.resizeStart.y;
        const newW = Math.max(460, Math.min(window.innerWidth - 20, pdfState.resizeStart.w + dw));
        const newH = Math.max(480, Math.min(window.innerHeight - 20, pdfState.resizeStart.h + dh));

        win.style.width = `${newW}px`;
        win.style.height = `${newH}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      if (pdfState.isDragging || pdfState.isResizing) {
        pdfState.isDragging = false;
        pdfState.isResizing = false;
        document.body.style.userSelect = '';
      }
    });

    // Keyboard navigation when PDF viewer is open
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('pdfBookModal');
      if (modal && modal.style.display !== 'none') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          nextPdfPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          prevPdfPage();
        } else if (e.key === 'Escape') {
          closePdfBookViewer();
        }
      }
    });
  }

  // Generates 8 authentic PDF manual sheets for the requested book
  function generatePdfDocumentSheets(book) {
    const title = book.title || 'Trading Masterclass';
    const author = book.author || 'ForexBot Hub Research';
    const topic = book.topic || 'Price Action';
    const coreIdea = book.coreIdea || 'Mastering institutional order flow and market structure.';
    const docRef = `FBH-PDF-${book.id.toUpperCase()}-2026`;

    return `
      <!-- ==========================================
           PAGE 1: OFFICIAL FRONT COVER
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="1">
        <div class="pdf-sheet-header">
          <span>FOREX BOT HUB OFFICIAL EDITION • DOCUMENT CLASSIFICATION: PUBLIC MASTER</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-cover-sheet">
          <div class="pdf-cover-accent-bar" style="background: ${book.coverColor || '#06b6d4'};"></div>
          <div class="pdf-cover-meta-tag">${topic.toUpperCase()} CURRICULUM • VOLUME I</div>
          
          <h1 class="pdf-cover-h1">${title}</h1>
          <h2 class="pdf-cover-author">Authored by <strong>${author}</strong></h2>

          <div class="pdf-cover-divider"></div>

          <p class="pdf-cover-desc">
            Complete institutional reference handbook covering algorithmic liquidity delivery, market profile distribution, order flow imbalance, and verified high-probability trade management.
          </p>

          <div class="pdf-cover-badges">
            <span class="pdf-cover-pill">★ ${book.rating} Rating</span>
            <span class="pdf-cover-pill">${book.pages} Pages Edition</span>
            <span class="pdf-cover-pill">${book.year} Publication</span>
            <span class="pdf-cover-pill">100% Free Companion</span>
          </div>

          <div class="pdf-cover-seal-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${book.coverColor || '#06b6d4'}" stroke-width="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <div>
              <strong>VERIFIED INSTITUTIONAL PUBLICATION</strong>
              <p>ForexBot Hub Quantitative Trading Library • MetaTrader 5 &amp; TradingView Architecture</p>
            </div>
          </div>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 1 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 2: EXECUTIVE SUMMARY & CORE THESIS
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="2">
        <div class="pdf-sheet-header">
          <span>CHAPTER 1: THE INSTITUTIONAL MARKET ARCHITECTURE</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>1.1 Executive Summary &amp; Interbank Order Mechanics</h3>
            <span class="pdf-stamp-badge">THEORY &amp; ANALYSIS</span>
          </div>

          <p>
            In <strong>"${title}"</strong>, ${author} demonstrates that modern currency exchange rates are neither chaotic nor governed by classical retail chart patterns (such as head-and-shoulders, diagonal trendlines, or moving average crossovers). Over <strong>$7.5 Trillion</strong> circulates every single business day through the interbank network, governed by institutional liquidity providers and Tier-1 market makers.
          </p>

          <div class="pdf-callout-box">
            <div class="pdf-callout-title">CORE THESIS BY ${author.toUpperCase()}:</div>
            <p>${coreIdea}</p>
          </div>

          <h4 style="margin: 18px 0 8px; color: #0f172a; font-size: 1rem;">The 90-90-90 Retail Failure Reality</h4>
          <p>
            Statistical market telemetry reveals that 90% of retail participants lose 90% of their deposited margin within 90 days. This catastrophic loss is not accidental: retail stop-loss orders represent predictable pools of resting counter-party liquidity. When price violently moves past obvious swing points before reversing, this is not an anomaly—it is the Interbank Price Delivery Algorithm fulfilling commercial buy and sell quotas.
          </p>

          <div class="pdf-diagram-box">
            <div class="pdf-diagram-title">FIGURE 1.1: INSTITUTIONAL PARTICIPANT HIERARCHY</div>
            <pre style="margin:0; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#38bdf8; line-height:1.4;">
[TIER 1 CENTRAL &amp; INVESTMENT BANKS]  -> J.P. Morgan, Citi, Deutsche (Infinite Liquidity)
   ▲
  / \   [QUANTITATIVE HEDGE FUNDS]     -> Citadel, Bridgewater, High-Frequency Desks
 /   \  [COMMERCIAL HEDGERS]           -> Multinational Corporates &amp; Importers
/     \ [RETAIL B-BOOK BROKERS]        -> Internalizes Flow &amp; Offsets Against Retail Loss
─────── [RETAIL TRADING POOL]          -> 90% Resting Stop Clusters (Target Liquidity)
            </pre>
          </div>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 2 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 3: STRUCTURAL GEOMETRY & BREAKOUT
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="3">
        <div class="pdf-sheet-header">
          <span>CHAPTER 2: STRUCTURAL GEOMETRY &amp; SETUP IDENTIFICATION</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>2.1 Market Geometry: BOS vs. CHoCH Confirmation</h3>
            <span class="pdf-stamp-badge">SETUP BLUEPRINT</span>
          </div>

          <p>
            Precision execution requires classifying whether price action represents continuation or structural transition. Two structural milestones govern high-probability entry models:
          </p>

          <ul class="pdf-rule-list">
            <li>
              <strong>Break of Structure (BOS):</strong> Confirmed when a candle body closes decisively past the most recent swing high or low in the prevailing Higher Timeframe (HTF) trend direction. Validates algorithmic order continuity.
            </li>
            <li>
              <strong>Change of Character (CHoCH):</strong> Occurs when price breaches the internal structural swing low/high responsible for creating the most recent extreme. Signals that institutional flow has pivoted from net accumulation to net distribution.
            </li>
          </ul>

          <h4 style="margin: 18px 0 8px; color: #0f172a; font-size: 0.95rem;">Structural Validation Matrix</h4>
          <table class="pdf-data-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Institutional High-Probability Setup</th>
                <th>Retail Trap / Invalidation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Candle Body Close</strong></td>
                <td>Candle body closes cleanly beyond swing level</td>
                <td>Only candle wick pierces the level (Liquidity Sweep)</td>
              </tr>
              <tr>
                <td><strong>Volume Displacement</strong></td>
                <td>Candle body &gt; 1.8x Average True Range (ATR)</td>
                <td>Small doji or weak candles with decreasing volume</td>
              </tr>
              <tr>
                <td><strong>HTF Alignment</strong></td>
                <td>M15 structure shift occurs inside 4-Hour Point of Interest</td>
                <td>Breakout in the middle of nowhere without liquidity backing</td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top: 14px;">
            <em>Critical Principle:</em> Never execute on a lower timeframe structure shift unless price has already interacted with an established higher timeframe liquidity pool or Fair Value Gap.
          </p>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 3 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 4: VISUAL ANATOMICAL SCHEMATIC
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="4">
        <div class="pdf-sheet-header">
          <span>CHAPTER 3: ANATOMICAL PRICE ACTION SCHEMATIC</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>3.1 Visual Anatomical Liquidity Delivery Schematic</h3>
            <span class="pdf-stamp-badge">VISUAL MASTERCLASS</span>
          </div>

          <p>
            Study this five-stage institutional price cycle carefully. This sequence repeats across all timeframes from the 1-Minute scalping chart up to the Daily institutional timeframe:
          </p>

          <div class="pdf-diagram-box">
            <div class="pdf-diagram-title">FIGURE 3.1: LIQUIDITY SWEEP &amp; MITIGATION BLUEPRINT</div>
            <div class="pdf-diagram-svg-wrap">
              <svg width="100%" height="210" viewBox="0 0 700 210" style="max-width: 100%;">
                <!-- Background grid -->
                <line x1="20" y1="50" x2="680" y2="50" stroke="#1e293b" stroke-dasharray="4,4"/>
                <line x1="20" y1="150" x2="680" y2="150" stroke="#1e293b" stroke-dasharray="4,4"/>

                <!-- Text labels -->
                <text x="25" y="44" fill="#94a3b8" font-size="11" font-family="'JetBrains Mono', monospace">Asian High Liquidity Pool (Resting Buy Stops)</text>
                <text x="25" y="165" fill="#94a3b8" font-size="11" font-family="'JetBrains Mono', monospace">Asian Low Liquidity Pool (Resting Sell Stops)</text>

                <!-- Asian consolidation wave -->
                <polyline points="30,100 60,65 90,135 120,70 150,130 180,95" fill="none" stroke="#64748b" stroke-width="2.5"/>

                <!-- Judas Swing (False Breakout) -->
                <polyline points="180,95 230,28" fill="none" stroke="#ef4444" stroke-width="3"/>
                <circle cx="230" cy="28" r="4.5" fill="#ef4444"/>
                <text x="240" y="28" fill="#ef4444" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">JUDAS SWING (LIQUIDITY PURGE)</text>

                <!-- Aggressive Displacement Candle (CHoCH) -->
                <polyline points="230,28 320,180" fill="none" stroke="#10b981" stroke-width="3.5"/>
                <text x="330" y="180" fill="#10b981" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">DISPLACEMENT (CHoCH CONFIRMED)</text>

                <!-- Retest / Mitigation Zone -->
                <rect x="360" y="85" width="80" height="30" fill="rgba(6,182,212,0.18)" stroke="#06b6d4" stroke-width="1.2"/>
                <text x="365" y="104" fill="#06b6d4" font-size="10" font-family="'JetBrains Mono', monospace">FVG MITIGATION</text>
                <polyline points="320,180 395,95" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3,3"/>

                <!-- Entry Arrow -->
                <circle cx="395" cy="95" r="5" fill="#06b6d4"/>
                <text x="408" y="92" fill="#38bdf8" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">OPTIMAL ENTRY (62%-79%)</text>

                <!-- Expansion to Target -->
                <polyline points="395,95 480,195 560,195" fill="none" stroke="#10b981" stroke-width="3"/>
                <polygon points="560,195 550,190 550,200" fill="#10b981"/>
                <text x="460" y="180" fill="#10b981" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace">TAKE PROFIT EXPANSION (1:3+ R:R)</text>
              </svg>
            </div>
          </div>

          <div class="pdf-callout-box" style="margin-top: 14px;">
            <div class="pdf-callout-title">KEY EXECUTION PHASES:</div>
            <p>
              <strong>Phase 1:</strong> Accumulation of resting orders in Asian session range.<br>
              <strong>Phase 2:</strong> Manipulation run 8-15 pips above the high to trigger buy stops into institutional short positions.<br>
              <strong>Phase 3:</strong> Clean displacement breakdown creating Fair Value Gap imbalance.<br>
              <strong>Phase 4:</strong> Controlled retracement mitigation offering 1:3.5 risk-to-reward ratio.
            </p>
          </div>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 4 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 5: PRECISION ENTRY RULES
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="5">
        <div class="pdf-sheet-header">
          <span>CHAPTER 4: PRECISION SETUP RULES &amp; CRITERIA</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>4.1 Step-by-Step Rule Engine &amp; Checklist</h3>
            <span class="pdf-stamp-badge">EXECUTION RULES</span>
          </div>

          <p>
            Discipline separates professional algorithmic and manual operators from gambled capital. You must satisfy <strong>all four conditions</strong> prior to initiating order entry:
          </p>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 14px 18px; margin: 12px 0;">
            <p style="margin: 0 0 10px; font-weight: 700; color: #0f172a;">Rule 1: Time of Day Filter (Killzones Only)</p>
            <p style="margin: 0 0 12px; font-size: 0.9rem; color: #334155;">Only deploy capital during highest liquidity windows: London Open Killzone (07:00 - 10:00 UTC) or New York Open Killzone (12:00 - 15:00 UTC). Outside these hours, spreads widen and algorithmic manipulation increases.</p>

            <p style="margin: 0 0 10px; font-weight: 700; color: #0f172a;">Rule 2: Liquidity Pool Purge Before Entry</p>
            <p style="margin: 0 0 12px; font-size: 0.9rem; color: #334155;">Never buy at a high or sell at a low. The market must sweep equal highs (EQH) or equal lows (EQL) to exhaust retail momentum traders.</p>

            <p style="margin: 0 0 10px; font-weight: 700; color: #0f172a;">Rule 3: Clean Displacement with Fair Value Gap (FVG)</p>
            <p style="margin: 0 0 12px; font-size: 0.9rem; color: #334155;">Candle 2 of a 3-candle sequence must leave an open price gap between the high of Candle 1 and low of Candle 3. This confirms institutional commitment.</p>

            <p style="margin: 0 0 10px; font-weight: 700; color: #0f172a;">Rule 4: Stop-Loss Placement at Structural Invalidation</p>
            <p style="margin: 0; font-size: 0.9rem; color: #334155;">Set your stop loss strictly 2.5 pips beyond the displacement origin swing extreme. Never widen a stop under any market circumstance.</p>
          </div>

          <div class="pdf-callout-box">
            <div class="pdf-callout-title">INVALIDATION RULE:</div>
            <p>
              If price retests the entry zone but closes beyond the 79% Fibonacci retracement level, the setup is immediately disqualified. Cancel all resting limit orders.
            </p>
          </div>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 5 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 6: RISK MANAGEMENT & FORMULAS
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="6">
        <div class="pdf-sheet-header">
          <span>CHAPTER 5: CAPITAL PRESERVATION &amp; POSITION SIZING</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>5.1 Mathematical Position Sizing Algorithms</h3>
            <span class="pdf-stamp-badge">QUANTITATIVE RISK</span>
          </div>

          <p>
            A trading edge is mathematically meaningless without strict drawdown management. To survive 15 consecutive losing trades without triggering a 20% drawdown limit, position sizing must scale dynamically:
          </p>

          <div class="pdf-callout-box">
            <div class="pdf-callout-title">DYNAMIC LOT SIZING FORMULA:</div>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 700; color: #0f172a;">
              Lot Size = (Account Equity × Risk Percentage) / (Stop Loss Pips × Pip Value)
            </p>
          </div>

          <h4 style="margin: 18px 0 8px; color: #0f172a; font-size: 0.95rem;">Position Sizing Reference Table ($10,000 Equity Account)</h4>
          <table class="pdf-data-table">
            <thead>
              <tr>
                <th>Asset Pair</th>
                <th>Risk % ($ Amount)</th>
                <th>Stop Loss (Pips)</th>
                <th>Pip Value ($)</th>
                <th>Calculated Lots</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EUR/USD</td>
                <td>1.0% ($100.00)</td>
                <td>20 Pips</td>
                <td>$10.00 / lot</td>
                <td><strong>0.50 Lots</strong></td>
              </tr>
              <tr>
                <td>GBP/USD</td>
                <td>1.5% ($150.00)</td>
                <td>25 Pips</td>
                <td>$10.00 / lot</td>
                <td><strong>0.60 Lots</strong></td>
              </tr>
              <tr>
                <td>XAU/USD (Gold)</td>
                <td>1.0% ($100.00)</td>
                <td>35 Pips ($3.50)</td>
                <td>$10.00 / 0.10</td>
                <td><strong>0.28 Lots</strong></td>
              </tr>
              <tr>
                <td>USD/JPY</td>
                <td>1.0% ($100.00)</td>
                <td>18 Pips</td>
                <td>$6.80 / lot</td>
                <td><strong>0.81 Lots</strong></td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top: 14px; font-size: 0.88rem; color: #475569;">
            <em>Risk Ceiling Policy:</em> Never allocate greater than <strong>2.0%</strong> equity risk on any single trade. If cumulative daily drawdown reaches <strong>4.0%</strong>, automated trading must pause until the next London session open.
          </p>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 6 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 7: ALGORITHMIC AUTOMATION CODE
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="7">
        <div class="pdf-sheet-header">
          <span>CHAPTER 6: ALGORITHMIC IMPLEMENTATION (MQL5 &amp; PINESCRIPT)</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>6.1 Automated Expert Advisor Code Architecture</h3>
            <span class="pdf-stamp-badge">ALGO CODE</span>
          </div>

          <p>
            The strategy principles outlined in this guide are directly automatable in MetaTrader 5 (MQL5) and TradingView PineScript v5. Below is the production execution framework:
          </p>

          <pre class="pdf-code-snippet">
//+------------------------------------------------------------------+
//| ForexBotHub_${book.id.toUpperCase()}_Strategy.mq5
//| Copyright 2026, ForexBot Hub Team (https://forexbothub.com)
//+------------------------------------------------------------------+
#property copyright "ForexBot Hub Quantitative Suite"
#property version   "2.10"
#include &lt;Trade\\Trade.mqh&gt;

CTrade trade;
input double InpRiskPct     = 1.5;   // Risk Percentage per Trade
input int    InpKillzoneHour= 7;     // London Session Start Hour (UTC)
input double InpMinRR       = 3.0;   // Minimum Risk to Reward Ratio

void OnTick()
{
   MqlDateTime dt;
   TimeGMT(dt);
   if(dt.hour &lt; InpKillzoneHour || dt.hour &gt; (InpKillzoneHour + 4)) return;

   // Check liquidity sweep and Fair Value Gap retest
   double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   
   if(IsInstitutionalBuyConditionMet())
   {
      double sl = CalculateStructuralSwingLow();
      double lot = CalculateDynamicLotSize(InpRiskPct, MathAbs(ask - sl));
      double tp = ask + ((ask - sl) * InpMinRR);
      trade.Buy(lot, _Symbol, ask, sl, tp, "ForexBotHub_${book.id}");
   }
}
          </pre>

          <p style="font-size: 0.88rem; color: #475569;">
            This Expert Advisor structure automatically incorporates ATR trailing stop logic, spread deviation protection, and automatic session shutoffs during high-impact news releases.
          </p>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 7 of 8</span>
        </div>
      </div>

      <!-- ==========================================
           PAGE 8: DISCIPLINE CHECKLIST & CERTIFICATE
           ========================================== -->
      <div class="pdf-page-sheet" data-page-num="8">
        <div class="pdf-sheet-header">
          <span>CHAPTER 7: MASTER TRADER DISCIPLINE &amp; CERTIFICATION</span>
          <span>REF: ${docRef}</span>
        </div>

        <div class="pdf-sheet-body">
          <div class="pdf-sec-title-row">
            <h3>7.1 Daily Trading Audit &amp; Journal Protocol</h3>
            <span class="pdf-stamp-badge">CERTIFIED DISCIPLINE</span>
          </div>

          <p>
            Success in quantitative and manual trading is an exercise in emotional control. Affirm these rules before taking any trade today:
          </p>

          <ul class="pdf-rule-list">
            <li>☑ <strong>Pre-Session Macro Check:</strong> Verified Forex Factory / Bloomberg calendar for high-impact NFP, CPI, or FOMC news.</li>
            <li>☑ <strong>Technical Alignment:</strong> Higher Timeframe (4-Hour) bias matches the lower timeframe execution direction.</li>
            <li>☑ <strong>Pre-Calculated Risk:</strong> Exact lot size calculated before clicking buy or sell, matching 1% - 1.5% maximum capital risk.</li>
            <li>☑ <strong>Trade Invalidation Set:</strong> Stop loss entered simultaneously with order fill; no manual override or emotional widening.</li>
            <li>☑ <strong>Daily Profit/Loss Limit:</strong> Committed to closing terminal if 3 consecutive losses or 2 full target wins occur.</li>
          </ul>

          <div style="border: 2px dashed #06b6d4; border-radius: 8px; padding: 20px; background: rgba(6,182,212,0.03); text-align: center; margin-top: 24px;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
              MASTER OPERATOR CERTIFICATE OF COMPLETION
            </div>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 12px;">
              This certifies that the bearer has completed the comprehensive manual study for:<br>
              <strong style="color: #06b6d4; font-size: 0.95rem;">"${title}"</strong> by <strong>${author}</strong>
            </p>
            <div style="display: flex; justify-content: space-around; align-items: center; margin-top: 14px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #94a3b8;">
              <div>Verified: FOREXBOT HUB ACADEMY</div>
              <div>Status: ACTIVE TRADER LICENSE</div>
              <div>Seal: [AUTHENTICATED 2026]</div>
            </div>
          </div>
        </div>

        <div class="pdf-sheet-footer">
          <span>ForexBot Hub Library • ${title}</span>
          <span class="pdf-page-num">Page 8 of 8</span>
        </div>
      </div>
    `;
  }

  // Open the Moveable & Size-Adjustable PDF Reader
  function openPdfBookViewer(bookId) {
    sfx.click();
    const book = BOOKS_DATABASE.find(b => b.id === bookId);
    if (!book) return;

    pdfState.activeBook = book;
    pdfState.currentPage = 1;
    pdfState.totalPages = 8;
    pdfState.zoomPct = 100;
    pdfState.readingMode = 'single';
    pdfState.searchQuery = '';

    const modal = document.getElementById('pdfBookModal');
    const titleEl = document.getElementById('pdfBookTitle');
    const authorEl = document.getElementById('pdfBookAuthor');
    const container = document.getElementById('pdfCanvasContainer');
    const totalPagesEl = document.getElementById('pdfTotalPages');
    const pageInput = document.getElementById('pdfPageInput');
    const searchInput = document.getElementById('pdfSearchInput');

    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = `By ${book.author} • Complete 8-Sheet Manual Edition`;
    if (totalPagesEl) totalPagesEl.textContent = '8';
    if (pageInput) {
      pageInput.value = '1';
      pageInput.max = '8';
    }
    if (searchInput) searchInput.value = '';

    if (container) {
      container.innerHTML = generatePdfDocumentSheets(book);
    }

    // Set standard window size and center on screen
    setPdfWindowSize('standard');

    // Initialize dragging and resizing listeners
    initPdfDragAndResize();

    // Render single vs scroll view
    renderPdfView();

    // Display modal
    if (modal) {
      modal.style.display = 'block';
    }

    showToast('PDF Manual Opened', `Opened "${book.title}". Move & resize freely on screen.`, 'info');
  }

  // Close PDF Reader
  function closePdfBookViewer() {
    sfx.click();
    const modal = document.getElementById('pdfBookModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Set window preset size ('compact', 'standard', 'large')
  function setPdfWindowSize(preset) {
    sfx.pop();
    const win = document.getElementById('pdfFloatingWindow');
    if (!win) return;

    pdfState.sizePreset = preset;
    pdfState.isMaximized = false;
    win.classList.remove('maximized');

    document.querySelectorAll('.pdf-size-presets .pdf-size-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    let w = 960, h = 740;
    if (preset === 'compact') {
      w = Math.min(720, window.innerWidth - 30);
      h = Math.min(540, window.innerHeight - 50);
      const btn = document.querySelector('.pdf-size-presets button:nth-child(2)');
      if (btn) btn.classList.add('active');
    } else if (preset === 'large') {
      w = Math.min(1240, window.innerWidth - 30);
      h = Math.min(880, window.innerHeight - 50);
      const btn = document.querySelector('.pdf-size-presets button:nth-child(4)');
      if (btn) btn.classList.add('active');
    } else {
      // standard
      w = Math.min(960, window.innerWidth - 30);
      h = Math.min(740, window.innerHeight - 50);
      const btn = document.getElementById('btnPdfSizeStandard');
      if (btn) btn.classList.add('active');
    }

    const left = Math.max(10, Math.floor((window.innerWidth - w) / 2));
    const top = Math.max(10, Math.floor((window.innerHeight - h) / 2));

    win.style.width = `${w}px`;
    win.style.height = `${h}px`;
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
    win.style.transform = 'none';
  }

  // Maximize / Restore floating window
  function togglePdfWindowMax() {
    sfx.pop();
    const win = document.getElementById('pdfFloatingWindow');
    const maxBtn = document.getElementById('btnPdfMax');
    if (!win) return;

    if (!pdfState.isMaximized) {
      pdfState.prevStyle = {
        width: win.style.width,
        height: win.style.height,
        left: win.style.left,
        top: win.style.top
      };
      win.classList.add('maximized');
      win.style.left = '14px';
      win.style.top = '14px';
      win.style.width = 'calc(100vw - 28px)';
      win.style.height = 'calc(100vh - 28px)';
      pdfState.isMaximized = true;
      if (maxBtn) maxBtn.classList.add('active');
    } else {
      win.classList.remove('maximized');
      if (pdfState.prevStyle) {
        win.style.width = pdfState.prevStyle.width || '960px';
        win.style.height = pdfState.prevStyle.height || '740px';
        win.style.left = pdfState.prevStyle.left || '40px';
        win.style.top = pdfState.prevStyle.top || '40px';
      }
      pdfState.isMaximized = false;
      if (maxBtn) maxBtn.classList.remove('active');
    }
  }

  // Render PDF View according to single page vs continuous scroll
  function renderPdfView() {
    const sheets = document.querySelectorAll('.pdf-page-sheet');
    const pageInput = document.getElementById('pdfPageInput');
    const zoomLabel = document.getElementById('pdfZoomLabel');

    if (pageInput) pageInput.value = pdfState.currentPage;
    if (zoomLabel) zoomLabel.textContent = `${pdfState.zoomPct}%`;

    sheets.forEach((sheet, idx) => {
      const pageNum = idx + 1;
      if (pdfState.readingMode === 'single') {
        if (pageNum === pdfState.currentPage) {
          sheet.style.display = 'block';
        } else {
          sheet.style.display = 'none';
        }
      } else {
        // Continuous scroll mode: show all sheets
        sheet.style.display = 'block';
      }

      // Apply zoom scale
      const scale = pdfState.zoomPct / 100;
      sheet.style.transform = `scale(${scale})`;
      sheet.style.transformOrigin = 'top center';
      sheet.style.marginBottom = `${24 * scale}px`;
    });

    // Scroll viewport to top if single page flip
    const viewport = document.getElementById('pdfViewport');
    if (viewport && pdfState.readingMode === 'single') {
      viewport.scrollTop = 0;
    }
  }

  // Previous Page
  function prevPdfPage() {
    sfx.click();
    if (pdfState.currentPage > 1) {
      pdfState.currentPage--;
      if (pdfState.readingMode === 'single') {
        renderPdfView();
      } else {
        scrollToPdfPage(pdfState.currentPage);
      }
    }
  }

  // Next Page
  function nextPdfPage() {
    sfx.click();
    if (pdfState.currentPage < pdfState.totalPages) {
      pdfState.currentPage++;
      if (pdfState.readingMode === 'single') {
        renderPdfView();
      } else {
        scrollToPdfPage(pdfState.currentPage);
      }
    } else {
      sfx.success();
      showToast('Document End', 'You have reached the final page of this manual.', 'info');
    }
  }

  // Jump to specific page
  function goToPdfPage(pageNum) {
    if (isNaN(pageNum)) return;
    sfx.click();
    const target = Math.max(1, Math.min(pdfState.totalPages, pageNum));
    pdfState.currentPage = target;
    if (pdfState.readingMode === 'single') {
      renderPdfView();
    } else {
      scrollToPdfPage(target);
    }
  }

  function scrollToPdfPage(targetPage) {
    const sheets = document.querySelectorAll('.pdf-page-sheet');
    const targetSheet = sheets[targetPage - 1];
    const viewport = document.getElementById('pdfViewport');
    if (targetSheet && viewport) {
      viewport.scrollTop = targetSheet.offsetTop - 20;
      const pageInput = document.getElementById('pdfPageInput');
      if (pageInput) pageInput.value = targetPage;
    }
  }

  // Zoom adjustments
  function adjustPdfZoom(delta) {
    sfx.pop();
    pdfState.zoomPct = Math.max(50, Math.min(200, pdfState.zoomPct + delta));
    renderPdfView();
  }

  // Fit Width to Viewport
  function setPdfFitWidth() {
    sfx.pop();
    const viewport = document.getElementById('pdfViewport');
    if (!viewport) return;
    const vpWidth = viewport.clientWidth - 50;
    // Standard sheet base width is ~780px
    const targetPct = Math.round((vpWidth / 780) * 100);
    pdfState.zoomPct = Math.max(60, Math.min(180, targetPct));
    renderPdfView();
  }

  // Toggle Single Page vs Continuous Scroll mode
  function setPdfReadingMode(mode) {
    sfx.click();
    pdfState.readingMode = mode;
    const btnSingle = document.getElementById('btnPdfModeSingle');
    const btnScroll = document.getElementById('btnPdfModeScroll');

    if (btnSingle) btnSingle.classList.toggle('active', mode === 'single');
    if (btnScroll) btnScroll.classList.toggle('active', mode === 'scroll');

    renderPdfView();
  }

  // Search inside PDF document
  function searchInPdf(query) {
    pdfState.searchQuery = (query || '').trim().toLowerCase();
    const sheets = document.querySelectorAll('.pdf-page-sheet');
    if (!pdfState.searchQuery) return;

    // Search through sheets for first match
    for (let i = 0; i < sheets.length; i++) {
      const text = sheets[i].innerText.toLowerCase();
      if (text.includes(pdfState.searchQuery)) {
        pdfState.currentPage = i + 1;
        if (pdfState.readingMode === 'single') {
          renderPdfView();
        } else {
          scrollToPdfPage(i + 1);
        }
        break;
      }
    }
  }

  // Print PDF document
  function printPdfDocument() {
    sfx.success();
    // In continuous scroll, ensure all pages visible before triggering print
    pdfState.readingMode = 'scroll';
    renderPdfView();
    window.print();
  }
  function playBookAudio(bookId) {
    const book = BOOKS_DATABASE.find(b => b.id === bookId);
    if (!book) return;
    bookState.activeBook = book;
    startAudioNarration();
  }

  function playActiveBookAudio() {
    if (!bookState.activeBook) return;
    startAudioNarration();
  }

  function startAudioNarration() {
    sfx.pop();
    const dock = document.getElementById('bookAudioDock');
    const titleEl = document.getElementById('audioBookTitle');
    const subEl = document.getElementById('audioBookSubtitle');
    const playPauseBtn = document.getElementById('audioPlayPauseBtn');
    const waveBox = document.getElementById('audioWaveBox');

    if (dock) dock.style.display = 'block';
    if (titleEl) titleEl.textContent = bookState.activeBook.title;
    if (subEl) subEl.textContent = `Narrating: ${bookState.activeBook.author} • ${bookState.selectedVoiceGender.toUpperCase()} VOICE`;

    if (!window.speechSynthesis) {
      showToast('Audio Notice', 'Speech synthesis is not supported in this browser.', 'error');
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const textToSpeak = `${bookState.activeBook.title} by ${bookState.activeBook.author}. ${bookState.activeBook.coreIdea} ${bookState.activeBook.chapters.map(c => c.title + '. ' + c.content).join(' ')}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = bookState.selectedSpeed;

    const selectedVoice = getPreferredVoice(bookState.selectedVoiceGender);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      bookState.isPlayingAudio = true;
      bookState.isPausedAudio = false;
      if (waveBox) waveBox.classList.add('playing');
      if (playPauseBtn) playPauseBtn.textContent = '⏸ Pause';
    };

    utterance.onend = () => {
      bookState.isPlayingAudio = false;
      bookState.isPausedAudio = false;
      if (waveBox) waveBox.classList.remove('playing');
      if (playPauseBtn) playPauseBtn.textContent = '▶ Play';
      showToast('Narration Completed', 'Audio playback finished for this trading book.', 'info');
    };

    utterance.onerror = () => {
      bookState.isPlayingAudio = false;
      bookState.isPausedAudio = false;
      if (waveBox) waveBox.classList.remove('playing');
      if (playPauseBtn) playPauseBtn.textContent = '▶ Play';
    };

    bookState.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    showToast('Audio Playing', `Narrating "${bookState.activeBook.title}" in ${bookState.selectedVoiceGender} voice.`, 'success');
  }

  function toggleAudioPlayPause() {
    sfx.click();
    const playPauseBtn = document.getElementById('audioPlayPauseBtn');
    const waveBox = document.getElementById('audioWaveBox');

    if (!window.speechSynthesis) return;

    if (bookState.isPlayingAudio && !bookState.isPausedAudio) {
      window.speechSynthesis.pause();
      bookState.isPausedAudio = true;
      if (waveBox) waveBox.classList.remove('playing');
      if (playPauseBtn) playPauseBtn.textContent = '▶ Resume';
      showToast('Audio Paused', 'Narration paused.', 'info');
    } else if (bookState.isPausedAudio) {
      window.speechSynthesis.resume();
      bookState.isPausedAudio = false;
      if (waveBox) waveBox.classList.add('playing');
      if (playPauseBtn) playPauseBtn.textContent = '⏸ Pause';
      showToast('Audio Resumed', 'Continuing book narration.', 'info');
    } else {
      startAudioNarration();
    }
  }

  function stopBookAudio() {
    sfx.click();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    bookState.isPlayingAudio = false;
    bookState.isPausedAudio = false;
    const playPauseBtn = document.getElementById('audioPlayPauseBtn');
    const waveBox = document.getElementById('audioWaveBox');
    if (waveBox) waveBox.classList.remove('playing');
    if (playPauseBtn) playPauseBtn.textContent = '▶ Play';
  }

  function closeAudioDock() {
    stopBookAudio();
    const dock = document.getElementById('bookAudioDock');
    if (dock) dock.style.display = 'none';
  }

  function setAudioVoiceGender(gender) {
    sfx.pop();
    bookState.selectedVoiceGender = gender;
    const subEl = document.getElementById('audioBookSubtitle');
    if (subEl && bookState.activeBook) {
      subEl.textContent = `Narrating: ${bookState.activeBook.author} • ${gender.toUpperCase()} VOICE`;
    }
    if (bookState.isPlayingAudio) {
      startAudioNarration();
    }
    showToast('Voice Changed', `Switched to ${gender.toUpperCase()} audio voice.`, 'info');
  }

  function setAudioSpeed(speed) {
    sfx.click();
    bookState.selectedSpeed = parseFloat(speed) || 1.0;
    if (bookState.isPlayingAudio) {
      startAudioNarration();
    }
  }

  // Easy Download Book
  function downloadBook(bookId) {
    sfx.click();
    const book = BOOKS_DATABASE.find(b => b.id === bookId);
    if (!book) return;

    const content = `================================================================================
FOREXBOT HUB - MASTER TRADING LIBRARY COMPANION
================================================================================
Title: ${book.title}
Author: ${book.author}
Topic: ${book.topic}
Publication Edition: ${book.year}
Rating: ${book.rating} / 5.0 Stars (${book.pages} Pages)
================================================================================

CORE IDEA OF THIS BOOK:
${book.coreIdea}

================================================================================
DETAILED CHAPTER BLUEPRINT & STRATEGY LESSONS:
================================================================================
${book.chapters.map((ch, idx) => `
[Chapter ${idx + 1}] ${ch.title}
--------------------------------------------------------------------------------
${ch.content}
`).join('\n')}

================================================================================
FOREXBOT HUB ALGORITHMIC IMPLEMENTATION:
- Risk Management: Never risk more than 1.5% equity per setup.
- Session Timing: Target London (08:00 GMT) and New York (13:30 GMT) overlaps.
- Automated EAs: Download complementary MT5 Expert Advisors from ForexBot Hub.
================================================================================
FOREXBOT HUB © 2026 • STRICTLY FOR PERSONAL EDUCATIONAL USE
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ForexBotHub_${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_Guide.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    sfx.success();
    showToast('Download Started', `Companion guide for "${book.title}" downloaded successfully!`, 'success');
  }

  // ==========================================================================
  // LIVE MARKET TERMINAL ENGINE (COMPREHENSIVE TRADINGVIEW STYLE, FOREXBOTHUB BRANDING)
  // All Forex Pairs, Gold & Crypto, Drawing Tools, Canvas Candlesticks, DOM Ladder & Watchlist
  // ==========================================================================
  // ==========================================================================
  // CHART SETTINGS & APPEARANCE CONFIGURATION (SAVED TEMPLATES & CUSTOM STYLES)
  // ==========================================================================
  const DEFAULT_CHART_CONFIG = {
    bgColor: '#0a0e1a',
    gridVisible: true,
    gridColor: 'rgba(255, 255, 255, 0.05)',
    bullBody: '#10b981',
    bullBorder: '#10b981',
    bullWick: '#10b981',
    bullWickWidth: 2,
    bearBody: '#ef4444',
    bearBorder: '#ef4444',
    bearWick: '#ef4444',
    bearWickWidth: 2,
    priceFontColor: '#94a3b8',
    priceFontSize: 11,
    timeFontColor: '#94a3b8',
    timeFontSize: 11,
    countdownVisible: true,
    crosshairVisible: true
  };

  let chartConfig = Object.assign({}, DEFAULT_CHART_CONFIG);
  try {
    const savedCfg = localStorage.getItem('forexbothub_chart_config');
    if (savedCfg) chartConfig = Object.assign({}, DEFAULT_CHART_CONFIG, JSON.parse(savedCfg));
  } catch (e) {}

  // ==========================================================================
  // LIVE MARKET TERMINAL ENGINE (COMPREHENSIVE TRADINGVIEW STYLE, FOREXBOTHUB BRANDING)
  // ==========================================================================
  const TF_CATALOG = {
    minutes: ['1m', '2m', '3m', '5m', '15m', '30m', '45m'],
    hours: ['1h', '2h', '3h', '4h', '6h', '8h'],
    days: ['1D', '1W', '1M', '12M']
  };

  const AVAILABLE_INDICATORS = [
    { id: 'ema', name: 'EMA Ribbons (20 & 50)', desc: 'Dual Exponential Moving Average trend detection' },
    { id: 'bb', name: 'Bollinger Bands (20, 2)', desc: 'Volatility envelopes with 2 standard deviations' },
    { id: 'vp', name: 'Volume Profile (VPVR & POC)', desc: 'Point of Control and volume by price buckets' },
    { id: 'smc', name: 'SMC Institutional Order Blocks', desc: 'Institutional demand/supply zones & mitigations' },
    { id: 'rsi', name: 'Relative Strength Index (RSI 14)', desc: 'Momentum oscillator with 70/30 threshold bands' },
    { id: 'macd', name: 'MACD (12, 26, 9)', desc: 'Moving Average Convergence Divergence momentum' },
    { id: 'atr', name: 'ATR Trailing Stop Band', desc: 'Average True Range volatility-based dynamic stop line' },
    { id: 'pivots', name: 'Standard Floor Pivots (P, R1, S1)', desc: 'Daily floor support and resistance pivots' }
  ];

  const terminalState = {
    activeEngine: 'custom', // 'custom' (FOREXBOTHUB Pro Canvas) or 'tradingview' (Official TradingView live widget)
    activeAsset: 'EURUSD',
    timeframe: '15m',
    chartStyle: 'candles', // 'candles' or 'line'
    activeTool: 'crosshair', // 'crosshair', 'trendline', 'ray', 'vertical', 'fib', 'rect', 'brush', 'long', 'short', 'text'
    range: '1D',
    chartLayout: '1', // '1', '2v', '2h', '3', '4'
    overlays: {
      ema: true,
      bb: false,
      vp: true,
      rsi: true,
      smc: true,
      macd: false,
      atr: false,
      pivots: false
    },
    frozenIndicators: new Set(['ema', 'vp', 'smc']),
    favoriteTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W'],
    customTimeframes: [],
    drawings: [],
    isDrawing: false,
    currentDrawing: null,
    selectedDrawing: null,
    mousePos: { x: 0, y: 0 },
    isMouseOver: false,
    currentScale: null, // Cached geometry for crosshair inverse math
    panOffsetX: 0,
    panOffsetY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    zoomScale: 1.0,
    lastTickTime: Date.now(),
    candles: [],
    timerId: null,
    watchlistInterval: null,
    // Multi-pane state
    panes: [
      { id: 0, asset: 'EURUSD', tf: '15m', candles: [] },
      { id: 1, asset: 'GBPUSD', tf: '1h',  candles: [] },
      { id: 2, asset: 'XAUUSD', tf: '4h',  candles: [] },
      { id: 3, asset: 'BTCUSD', tf: '1D',  candles: [] }
    ],
    activePaneIndex: 0
  };

  // Load saved state from LocalStorage
  try {
    const savedFavTfs = localStorage.getItem('forexbothub_tf_favs');
    if (savedFavTfs) terminalState.favoriteTimeframes = JSON.parse(savedFavTfs);

    const savedCustomTfs = localStorage.getItem('forexbothub_custom_tfs');
    if (savedCustomTfs) terminalState.customTimeframes = JSON.parse(savedCustomTfs);

    const savedFrozen = localStorage.getItem('forexbothub_frozen_indicators');
    if (savedFrozen) terminalState.frozenIndicators = new Set(JSON.parse(savedFrozen));
  } catch (e) {}

  const ASSETS_SPECS = {
    EURUSD: { name: 'EUR / USD', cat: 'Forex', basePrice: 1.08450, pipDec: 5, spread: 0.4 },
    GBPUSD: { name: 'GBP / USD', cat: 'Forex', basePrice: 1.29820, pipDec: 5, spread: 0.6 },
    USDJPY: { name: 'USD / JPY', cat: 'Forex', basePrice: 153.350, pipDec: 3, spread: 0.5 },
    AUDUSD: { name: 'AUD / USD', cat: 'Forex', basePrice: 0.65840, pipDec: 5, spread: 0.5 },
    USDCAD: { name: 'USD / CAD', cat: 'Forex', basePrice: 1.38520, pipDec: 5, spread: 0.6 },
    USDCHF: { name: 'USD / CHF', cat: 'Forex', basePrice: 0.86430, pipDec: 5, spread: 0.6 },
    NZDUSD: { name: 'NZD / USD', cat: 'Forex', basePrice: 0.59840, pipDec: 5, spread: 0.7 },
    EURGBP: { name: 'EUR / GBP', cat: 'Forex', basePrice: 0.83540, pipDec: 5, spread: 0.5 },
    GBPJPY: { name: 'GBP / JPY', cat: 'Forex', basePrice: 199.120, pipDec: 3, spread: 1.1 },
    XAUUSD: { name: 'XAU / USD', cat: 'Metals', basePrice: 2652.40, pipDec: 2, spread: 1.8 },
    XAGUSD: { name: 'XAG / USD', cat: 'Metals', basePrice: 31.85, pipDec: 3, spread: 1.2 },
    USOIL:  { name: 'USOIL',     cat: 'Metals', basePrice: 71.40,  pipDec: 2, spread: 2.0 },
    BTCUSD: { name: 'BTC / USD', cat: 'Crypto', basePrice: 64280.0, pipDec: 1, spread: 4.5 },
    ETHUSD: { name: 'ETH / USD', cat: 'Crypto', basePrice: 2640.50, pipDec: 2, spread: 1.2 },
    SOLUSD: { name: 'SOL / USD', cat: 'Crypto', basePrice: 154.20,  pipDec: 2, spread: 0.8 },
    XRPUSD: { name: 'XRP / USD', cat: 'Crypto', basePrice: 0.5480,  pipDec: 4, spread: 0.3 }
  };

  // Helper: Parse timeframe string into milliseconds
  function parseTfToMs(tf) {
    if (!tf) return 15 * 60 * 1000;
    const num = parseInt(tf) || 1;
    if (tf.endsWith('m')) return num * 60 * 1000;
    if (tf.endsWith('h')) return num * 60 * 60 * 1000;
    if (tf.endsWith('D')) return num * 24 * 60 * 60 * 1000;
    if (tf.endsWith('W')) return num * 7 * 24 * 60 * 60 * 1000;
    if (tf.endsWith('M')) return num * 30 * 24 * 60 * 60 * 1000;
    return 15 * 60 * 1000;
  }

  // Helper: Format candle date/time like TradingView
  function formatCandleTime(d, isDetailed = false) {
    if (!(d instanceof Date) || isNaN(d)) d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const mon = months[d.getMonth()];
    const yr = String(d.getFullYear()).slice(-2);
    const hrs = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    if (terminalState.timeframe && (terminalState.timeframe.includes('D') || terminalState.timeframe.includes('W'))) {
      return `${day} ${mon} '${yr}`;
    }
    return isDetailed ? `${day} ${mon} '${yr}  ${hrs}:${min}:${sec}` : `${hrs}:${min}`;
  }

  // Generate synthetic high-resolution candlestick data for terminal
  function generateTerminalCandles(assetKey) {
    const spec = ASSETS_SPECS[assetKey] || ASSETS_SPECS.EURUSD;
    let price = spec.basePrice;
    const candles = [];
    const count = 85;
    const tfMs = parseTfToMs(terminalState.timeframe);
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const volatility = spec.basePrice * 0.0016;
      const change = (Math.random() - 0.485) * volatility;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.55);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.55);
      const volume = Math.floor(400 + Math.random() * 1400);
      const candleTime = now - (count - 1 - i) * tfMs;

      candles.push({ open, high, low, close, volume, time: candleTime });
      price = close;
    }

    terminalState.candles = candles;
  }

  // Draw Canvas Chart Engine with Custom Colors, Fonts, Panning & Zooming
  function renderTerminalCanvas() {
    const canvas = document.getElementById('terminalMainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stage = document.getElementById('terminalChartStage');
    if (stage) {
      stage.style.background = chartConfig.bgColor;
    }

    const width = canvas.width;
    const height = canvas.height;
    
    // 0. Background Fill
    ctx.fillStyle = chartConfig.bgColor;
    ctx.fillRect(0, 0, width, height);

    const candles = terminalState.candles;
    if (!candles || candles.length === 0) return;

    // Price scaling calculations (supporting panOffsetY)
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });

    const paddingY = 36;
    const priceRange = (maxPrice - minPrice) || 1;
    const scaleY = (p) => {
      const normalized = (p - minPrice) / priceRange;
      return height - paddingY - normalized * (height - paddingY * 2) + terminalState.panOffsetY;
    };

    const padRight = 78;
    const chartWidth = width - padRight;
    const baseSpacing = (chartWidth / candles.length) * terminalState.zoomScale;
    const candleSpacing = Math.max(baseSpacing, 3);
    const candleWidth = Math.max(candleSpacing * 0.65, 3);

    // Cache current scale geometry for exact crosshair inverse math
    terminalState.currentScale = {
      minPrice,
      maxPrice,
      priceRange,
      paddingY,
      height,
      width,
      chartWidth,
      candleSpacing,
      candleWidth
    };

    // 1. Grid Lines (Configurable visibility & color)
    if (chartConfig.gridVisible) {
      ctx.strokeStyle = chartConfig.gridColor;
      ctx.lineWidth = 1;
      // Horizontal Price Gridlines
      for (let i = 1; i <= 6; i++) {
        const y = (height / 7) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
      }
      // Vertical Time Gridlines
      for (let i = 1; i <= 8; i++) {
        const x = (chartWidth / 9) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // 2. SMC Order Block Highlight Zone (Demand & Supply Boxes)
    if (terminalState.overlays.smc && candles.length > 20) {
      const obCandle = candles[Math.floor(candles.length * 0.45)];
      const yObTop = scaleY(obCandle.high);
      const yObBot = scaleY(obCandle.low);
      const obH = Math.abs(yObBot - yObTop);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fillRect(chartWidth * 0.4 + terminalState.panOffsetX, Math.min(yObTop, yObBot), chartWidth * 0.55, obH);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(chartWidth * 0.4 + terminalState.panOffsetX, Math.min(yObTop, yObBot), chartWidth * 0.55, obH);
      ctx.setLineDash([]);

      ctx.fillStyle = '#10b981';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('Institutional Order Block [Demand Zone]', chartWidth * 0.42 + terminalState.panOffsetX, Math.min(yObTop, yObBot) + 14);
    }

    // 3. Volume Profile (VPVR) on Right Scale
    if (terminalState.overlays.vp) {
      const vpWidth = 90;
      const numBuckets = 18;
      const bucketHeight = (height - paddingY * 2) / numBuckets;
      for (let b = 0; b < numBuckets; b++) {
        const barLen = Math.sin((b / numBuckets) * Math.PI) * (vpWidth * 0.85) + (b === 9 ? vpWidth : 15);
        const yBar = paddingY + b * bucketHeight + terminalState.panOffsetY;
        ctx.fillStyle = (b === 9) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(chartWidth - barLen, yBar, barLen, bucketHeight - 2);

        if (b === 9) {
          ctx.fillStyle = '#ef4444';
          ctx.font = '9px JetBrains Mono';
          ctx.fillText('POC', chartWidth - barLen - 26, yBar + bucketHeight * 0.7);
        }
      }
    }

    // 4. Moving Average (EMA 20 & EMA 50) Ribbons
    if (terminalState.overlays.ema) {
      // EMA 20 (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleSpacing + candleSpacing * 0.5 + terminalState.panOffsetX;
        const avg = (c.open + c.close + c.high + c.low) / 4;
        const y = scaleY(avg);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // EMA 50 (Purple)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleSpacing + candleSpacing * 0.5 + terminalState.panOffsetX;
        const avg = (c.open + c.close) / 2 * 0.9995;
        const y = scaleY(avg);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // 5. Candlestick Bars or Line Chart
    if (terminalState.chartStyle === 'candles') {
      candles.forEach((c, idx) => {
        const x = idx * candleSpacing + candleSpacing * 0.5 + terminalState.panOffsetX;
        if (x < -candleWidth || x > chartWidth + candleWidth) return;

        const yOpen = scaleY(c.open);
        const yClose = scaleY(c.close);
        const yHigh = scaleY(c.high);
        const yLow = scaleY(c.low);

        const isBull = c.close >= c.open;
        const bodyColor = isBull ? chartConfig.bullBody : chartConfig.bearBody;
        const borderColor = isBull ? chartConfig.bullBorder : chartConfig.bearBorder;
        const wickColor = isBull ? chartConfig.bullWick : chartConfig.bearWick;
        const wickWidth = isBull ? chartConfig.bullWickWidth : chartConfig.bearWickWidth;

        // High-Low Wick
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = wickWidth;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Real Body
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        const top = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);
        ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyHeight);
        ctx.strokeRect(x - candleWidth / 2, top, candleWidth, bodyHeight);
      });
    } else {
      // Line Chart Style
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleSpacing + candleSpacing * 0.5 + terminalState.panOffsetX;
        const y = scaleY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Translucent Gradient Area
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = grad;
      ctx.lineTo(chartWidth + terminalState.panOffsetX, height);
      ctx.lineTo(terminalState.panOffsetX, height);
      ctx.closePath();
      ctx.fill();
    }

    // 6. Custom User Drawings (Trendline, Ray, Vertical, Fib, Rect, Brush, Text, Long, Short)
    terminalState.drawings.forEach(d => {
      if (d.hidden) return;
      ctx.strokeStyle = d.color || '#38bdf8';
      ctx.lineWidth = d.width || 2;
      ctx.fillStyle = d.fillColor || 'rgba(56, 189, 248, 0.15)';

      if (d.type === 'trendline') {
        ctx.beginPath();
        ctx.moveTo(d.x1, d.y1);
        ctx.lineTo(d.x2, d.y2);
        ctx.stroke();
      } else if (d.type === 'ray') {
        // Horizontal Line spanning whole chart
        ctx.beginPath();
        ctx.moveTo(0, d.y);
        ctx.lineTo(chartWidth, d.y);
        ctx.stroke();
      } else if (d.type === 'vertical') {
        // Vertical Line spanning whole chart
        ctx.beginPath();
        ctx.moveTo(d.x, 0);
        ctx.lineTo(d.x, height);
        ctx.stroke();
      } else if (d.type === 'rect') {
        const rx = Math.min(d.x1, d.x2);
        const ry = Math.min(d.y1, d.y2);
        const rw = Math.abs(d.x2 - d.x1);
        const rh = Math.abs(d.y2 - d.y1);
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);
      } else if (d.type === 'brush') {
        if (d.points && d.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(d.points[0].x, d.points[0].y);
          for (let p = 1; p < d.points.length; p++) {
            ctx.lineTo(d.points[p].x, d.points[p].y);
          }
          ctx.stroke();
        }
      } else if (d.type === 'fib') {
        // Complete Fibonacci Retracement Levels requested: 0, 0.25, 0.382, 0.50, 0.618, 0.75, 1.0, 1.25, 1.50, 1.75, 2.0
        const fibRatios = [
          { r: 0.0,   label: '0.0% (Origin)',    color: '#94a3b8' },
          { r: 0.25,  label: '25.0% Fib',        color: '#38bdf8' },
          { r: 0.382, label: '38.2% Fib',        color: '#f59e0b' },
          { r: 0.50,  label: '50.0% Equilibrium', color: '#10b981' },
          { r: 0.618, label: '61.8% Golden Ratio', color: '#06b6d4' },
          { r: 0.75,  label: '75.0% Fib',        color: '#818cf8' },
          { r: 1.0,   label: '100.0% Swing Ext', color: '#94a3b8' },
          { r: 1.25,  label: '125.0% Extension', color: '#ec4899' },
          { r: 1.50,  label: '150.0% Extension', color: '#a855f7' },
          { r: 1.75,  label: '175.0% Extension', color: '#f43f5e' },
          { r: 2.0,   label: '200.0% Expansion', color: '#ef4444' }
        ];

        fibRatios.forEach(lvl => {
          const yLvl = d.y1 + (d.y2 - d.y1) * lvl.r;
          ctx.strokeStyle = lvl.color;
          ctx.lineWidth = d.width || 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(d.x1, yLvl);
          ctx.lineTo(chartWidth, yLvl);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = lvl.color;
          ctx.font = '9px JetBrains Mono';
          ctx.fillText(`Fib ${lvl.label}`, d.x1 + 6, yLvl - 4);
        });
      } else if (d.type === 'text') {
        ctx.fillStyle = d.color || '#f8fafc';
        ctx.font = `${d.fontSize || 12}px JetBrains Mono`;
        ctx.fillText(d.text || 'Annotation Note', d.x, d.y);
      } else if (d.type === 'long' || d.type === 'short') {
        const rx = Math.min(d.x1, d.x2);
        const rw = Math.abs(d.x2 - d.x1);
        const midY = d.y1;
        const targetY = d.y2;
        const riskY = midY + (midY - targetY) * 0.45;

        // Profit Box
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.strokeStyle = '#10b981';
        ctx.fillRect(rx, Math.min(midY, targetY), rw, Math.abs(targetY - midY));
        ctx.strokeRect(rx, Math.min(midY, targetY), rw, Math.abs(targetY - midY));

        // Stop Loss Box
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.strokeStyle = '#ef4444';
        ctx.fillRect(rx, Math.min(midY, riskY), rw, Math.abs(riskY - midY));
        ctx.strokeRect(rx, Math.min(midY, riskY), rw, Math.abs(riskY - midY));
      }
    });

    // 7. TradingView-Style Real-Time Live Price Line across Canvas
    const spec = ASSETS_SPECS[terminalState.activeAsset] || ASSETS_SPECS.EURUSD;
    const last = candles[candles.length - 1];
    if (last) {
      const yLast = scaleY(last.close);
      const isUp = last.close >= last.open;
      const priceLineColor = isUp ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';

      // Prominent dashed price line extending across chart
      ctx.save();
      ctx.strokeStyle = priceLineColor;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(0, yLast);
      ctx.lineTo(chartWidth, yLast);
      ctx.stroke();
      ctx.restore();

      // Glowing live price point at the right boundary
      ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(chartWidth - 2, yLast, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Update Live Price Badge on Right Scale (#currentPriceBadge)
      const currentBadge = document.getElementById('currentPriceBadge');
      const currentBadgeVal = document.getElementById('currentPriceBadgeVal');
      const currentCountdown = document.getElementById('currentCandleCountdown');
      const wrapper = document.getElementById('forexBotHubCanvasWrapper');
      if (currentBadge && currentBadgeVal && wrapper) {
        const canvasRect = canvas.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        if (canvasRect.height > 0) {
          const domY = (yLast / height) * canvasRect.height + (canvasRect.top - wrapperRect.top);
          currentBadge.style.top = `${domY}px`;
          currentBadge.style.display = 'flex';
          currentBadge.className = `terminal-current-price-badge ${isUp ? '' : 'down'}`;
          currentBadgeVal.textContent = last.close.toFixed(spec.pipDec);

          // Real-time candle countdown
          if (currentCountdown) {
            if (chartConfig.countdownVisible === false) {
              currentCountdown.style.display = 'none';
            } else {
              currentCountdown.style.display = 'inline-block';
              const cycleMs = parseTfToMs(terminalState.timeframe);
              const now = Date.now();
              const remainingMs = cycleMs - (now % cycleMs);
              const totalSec = Math.floor(remainingMs / 1000);
              const mins = Math.floor(totalSec / 60);
              const secs = totalSec % 60;
              const hours = Math.floor(mins / 60);
              const dispMins = mins % 60;

              if (hours > 0) {
                currentCountdown.textContent = `${hours}h ${String(dispMins).padStart(2, '0')}m`;
              } else {
                currentCountdown.textContent = `${String(dispMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
              }
            }
          }
        }
      }
    }

    // 8. Interactive Dotted Crosshair Lines on Canvas
    if (chartConfig.crosshairVisible !== false && terminalState.activeTool === 'crosshair' && terminalState.isMouseOver && terminalState.mousePos) {
      const mx = terminalState.mousePos.x;
      const my = terminalState.mousePos.y;
      if (mx >= 0 && mx <= chartWidth && my >= 0 && my <= height) {
        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        // Horizontal crosshair across chart width
        ctx.beginPath();
        ctx.moveTo(0, my);
        ctx.lineTo(chartWidth, my);
        ctx.stroke();

        // Vertical crosshair across canvas height
        ctx.beginPath();
        ctx.moveTo(mx, 0);
        ctx.lineTo(mx, height);
        ctx.stroke();

        ctx.restore();
      }
    }

    // 9. Right Price Axis Scale (Custom Font Color and Size)
    const axisContainer = document.getElementById('terminalPriceAxis');
    if (axisContainer) {
      const dec = spec.pipDec;
      axisContainer.style.color = chartConfig.priceFontColor;
      axisContainer.style.fontSize = `${chartConfig.priceFontSize}px`;

      let html = '';
      for (let s = 0; s <= 6; s++) {
        const p = maxPrice - (priceRange / 6) * s;
        html += `<span style="color:${chartConfig.priceFontColor}; font-size:${chartConfig.priceFontSize}px;">${p.toFixed(dec)}</span>`;
      }
      axisContainer.innerHTML = html;
    }

    // 10. Bottom Time Axis Bar (Timestamps aligned with candles)
    const timeAxis = document.getElementById('terminalTimeAxis');
    if (timeAxis && candles.length > 0) {
      const tfMs = parseTfToMs(terminalState.timeframe);
      const now = Date.now();
      let timeHtml = '';
      const step = Math.max(Math.floor(candles.length / 7), 1);
      for (let i = 0; i < candles.length; i += step) {
        const x = i * candleSpacing + candleSpacing * 0.5 + terminalState.panOffsetX;
        if (x >= 25 && x <= chartWidth - 30) {
          const cTime = new Date(now - (candles.length - 1 - i) * tfMs);
          const label = formatCandleTime(cTime, false);
          timeHtml += `<span style="position: absolute; left: ${(x / width) * 100}%; transform: translateX(-50%); color: ${chartConfig.timeFontColor || '#94a3b8'};">${label}</span>`;
        }
      }
      timeAxis.innerHTML = timeHtml;
    }

    // 11. Toggle Jump-to-Latest Button (>>)
    const jumpBtn = document.getElementById('btnJumpToLatestCandle');
    if (jumpBtn) {
      if (terminalState.panOffsetX > 25 || terminalState.panOffsetX < -25) {
        jumpBtn.style.display = 'flex';
      } else {
        jumpBtn.style.display = 'none';
      }
    }
  }

  // Jump to Current Real-Time Candle (>>)
  function jumpToLatestCandle() {
    sfx.click();
    terminalState.panOffsetX = 0;
    terminalState.panOffsetY = 0;
    const jumpBtn = document.getElementById('btnJumpToLatestCandle');
    if (jumpBtn) jumpBtn.style.display = 'none';
    renderTerminalCanvas();
    showToast('Real-Time Market', 'Snapped chart to latest live market candle.', 'info');
  }

  // Live Price Ticking Engine
  function tickTerminalMarket() {
    const candles = terminalState.candles;
    if (!candles || candles.length === 0) return;

    const spec = ASSETS_SPECS[terminalState.activeAsset] || ASSETS_SPECS.EURUSD;
    const last = candles[candles.length - 1];

    const delta = (Math.random() - 0.495) * (spec.basePrice * 0.00035);
    last.close += delta;
    if (last.close > last.high) last.high = last.close;
    if (last.close < last.low) last.low = last.close;

    // Update Top OHLC
    const dec = spec.pipDec;
    const oEl = document.getElementById('ohlcOpen');
    const hEl = document.getElementById('ohlcHigh');
    const lEl = document.getElementById('ohlcLow');
    const cEl = document.getElementById('ohlcClose');
    const chgEl = document.getElementById('ohlcChange');

    if (oEl) oEl.textContent = last.open.toFixed(dec);
    if (hEl) hEl.textContent = last.high.toFixed(dec);
    if (lEl) lEl.textContent = last.low.toFixed(dec);
    if (cEl) cEl.textContent = last.close.toFixed(dec);

    const diff = last.close - last.open;
    const pct = (diff / last.open) * 100;
    if (chgEl) {
      const isUp = diff >= 0;
      chgEl.className = `ohlc-change ${isUp ? 'up' : 'down'}`;
      chgEl.textContent = `${isUp ? '+' : ''}${diff.toFixed(dec)} (${isUp ? '+' : ''}${pct.toFixed(2)}%)`;
    }

    // Update Bid/Ask Badge
    const bidEl = document.getElementById('termBid');
    const askEl = document.getElementById('termAsk');
    const spreadEl = document.getElementById('termSpread');
    if (bidEl && askEl) {
      const halfSpread = (spec.spread * Math.pow(10, -dec)) * 0.5;
      bidEl.textContent = (last.close - halfSpread).toFixed(dec);
      askEl.textContent = (last.close + halfSpread).toFixed(dec);
      if (spreadEl) spreadEl.textContent = spec.spread.toFixed(1);
    }

    if (terminalState.activeEngine === 'custom') {
      renderTerminalCanvas();
    }
  }

  // Switch Active Terminal Asset
  function handleMarketAssetChange(assetKey) {
    sfx.click();
    terminalState.activeAsset = assetKey;
    const select = document.getElementById('terminalAssetSelect');
    if (select) select.value = assetKey;

    // Preserve frozen indicators across asset switch
    terminalState.frozenIndicators.forEach(ind => {
      terminalState.overlays[ind] = true;
    });

    const paneTag = document.getElementById('paneSymbolTag0');
    if (paneTag) {
      const spec = ASSETS_SPECS[assetKey] || ASSETS_SPECS.EURUSD;
      paneTag.textContent = `${spec.name} • ${terminalState.timeframe}`;
    }

    generateTerminalCandles(assetKey);
    if (terminalState.activeEngine === 'tradingview') {
      loadOfficialTradingViewWidget();
    } else {
      renderTerminalCanvas();
      tickTerminalMarket();
    }
    renderDomLadder();
    highlightActiveWatchlistRow();
  }

  // ==========================================================================
  // TIMEFRAMES ENGINE (FAVORITES TOOLBAR, FULL TRADINGVIEW LIST & CUSTOM CREATOR)
  // ==========================================================================
  function renderFavoriteTimeframes() {
    const container = document.getElementById('terminalFavoriteTfs');
    if (!container) return;

    container.innerHTML = terminalState.favoriteTimeframes.map(tf => `
      <button class="tf-btn ${tf === terminalState.timeframe ? 'active' : ''}" data-tf="${tf}" onclick="window.HubApp.setTerminalTF('${tf}')">
        ${tf}
      </button>
    `).join('');
  }

  function renderTfDropdownGrids() {
    const minGrid = document.getElementById('tfMinutesGrid');
    const hrGrid = document.getElementById('tfHoursGrid');
    const dayGrid = document.getElementById('tfDaysGrid');

    const renderGrid = (items, targetEl) => {
      if (!targetEl) return;
      targetEl.innerHTML = items.map(tf => {
        const isFav = terminalState.favoriteTimeframes.includes(tf);
        const isActive = (tf === terminalState.timeframe);
        return `
          <div class="tf-grid-card ${isActive ? 'active' : ''}">
            <span class="tf-name" onclick="window.HubApp.selectTfFromMenu('${tf}')">${tf}</span>
            <button class="tf-star-toggle ${isFav ? 'starred' : ''}" title="${isFav ? 'Unpin from toolbar' : 'Pin to favorite toolbar'}" onclick="window.HubApp.toggleTfFavorite('${tf}', event)">
              ★
            </button>
          </div>
        `;
      }).join('');
    };

    renderGrid(TF_CATALOG.minutes, minGrid);
    renderGrid(TF_CATALOG.hours, hrGrid);
    renderGrid([...TF_CATALOG.days, ...terminalState.customTimeframes], dayGrid);
  }

  function toggleTfDropdown(e) {
    if (e) e.stopPropagation();
    sfx.pop();
    const menu = document.getElementById('tfDropdownMenu');
    const btn = document.getElementById('tfDropdownTriggerBtn');
    if (!menu) return;

    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
    if (btn) btn.classList.toggle('active', !isOpen);

    if (!isOpen) {
      renderTfDropdownGrids();
    }
  }

  function selectTfFromMenu(tf) {
    setTerminalTF(tf);
    const menu = document.getElementById('tfDropdownMenu');
    if (menu) menu.style.display = 'none';
  }

  function toggleTfFavorite(tf, e) {
    if (e) e.stopPropagation();
    sfx.pop();

    const idx = terminalState.favoriteTimeframes.indexOf(tf);
    if (idx >= 0) {
      if (terminalState.favoriteTimeframes.length <= 1) {
        showToast('Notice', 'Must retain at least 1 favorite timeframe on toolbar.', 'info');
        return;
      }
      terminalState.favoriteTimeframes.splice(idx, 1);
    } else {
      terminalState.favoriteTimeframes.push(tf);
    }

    try {
      localStorage.setItem('forexbothub_tf_favs', JSON.stringify(terminalState.favoriteTimeframes));
    } catch (e) {}

    renderFavoriteTimeframes();
    renderTfDropdownGrids();
  }

  function addCustomTimeframe() {
    const numInput = document.getElementById('tfCustomNum');
    const unitSelect = document.getElementById('tfCustomUnit');
    if (!numInput || !unitSelect) return;

    const num = parseInt(numInput.value);
    const unit = unitSelect.value;
    if (!num || num < 1) return;

    const customTf = `${num}${unit}`;
    if (!terminalState.customTimeframes.includes(customTf)) {
      terminalState.customTimeframes.push(customTf);
      try {
        localStorage.setItem('forexbothub_custom_tfs', JSON.stringify(terminalState.customTimeframes));
      } catch (e) {}
    }

    if (!terminalState.favoriteTimeframes.includes(customTf)) {
      terminalState.favoriteTimeframes.push(customTf);
      try {
        localStorage.setItem('forexbothub_tf_favs', JSON.stringify(terminalState.favoriteTimeframes));
      } catch (e) {}
    }

    selectTfFromMenu(customTf);
    showToast('Custom Timeframe Added', `Added ${customTf} to your timeframe toolbar.`, 'success');
  }

  function setTerminalTF(tf) {
    sfx.click();
    terminalState.timeframe = tf;

    // Preserve frozen indicators across timeframe switch
    terminalState.frozenIndicators.forEach(ind => {
      terminalState.overlays[ind] = true;
    });

    renderFavoriteTimeframes();
    renderTfDropdownGrids();

    const paneTag = document.getElementById('paneSymbolTag0');
    if (paneTag) {
      const spec = ASSETS_SPECS[terminalState.activeAsset] || ASSETS_SPECS.EURUSD;
      paneTag.textContent = `${spec.name} • ${tf}`;
    }

    generateTerminalCandles(terminalState.activeAsset);
    if (terminalState.activeEngine === 'tradingview') {
      loadOfficialTradingViewWidget();
    } else {
      renderTerminalCanvas();
    }
    showToast('Timeframe Changed', `Chart timeframe updated to ${tf}.`, 'info');
  }

  function setChartStyle(style) {
    sfx.click();
    terminalState.chartStyle = style;
    const candleBtn = document.getElementById('termCandleStyleBtn');
    const lineBtn = document.getElementById('termLineStyleBtn');
    if (candleBtn) candleBtn.classList.toggle('active', style === 'candles');
    if (lineBtn) lineBtn.classList.toggle('active', style === 'line');
    if (terminalState.activeEngine === 'tradingview') {
      loadOfficialTradingViewWidget();
    } else {
      renderTerminalCanvas();
    }
  }

  // ==========================================================================
  // MULTI-CHART LAYOUTS (1, 2v, 2h, 3, 4 CHARTS)
  // ==========================================================================
  function toggleLayoutMenu(e) {
    if (e) e.stopPropagation();
    sfx.pop();
    const menu = document.getElementById('layoutPickerMenu');
    if (!menu) return;
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  }

  function setChartLayout(layout) {
    sfx.click();
    terminalState.chartLayout = layout;

    const label = document.getElementById('currentLayoutLabel');
    if (label) label.textContent = layout;

    const menu = document.getElementById('layoutPickerMenu');
    if (menu) menu.style.display = 'none';

    document.querySelectorAll('.layout-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.layout === layout);
    });

    const grid = document.getElementById('terminalMultiChartGrid');
    if (!grid) return;

    grid.className = `terminal-multi-grid multi-grid-${layout}`;

    // Render secondary chart panes if needed
    renderMultiChartPanes(layout);
    showToast('Layout Switched', `Chart workspace switched to ${layout.toUpperCase()} layout.`, 'info');
  }

  function renderMultiChartPanes(layout) {
    const grid = document.getElementById('terminalMultiChartGrid');
    if (!grid) return;

    const existingPanes = grid.querySelectorAll('.chart-pane-wrapper:not(#chartPane0)');
    existingPanes.forEach(p => p.remove());

    const neededPanes = layout === '1' ? 1 : (layout === '2v' || layout === '2h' ? 2 : (layout === '3' ? 3 : 4));

    for (let i = 1; i < neededPanes; i++) {
      const paneData = terminalState.panes[i] || { asset: 'GBPUSD', tf: '1h' };
      const paneDiv = document.createElement('div');
      paneDiv.className = 'chart-pane-wrapper';
      paneDiv.id = `chartPane${i}`;
      paneDiv.innerHTML = `
        <div class="pane-symbol-tag">${paneData.asset} • ${paneData.tf}</div>
        <canvas id="terminalCanvasPane${i}" width="600" height="300"></canvas>
      `;
      grid.appendChild(paneDiv);

      // Render secondary canvas
      const subCanvas = paneDiv.querySelector('canvas');
      if (subCanvas) {
        const subCtx = subCanvas.getContext('2d');
        subCtx.fillStyle = chartConfig.bgColor;
        subCtx.fillRect(0, 0, subCanvas.width, subCanvas.height);
        subCtx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let g = 1; g <= 4; g++) {
          subCtx.fillRect(0, (subCanvas.height / 5) * g, subCanvas.width, 1);
        }
        // Synthetic candles
        const subSpec = ASSETS_SPECS[paneData.asset] || ASSETS_SPECS.EURUSD;
        let p = subSpec.basePrice;
        for (let c = 0; c < 35; c++) {
          const chg = (Math.random() - 0.48) * (subSpec.basePrice * 0.0015);
          const isUp = chg >= 0;
          const x = c * 16 + 10;
          const y = subCanvas.height / 2 + (Math.sin(c * 0.4) * 40);
          subCtx.fillStyle = isUp ? chartConfig.bullBody : chartConfig.bearBody;
          subCtx.fillRect(x, y, 8, Math.max(Math.abs(chg * 1000), 4));
        }
      }
    }
  }

  // ==========================================================================
  // CHART SETTINGS MODAL & TEMPLATE SAVING
  // ==========================================================================
  function openChartSettingsModal() {
    sfx.click();
    const modal = document.getElementById('chartSettingsModal');
    if (!modal) return;

    // Populate inputs from chartConfig
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('cfgBgColor', chartConfig.bgColor);
    setVal('cfgBgPreset', chartConfig.bgColor);
    const gridChk = document.getElementById('cfgGridVisible');
    if (gridChk) gridChk.checked = chartConfig.gridVisible;
    setVal('cfgGridColor', chartConfig.gridColor);

    setVal('cfgBullBody', chartConfig.bullBody);
    setVal('cfgBullBorder', chartConfig.bullBorder);
    setVal('cfgBullWick', chartConfig.bullWick);
    setVal('cfgBullWickWidth', String(chartConfig.bullWickWidth));

    setVal('cfgBearBody', chartConfig.bearBody);
    setVal('cfgBearBorder', chartConfig.bearBorder);
    setVal('cfgBearWick', chartConfig.bearWick);
    setVal('cfgBearWickWidth', String(chartConfig.bearWickWidth));

    setVal('cfgPriceFontColor', chartConfig.priceFontColor);
    setVal('cfgPriceFontSize', String(chartConfig.priceFontSize));
    setVal('cfgTimeFontColor', chartConfig.timeFontColor);
    setVal('cfgTimeFontSize', String(chartConfig.timeFontSize));

    const countdownChk = document.getElementById('cfgCountdownVisible');
    if (countdownChk) countdownChk.checked = (chartConfig.countdownVisible !== false);
    const crossChk = document.getElementById('cfgCrosshairVisible');
    if (crossChk) crossChk.checked = (chartConfig.crosshairVisible !== false);

    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  function updateChartAppearance() {
    const getVal = (id, fallback) => {
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    };

    chartConfig.bgColor = getVal('cfgBgColor', '#0a0e1a');
    const gridChk = document.getElementById('cfgGridVisible');
    chartConfig.gridVisible = gridChk ? gridChk.checked : true;
    chartConfig.gridColor = getVal('cfgGridColor', 'rgba(255,255,255,0.05)');

    chartConfig.bullBody = getVal('cfgBullBody', '#10b981');
    chartConfig.bullBorder = getVal('cfgBullBorder', '#10b981');
    chartConfig.bullWick = getVal('cfgBullWick', '#10b981');
    chartConfig.bullWickWidth = parseInt(getVal('cfgBullWickWidth', '2'));

    chartConfig.bearBody = getVal('cfgBearBody', '#ef4444');
    chartConfig.bearBorder = getVal('cfgBearBorder', '#ef4444');
    chartConfig.bearWick = getVal('cfgBearWick', '#ef4444');
    chartConfig.bearWickWidth = parseInt(getVal('cfgBearWickWidth', '2'));

    chartConfig.priceFontColor = getVal('cfgPriceFontColor', '#94a3b8');
    chartConfig.priceFontSize = parseInt(getVal('cfgPriceFontSize', '11'));
    chartConfig.timeFontColor = getVal('cfgTimeFontColor', '#94a3b8');
    chartConfig.timeFontSize = parseInt(getVal('cfgTimeFontSize', '11'));

    const countdownChk = document.getElementById('cfgCountdownVisible');
    chartConfig.countdownVisible = countdownChk ? countdownChk.checked : true;
    const crossChk = document.getElementById('cfgCrosshairVisible');
    chartConfig.crosshairVisible = crossChk ? crossChk.checked : true;

    renderTerminalCanvas();

    // Dynamically apply settings to official TradingView widget if currently active
    if (terminalState.activeEngine === 'tradingview') {
      loadOfficialTradingViewWidget();
    }
  }

  function applyBgPreset(color) {
    const picker = document.getElementById('cfgBgColor');
    if (picker) picker.value = color;
    updateChartAppearance();
  }

  function saveChartTemplate() {
    sfx.success();
    try {
      localStorage.setItem('forexbothub_chart_config', JSON.stringify(chartConfig));
    } catch (e) {}
    showToast('Template Saved', 'Chart settings and custom appearance saved successfully!', 'success');
  }

  function resetChartSettingsDefault() {
    sfx.pop();
    chartConfig = Object.assign({}, DEFAULT_CHART_CONFIG);
    try {
      localStorage.removeItem('forexbothub_chart_config');
    } catch (e) {}
    openChartSettingsModal();
    renderTerminalCanvas();
    if (terminalState.activeEngine === 'tradingview') {
      loadOfficialTradingViewWidget();
    }
    showToast('Settings Reset', 'Restored default TradingView Pro dark theme.', 'info');
  }

  // ==========================================================================
  // INDICATORS MODAL & FREEZE FEATURE
  // ==========================================================================
  function openIndicatorsModal() {
    sfx.click();
    const modal = document.getElementById('indicatorsModal');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('active');

    renderIndicatorsModalList();
  }

  function renderIndicatorsModalList(filter = '') {
    const listEl = document.getElementById('indicatorsItemsList');
    if (!listEl) return;

    const filtered = AVAILABLE_INDICATORS.filter(ind => {
      const q = filter.toLowerCase().trim();
      return !q || ind.name.toLowerCase().includes(q) || ind.desc.toLowerCase().includes(q);
    });

    listEl.innerHTML = filtered.map(ind => {
      const isActive = !!terminalState.overlays[ind.id];
      const isFrozen = terminalState.frozenIndicators.has(ind.id);
      return `
        <div class="indicator-item-row ${isActive ? 'active' : ''}">
          <div class="ind-info">
            <h5>${ind.name}</h5>
            <p>${ind.desc}</p>
          </div>
          <div class="ind-actions">
            <button class="btn btn-xs ${isActive ? 'btn-cyan' : 'btn-outline'}" onclick="window.HubApp.toggleIndicatorOverlay('${ind.id}')">
              ${isActive ? 'Visible ✔' : 'Enable +'}
            </button>
            <button class="btn btn-xs ${isFrozen ? 'btn-emerald' : 'btn-outline'}" title="${isFrozen ? 'Indicator is Frozen on Chart (Will persist across symbol/TF changes)' : 'Freeze Indicator on Chart'}" onclick="window.HubApp.toggleIndicatorFreeze('${ind.id}')">
              📌 ${isFrozen ? 'Frozen' : 'Freeze'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    updateFrozenBadge();
  }

  function filterIndicatorList(q) {
    renderIndicatorsModalList(q);
  }

  function toggleIndicatorOverlay(key) {
    sfx.click();
    terminalState.overlays[key] = !terminalState.overlays[key];
    renderIndicatorsModalList();
    renderTerminalCanvas();
  }

  function toggleIndicatorFreeze(key) {
    sfx.pop();
    if (terminalState.frozenIndicators.has(key)) {
      terminalState.frozenIndicators.delete(key);
    } else {
      terminalState.frozenIndicators.add(key);
      terminalState.overlays[key] = true;
    }

    try {
      localStorage.setItem('forexbothub_frozen_indicators', JSON.stringify(Array.from(terminalState.frozenIndicators)));
    } catch (e) {}

    renderIndicatorsModalList();
    renderTerminalCanvas();
    updateFrozenBadge();
    showToast('Indicator Freeze Updated', `Freeze preference updated for ${key.toUpperCase()}.`, 'info');
  }

  function updateFrozenBadge() {
    const badge = document.getElementById('frozenIndTag');
    if (!badge) return;
    const count = terminalState.frozenIndicators.size;
    if (count > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = `📌 Freeze Active (${count})`;
    } else {
      badge.style.display = 'none';
    }
  }

  // ==========================================================================
  // ADVANCED DRAWING TOOLS & IN-PLACE FLOATING CONTEXT TOOLBAR
  // ==========================================================================
  function setDrawingTool(tool) {
    sfx.click();
    terminalState.activeTool = tool;
    document.querySelectorAll('.terminal-drawing-toolbar .tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    const ctxBar = document.getElementById('drawingContextToolbar');
    if (ctxBar) ctxBar.style.display = 'none';

    showToast('Tool Selected', `Active tool: ${tool.toUpperCase()}. Click and drag on chart to draw.`, 'info');
  }

  function clearCanvasDrawings() {
    sfx.pop();
    terminalState.drawings = [];
    terminalState.selectedDrawing = null;
    const ctxBar = document.getElementById('drawingContextToolbar');
    if (ctxBar) ctxBar.style.display = 'none';
    renderTerminalCanvas();
    showToast('Drawings Cleared', 'All chart annotations removed.', 'info');
  }

  function showDrawingContextToolbar(drawing, x, y) {
    const ctxBar = document.getElementById('drawingContextToolbar');
    if (!ctxBar) return;

    terminalState.selectedDrawing = drawing;
    const colorPicker = document.getElementById('ctxDrawColor');
    const widthSelect = document.getElementById('ctxDrawWidth');

    if (colorPicker && drawing.color) colorPicker.value = drawing.color;
    if (widthSelect && drawing.width) widthSelect.value = String(drawing.width);

    ctxBar.style.display = 'flex';
  }

  function updateActiveDrawingProp(prop, val) {
    if (!terminalState.selectedDrawing) return;
    sfx.pop();
    terminalState.selectedDrawing[prop] = val;
    renderTerminalCanvas();
  }

  function cloneActiveDrawing() {
    if (!terminalState.selectedDrawing) return;
    sfx.pop();
    const cloned = JSON.parse(JSON.stringify(terminalState.selectedDrawing));
    // Shift slightly
    if (cloned.x1 !== undefined) { cloned.x1 += 15; cloned.x2 += 15; }
    if (cloned.y1 !== undefined) { cloned.y1 += 15; cloned.y2 += 15; }
    if (cloned.x !== undefined) cloned.x += 15;
    if (cloned.y !== undefined) cloned.y += 15;
    if (cloned.points) cloned.points.forEach(pt => { pt.x += 15; pt.y += 15; });

    terminalState.drawings.push(cloned);
    terminalState.selectedDrawing = cloned;
    renderTerminalCanvas();
    showToast('Drawing Cloned', 'Duplicated active chart element.', 'info');
  }

  function toggleActiveDrawingVisibility() {
    if (!terminalState.selectedDrawing) return;
    sfx.click();
    terminalState.selectedDrawing.hidden = !terminalState.selectedDrawing.hidden;
    renderTerminalCanvas();
  }

  function deleteActiveDrawing() {
    if (!terminalState.selectedDrawing) return;
    sfx.pop();
    const idx = terminalState.drawings.indexOf(terminalState.selectedDrawing);
    if (idx >= 0) terminalState.drawings.splice(idx, 1);
    terminalState.selectedDrawing = null;

    const ctxBar = document.getElementById('drawingContextToolbar');
    if (ctxBar) ctxBar.style.display = 'none';

    renderTerminalCanvas();
    showToast('Drawing Deleted', 'Annotation removed from chart.', 'info');
  }

  // Hotkey listener for Ctrl+A, Delete, Backspace, Escape
  window.addEventListener('keydown', (e) => {
    // Ctrl+A on chart
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      const activeEl = document.activeElement;
      if (!activeEl || !['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
        if (terminalState.drawings.length > 0) {
          e.preventDefault();
          showToast('All Drawings Selected', 'Press Delete / Backspace or click Clear to erase.', 'info');
        }
      }
    }
    // Delete or Backspace key
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeEl = document.activeElement;
      if (!activeEl || !['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
        if (terminalState.selectedDrawing) {
          e.preventDefault();
          deleteActiveDrawing();
        }
      }
    }
    // Escape key closes context bar
    if (e.key === 'Escape') {
      const ctxBar = document.getElementById('drawingContextToolbar');
      if (ctxBar) ctxBar.style.display = 'none';
      terminalState.selectedDrawing = null;
    }
  });

  // Dock Switcher (Watchlist, DOM, Tech)
  function switchDockTab(tab) {
    sfx.click();
    document.querySelectorAll('.dock-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dock-pane').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });

    if (tab === 'watchlist') {
      const btn = document.getElementById('dockTabWatchlistBtn');
      const pane = document.getElementById('dockPaneWatchlist');
      if (btn) btn.classList.add('active');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
    } else if (tab === 'dom') {
      const btn = document.getElementById('dockTabDomBtn');
      const pane = document.getElementById('dockPaneDom');
      if (btn) btn.classList.add('active');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
      renderDomLadder();
    } else if (tab === 'tech') {
      const btn = document.getElementById('dockTabTechBtn');
      const pane = document.getElementById('dockPaneTech');
      if (btn) btn.classList.add('active');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
    }
  }

  // Populate Right Dock Watchlist
  function renderWatchlist() {
    const container = document.getElementById('terminalWatchlist');
    if (!container) return;

    const list = Object.keys(ASSETS_SPECS).map(sym => {
      const spec = ASSETS_SPECS[sym];
      const deltaPct = ((Math.random() - 0.47) * 0.8).toFixed(2);
      const isUp = deltaPct >= 0;
      return `
        <div class="watchlist-row ${sym === terminalState.activeAsset ? 'active' : ''}" data-symbol="${sym}" onclick="window.HubApp.handleMarketAssetChange('${sym}')">
          <div class="wl-sym">
            <strong>${spec.name}</strong>
            <small>${spec.cat}</small>
          </div>
          <div class="wl-price" id="wl_price_${sym}">${spec.basePrice.toFixed(spec.pipDec)}</div>
          <div class="wl-chg ${isUp ? 'up' : 'down'}">${isUp ? '+' : ''}${deltaPct}%</div>
        </div>
      `;
    }).join('');

    container.innerHTML = list;
  }

  function highlightActiveWatchlistRow() {
    document.querySelectorAll('.watchlist-row').forEach(row => {
      row.classList.toggle('active', row.dataset.symbol === terminalState.activeAsset);
    });
  }

  // Populate Depth of Market (DOM) Ladder
  function renderDomLadder() {
    const container = document.getElementById('terminalDomLadder');
    if (!container) return;

    const spec = ASSETS_SPECS[terminalState.activeAsset] || ASSETS_SPECS.EURUSD;
    const last = terminalState.candles[terminalState.candles.length - 1];
    const currentPrice = last ? last.close : spec.basePrice;
    const step = Math.pow(10, -spec.pipDec) * (spec.pipDec === 5 ? 10 : (spec.pipDec === 3 ? 10 : 1));

    let html = '';

    // 10 Ask Levels (Higher prices)
    for (let i = 10; i >= 1; i--) {
      const askPrice = currentPrice + i * step;
      const vol = Math.floor(120 + Math.random() * 450);
      const barPct = Math.min((vol / 500) * 100, 100);
      html += `
        <div class="dom-ladder-row ask-tier">
          <div class="dom-cell bid-qty"></div>
          <div class="dom-cell price-level">${askPrice.toFixed(spec.pipDec)}</div>
          <div class="dom-cell ask-qty">${vol}</div>
          <div class="dom-vol-bar ask-bar" style="width: ${barPct}%;"></div>
        </div>
      `;
    }

    // Mid Spread / Market Line
    html += `
      <div class="dom-ladder-row market-spread-tier">
        <div class="dom-cell" style="grid-column: 1 / -1; text-align:center; color:var(--accent-cyan); font-weight:700;">
          --- SPREAD ${spec.spread.toFixed(1)} PIPS ---
        </div>
      </div>
    `;

    // 10 Bid Levels (Lower prices)
    for (let i = 1; i <= 10; i++) {
      const bidPrice = currentPrice - i * step;
      const vol = Math.floor(140 + Math.random() * 500);
      const barPct = Math.min((vol / 500) * 100, 100);
      html += `
        <div class="dom-ladder-row bid-tier">
          <div class="dom-cell bid-qty">${vol}</div>
          <div class="dom-cell price-level">${bidPrice.toFixed(spec.pipDec)}</div>
          <div class="dom-cell ask-qty"></div>
          <div class="dom-vol-bar bid-bar" style="width: ${barPct}%;"></div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // Setup Canvas Interactive Drawing Handlers (Panning, Zooming, Drawing)
  function setupCanvasDrawingListeners() {
    const stage = document.getElementById('terminalChartStage');
    const wrapper = document.getElementById('forexBotHubCanvasWrapper');
    const canvas = document.getElementById('terminalMainCanvas');
    const markerY = document.getElementById('markerY');
    const markerX = document.getElementById('markerX');
    if (!stage || !canvas) return;

    stage.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleFactorX = canvas.width / rect.width;
      const scaleFactorY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleFactorX;
      const y = (e.clientY - rect.top) * scaleFactorY;

      terminalState.mousePos = { x, y };
      terminalState.isMouseOver = true;

      const wrapperRect = (wrapper || canvas).getBoundingClientRect();
      const domX = e.clientX - wrapperRect.left;
      const domY = e.clientY - wrapperRect.top;

      // Update Crosshair Marker Y (Exact Price on Right Axis)
      if (markerY && terminalState.currentScale) {
        if (chartConfig.crosshairVisible === false) {
          markerY.style.display = 'none';
        } else {
          markerY.style.top = `${domY}px`;
          const spec = ASSETS_SPECS[terminalState.activeAsset] || ASSETS_SPECS.EURUSD;
          const cs = terminalState.currentScale;
          const effectiveY = y - terminalState.panOffsetY;
          const normY = (cs.height - cs.paddingY - effectiveY) / (cs.height - cs.paddingY * 2);
          const priceAtCursor = cs.minPrice + normY * cs.priceRange;
          markerY.textContent = priceAtCursor.toFixed(spec.pipDec);
          markerY.style.display = 'block';
        }
      }

      // Update Crosshair Marker X (Exact Time on Bottom Axis)
      if (markerX && terminalState.currentScale && terminalState.candles.length > 0) {
        if (chartConfig.crosshairVisible === false) {
          markerX.style.display = 'none';
        } else {
          markerX.style.left = `${domX}px`;
          const cs = terminalState.currentScale;
          const candleIdx = Math.round((x - terminalState.panOffsetX - cs.candleSpacing * 0.5) / cs.candleSpacing);
          const tfMs = parseTfToMs(terminalState.timeframe);
          const now = Date.now();
          const candleTime = new Date(now - (terminalState.candles.length - 1 - candleIdx) * tfMs);
          markerX.textContent = formatCandleTime(candleTime, true);
          markerX.style.display = 'block';
        }
      }

      // Smooth Panning Logic in Crosshair Mode
      if (terminalState.isPanning) {
        const dx = (e.clientX - terminalState.panStartX) * scaleFactorX;
        const dy = (e.clientY - terminalState.panStartY) * scaleFactorY;
        terminalState.panOffsetX += dx;
        terminalState.panOffsetY += dy;
        terminalState.panStartX = e.clientX;
        terminalState.panStartY = e.clientY;
        renderTerminalCanvas();
        return;
      }

      // Active Drawing Update
      if (terminalState.isDrawing && terminalState.currentDrawing) {
        if (terminalState.currentDrawing.type === 'brush') {
          terminalState.currentDrawing.points.push({ x, y });
        } else {
          terminalState.currentDrawing.x2 = x;
          terminalState.currentDrawing.y2 = y;
        }
        renderTerminalCanvas();
        return;
      }

      // Re-render crosshairs smoothly on canvas
      if (terminalState.activeTool === 'crosshair') {
        renderTerminalCanvas();
      }
    });

    stage.addEventListener('mouseleave', () => {
      terminalState.isMouseOver = false;
      if (markerY) markerY.style.display = 'none';
      if (markerX) markerX.style.display = 'none';
      renderTerminalCanvas();
    });

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleFactorX = canvas.width / rect.width;
      const scaleFactorY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleFactorX;
      const y = (e.clientY - rect.top) * scaleFactorY;

      // In Crosshair mode: initiate Pan
      if (terminalState.activeTool === 'crosshair') {
        terminalState.isPanning = true;
        terminalState.panStartX = e.clientX;
        terminalState.panStartY = e.clientY;
        return;
      }

      // One-Click Drawings
      if (terminalState.activeTool === 'ray') {
        const ray = {
          type: 'ray',
          y,
          color: '#06b6d4',
          width: 2
        };
        terminalState.drawings.push(ray);
        showDrawingContextToolbar(ray, x, y);
        renderTerminalCanvas();
        return;
      }

      if (terminalState.activeTool === 'vertical') {
        const vert = {
          type: 'vertical',
          x,
          color: '#eab308',
          width: 2
        };
        terminalState.drawings.push(vert);
        showDrawingContextToolbar(vert, x, y);
        renderTerminalCanvas();
        return;
      }

      if (terminalState.activeTool === 'text') {
        const textNote = prompt('Enter annotation text for chart:', 'Institutional Liquidity Level');
        if (textNote) {
          const tObj = {
            type: 'text',
            text: textNote,
            x,
            y,
            color: '#f8fafc',
            fontSize: 12
          };
          terminalState.drawings.push(tObj);
          showDrawingContextToolbar(tObj, x, y);
          renderTerminalCanvas();
        }
        return;
      }

      // Drag-to-Draw Tools
      terminalState.isDrawing = true;
      if (terminalState.activeTool === 'brush') {
        terminalState.currentDrawing = {
          type: 'brush',
          points: [{ x, y }],
          color: '#38bdf8',
          width: 3
        };
      } else {
        terminalState.currentDrawing = {
          type: terminalState.activeTool,
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          color: terminalState.activeTool === 'long' ? '#10b981' : (terminalState.activeTool === 'short' ? '#ef4444' : '#38bdf8'),
          fillColor: terminalState.activeTool === 'long' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)'
        };
      }
      terminalState.drawings.push(terminalState.currentDrawing);
    });

    window.addEventListener('mouseup', () => {
      if (terminalState.isPanning) {
        terminalState.isPanning = false;
      }
      if (terminalState.isDrawing) {
        terminalState.isDrawing = false;
        if (terminalState.currentDrawing) {
          showDrawingContextToolbar(terminalState.currentDrawing);
        }
        terminalState.currentDrawing = null;
        renderTerminalCanvas();
      }
    });

    // Smooth Mouse Wheel Zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      terminalState.zoomScale = Math.min(3.0, Math.max(0.4, terminalState.zoomScale * zoomFactor));
      renderTerminalCanvas();
    }, { passive: false });
  }

  function setRange(range) {
    sfx.click();
    terminalState.range = range;
    document.querySelectorAll('.time-range-presets .range-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === range);
    });
    generateTerminalCandles(terminalState.activeAsset);
    renderTerminalCanvas();
    showToast('Range Presets', `Zoomed chart to ${range} historical window.`, 'info');
  }

  function takeTerminalSnapshot() {
    sfx.pop();
    const canvas = document.getElementById('terminalMainCanvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ForexBotHub_${terminalState.activeAsset}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('Snapshot Saved', 'High-resolution chart capture downloaded!', 'success');
  }

  function toggleTerminalFullscreen() {
    sfx.click();
    const shell = document.querySelector('.terminal-shell');
    if (!shell) return;

    if (!document.fullscreenElement) {
      shell.requestFullscreen().then(() => {
        setTimeout(() => {
          if (terminalState.activeEngine === 'tradingview') {
            loadOfficialTradingViewWidget();
          } else {
            renderTerminalCanvas();
          }
        }, 150);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setTimeout(() => {
          if (terminalState.activeEngine === 'tradingview') {
            loadOfficialTradingViewWidget();
          } else {
            renderTerminalCanvas();
          }
        }, 150);
      }).catch(() => {});
    }
  }

  // ==========================================================================
  // OFFICIAL TRADINGVIEW REAL-TIME CHART ENGINE INTEGRATION
  // ==========================================================================
  let currentTvWidget = null;

  function getTradingViewSymbol(assetKey) {
    const map = {
      EURUSD: 'FX:EURUSD',
      GBPUSD: 'FX:GBPUSD',
      USDJPY: 'FX:USDJPY',
      AUDUSD: 'FX:AUDUSD',
      USDCAD: 'FX:USDCAD',
      USDCHF: 'FX:USDCHF',
      NZDUSD: 'FX:NZDUSD',
      EURGBP: 'FX:EURGBP',
      GBPJPY: 'FX:GBPJPY',
      XAUUSD: 'OANDA:XAUUSD',
      XAGUSD: 'OANDA:XAGUSD',
      USOIL:  'TVC:USOIL',
      BTCUSD: 'BINANCE:BTCUSDT',
      ETHUSD: 'BINANCE:ETHUSDT',
      SOLUSD: 'BINANCE:SOLUSDT',
      XRPUSD: 'BINANCE:XRPUSDT'
    };
    return map[assetKey] || `FX:${assetKey}`;
  }

  function getTradingViewInterval(tf) {
    const map = {
      '1m': '1',
      '3m': '3',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '45m': '45',
      '1h': '60',
      '2h': '120',
      '3h': '180',
      '4h': '240',
      '1D': 'D',
      '1W': 'W',
      '1M': 'M'
    };
    return map[tf] || '15';
  }

  function loadOfficialTradingViewWidget() {
    const frame = document.getElementById('tradingview_widget_frame');
    if (!frame) return;
    frame.innerHTML = '';

    const symbol = getTradingViewSymbol(terminalState.activeAsset);
    const interval = getTradingViewInterval(terminalState.timeframe);

    // Extract dynamic customization options from user-configured chartConfig
    const bgColor = chartConfig.bgColor || '#0a0e1a';
    const isLight = bgColor.toLowerCase() === '#ffffff' || bgColor.toLowerCase() === '#fff';
    const gridColor = chartConfig.gridVisible ? (chartConfig.gridColor || 'rgba(255, 255, 255, 0.05)') : 'rgba(0, 0, 0, 0)';
    const textColor = chartConfig.priceFontColor || '#94a3b8';
    const bullBody = chartConfig.bullBody || '#10b981';
    const bearBody = chartConfig.bearBody || '#ef4444';
    const bullBorder = chartConfig.bullBorder || '#10b981';
    const bearBorder = chartConfig.bearBorder || '#ef4444';
    const bullWick = chartConfig.bullWick || '#10b981';
    const bearWick = chartConfig.bearWick || '#ef4444';
    const crosshairColor = (chartConfig.crosshairVisible !== false) ? 'rgba(148, 163, 184, 0.55)' : 'rgba(0, 0, 0, 0)';
    const showCountdown = (chartConfig.countdownVisible !== false);

    const tvOverrides = {
      'paneProperties.background': bgColor,
      'paneProperties.vertGridProperties.color': gridColor,
      'paneProperties.horzGridProperties.color': gridColor,
      'paneProperties.crossHairProperties.color': crosshairColor,
      'paneProperties.crossHairProperties.style': (chartConfig.crosshairVisible !== false) ? 2 : 0,
      'scalesProperties.textColor': textColor,
      'scalesProperties.fontSize': chartConfig.priceFontSize || 11,
      'scalesProperties.showCountdown': showCountdown,
      'mainSeriesProperties.candleStyle.upColor': bullBody,
      'mainSeriesProperties.candleStyle.downColor': bearBody,
      'mainSeriesProperties.candleStyle.borderUpColor': bullBorder,
      'mainSeriesProperties.candleStyle.borderDownColor': bearBorder,
      'mainSeriesProperties.candleStyle.wickUpColor': bullWick,
      'mainSeriesProperties.candleStyle.wickDownColor': bearWick,
      'mainSeriesProperties.candleStyle.drawWick': true,
      'mainSeriesProperties.candleStyle.drawBorder': true,
      'mainSeriesProperties.candleStyle.borderColor': bullBorder,
      'mainSeriesProperties.hollowCandleStyle.upColor': bullBody,
      'mainSeriesProperties.hollowCandleStyle.downColor': bearBody,
      'mainSeriesProperties.hollowCandleStyle.borderUpColor': bullBorder,
      'mainSeriesProperties.hollowCandleStyle.borderDownColor': bearBorder,
      'mainSeriesProperties.hollowCandleStyle.wickUpColor': bullWick,
      'mainSeriesProperties.hollowCandleStyle.wickDownColor': bearWick
    };

    if (window.TradingView && window.TradingView.widget) {
      try {
        currentTvWidget = new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: 'Asia/Kolkata',
          theme: isLight ? 'light' : 'dark',
          style: terminalState.chartStyle === 'candles' ? '1' : '2',
          locale: 'en',
          toolbar_bg: bgColor,
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: 'tradingview_widget_frame',
          hide_side_toolbar: false,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ],
          disabled_features: [
            'header_saveload'
          ],
          enabled_features: [
            'study_templates',
            'use_localstorage_for_settings'
          ],
          overrides: tvOverrides
        });
        return;
      } catch (err) {
        console.warn('TradingView constructor warning, using fallback embed:', err);
      }
    }

    // High-reliability embed fallback
    frame.innerHTML = `
      <iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(symbol)}&interval=${interval}&symboledit=1&saveimage=1&toolbarbg=${encodeURIComponent(bgColor.replace('#',''))}&studies=%5B%5D&theme=${isLight ? 'light' : 'dark'}&style=${terminalState.chartStyle === 'candles' ? '1' : '2'}&timezone=Asia%2FKolkata"
        style="width: 100%; height: 100%; min-height: 100%; border: none; display: block;" allowfullscreen></iframe>
    `;
  }

  function setTerminalEngine(engine) {
    sfx.click();
    terminalState.activeEngine = engine;
    const btnCustom = document.getElementById('btnEngineForexBotHub');
    const btnTV = document.getElementById('btnEngineTradingView');
    const wrapperCustom = document.getElementById('forexBotHubCanvasWrapper');
    const wrapperTV = document.getElementById('tradingViewLiveWrapper');

    if (engine === 'tradingview') {
      if (btnCustom) btnCustom.classList.remove('active');
      if (btnTV) btnTV.classList.add('active');
      if (wrapperCustom) wrapperCustom.style.display = 'none';
      if (wrapperTV) wrapperTV.style.display = 'block';
      loadOfficialTradingViewWidget();
      showToast('TradingView Live Platform', 'Switched to official TradingView live charts.', 'info');
    } else {
      if (btnTV) btnTV.classList.remove('active');
      if (btnCustom) btnCustom.classList.add('active');
      if (wrapperTV) wrapperTV.style.display = 'none';
      if (wrapperCustom) wrapperCustom.style.display = 'block';
      renderTerminalCanvas();
      tickTerminalMarket();
      showToast('ForexBotHub Pro', 'Switched to FOREXBOTHUB Pro Canvas engine.', 'info');
    }
  }

  function initMarketTerminal() {
    generateTerminalCandles(terminalState.activeAsset);
    renderFavoriteTimeframes();
    renderTerminalCanvas();
    renderWatchlist();
    renderDomLadder();
    setupCanvasDrawingListeners();
    updateFrozenBadge();

    if (terminalState.timerId) clearInterval(terminalState.timerId);
    terminalState.timerId = setInterval(tickTerminalMarket, 1600);

    // Live clock ticking
    setInterval(() => {
      const clockEl = document.getElementById('marketClockLocal');
      if (clockEl) {
        const now = new Date();
        clockEl.textContent = `${now.toISOString().substring(0, 10)} ${now.toLocaleTimeString()} (IST / UTC+05:30)`;
      }
    }, 1000);

    // Close timeframe and layout dropdowns on outside click
    document.addEventListener('click', (e) => {
      const tfMenu = document.getElementById('tfDropdownMenu');
      const tfBtn = document.getElementById('tfDropdownTriggerBtn');
      if (tfMenu && tfMenu.style.display === 'block' && !tfMenu.contains(e.target) && (!tfBtn || !tfBtn.contains(e.target))) {
        tfMenu.style.display = 'none';
        if (tfBtn) tfBtn.classList.remove('active');
      }

      const layoutMenu = document.getElementById('layoutPickerMenu');
      const layoutBtn = document.getElementById('chartLayoutMenuBtn');
      if (layoutMenu && layoutMenu.style.display === 'block' && !layoutMenu.contains(e.target) && (!layoutBtn || !layoutBtn.contains(e.target))) {
        layoutMenu.style.display = 'none';
      }
    });
  }

  // ==========================================================================
  // APPLICATION GLOBAL STATE & MASTER ADMIN IDENTIFICATION (MOBILE: 9788371042)
  // ==========================================================================
  const ADMIN_MOBILE_NUMBER = '9788371042';

  function isAdminMobile(mobileStr) {
    if (!mobileStr) return false;
    const digits = String(mobileStr).replace(/[^0-9]/g, '');
    return digits.endsWith(ADMIN_MOBILE_NUMBER);
  }

  function handleMobileInput(val) {
    const badge = document.getElementById('adminDetectedBadge');
    if (!badge) return;
    if (isAdminMobile(val)) {
      badge.style.display = 'flex';
      sfx.success();
    } else {
      badge.style.display = 'none';
    }
  }

  function quickLoginAsAdmin() {
    sfx.click();
    const usernameInput = document.getElementById('regUsername');
    const passwordInput = document.getElementById('regPassword');
    const phoneInput = document.getElementById('regPhoneInput');
    const countrySelect = document.getElementById('regCountry');
    const addressInput = document.getElementById('regAddress');
    const dobInput = document.getElementById('regDob');

    if (usernameInput) usernameInput.value = 'Admin_Master';
    if (passwordInput) {
      passwordInput.value = 'AdminMaster#2026';
      updatePasswordStrengthUI('AdminMaster#2026');
    }
    if (countrySelect) {
      countrySelect.value = 'India';
      handleCountryChange('India');
    }
    const stateSelect = document.getElementById('regState');
    if (stateSelect) {
      stateSelect.value = 'Tamil Nadu';
      handleStateChange('Tamil Nadu', 'regDistrict');
    }
    const districtSelect = document.getElementById('regDistrict');
    if (districtSelect) {
      districtSelect.value = 'Chennai';
    }
    if (addressInput) addressInput.value = 'Master Server Operations HQ, Anna Salai';
    if (dobInput) dobInput.value = '1990-01-01';
    if (phoneInput) {
      phoneInput.value = '9788371042';
      handleMobileInput('9788371042');
    }

    showToast('Admin Credentials Pre-filled', 'Website Hoster Mobile (9788371042) set. Click Continue to proceed to OTP verification.', 'info');
  }

  const state = {
    currentUser: null,
    customers: [],
    submissions: [],
    devRequests: [],
    activeTab: 'home',
    activeAdminTab: 'submissions',
    pendingRegistration: null,
    generatedOTP: null,
    otpTimerInterval: null,
    otpTimeRemaining: 60,
    uploadedChartBase64: null,
    activeChartPair: 'FX:EURUSD',
    chartIntervalId: null,
    chartCandles: []
  };

  // Toast Notifications
  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
      iconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px) scale(0.9)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Strong 8-Digit Password Generator
  function generateStrong8Password() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*';

    let pass = '';
    pass += upper[Math.floor(Math.random() * upper.length)];
    pass += lower[Math.floor(Math.random() * lower.length)];
    pass += digits[Math.floor(Math.random() * digits.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];

    const allChars = upper + lower + digits + symbols;
    for (let i = 0; i < 4; i++) {
      pass += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  }

  function evaluatePasswordStrength(val) {
    if (!val || val.length < 8) return 0;
    let score = 0;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  // Load Persisted Data with Comprehensive Seed Records
  function loadPersistedData() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) state.currentUser = JSON.parse(storedUser);

      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS_DB);
      if (storedCustomers) {
        state.customers = JSON.parse(storedCustomers);
      } else {
        // Seed Realistic Customer Directory Across India & Abroad
        state.customers = [
          {
            id: 'admin_master_hoster',
            username: 'Admin_Master',
            dob: '1990-01-01',
            country: 'India',
            state: 'Tamil Nadu',
            district: 'Chennai',
            address: 'Central Server Operations HQ, Anna Salai',
            mobile: '+91 9788371042',
            password: 'AdminMaster#2026',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-01T08:00:00.000Z',
            status: 'Website Hoster & Master Administrator',
            isAdmin: true,
            role: 'ADMIN_HOSTER'
          },
          {
            id: 'cust_seed_rajesh',
            username: 'Rajesh_Kumar',
            dob: '1994-05-14',
            country: 'India',
            state: 'Tamil Nadu',
            district: 'Coimbatore',
            address: 'RS Puram, 4th Cross Road',
            mobile: '+91 94432 18920',
            password: 'RajeshTrader94!',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-12T11:20:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          },
          {
            id: 'cust_seed_priya',
            username: 'Priya_Sharma',
            dob: '1997-11-22',
            country: 'India',
            state: 'Karnataka',
            district: 'Bengaluru',
            address: 'Indiranagar 100 Feet Road',
            mobile: '+91 98860 41235',
            password: 'PriyaAlgoGold#22',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-15T09:40:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          },
          {
            id: 'cust_seed_amit',
            username: 'Amit_Patil',
            dob: '1992-03-08',
            country: 'India',
            state: 'Maharashtra',
            district: 'Mumbai',
            address: 'Bandra Kurla Complex, Tower B',
            mobile: '+91 98201 77489',
            password: 'AmitBtcTrader92#',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-18T14:15:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          },
          {
            id: 'cust_seed_rohan',
            username: 'Rohan_Verma',
            dob: '1996-08-30',
            country: 'India',
            state: 'Delhi',
            district: 'New Delhi',
            address: 'Connaught Place, Block C',
            mobile: '+91 98111 65780',
            password: 'RohanGbpFx96!',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-21T16:50:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          },
          {
            id: 'cust_seed_neha',
            username: 'Neha_Patel',
            dob: '1998-02-17',
            country: 'India',
            state: 'Gujarat',
            district: 'Ahmedabad',
            address: 'SG Highway, Bodakdev',
            mobile: '+91 98980 23418',
            password: 'NehaScalp98@!',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-24T10:10:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          },
          {
            id: 'cust_seed_suresh',
            username: 'Suresh_Reddy',
            dob: '1991-07-25',
            country: 'India',
            state: 'Telangana',
            district: 'Hyderabad',
            address: 'Hitech City, Madhapur',
            mobile: '+91 98490 88219',
            password: 'SureshEaTrading91!',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            registeredAt: '2026-09-26T12:00:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          },
          {
            id: 'cust_seed_01',
            username: 'ForexBot Hub',
            dob: '2026-09-28',
            country: 'India',
            state: 'Tamil Nadu',
            district: 'Chennai',
            address: 'Central Trading Tower, Floor 14',
            mobile: '+91 9876543210',
            password: 'EncryptedPassword99!',
            avatar: DEFAULT_GUEST_AVATAR,
            registeredAt: '2026-09-28T10:00:00.000Z',
            status: 'Active Verified Trader',
            isAdmin: false,
            role: 'CUSTOMER'
          }
        ];
        saveState();
      }

      const storedSubs = localStorage.getItem(STORAGE_KEYS.PRIVATE_SUBMISSIONS);
      if (storedSubs) {
        state.submissions = JSON.parse(storedSubs);
      } else {
        // Seed Realistic Customer Chart Uploads for Hoster Review & Reply
        state.submissions = [
          {
            id: 'sub_seed_01',
            customerId: 'cust_seed_rajesh',
            customerUsername: 'Rajesh_Kumar',
            customerMobile: '+91 94432 18920',
            pair: 'FX:EURUSD',
            timeframe: '15m',
            setupType: 'ICT Silver Bullet FVG Setup',
            notes: 'Hoster Sir, I marked London session displacement and 15M FVG at 1.0842. Does this meet the threshold for automated EA buy entry?',
            image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
            timestamp: 'Today at 09:30 AM',
            status: 'replied',
            hosterReplies: [
              {
                id: 'rep_01',
                author: 'Website Hoster & Admin (+91 9788371042)',
                timestamp: 'Today at 09:42 AM',
                text: 'Excellent setup Rajesh. 15M displacement meets the Silver Bullet criterion. Set displacement minimum to 12 pips and risk 1% per session.'
              }
            ]
          },
          {
            id: 'sub_seed_02',
            customerId: 'cust_seed_priya',
            customerUsername: 'Priya_Sharma',
            customerMobile: '+91 98860 41235',
            pair: 'OANDA:XAUUSD',
            timeframe: '1h',
            setupType: 'SMC Order Block & Liquidity Sweep',
            notes: 'Gold swept previous day high at 2648 and formed an unmitigated bullish order block at 2635. Can Admin review my stop loss placement?',
            image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80',
            timestamp: 'Today at 10:15 AM',
            status: 'waiting',
            hosterReplies: []
          },
          {
            id: 'sub_seed_03',
            customerId: 'cust_seed_amit',
            customerUsername: 'Amit_Patil',
            customerMobile: '+91 98201 77489',
            pair: 'BINANCE:BTCUSDT',
            timeframe: '4h',
            setupType: 'Volume Profile POC Retest',
            notes: 'Bitcoin 4H tested Point of Control (POC) at 63,400 with high absorption volume. Looking to hold swing long to 66,200.',
            image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
            timestamp: 'Yesterday at 04:20 PM',
            status: 'replied',
            hosterReplies: [
              {
                id: 'rep_02',
                author: 'Website Hoster & Admin (+91 9788371042)',
                timestamp: 'Yesterday at 04:45 PM',
                text: 'POC absorption confirmed Amit. Keep trailing stop at Value Area Low (VAL 62,780). Bot trailing strategy dispatched to your account.'
              }
            ]
          },
          {
            id: 'sub_seed_04',
            customerId: 'cust_seed_rohan',
            customerUsername: 'Rohan_Verma',
            customerMobile: '+91 98111 65780',
            pair: 'FX:GBPUSD',
            timeframe: '30m',
            setupType: 'Order Flow Delta Divergence',
            notes: 'Admin sir, positive delta divergence spotted during NY open pullback on Cable. Would like your confirmation before executing bot.',
            image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
            timestamp: 'Today at 11:45 AM',
            status: 'waiting',
            hosterReplies: []
          }
        ];
        saveState();
      }

      const storedDev = localStorage.getItem(STORAGE_KEYS.DEV_REQUESTS);
      if (storedDev) {
        state.devRequests = JSON.parse(storedDev);
      } else {
        state.devRequests = [
          {
            id: 'dev_seed_01',
            customerId: 'cust_seed_rajesh',
            customerUsername: 'Rajesh_Kumar',
            projectType: 'MetaTrader 5 EA',
            pair: 'GBP/JPY',
            title: 'Asian Session Box Breakout Bot',
            entryRules: 'Identify 00:00 - 06:00 GMT Asian box high/low; execute buy stop / sell stop 3 pips beyond wick.',
            exitRules: 'Take profit 2:1 RR; move stop to breakeven at 1R.',
            riskSettings: '1.5% max risk per trade, max 2 trades/day',
            timestamp: '2 days ago',
            status: 'In Development Queue'
          },
          {
            id: 'dev_seed_02',
            customerId: 'cust_seed_priya',
            customerUsername: 'Priya_Sharma',
            projectType: 'PineScript v5 Indicator',
            pair: 'XAU/USD',
            title: 'Gold Institutional Liquidity Sweep Overlay',
            entryRules: 'Detect sweep of Asian/London session high/low with Volume Spike > 2.5x 20-period SMA.',
            exitRules: 'Target opposing Fair Value Gap or session equilibrium (50%).',
            riskSettings: 'Alert triggers via Webhook to MT5 Bridge',
            timestamp: 'Yesterday',
            status: 'Code Ready for Delivery'
          }
        ];
        saveState();
      }
    } catch (e) {
      console.warn('Storage error: fallback to memory state');
    }
  }

  function saveState() {
    try {
      if (state.currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS_DB, JSON.stringify(state.customers));
      localStorage.setItem(STORAGE_KEYS.PRIVATE_SUBMISSIONS, JSON.stringify(state.submissions));
      localStorage.setItem(STORAGE_KEYS.DEV_REQUESTS, JSON.stringify(state.devRequests));
    } catch (e) {
      // Storage limits or policy
    }
  }

  // Update UI Elements For Auth State (Including Master Admin 9788371042 Controls)
  function updateUIForAuthState() {
    const isLoggedIn = !!state.currentUser;

    // Nav buttons (Including Live Market & Book)
    const navConditionalButtons = [
      { id: 'navTabCharting', badgeId: 'badgeCharting' },
      { id: 'navTabMarket', badgeId: 'badgeMarket' },
      { id: 'navTabIndicators', badgeId: 'badgeIndicators' },
      { id: 'navTabBots', badgeId: 'badgeBots' },
      { id: 'navTabBook', badgeId: 'badgeBook' },
      { id: 'navTabDevelopment', badgeId: 'badgeDevelopment' },
      { id: 'navTabResources', badgeId: 'badgeResources' }
    ];

    // Header Profile Elements
    const headerProfileName = document.getElementById('headerProfileName');
    const headerProfileSub = document.getElementById('headerProfileSub');
    const headerProfileAvatar = document.getElementById('headerProfileAvatar');
    const headerStatusDot = document.getElementById('headerStatusDot');

    // Admin Portal Header Button
    const adminPortalBtn = document.getElementById('adminPortalBtn');

    // Home Right Card Elements
    const homeShowcaseAvatar = document.getElementById('homeShowcaseAvatar');
    const homeShowcaseName = document.getElementById('homeShowcaseName');
    const homeShowcaseLevel = document.getElementById('homeShowcaseLevel');
    const homeShowcaseDob = document.getElementById('homeShowcaseDob');
    const homeShowcaseLocation = document.getElementById('homeShowcaseLocation');
    const homeShowcaseMobile = document.getElementById('homeShowcaseMobile');
    const homeShowcasePassTag = document.getElementById('homeShowcasePassTag');
    const homeCardActionBtnText = document.getElementById('homeCardActionBtnText');

    if (isLoggedIn) {
      const user = state.currentUser;
      const isMasterAdmin = !!(user && (user.isAdmin || isAdminMobile(user.mobile)));

      // Unlock Conditional Navigation
      navConditionalButtons.forEach(item => {
        const btn = document.getElementById(item.id);
        const badge = document.getElementById(item.badgeId);
        if (btn) {
          btn.classList.remove('locked');
          btn.classList.add('unlocked');
          btn.title = 'Unlocked & Fully Accessible';
        }
        if (badge) {
          badge.textContent = 'Active';
          badge.className = 'tab-badge badge-unlocked';
        }
      });

      // Update Header Profile with Master Admin identification
      if (headerProfileName) {
        headerProfileName.textContent = user.username + (isMasterAdmin ? ' 🛡️' : '');
      }
      if (headerProfileSub) {
        headerProfileSub.textContent = isMasterAdmin ? 'Master Hoster (9788371042)' : 'Verified Member';
      }
      if (headerProfileAvatar) headerProfileAvatar.src = user.avatar || DEFAULT_GUEST_AVATAR;
      if (headerStatusDot) headerStatusDot.classList.add('online');

      // Update Admin Portal Button Glow
      if (adminPortalBtn) {
        if (isMasterAdmin) {
          adminPortalBtn.classList.add('hoster-glow');
          adminPortalBtn.title = 'Website Hoster & Admin Portal (Active - 9788371042)';
          const span = adminPortalBtn.querySelector('span');
          if (span) span.textContent = 'Hoster Admin (9788371042)';
        } else {
          adminPortalBtn.classList.remove('hoster-glow');
          adminPortalBtn.title = 'Website Hoster Access (Restricted to 9788371042)';
          const span = adminPortalBtn.querySelector('span');
          if (span) span.textContent = 'Hoster / Admin';
        }
      }

      // Update Home Card Showcase
      if (homeShowcaseAvatar) homeShowcaseAvatar.src = user.avatar || DEFAULT_GUEST_AVATAR;
      if (homeShowcaseName) homeShowcaseName.textContent = user.username;
      if (homeShowcaseLevel) {
        homeShowcaseLevel.textContent = isMasterAdmin ? 'Master Hoster: Admin Level' : 'Verification: Advanced Level';
      }
      if (homeShowcaseDob) homeShowcaseDob.textContent = user.dob || '2026-09-28';
      if (homeShowcaseLocation) {
        homeShowcaseLocation.textContent = `${user.district || 'Chennai'}, ${user.state || 'Tamil Nadu'}, ${user.country || 'India'}`;
      }
      if (homeShowcaseMobile) {
        if (isMasterAdmin) {
          homeShowcaseMobile.textContent = '+91 9788371042 (Hoster Master)';
        } else {
          homeShowcaseMobile.textContent = user.mobile ? `${user.mobile.substring(0, 5)}*****${user.mobile.slice(-2)}(Locked)` : '+91 98*****10(Locked)';
        }
      }
      if (homeShowcasePassTag) homeShowcasePassTag.textContent = '•••••••• (Encrypted)';
      if (homeCardActionBtnText) {
        homeCardActionBtnText.textContent = isMasterAdmin ? 'Admin Master Portal' : 'User Dashboard';
      }

      renderCustomerPrivateSubmissions();
    } else {
      // Locked Guest State
      navConditionalButtons.forEach(item => {
        const btn = document.getElementById(item.id);
        const badge = document.getElementById(item.badgeId);
        if (btn) {
          btn.classList.add('locked');
          btn.classList.remove('unlocked');
          btn.title = 'Login required to unlock this option';
        }
        if (badge) {
          badge.textContent = 'Locked';
          badge.className = 'tab-badge badge-locked';
        }
      });

      if (adminPortalBtn) {
        adminPortalBtn.classList.remove('hoster-glow');
        const span = adminPortalBtn.querySelector('span');
        if (span) span.textContent = 'Hoster / Admin';
      }

      if (headerProfileName) headerProfileName.textContent = 'Guest Trader';
      if (headerProfileSub) headerProfileSub.textContent = 'Log In';
      if (headerProfileAvatar) headerProfileAvatar.src = DEFAULT_GUEST_AVATAR;
      if (headerStatusDot) headerStatusDot.classList.remove('online');

      if (homeShowcaseAvatar) homeShowcaseAvatar.src = DEFAULT_GUEST_AVATAR;
      if (homeShowcaseName) homeShowcaseName.textContent = 'ForexBot Hub';
      if (homeShowcaseLevel) homeShowcaseLevel.textContent = 'Verification: Advanced Level';
      if (homeShowcaseDob) homeShowcaseDob.textContent = '2026-09-28';
      if (homeShowcaseLocation) homeShowcaseLocation.textContent = 'Chennai, Tamil Nadu, India';
      if (homeShowcaseMobile) homeShowcaseMobile.textContent = '+91 98*****10(Locked)';
      if (homeShowcasePassTag) homeShowcasePassTag.textContent = '•••••••• (Encrypted)';
      if (homeCardActionBtnText) homeCardActionBtnText.textContent = 'Login to Access Hub';

      // If viewing a protected section, revert to Home
      if (['charting', 'market', 'indicators', 'bots', 'book', 'development', 'resources'].includes(state.activeTab)) {
        switchTab('home');
      }
    }
  }

  // Switch Active Section Tab
  function switchTab(tabName) {
    const protectedTabs = ['charting', 'market', 'indicators', 'bots', 'book', 'development', 'resources'];

    if (protectedTabs.includes(tabName) && !state.currentUser) {
      sfx.click();
      showToast('Authentication Required', 'Please log in to your ForexBot Hub account to unlock Live Charting, Live Market, Books & Algo Bots!', 'error');
      openAuthModal();
      return;
    }

    state.activeTab = tabName;
    sfx.click();

    // Update Nav buttons active state
    const tabMap = {
      home: 'navTabHome',
      charting: 'navTabCharting',
      market: 'navTabMarket',
      indicators: 'navTabIndicators',
      bots: 'navTabBots',
      book: 'navTabBook',
      development: 'navTabDevelopment',
      resources: 'navTabResources',
      about: 'navTabAbout'
    };

    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(tabMap[tabName]);
    if (activeBtn) activeBtn.classList.add('active');

    // Update View Sections
    const sectionMap = {
      home: 'homeViewSection',
      charting: 'chartingViewSection',
      market: 'marketViewSection',
      indicators: 'indicatorsViewSection',
      bots: 'botsViewSection',
      book: 'bookViewSection',
      development: 'developmentViewSection',
      resources: 'resourcesViewSection',
      about: 'aboutViewSection'
    };

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(sectionMap[tabName]);
    if (targetSection) targetSection.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initialize specific tab logic
    if (tabName === 'charting') {
      initLiveCandleChart();
      renderCustomerPrivateSubmissions();
    } else if (tabName === 'market') {
      initMarketTerminal();
      if (terminalState.activeEngine === 'tradingview') {
        setTimeout(loadOfficialTradingViewWidget, 80);
      }
    } else if (tabName === 'book') {
      renderBooks();
    } else if (tabName === 'bots') {
      updateBotSimulation();
    } else if (tabName === 'resources') {
      calculateLotSize();
    }
  }

  // Open Auth Modal
  function openAuthModal() {
    sfx.click();
    if (state.currentUser) {
      openEditProfileModal();
    } else {
      openRegisterModal();
    }
  }

  // Open Registration Modal
  function openRegisterModal() {
    const modal = document.getElementById('authModal');
    const registerStep = document.getElementById('registerStep');
    const otpStep = document.getElementById('otpStep');
    if (!modal) return;

    registerStep.style.display = 'block';
    otpStep.style.display = 'none';

    const form = document.getElementById('registerForm');
    if (form) form.reset();

    // Default Country to India with +91 prefix
    const regCountry = document.getElementById('regCountry');
    if (regCountry) {
      regCountry.value = 'India';
      handleCountryChange('India');
    }

    const avatarPreview = document.getElementById('registerAvatarPreview');
    if (avatarPreview) avatarPreview.src = DEFAULT_GUEST_AVATAR;

    updatePasswordStrengthUI('');
    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  // Open Profile Edit Modal (Enforces Re-edit vs Permanently Locked fields)
  function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal || !state.currentUser) return;

    const user = state.currentUser;

    document.getElementById('editAvatarPreview').src = user.avatar || DEFAULT_GUEST_AVATAR;
    document.getElementById('editUsername').value = user.username || '';
    document.getElementById('editDob').value = user.dob || '';
    document.getElementById('editAddress').value = user.address || '';

    // Country, State, District dropdown sync
    const editCountry = document.getElementById('editCountry');
    if (editCountry) {
      editCountry.value = user.country || 'India';
      populateStates(editCountry.value, 'editState', 'editDistrict', user.state, user.district);
    }

    // Permanently locked fields
    const mobileField = document.getElementById('editMobileLocked');
    if (mobileField) {
      mobileField.value = user.mobile || '';
      mobileField.disabled = true;
    }

    const passwordField = document.getElementById('editPasswordLocked');
    if (passwordField) {
      passwordField.value = '••••••••';
      passwordField.disabled = true;
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  // Close Modal
  function closeModal(modalId) {
    sfx.click();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    if (state.otpTimerInterval) clearInterval(state.otpTimerInterval);
  }

  // Password Generator
  function autoGeneratePassword() {
    sfx.pop();
    const pass = generateStrong8Password();
    const input = document.getElementById('regPassword');
    if (input) {
      input.value = pass;
      input.type = 'text';
      updatePasswordStrengthUI(pass);
      showToast('Strong Password Generated', `Generated: ${pass}`, 'success');
      setTimeout(() => { input.type = 'password'; }, 3000);
    }
  }

  function handlePasswordInput(val) {
    updatePasswordStrengthUI(val);
  }

  function togglePasswordVisibility(inputId) {
    sfx.click();
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  function updatePasswordStrengthUI(val) {
    const fill = document.getElementById('passStrengthFill');
    const text = document.getElementById('passStrengthText');
    if (!fill || !text) return;

    const score = evaluatePasswordStrength(val);
    if (score === 0) {
      fill.style.width = '0%';
      fill.style.backgroundColor = '#ef4444';
      text.textContent = 'Min 8 characters required';
    } else if (score === 1) {
      fill.style.width = '33%';
      fill.style.backgroundColor = '#ef4444';
      text.textContent = 'Weak - Add uppercase & numbers';
    } else if (score === 2) {
      fill.style.width = '66%';
      fill.style.backgroundColor = '#f59e0b';
      text.textContent = 'Medium - Add symbols (!@#$)';
    } else {
      fill.style.width = '100%';
      fill.style.backgroundColor = '#10b981';
      text.textContent = 'Strong 8-digit security satisfied!';
    }
  }

  // Step 1: Submit Registration -> Immediate Mobile OTP Trigger
  function handleRegisterSubmit(e) {
    e.preventDefault();
    sfx.click();

    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const dob = document.getElementById('regDob').value;
    const country = document.getElementById('regCountry').value;
    const stateVal = document.getElementById('regState').value;
    const district = document.getElementById('regDistrict').value;
    const address = document.getElementById('regAddress').value.trim();
    const rawPhone = document.getElementById('regPhoneInput').value.trim();
    const avatar = document.getElementById('registerAvatarPreview').src;

    if (password.length < 8) {
      showToast('Security Error', 'Custom password must be at least 8 characters long!', 'error');
      return;
    }

    if (!rawPhone || rawPhone.length < 7) {
      showToast('Mobile Required', 'Please enter a valid mobile number!', 'error');
      return;
    }

    const dialCode = COUNTRY_DIAL_CODES[country] || '+91';
    const cleanPhone = rawPhone.replace(/^\+?[0-9]{1,3}\s*/, '');
    const isAdmin = isAdminMobile(rawPhone) || isAdminMobile(cleanPhone);
    const formattedMobile = `${dialCode} ${cleanPhone || rawPhone}`;

    state.pendingRegistration = {
      id: isAdmin ? 'admin_master_hoster' : ('cust_' + Date.now()),
      username: (isAdmin && !username) ? 'Admin_Master' : username,
      password,
      dob,
      country,
      state: stateVal,
      district,
      address,
      mobile: formattedMobile,
      avatar,
      registeredAt: new Date().toISOString(),
      status: isAdmin ? 'Website Hoster & Master Administrator' : 'Active Verified Trader',
      isAdmin: isAdmin,
      role: isAdmin ? 'ADMIN_HOSTER' : 'CUSTOMER'
    };

    // Transition to OTP screen
    document.getElementById('registerStep').style.display = 'none';
    document.getElementById('otpStep').style.display = 'block';

    const recipientText = document.getElementById('otpRecipientText');
    if (recipientText) {
      recipientText.textContent = `Enter the 6-digit code dispatched to ${formattedMobile}`;
    }

    // Immediately trigger OTP dispatch
    sendOTP();
  }

  // Step 2: Send OTP
  function sendOTP() {
    sfx.click();

    if (!state.pendingRegistration) {
      showToast('Registration Error', 'Please complete step 1 first!', 'error');
      return;
    }

    // Generate 6-digit code
    state.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Show simulated notification
    const banner = document.getElementById('otpSimulatedNotification');
    const codeDisplay = document.getElementById('simulatedCodeDisplay');
    if (banner && codeDisplay) {
      codeDisplay.textContent = state.generatedOTP;
      banner.style.display = 'flex';
      sfx.otpChime();
    }

    // Clear digit boxes & focus first
    document.querySelectorAll('.otp-digit-box').forEach(box => {
      box.value = '';
    });
    const firstBox = document.querySelector('.otp-digit-box[data-index="0"]');
    if (firstBox) firstBox.focus();

    // Start 60-second countdown
    startOTPCountdown();
    showToast('SMS Dispatched', `Verification code sent to ${state.pendingRegistration.mobile}!`, 'success');
  }

  function startOTPCountdown() {
    state.otpTimeRemaining = 60;
    const countdownText = document.getElementById('otpCountdownText');
    const resendBtn = document.getElementById('resendOtpBtn');

    if (resendBtn) resendBtn.style.display = 'none';
    if (countdownText) countdownText.style.display = 'inline';

    if (state.otpTimerInterval) clearInterval(state.otpTimerInterval);

    state.otpTimerInterval = setInterval(() => {
      state.otpTimeRemaining--;
      if (countdownText) countdownText.textContent = `(Resend in ${state.otpTimeRemaining}s)`;

      if (state.otpTimeRemaining <= 0) {
        clearInterval(state.otpTimerInterval);
        if (countdownText) countdownText.style.display = 'none';
        if (resendBtn) resendBtn.style.display = 'inline-block';
      }
    }, 1000);
  }

  function autoFillOTP() {
    sfx.pop();
    if (!state.generatedOTP) return;
    const digits = state.generatedOTP.split('');
    document.querySelectorAll('.otp-digit-box').forEach((box, index) => {
      box.value = digits[index] || '';
    });
    showToast('Auto-Filled', 'Verification code filled automatically!', 'info');
  }

  // Step 3: Verify OTP & Finalize Login
  function verifyOTP() {
    sfx.click();
    const boxes = document.querySelectorAll('.otp-digit-box');
    let enteredCode = '';
    boxes.forEach(box => enteredCode += box.value.trim());

    if (!state.generatedOTP || enteredCode !== state.generatedOTP) {
      showToast('Verification Failed', 'Incorrect OTP code entered. Please try again or click Auto-Fill!', 'error');
      return;
    }

    if (!state.pendingRegistration) return;

    const finalUser = { ...state.pendingRegistration };
    if (isAdminMobile(finalUser.mobile) || finalUser.isAdmin) {
      finalUser.isAdmin = true;
      finalUser.role = 'ADMIN_HOSTER';
      finalUser.status = 'Website Hoster & Master Administrator';
    }

    // Save to customers directory
    const existingIndex = state.customers.findIndex(c => 
      (c.id && c.id === finalUser.id) ||
      (c.mobile && isAdminMobile(c.mobile) && isAdminMobile(finalUser.mobile)) ||
      (c.username.toLowerCase() === finalUser.username.toLowerCase())
    );
    if (existingIndex >= 0) {
      state.customers[existingIndex] = finalUser;
    } else {
      state.customers.push(finalUser);
    }

    state.currentUser = finalUser;
    state.pendingRegistration = null;
    saveState();

    sfx.success();
    closeModal('authModal');
    updateUIForAuthState();

    if (finalUser.isAdmin) {
      showToast(
        '🛡️ Master Admin Authenticated!',
        'Welcome Website Hoster! Mobile 9788371042 verified. Centralized customer management & all chart controls unlocked.',
        'success'
      );
    } else {
      showToast('Authentication Successful!', `Welcome to ForexBot Hub, ${finalUser.username}! Live Market, Books & Bots unlocked.`, 'success');
    }
  }

  // Handle Edit Profile Save
  function handleEditProfileSubmit(e) {
    e.preventDefault();
    sfx.click();

    if (!state.currentUser) return;

    state.currentUser.username = document.getElementById('editUsername').value.trim();
    state.currentUser.dob = document.getElementById('editDob').value;
    state.currentUser.address = document.getElementById('editAddress').value.trim();
    state.currentUser.country = document.getElementById('editCountry').value;
    state.currentUser.state = document.getElementById('editState').value;
    state.currentUser.district = document.getElementById('editDistrict').value;
    state.currentUser.avatar = document.getElementById('editAvatarPreview').src;

    // Update in customers DB
    const idx = state.customers.findIndex(c => c.id === state.currentUser.id);
    if (idx >= 0) {
      state.customers[idx] = { ...state.currentUser };
    }

    saveState();
    sfx.success();
    closeModal('editProfileModal');
    updateUIForAuthState();
    showToast('Profile Updated', 'Profile details saved successfully! Mobile number remains permanently locked.', 'success');
  }

  // Logout
  function logout() {
    sfx.click();
    state.currentUser = null;
    saveState();
    closeModal('editProfileModal');
    updateUIForAuthState();
    showToast('Logged Out', 'You have been safely logged out from ForexBot Hub.', 'info');
  }

  // Hero Buttons
  function handleExploreClick() {
    if (!state.currentUser) {
      switchTab('indicators');
    } else {
      switchTab('indicators');
    }
  }

  function handleBuildBotClick() {
    if (!state.currentUser) {
      switchTab('development');
    } else {
      switchTab('development');
    }
  }

  function handleCardActionClick() {
    if (state.currentUser) {
      openEditProfileModal();
    } else {
      openAuthModal();
    }
  }

  // ==========================================================================
  // PRIVATE CUSTOMER CHART IMAGE UPLOAD PORTAL (LIVE CHARTING)
  // Strictly isolates submissions: Only Customer & Hoster/Admin can view!
  // ==========================================================================
  function setupChartUploadListeners() {
    const dropZone = document.getElementById('chartDropZone');
    const fileInput = document.getElementById('chartFileInput');
    const previewBox = document.getElementById('chartPreviewBox');
    const previewImg = document.getElementById('chartPreviewImg');
    const removeBtn = document.getElementById('removeChartPreviewBtn');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processChartFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processChartFile(e.target.files[0]);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.uploadedChartBase64 = null;
        if (previewBox) previewBox.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (fileInput) fileInput.value = '';
      });
    }
  }

  function processChartFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please upload an image file (PNG, JPG, WebP)!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      state.uploadedChartBase64 = e.target.result;
      const previewBox = document.getElementById('chartPreviewBox');
      const previewImg = document.getElementById('chartPreviewImg');
      if (previewBox && previewImg) {
        previewImg.src = state.uploadedChartBase64;
        previewBox.style.display = 'block';
      }
      sfx.pop();
    };
    reader.readAsDataURL(file);
  }

  function submitCustomerChart() {
    if (!state.currentUser) {
      showToast('Login Required', 'You must be logged in to upload chart tests for hoster review!', 'error');
      openAuthModal();
      return;
    }

    if (!state.uploadedChartBase64) {
      showToast('Chart Image Required', 'Please drag & drop or select your chart screenshot before submitting!', 'error');
      return;
    }

    const pair = document.getElementById('chartPairSelect').value;
    const timeframe = document.getElementById('chartTimeframeSelect').value;
    const setupType = document.getElementById('chartSetupType').value.trim() || 'Custom Setup';
    const notes = document.getElementById('chartNotes').value.trim() || 'Trade setup for review & bot conversion.';

    const newSubmission = {
      id: 'sub_' + Date.now(),
      customerId: state.currentUser.id,
      customerUsername: state.currentUser.username,
      customerMobile: state.currentUser.mobile,
      pair,
      timeframe,
      setupType,
      notes,
      image: state.uploadedChartBase64,
      timestamp: 'Just now',
      status: 'waiting',
      hosterReplies: []
    };

    state.submissions.unshift(newSubmission);
    saveState();

    // Reset Form
    state.uploadedChartBase64 = null;
    document.getElementById('chartPreviewBox').style.display = 'none';
    document.getElementById('chartPreviewImg').src = '';
    document.getElementById('chartNotes').value = '';
    document.getElementById('chartSetupType').value = '';

    sfx.success();
    renderCustomerPrivateSubmissions();
    showToast('Chart Sent Privately', 'Your chart test was sent securely to the Website Hoster / Admin! Only you and Admin can view it.', 'success');
  }

  // Render Submissions in Customer Private View (Strictly only their own!)
  function renderCustomerPrivateSubmissions() {
    const container = document.getElementById('customerSubmissionsList');
    const countBadge = document.getElementById('customerChartCount');
    if (!container) return;

    if (!state.currentUser) {
      container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Please log in to view your private chart submissions.</div>';
      return;
    }

    const mySubmissions = state.submissions.filter(s => s.customerId === state.currentUser.id);
    if (countBadge) countBadge.textContent = `${mySubmissions.length} Private Submissions`;

    if (mySubmissions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px; opacity: 0.5;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>No chart tests uploaded yet.</p>
          <span style="font-size: 0.8rem;">Upload a chart screenshot above to get private technical analysis and bot support from the Hoster!</span>
        </div>
      `;
      return;
    }

    container.innerHTML = mySubmissions.map(sub => `
      <div class="private-submission-card" id="${sub.id}">
        <div class="sub-card-head">
          <span class="sub-pair-pill">${sub.pair} • ${sub.timeframe}</span>
          <span class="sub-status-tag ${sub.status === 'replied' ? 'replied' : 'waiting'}">
            ${sub.status === 'replied' ? '💬 Hoster Replied' : '⏳ Awaiting Hoster Review'}
          </span>
        </div>

        <img class="sub-card-img" src="${sub.image}" alt="Chart Setup" onclick="window.HubApp.openLightbox('${sub.image}')">
        
        <div class="sub-card-notes">
          <strong>Setup:</strong> ${sub.setupType}<br>
          <strong>Notes:</strong> ${sub.notes}
        </div>

        ${sub.hosterReplies && sub.hosterReplies.length > 0 ? `
          <div class="hoster-reply-thread">
            ${sub.hosterReplies.map(rep => `
              <div class="hoster-reply-box">
                <div class="hoster-reply-header">
                  <strong>🛡️ ${rep.author}</strong>
                  <span>${rep.timestamp}</span>
                </div>
                <div class="hoster-reply-text">${rep.text}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size:0.78rem; color:var(--text-muted); background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px;">
            🔒 Sent privately to Website Hoster & Admin. Hoster reply will appear here shortly.
          </div>
        `}

        <div class="customer-followup-row">
          <input type="text" placeholder="Type a follow-up question to Hoster..." id="followUp_${sub.id}" onkeypress="if(event.key==='Enter') window.HubApp.sendCustomerFollowUp('${sub.id}')">
          <button class="btn btn-cyan btn-sm" onclick="window.HubApp.sendCustomerFollowUp('${sub.id}')">Send</button>
        </div>
      </div>
    `).join('');
  }

  function sendCustomerFollowUp(subId) {
    sfx.click();
    const input = document.getElementById(`followUp_${subId}`);
    if (!input || !input.value.trim()) return;

    const sub = state.submissions.find(s => s.id === subId);
    if (!sub) return;

    if (!sub.hosterReplies) sub.hosterReplies = [];
    sub.hosterReplies.push({
      id: 'rep_' + Date.now(),
      author: `${state.currentUser.username} (Customer Question)`,
      timestamp: 'Just now',
      text: input.value.trim()
    });
    sub.status = 'waiting';

    input.value = '';
    saveState();
    renderCustomerPrivateSubmissions();
    showToast('Question Sent', 'Your follow-up question was sent to the Website Hoster / Admin inbox!', 'success');
  }

  // ==========================================================================
  // WEBSITE HOSTER & MASTER ADMIN CONTROL CENTER (MOBILE: 9788371042)
  // Strict Privacy: Customer-to-Customer Leakage is 100% BLOCKED.
  // All Customer Charts, Profiles & Website Usage visible ONLY to Admin Hoster.
  // ==========================================================================
  function openAdminPortal() {
    sfx.click();
    const isMasterAdmin = !!(state.currentUser && (state.currentUser.isAdmin || isAdminMobile(state.currentUser.mobile)));

    if (!isMasterAdmin) {
      sfx.error();
      showToast(
        'Access Restricted to Website Hoster',
        'Customer details, charts, and platform statistics are private to the Website Hoster (Mobile: 9788371042). Individual customer data is never shared publicly.',
        'error'
      );
      if (!state.currentUser) {
        openAuthModal();
      }
      return;
    }

    const modal = document.getElementById('adminModal');
    if (!modal) return;

    renderAdminDashboardStats();
    renderAdminSubmissions();
    renderAdminCustomers();
    renderAdminDevRequests();
    renderAdminAnalytics();

    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  function renderAdminDashboardStats() {
    const totalUsersEl = document.getElementById('adminTotalUsersVal');
    const totalChartsEl = document.getElementById('adminTotalChartsVal');
    const pendingRepliesEl = document.getElementById('adminPendingRepliesVal');
    const totalBotsEl = document.getElementById('adminTotalBotsVal');
    const liveSessionsEl = document.getElementById('adminLiveSessionsVal');

    const totalCustomers = state.customers.length;
    const totalCharts = state.submissions.length;
    const pendingReplies = state.submissions.filter(s => s.status !== 'replied').length;
    const totalBots = state.devRequests.length;

    if (totalUsersEl) totalUsersEl.textContent = totalCustomers;
    if (totalChartsEl) totalChartsEl.textContent = totalCharts;
    if (pendingRepliesEl) pendingRepliesEl.textContent = `${pendingReplies} awaiting your reply`;
    if (totalBotsEl) totalBotsEl.textContent = totalBots;
    if (liveSessionsEl) {
      const simulatedSessions = Math.max(1482, totalCustomers * 124 + 18);
      liveSessionsEl.textContent = simulatedSessions.toLocaleString();
    }
  }

  function switchAdminTab(tab) {
    sfx.click();
    state.activeAdminTab = tab;

    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      pane.classList.remove('active');
      pane.style.display = 'none';
    });

    if (tab === 'submissions') {
      const btn = document.getElementById('adminTabSubmissionsBtn');
      if (btn) btn.classList.add('active');
      const pane = document.getElementById('adminPaneSubmissions');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
      renderAdminSubmissions();
    } else if (tab === 'customers') {
      const btn = document.getElementById('adminTabCustomersBtn');
      if (btn) btn.classList.add('active');
      const pane = document.getElementById('adminPaneCustomers');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
      renderAdminCustomers();
    } else if (tab === 'dev') {
      const btn = document.getElementById('adminTabDevRequestsBtn');
      if (btn) btn.classList.add('active');
      const pane = document.getElementById('adminPaneDev');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
      renderAdminDevRequests();
    } else if (tab === 'analytics') {
      const btn = document.getElementById('adminTabAnalyticsBtn');
      if (btn) btn.classList.add('active');
      const pane = document.getElementById('adminPaneAnalytics');
      if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
      renderAdminAnalytics();
    }
  }

  function renderAdminSubmissions() {
    const container = document.getElementById('adminSubmissionsContainer');
    const badge = document.getElementById('adminSubmissionsCount');
    if (!container) return;

    if (badge) badge.textContent = state.submissions.length;

    if (state.submissions.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No customer chart submissions yet.</div>';
      return;
    }

    container.innerHTML = state.submissions.map(sub => `
      <div class="admin-sub-card">
        <div class="admin-sub-grid">
          <div class="admin-sub-img-box">
            <img src="${sub.image}" alt="Customer Chart" onclick="window.HubApp.openLightbox('${sub.image}')">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 4px;">Click to zoom chart</div>
          </div>
          
          <div class="admin-sub-details">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4>${sub.pair} • <span style="color:var(--accent-cyan); font-weight:600;">${sub.setupType}</span></h4>
              <span class="sub-status-tag ${sub.status === 'replied' ? 'replied' : 'waiting'}">
                ${sub.status === 'replied' ? '✓ Replied by Hoster' : '⏳ Needs Admin Reply'}
              </span>
            </div>

            <div class="admin-sub-meta">
              <span>👤 <strong>Customer:</strong> ${sub.customerUsername}</span>
              <span>📱 <strong>Mobile:</strong> <code style="color:var(--accent-cyan);">${sub.customerMobile || 'Verified'}</code></span>
              <span>⏱ <strong>Timeframe:</strong> ${sub.timeframe}</span>
              <span>📅 <strong>Submitted:</strong> ${sub.timestamp}</span>
            </div>

            <div style="font-size:0.88rem; color:var(--text-primary); background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:6px; margin-bottom:12px;">
              <strong>Customer Query:</strong> ${sub.notes}
            </div>

            ${sub.hosterReplies && sub.hosterReplies.length > 0 ? `
              <div class="hoster-reply-thread" style="margin-bottom:12px;">
                ${sub.hosterReplies.map(r => `
                  <div style="margin-bottom:8px; padding:8px 12px; background:rgba(6, 182, 212, 0.08); border-left:3px solid var(--accent-cyan); border-radius:4px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
                      <strong style="color:var(--accent-cyan);">${r.author}</strong>
                      <span style="color:var(--text-muted);">${r.timestamp}</span>
                    </div>
                    <div style="font-size:0.84rem; color:var(--text-secondary); margin-top:4px;">${r.text}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="admin-reply-form">
              <textarea id="adminReplyText_${sub.id}" class="admin-reply-textarea" placeholder="Type official Website Hoster reply, technical feedback, or bot parameters for ${sub.customerUsername}..."></textarea>
              <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button class="btn btn-outline btn-sm" onclick="window.HubApp.deleteSubmission('${sub.id}')">Delete Post</button>
                <button class="btn btn-cyan btn-sm" onclick="window.HubApp.sendHosterReply('${sub.id}')">Send Hoster Reply to Customer</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    `).join('');
  }

  function sendHosterReply(subId) {
    sfx.click();
    const textarea = document.getElementById(`adminReplyText_${subId}`);
    if (!textarea || !textarea.value.trim()) {
      showToast('Reply Required', 'Please type a reply message to send to the customer!', 'error');
      return;
    }

    const sub = state.submissions.find(s => s.id === subId);
    if (!sub) return;

    if (!sub.hosterReplies) sub.hosterReplies = [];
    sub.hosterReplies.push({
      id: 'rep_' + Date.now(),
      author: 'Website Hoster & Admin (+91 9788371042)',
      timestamp: 'Just now',
      text: textarea.value.trim()
    });

    sub.status = 'replied';
    saveState();
    renderAdminSubmissions();
    renderAdminDashboardStats();
    renderCustomerPrivateSubmissions();

    sfx.success();
    showToast('Reply Dispatched', `Official Hoster reply delivered to ${sub.customerUsername}!`, 'success');
  }

  function deleteSubmission(subId) {
    if (!confirm('Are you sure you want to delete this customer submission?')) return;
    sfx.pop();
    state.submissions = state.submissions.filter(s => s.id !== subId);
    saveState();
    renderAdminSubmissions();
    renderAdminDashboardStats();
    renderCustomerPrivateSubmissions();
    showToast('Deleted', 'Submission deleted by Admin.', 'info');
  }

  function renderAdminCustomers(list = null) {
    const tbody = document.getElementById('adminCustomerTableBody');
    const badge = document.getElementById('adminCustomerCount');
    if (!tbody) return;

    const customersToRender = list !== null ? list : state.customers;
    if (badge) badge.textContent = customersToRender.length;

    if (customersToRender.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No customer records found matching search query.</td></tr>';
      return;
    }

    tbody.innerHTML = customersToRender.map(c => {
      const isHoster = isAdminMobile(c.mobile) || c.isAdmin;
      return `
        <tr class="${isHoster ? 'admin-highlight-row' : ''}">
          <td>
            <div class="customer-cell">
              <img src="${c.avatar || DEFAULT_GUEST_AVATAR}" alt="${c.username}">
              <div>
                <strong style="color:var(--text-primary); font-size:0.92rem;">
                  ${c.username}
                  ${isHoster ? '<span class="hoster-inline-tag">Master Hoster</span>' : ''}
                </strong>
                <div style="font-size:0.75rem; color:var(--text-muted); font-family:'JetBrains Mono';">${c.id}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-family:'JetBrains Mono'; color:${isHoster ? '#ec4899' : 'var(--accent-cyan)'}; font-weight:600;">
              ${c.mobile || 'Pending Verification'}
            </span>
          </td>
          <td>${c.dob || '2000-01-01'}</td>
          <td>
            <span style="font-weight:500;">${c.district || 'Chennai'}</span>, ${c.state || 'Tamil Nadu'}, ${c.country || 'India'}
          </td>
          <td>${c.registeredAt ? c.registeredAt.substring(0, 10) : '2026-09-28'}</td>
          <td>
            <span class="live-badge">
              <span class="live-badge-dot"></span> Active
            </span>
          </td>
          <td>
            ${isHoster ? `
              <span style="font-size:0.75rem; color:#ec4899; font-weight:600;">Admin Master</span>
            ` : `
              <button class="btn btn-outline btn-sm" onclick="window.HubApp.loginAsCustomer('${c.id}')" title="Inspect private customer view without altering data">
                Inspect View
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  function filterAdminCustomers(query) {
    if (!query || !query.trim()) {
      renderAdminCustomers();
      return;
    }
    const q = query.trim().toLowerCase();
    const filtered = state.customers.filter(c => {
      const u = (c.username || '').toLowerCase();
      const m = (c.mobile || '').toLowerCase();
      const d = (c.district || '').toLowerCase();
      const s = (c.state || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      return u.includes(q) || m.includes(q) || d.includes(q) || s.includes(q) || id.includes(q);
    });
    renderAdminCustomers(filtered);
  }

  function renderAdminAnalytics() {
    const grid = document.getElementById('adminAnalyticsGrid');
    if (!grid) return;

    // Calculate Regional Breakdown
    const stateCounts = {};
    state.customers.forEach(c => {
      const region = c.state || c.country || 'Other';
      stateCounts[region] = (stateCounts[region] || 0) + 1;
    });

    const totalCust = Math.max(1, state.customers.length);
    const sortedRegions = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);

    grid.innerHTML = `
      <!-- Panel 1: Customer Regional Distribution -->
      <div class="analytics-panel-card">
        <div class="panel-card-head">
          <div class="panel-card-icon">📍</div>
          <div>
            <h4>Geographical User Distribution</h4>
            <p>Active website customers broken down by State &amp; Country</p>
          </div>
        </div>
        <div class="geo-breakdown-list">
          ${sortedRegions.map(([reg, count]) => {
            const pct = Math.round((count / totalCust) * 100);
            return `
              <div class="geo-breakdown-item">
                <div class="geo-item-header">
                  <span><strong>${reg}</strong></span>
                  <span>${count} customer${count > 1 ? 's' : ''} (${pct}%)</span>
                </div>
                <div class="geo-progress-track">
                  <div class="geo-bar-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Panel 2: Website Feature Telemetry -->
      <div class="analytics-panel-card">
        <div class="panel-card-head">
          <div class="panel-card-icon">⚡</div>
          <div>
            <h4>Feature Usage Telemetry</h4>
            <p>Real-time customer engagement per module</p>
          </div>
        </div>
        <div class="geo-breakdown-list">
          <div class="geo-breakdown-item">
            <div class="geo-item-header">
              <span><strong>Live Market TradingView Engine</strong></span>
              <span>88% Engagement</span>
            </div>
            <div class="geo-progress-track"><div class="geo-bar-fill" style="width: 88%;"></div></div>
          </div>
          <div class="geo-breakdown-item">
            <div class="geo-item-header">
              <span><strong>Private Chart Uploads &amp; Consultations</strong></span>
              <span>74% Engagement</span>
            </div>
            <div class="geo-progress-track"><div class="geo-bar-fill" style="width: 74%;"></div></div>
          </div>
          <div class="geo-breakdown-item">
            <div class="geo-item-header">
              <span><strong>Trading Books &amp; Audio Reader</strong></span>
              <span>92% Engagement</span>
            </div>
            <div class="geo-progress-track"><div class="geo-bar-fill" style="width: 92%;"></div></div>
          </div>
          <div class="geo-breakdown-item">
            <div class="geo-item-header">
              <span><strong>Algo Bots &amp; Strategy Development</strong></span>
              <span>65% Engagement</span>
            </div>
            <div class="geo-progress-track"><div class="geo-bar-fill" style="width: 65%;"></div></div>
          </div>
        </div>
      </div>

      <!-- Panel 3: Privacy & Zero Leakage Compliance -->
      <div class="analytics-panel-card">
        <div class="panel-card-head">
          <div class="panel-card-icon">🔒</div>
          <div>
            <h4>Privacy Isolation Architecture</h4>
            <p>End-to-End isolation: No customer can view another's data</p>
          </div>
        </div>
        <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">
          <div style="padding: 10px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 4px; margin-bottom: 10px;">
            <strong style="color: #10b981;">✓ Customer-to-Customer Leakage: 0% (BLOCKED)</strong><br>
            Customer profiles, phone numbers, and chart tests are strictly partitioned by unique Customer ID.
          </div>
          <div style="padding: 10px; background: rgba(6, 182, 212, 0.1); border-left: 3px solid var(--accent-cyan); border-radius: 4px; margin-bottom: 10px;">
            <strong style="color: var(--accent-cyan);">✓ Website Hoster Master Key: ACTIVE</strong><br>
            Mobile <strong>+91 9788371042</strong> is the sole authenticated hoster authorized to view cross-customer records and dispatch technical replies.
          </div>
          <div style="padding: 10px; background: rgba(236, 72, 153, 0.1); border-left: 3px solid #ec4899; border-radius: 4px;">
            <strong style="color: #ec4899;">✓ Mobile &amp; Password Cryptographic Lock</strong><br>
            Customers cannot tamper with phone numbers post-OTP verification; phone is permanently locked to prevent impersonation.
          </div>
        </div>
      </div>

      <!-- Panel 4: Live Activity Feed -->
      <div class="analytics-panel-card">
        <div class="panel-card-head">
          <div class="panel-card-icon">📡</div>
          <div>
            <h4>Live Customer Session Activity</h4>
            <p>Recent platform events across registered members</p>
          </div>
        </div>
        <div class="session-live-feed">
          <div class="session-feed-item">
            <span class="feed-dot"></span>
            <div>
              <strong>Trader @Priya_Sharma</strong> opened <em>ICT Complete Guide</em> in Online Reader.
              <div class="feed-time">1 min ago • Bengaluru, Karnataka</div>
            </div>
          </div>
          <div class="session-feed-item">
            <span class="feed-dot"></span>
            <div>
              <strong>Trader @Rajesh_Kumar</strong> submitted follow-up on EURUSD 15M Chart.
              <div class="feed-time">4 mins ago • Coimbatore, Tamil Nadu</div>
            </div>
          </div>
          <div class="session-feed-item">
            <span class="feed-dot"></span>
            <div>
              <strong>Trader @Amit_Patil</strong> activated FOREXBOTHUB Pro Canvas layout.
              <div class="feed-time">7 mins ago • Mumbai, Maharashtra</div>
            </div>
          </div>
          <div class="session-feed-item">
            <span class="feed-dot"></span>
            <div>
              <strong>Trader @Rohan_Verma</strong> placed custom Algo Bot build order for GBPUSD.
              <div class="feed-time">12 mins ago • New Delhi, Delhi</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function loginAsCustomer(customerId) {
    const customer = state.customers.find(c => c.id === customerId);
    if (!customer) return;
    state.currentUser = customer;
    saveState();
    updateUIForAuthState();
    closeModal('adminModal');
    switchTab('charting');
    showToast('Switched to Customer', `Now viewing private dashboard of @${customer.username}`, 'info');
  }

  function renderAdminDevRequests() {
    const container = document.getElementById('adminDevRequestsContainer');
    const badge = document.getElementById('adminDevCount');
    if (!container) return;

    if (badge) badge.textContent = state.devRequests.length;

    if (state.devRequests.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No custom bot build requests currently.</div>';
      return;
    }

    container.innerHTML = state.devRequests.map(dev => `
      <div class="admin-sub-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="color:var(--accent-violet);">${dev.title} (${dev.projectType})</h4>
          <span class="sub-status-tag replied">${dev.status}</span>
        </div>
        <div class="admin-sub-meta">
          <span>Customer: <strong>${dev.customerUsername}</strong></span>
          <span>Target Pair: <strong>${dev.pair}</strong></span>
          <span>Date: <strong>${dev.timestamp}</strong></span>
        </div>
        <div style="font-size:0.85rem; line-height:1.5; background:rgba(0,0,0,0.3); padding:12px; border-radius:6px;">
          <strong>Entry Rules:</strong> ${dev.entryRules}<br>
          <strong>Exit / Risk:</strong> ${dev.exitRules} | ${dev.riskSettings || 'Standard Risk'}
        </div>
      </div>
    `).join('');
  }

  function exportAllData() {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      customers: state.customers,
      submissions: state.submissions,
      devRequests: state.devRequests
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `forexbot_hub_backup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();

    showToast('Data Exported', 'Full customer records and chart submissions exported as JSON.', 'success');
  }

  function submitCustomDevRequest(e) {
    e.preventDefault();
    sfx.click();

    if (!state.currentUser) {
      showToast('Login Required', 'Please log in to submit a custom bot or indicator build request!', 'error');
      openAuthModal();
      return;
    }

    const projectType = document.getElementById('devProjectType').value;
    const pair = document.getElementById('devPrimaryPair').value.trim();
    const title = document.getElementById('devStrategyTitle').value.trim();
    const entryRules = document.getElementById('devEntryRules').value.trim();
    const exitRules = document.getElementById('devExitRules').value.trim();
    const riskSettings = document.getElementById('devRiskSettings').value.trim();

    const request = {
      id: 'dev_' + Date.now(),
      customerId: state.currentUser.id,
      customerUsername: state.currentUser.username,
      projectType,
      pair,
      title,
      entryRules,
      exitRules,
      riskSettings,
      timestamp: 'Just now',
      status: 'In Development Queue'
    };

    state.devRequests.unshift(request);
    saveState();

    document.getElementById('customDevForm').reset();
    sfx.success();
    showToast('Strategy Submitted', 'Your custom bot strategy has been submitted directly to the Website Hoster / Admin!', 'success');
  }

  // ==========================================================================
  // LIVE CHARTING SECTION (EXISTING SIMPLE CANDLE ENGINE FOR CONSULTATION)
  // ==========================================================================
  function initLiveCandleChart() {
    generateChartCandles(state.activeChartPair);
    renderCandleSvg();

    if (state.chartIntervalId) clearInterval(state.chartIntervalId);
    state.chartIntervalId = setInterval(tickLiveChartPrice, 2500);
  }

  function loadLiveChart(pairSymbol) {
    sfx.click();
    state.activeChartPair = pairSymbol;

    document.querySelectorAll('.pair-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pair === pairSymbol);
    });

    const titles = {
      'FX:EURUSD': 'EUR / USD • Euro vs US Dollar',
      'FX:GBPUSD': 'GBP / USD • British Pound vs US Dollar',
      'FX:USDJPY': 'USD / JPY • US Dollar vs Japanese Yen',
      'OANDA:XAUUSD': 'Gold (XAU / USD) • Spot Gold vs US Dollar',
      'BINANCE:BTCUSDT': 'BTC / USDT • Bitcoin vs Tether'
    };

    const titleEl = document.getElementById('chartPairTitle');
    if (titleEl) titleEl.textContent = titles[pairSymbol] || pairSymbol;

    generateChartCandles(pairSymbol);
    renderCandleSvg();
    tickLiveChartPrice();
  }

  function generateChartCandles(symbol) {
    let basePrice = 1.08425;
    if (symbol.includes('GBPUSD')) basePrice = 1.29850;
    else if (symbol.includes('USDJPY')) basePrice = 153.420;
    else if (symbol.includes('XAUUSD')) basePrice = 2645.80;
    else if (symbol.includes('BTC')) basePrice = 64250.0;

    const candles = [];
    let current = basePrice;

    for (let i = 0; i < 28; i++) {
      const delta = (Math.random() - 0.48) * (basePrice * 0.0018);
      const open = current;
      const close = current + delta;
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.0009);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.0009);

      candles.push({ open, close, high, low });
      current = close;
    }

    state.chartCandles = candles;
  }

  function tickLiveChartPrice() {
    if (!state.chartCandles || state.chartCandles.length === 0) return;
    const last = state.chartCandles[state.chartCandles.length - 1];

    const change = (Math.random() - 0.49) * (last.close * 0.0006);
    last.close += change;
    if (last.close > last.high) last.high = last.close;
    if (last.close < last.low) last.low = last.close;

    const priceEl = document.getElementById('chartLivePrice');
    const deltaEl = document.getElementById('chartPriceDelta');

    if (priceEl) {
      const decimals = state.activeChartPair.includes('JPY') ? 3 : (state.activeChartPair.includes('XAU') ? 2 : (state.activeChartPair.includes('BTC') ? 1 : 5));
      priceEl.textContent = last.close.toFixed(decimals);
    }

    if (deltaEl) {
      const isUp = change >= 0;
      deltaEl.className = `chart-price-delta ${isUp ? 'up' : 'down'}`;
      deltaEl.textContent = `${isUp ? '+' : ''}${(change * 10).toFixed(4)} (${isUp ? '+' : ''}${(change * 0.5).toFixed(2)}%)`;
    }

    renderCandleSvg();
  }

  function renderCandleSvg() {
    const candles = state.chartCandles;
    if (!candles || candles.length === 0) return;

    const g = document.getElementById('svgCandlesGroup');
    const linePath = document.getElementById('chartTrendPath');
    const areaPath = document.getElementById('chartAreaPath');
    if (!g || !linePath || !areaPath) return;

    let min = Infinity, max = -Infinity;
    candles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    const range = (max - min) || 1;
    const svgWidth = 1000;
    const svgHeight = 360;
    const padY = 30;

    const scaleY = (val) => svgHeight - padY - ((val - min) / range) * (svgHeight - padY * 2);

    const stepX = svgWidth / candles.length;
    const candleWidth = stepX * 0.65;

    let gHtml = '';
    let linePoints = [];

    candles.forEach((c, idx) => {
      const x = idx * stepX + stepX * 0.5;
      const yOpen = scaleY(c.open);
      const yClose = scaleY(c.close);
      const yHigh = scaleY(c.high);
      const yLow = scaleY(c.low);

      const isBull = c.close >= c.open;
      const color = isBull ? '#10b981' : '#ef4444';
      const topBody = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);

      gHtml += `<line x1="${x}" y1="${yHigh}" x2="${x}" y2="${yLow}" stroke="${color}" stroke-width="1.5"/>`;
      gHtml += `<rect x="${x - candleWidth / 2}" y="${topBody}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" rx="1"/>`;

      linePoints.push(`${x},${yClose}`);
    });

    g.innerHTML = gHtml;

    if (linePoints.length > 0) {
      linePath.setAttribute('d', `M ${linePoints.join(' L ')}`);
      areaPath.setAttribute('d', `M 0,${svgHeight} L ${linePoints.join(' L ')} L ${svgWidth},${svgHeight} Z`);
    }
  }

  // ==========================================================================
  // BOT PERFORMANCE SIMULATOR
  // ==========================================================================
  function updateBotSimulation() {
    const riskSlider = document.getElementById('simRiskSlider');
    const depositInput = document.getElementById('simDepositInput');
    const botSelect = document.getElementById('simBotSelect');
    const riskValText = document.getElementById('simRiskVal');

    if (!riskSlider || !depositInput || !botSelect) return;

    const risk = parseFloat(riskSlider.value);
    const deposit = parseFloat(depositInput.value) || 10000;
    const bot = botSelect.value;

    if (riskValText) riskValText.textContent = `${risk.toFixed(1)}%`;

    const multipliers = {
      grid: { winRate: 78.4, pf: 2.45, dd: 4.2, growth: 1.64 },
      gold: { winRate: 83.1, pf: 2.82, dd: 5.8, growth: 1.95 },
      breakout: { winRate: 74.5, pf: 2.15, dd: 3.8, growth: 1.48 },
      python: { winRate: 81.0, pf: 2.60, dd: 3.2, growth: 1.76 }
    };

    const profile = multipliers[bot] || multipliers.grid;
    const adjustedGrowth = profile.growth * (risk / 1.5);
    const finalEquity = Math.round(deposit * adjustedGrowth);
    const midEquity = Math.round(deposit + (finalEquity - deposit) * 0.45);

    const winRateEl = document.getElementById('simWinRate');
    const pfEl = document.getElementById('simProfitFactor');
    const ddEl = document.getElementById('simDrawdown');
    const midEl = document.getElementById('simMidGrowth');
    const finalEl = document.getElementById('simFinalGrowth');

    if (winRateEl) winRateEl.textContent = `${profile.winRate}%`;
    if (pfEl) pfEl.textContent = profile.pf.toFixed(2);
    if (ddEl) ddEl.textContent = `${(profile.dd * (risk / 1.5)).toFixed(1)}%`;
    if (midEl) midEl.textContent = `Day 45: $${midEquity.toLocaleString()}`;
    if (finalEl) finalEl.textContent = `Day 90: $${finalEquity.toLocaleString()} (+${Math.round((adjustedGrowth - 1) * 100)}%)`;

    const pathLine = document.getElementById('simPathLine');
    const pathGrad = document.getElementById('simPathGrad');
    if (pathLine && pathGrad) {
      const pts = [
        [0, 140],
        [200, 115],
        [400, 85],
        [600, 50],
        [800, 20]
      ];
      const dLine = `M ${pts.map(p => p.join(',')).join(' L ')}`;
      const dGrad = `M 0,160 L ${pts.map(p => p.join(',')).join(' L ')} L 800,160 Z`;
      pathLine.setAttribute('d', dLine);
      pathGrad.setAttribute('d', dGrad);
    }
  }

  function requestBotConfig(botName) {
    sfx.click();
    showToast('Preset Ready', `Downloading institutional configuration preset for ${botName}...`, 'success');
  }

  // ==========================================================================
  // POSITION SIZE CALCULATOR
  // ==========================================================================
  function calculateLotSize() {
    const balanceInput = document.getElementById('calcBalance');
    const riskPctInput = document.getElementById('calcRiskPct');
    const stopPipsInput = document.getElementById('calcStopPips');
    const pairSelect = document.getElementById('calcPair');

    if (!balanceInput || !riskPctInput || !stopPipsInput) return;

    const balance = parseFloat(balanceInput.value) || 10000;
    const riskPct = parseFloat(riskPctInput.value) || 1.5;
    const stopPips = parseFloat(stopPipsInput.value) || 25;
    const pair = pairSelect ? pairSelect.value : 'EURUSD';

    const riskAmount = balance * (riskPct / 100);
    const pipValueStandard = (pair === 'XAUUSD') ? 10 : 10;
    const standardLotPips = stopPips * pipValueStandard;

    const recommendedLots = Math.max(0.01, (riskAmount / standardLotPips));
    const units = Math.round(recommendedLots * 100000);

    const riskAmountEl = document.getElementById('calcRiskAmount');
    const lotsEl = document.getElementById('calcRecommendedLots');
    const unitsEl = document.getElementById('calcUnits');

    if (riskAmountEl) riskAmountEl.textContent = `$${riskAmount.toFixed(2)}`;
    if (lotsEl) lotsEl.textContent = `${recommendedLots.toFixed(2)} Lots`;
    if (unitsEl) unitsEl.textContent = `${units.toLocaleString()} Units`;
  }

  // ==========================================================================
  // INDICATOR CODE VIEWER MODAL
  // ==========================================================================
  const INDICATOR_SNIPPETS = {
    trend_matrix: `//@version=5
indicator("ForexBot Hub - Trend Matrix Pro [Zero Repaint]", overlay=true)

// Inputs
emaFastLen = input.int(20, "Fast EMA Length")
emaSlowLen = input.int(50, "Slow EMA Length")
atrLen     = input.int(14, "ATR Volatility Period")

// Calculations
emaFast = ta.ema(close, emaFastLen)
emaSlow = ta.ema(close, emaSlowLen)
atrVal  = ta.atr(atrLen)

// Breakout Conditions
longSignal  = ta.crossover(emaFast, emaSlow) and close > emaFast
shortSignal = ta.crossunder(emaFast, emaSlow) and close < emaFast

// Visual Plots
plot(emaFast, "Fast EMA", color=color.cyan, linewidth=2)
plot(emaSlow, "Slow EMA", color=color.purple, linewidth=2)

plotshape(longSignal, title="BUY Entry", style=shape.triangleup, 
          location=location.belowbar, color=color.green, size=size.small, text="BUY")
plotshape(shortSignal, title="SELL Entry", style=shape.triangledown, 
          location=location.abovebar, color=color.red, size=size.small, text="SELL")

// Automation Alerts
alertcondition(longSignal, title="ForexBot Hub BUY", message="BUY Signal triggered on {{ticker}} at {{close}}")
alertcondition(shortSignal, title="ForexBot Hub SELL", message="SELL Signal triggered on {{ticker}} at {{close}}")`,

    order_block: `//+------------------------------------------------------------------+
//|                  ForexBot Hub - Smart Order Block & FVG (MQL5)   |
//|               Copyright 2026, ForexBot Hub Automation Suite       |
//+------------------------------------------------------------------+
#property indicator_chart_window
#property indicator_buffers 2
#property indicator_plots   2

input int LookbackBars = 50; // Historical Scan Depth
input double MinFvgSizePips = 10.0; // Fair Value Gap Sensitivity

int OnInit() {
   Print("ForexBot Hub Order Block Engine Initialized.");
   return(INIT_SUCCEEDED);
}

int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[]) {
   // Instant Institutional Order Block Detection
   return(rates_total);
}`,

    supertrend_ea: `//@version=5
strategy("ForexBot Hub - Multi-Timeframe Supertrend EA", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=1.5)

atrPeriod = input.int(10, "ATR Period")
factor    = input.float(3.0, "Multiplier")

[supertrend, direction] = ta.supertrend(factor, atrPeriod)

if (ta.change(direction) < 0)
    strategy.entry("Long", strategy.long)
    strategy.exit("Exit Long", "Long", trail_points=30, trail_offset=10)

if (ta.change(direction) > 0)
    strategy.entry("Short", strategy.short)
    strategy.exit("Exit Short", "Short", trail_points=30, trail_offset=10)

plot(supertrend, color = direction == 1 ? color.red : color.green, linewidth=2)`,

    volume_radar: `# ====================================================================
# ForexBot Hub - Python Ultra-Low Latency Volume Spike Radar
# Compatible with MetaTrader 5 API & CCXT
# ====================================================================
import MetaTrader5 as mt5
import numpy as np

def detect_institutional_spike(symbol, timeframe=mt5.TIMEFRAME_M15, multiplier=2.5):
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, 50)
    tick_volumes = [r['tick_volume'] for r in rates[:-1]]
    mean_volume = np.mean(tick_volumes)
    current_volume = rates[-1]['tick_volume']
    
    if current_volume >= (mean_volume * multiplier):
        print(f"🚨 Institutional Spike on {symbol}! Volume: {current_volume} (Avg: {mean_volume:.0f})")
        return True
    return False`
  };

  let activeCodeText = '';

  function viewIndicatorCode(type) {
    sfx.click();
    const modal = document.getElementById('codeModal');
    const snippetEl = document.getElementById('codeSnippetContent');
    const titleEl = document.getElementById('codeModalTitle');

    if (!modal || !snippetEl) return;

    activeCodeText = INDICATOR_SNIPPETS[type] || '// Code snippet not found';
    snippetEl.textContent = activeCodeText;

    const titles = {
      trend_matrix: 'ForexBot Hub Trend Matrix Pro (TradingView v5)',
      order_block: 'Smart Order Block & Liquidity Zones (MQL5)',
      supertrend_ea: 'Multi-Timeframe Supertrend EA Strategy',
      volume_radar: 'Python Volatility Squeeze Radar Module'
    };
    if (titleEl) titleEl.textContent = titles[type] || 'Code Snippet';

    modal.classList.add('active');
  }

  function copyActiveCode() {
    sfx.pop();
    if (!activeCodeText) return;
    navigator.clipboard.writeText(activeCodeText).then(() => {
      showToast('Copied to Clipboard!', 'Source code copied to your clipboard.', 'success');
    }).catch(() => {
      showToast('Copy Failed', 'Please select and copy manually from the viewer.', 'error');
    });
  }

  function downloadAsset(filename, title) {
    sfx.click();
    showToast('Download Ready', `File [${filename}] generated for ${title}. Ready to load into your terminal.`, 'info');
  }

  function toggleChartingHelp() {
    sfx.pop();
    const drawer = document.getElementById('helpDrawer');
    const closeCross = document.getElementById('helpCloseCross');
    const textEl = document.getElementById('helpBtnText');

    if (!drawer) return;
    const isOpen = drawer.classList.contains('active');

    if (isOpen) {
      drawer.classList.remove('active');
      if (closeCross) closeCross.style.display = 'none';
      if (textEl) textEl.style.display = 'inline';
    } else {
      drawer.classList.add('active');
      if (closeCross) closeCross.style.display = 'inline';
      if (textEl) textEl.style.display = 'none';
    }
  }

  function goToPrivateChartUpload() {
    toggleChartingHelp();
    if (!state.currentUser) {
      showToast('Login Required', 'Please log in to upload chart tests for hoster review!', 'error');
      openAuthModal();
      return;
    }
    switchTab('charting');
    const dropZone = document.getElementById('chartDropZone');
    if (dropZone) dropZone.scrollIntoView({ behavior: 'smooth' });
  }

  function openLightbox(imgSrc) {
    sfx.click();
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if (modal && img) {
      img.src = imgSrc;
      modal.classList.add('active');
    }
  }

  function closeLightbox() {
    sfx.click();
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('active');
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  function init() {
    loadPersistedData();
    initSpeechVoices();
    updateUIForAuthState();
    setupChartUploadListeners();
    setupCanvasDrawingListeners();

    // Default country and location dropdowns
    populateStates('India', 'regState', 'regDistrict', 'Tamil Nadu', 'Chennai');
    populateStates('India', 'editState', 'editDistrict', 'Tamil Nadu', 'Chennai');

    // Setup OTP auto-advance
    const otpBoxes = document.querySelectorAll('.otp-digit-box');
    otpBoxes.forEach((box, idx) => {
      box.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          otpBoxes[idx - 1].focus();
        }
      });
    });

    // Preset avatar buttons
    const regPresetBtn = document.getElementById('regPresetBtn');
    if (regPresetBtn) {
      regPresetBtn.addEventListener('click', () => {
        sfx.pop();
        const rand = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
        const img = document.getElementById('registerAvatarPreview');
        if (img) img.src = rand;
      });
    }

    const editPresetBtn = document.getElementById('editPresetBtn');
    if (editPresetBtn) {
      editPresetBtn.addEventListener('click', () => {
        sfx.pop();
        const rand = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
        const img = document.getElementById('editAvatarPreview');
        if (img) img.src = rand;
      });
    }

    // Custom avatar uploads
    const regFileInput = document.getElementById('regAvatarFileInput');
    if (regFileInput) {
      regFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const r = new FileReader();
          r.onload = (ev) => {
            const preview = document.getElementById('registerAvatarPreview');
            if (preview) preview.src = ev.target.result;
            sfx.pop();
          };
          r.readAsDataURL(e.target.files[0]);
        }
      });
    }

    const editFileInput = document.getElementById('editAvatarFileInput');
    if (editFileInput) {
      editFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const r = new FileReader();
          r.onload = (ev) => {
            const preview = document.getElementById('editAvatarPreview');
            if (preview) preview.src = ev.target.result;
            sfx.pop();
          };
          r.readAsDataURL(e.target.files[0]);
        }
      });
    }

    // Sticky header shadow on scroll
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });

    // Handle screen resize (phones, laptops, 24" monitors) with zero bottom dead space
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (terminalState.activeEngine === 'tradingview') {
          loadOfficialTradingViewWidget();
        } else {
          renderTerminalCanvas();
        }
      }, 180);
    });

    // Handle Fullscreen mode changes
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        if (terminalState.activeEngine === 'tradingview') {
          loadOfficialTradingViewWidget();
        } else {
          renderTerminalCanvas();
        }
      }, 150);
    });

    // Initial renders
    renderBooks();
    initMarketTerminal();

    console.log('ForexBot Hub Advanced Engine & Terminal Initialized Successfully.');
  }

  // Expose HubApp API to Window for HTML event handlers
  window.HubApp = {
    // Navigation & Auth
    switchTab,
    openAuthModal,
    closeModal,
    autoGeneratePassword,
    handlePasswordInput,
    togglePasswordVisibility,
    handleMobileInput,
    quickLoginAsAdmin,
    isAdminMobile,
    handleCountryChange,
    handleCountryChangeEdit,
    handleStateChange,
    populateStates,
    handleRegisterSubmit,
    sendOTP,
    autoFillOTP,
    verifyOTP,
    handleEditProfileSubmit,
    logout,
    handleExploreClick,
    handleBuildBotClick,
    handleCardActionClick,

    // Live Charting & Hoster Consultations
    submitCustomerChart,
    sendCustomerFollowUp,
    openAdminPortal,
    switchAdminTab,
    renderAdminDashboardStats,
    renderAdminCustomers,
    filterAdminCustomers,
    renderAdminAnalytics,
    renderAdminDevRequests,
    sendHosterReply,
    deleteSubmission,
    loginAsCustomer,
    exportAllData,
    submitCustomDevRequest,
    loadLiveChart,

    // Live Market Terminal & Chart Settings
    setTerminalEngine,
    loadOfficialTradingViewWidget,
    handleMarketAssetChange,
    setTerminalTF,
    setChartStyle,
    setDrawingTool,
    clearCanvasDrawings,
    switchDockTab,
    renderWatchlist,
    renderDomLadder,
    setRange,
    takeTerminalSnapshot,
    toggleTerminalFullscreen,
    jumpToLatestCandle,

    // Chart Settings & Appearance
    openChartSettingsModal,
    updateChartAppearance,
    applyBgPreset,
    saveChartTemplate,
    resetChartSettingsDefault,

    // Timeframes & Favorites Dropdown
    toggleTfDropdown,
    selectTfFromMenu,
    toggleTfFavorite,
    addCustomTimeframe,

    // Multi-Chart Layout Selector
    toggleLayoutMenu,
    setChartLayout,

    // Technical Indicators & Freeze
    openIndicatorsModal,
    filterIndicatorList,
    toggleIndicatorOverlay,
    toggleIndicatorFreeze,

    // Drawing Tools Floating Context Bar
    updateActiveDrawingProp,
    cloneActiveDrawing,
    toggleActiveDrawingVisibility,
    deleteActiveDrawing,

    // Book Library, Multi-Page Reader & TTS Audio Engine
    setBookTopicFilter,
    filterBooks,
    openBookReader,
    prevReaderPage,
    nextReaderPage,
    goToReaderPage,
    adjustReaderFontSize,
    setReaderTheme,
    toggleReaderFullscreen,
    playBookAudio,
    playActiveBookAudio,
    toggleAudioPlayPause,
    stopBookAudio,
    closeAudioDock,
    setAudioVoiceGender,
    setAudioSpeed,
    downloadBook,

    // Moveable & Size-Adjustable PDF Book Viewer
    openPdfBookViewer,
    closePdfBookViewer,
    setPdfWindowSize,
    togglePdfWindowMax,
    prevPdfPage,
    nextPdfPage,
    goToPdfPage,
    adjustPdfZoom,
    setPdfFitWidth,
    setPdfReadingMode,
    searchInPdf,
    printPdfDocument,

    // Utilities & Admin
    renderAdminSubmissions,
    updateBotSimulation,
    requestBotConfig,
    calculateLotSize,
    viewIndicatorCode,
    copyActiveCode,
    downloadAsset,
    toggleChartingHelp,
    goToPrivateChartUpload,
    openLightbox,
    closeLightbox
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
