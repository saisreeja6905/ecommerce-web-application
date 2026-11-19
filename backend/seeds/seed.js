const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Payment = require('../models/Payment');

const categoriesData = [
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics',
    description: 'Cutting-edge smartphones, computing devices, smart displays, and tech accessories.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Audio & Acoustics',
    slug: 'audio',
    description: 'Premium noise-cancelling headphones, wireless earbuds, and studio monitors.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Contemporary streetwear, minimal essentials, outerwear, and footwear.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Ergonomic furnishings, intelligent kitchen gear, lighting, and modern decor.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Sports & Fitness',
    slug: 'fitness',
    description: 'Athletic wear, smart fitness trackers, yoga essentials, and recovery gear.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    name: 'Watches & Accessories',
    slug: 'accessories',
    description: 'Luxury chronographs, minimalist timepieces, leather wallets, and sunglasses.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database successfully.');

    // Clear existing data
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      Cart.deleteMany(),
      Wishlist.deleteMany(),
      Payment.deleteMany(),
    ]);

    if (process.argv[2] === '-d') {
      console.log('[Seed] Database successfully cleared.');
      process.exit(0);
    }

    console.log('[Seed] Inserting sample categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((cat) => {
      catMap[cat.slug] = cat._id;
    });

    console.log('[Seed] Creating sample users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: {
        street: '100 Innovation Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    });

    const customerUser1 = await User.create({
      name: 'Alex Morgan',
      email: 'customer@ecommerce.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1 (555) 432-8910',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'US',
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    });

    const customerUser2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@ecommerce.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 987-6543',
      address: {
        street: '456 West Broadway',
        city: 'New York',
        state: 'NY',
        postalCode: '10012',
        country: 'US',
      },
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    });

    console.log('[Seed] Inserting 24 products...');
    const productsData = [
      // 1-4: Electronics
      {
        name: 'UltraBook Pro 16" M3 Max',
        slug: 'ultrabook-pro-16-m3-max',
        description: 'Engineered for high performance workflows with a 16.2-inch Liquid Retina XDR display, up to 128GB unified memory, and up to 22 hours of battery life.',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'ApexTech',
        price: 2499.99,
        comparePrice: 2699.99,
        category: catMap['electronics'],
        stockCount: 15,
        rating: 4.9,
        numReviews: 28,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Processor', value: '16-core CPU / 40-core GPU' },
          { key: 'RAM', value: '36GB Unified Memory' },
          { key: 'Storage', value: '1TB Superfast NVMe SSD' },
          { key: 'Display', value: '16.2-inch Mini-LED 120Hz ProMotion' },
        ],
        tags: ['laptop', 'macbook', 'workstation', 'ultrabook', 'tech'],
        sku: 'AT-UBP-16-MAX',
      },
      {
        name: 'Quantum Horizon 4K Gaming Monitor 32"',
        slug: 'quantum-horizon-4k-gaming-monitor-32',
        description: 'Ultra-fast 240Hz refresh rate with OLED panel, 0.03ms response time, HDMI 2.1 support, and HDR1000 certified color gamut.',
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'HorizonVision',
        price: 899.99,
        comparePrice: 1099.99,
        category: catMap['electronics'],
        stockCount: 8,
        rating: 4.8,
        numReviews: 19,
        isFeatured: true,
        isTrending: false,
        specifications: [
          { key: 'Screen Size', value: '32 Inches' },
          { key: 'Resolution', value: '3840 x 2160 (4K UHD)' },
          { key: 'Refresh Rate', value: '240Hz' },
          { key: 'Response Time', value: '0.03ms GtG' },
        ],
        tags: ['monitor', 'gaming', '4k', 'oled', 'displays'],
        sku: 'HV-MON-32-4K',
      },
      {
        name: 'NexusPad 11" OLED Tablet 256GB',
        slug: 'nexuspad-11-oled-tablet-256gb',
        description: 'Vibrant OLED display with precision pen support, magnetic keyboard connection, quad-speaker Dolby Atmos, and all-day battery life.',
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'ApexTech',
        price: 649.99,
        comparePrice: 749.99,
        category: catMap['electronics'],
        stockCount: 22,
        rating: 4.7,
        numReviews: 14,
        isFeatured: false,
        isTrending: true,
        specifications: [
          { key: 'Display', value: '11.0-inch 120Hz OLED' },
          { key: 'Storage', value: '256GB NVMe' },
          { key: 'Battery', value: '8800 mAh' },
          { key: 'Weight', value: '470g' },
        ],
        tags: ['tablet', 'oled', 'nexuspad', 'mobile'],
        sku: 'AT-NPAD-11-256',
      },
      {
        name: 'StreamCam 4K Studio Webcam',
        slug: 'streamcam-4k-studio-webcam',
        description: 'Broadcast in crisp 4K at 60FPS with AI autofocus, dual noise-reducing stereo microphones, and customized lighting compensation.',
        images: [
          'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'ClearVision',
        price: 159.99,
        comparePrice: 199.99,
        category: catMap['electronics'],
        stockCount: 35,
        rating: 4.6,
        numReviews: 42,
        isFeatured: false,
        isTrending: false,
        specifications: [
          { key: 'Resolution', value: '4K @ 60 FPS' },
          { key: 'FOV', value: '90-degree wide angle' },
          { key: 'Connection', value: 'USB-C 3.1' },
        ],
        tags: ['webcam', 'streaming', 'camera', 'creator'],
        sku: 'CV-SCAM-4K-01',
      },

      // 5-8: Audio & Acoustics
      {
        name: 'AuraStudio Wireless ANC Headphones',
        slug: 'aurastudio-wireless-anc-headphones',
        description: 'Industry-leading adaptive active noise cancellation with spatial audio head-tracking, luxurious memory foam ear cushions, and 40-hour playback.',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'AcoustiQ',
        price: 349.99,
        comparePrice: 399.99,
        category: catMap['audio'],
        stockCount: 20,
        rating: 4.9,
        numReviews: 68,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Noise Cancellation', value: 'Hybrid ANC with 8 Microphones' },
          { key: 'Battery Life', value: 'Up to 40 Hours' },
          { key: 'Bluetooth', value: '5.3 with LDAC, AAC' },
          { key: 'Drivers', value: '40mm Titanium Dynamic Drivers' },
        ],
        tags: ['audio', 'headphones', 'anc', 'wireless', 'bluetooth'],
        sku: 'AQ-AS-ANC-01',
      },
      {
        name: 'EchoPods Pro True Wireless Earbuds',
        slug: 'echopods-pro-true-wireless-earbuds',
        description: 'Compact wireless earbuds with active transparency mode, wireless charging Qi-case, IPX7 sweatproof design, and 30-hour total playtime.',
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'AcoustiQ',
        price: 179.99,
        comparePrice: 219.99,
        category: catMap['audio'],
        stockCount: 45,
        rating: 4.7,
        numReviews: 53,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Driver Size', value: '11mm Graphene' },
          { key: 'Water Resistance', value: 'IPX7 certified' },
          { key: 'Case Charging', value: 'Qi Wireless & USB-C' },
        ],
        tags: ['earbuds', 'wireless', 'audio', 'workout', 'echopods'],
        sku: 'AQ-EPOD-PRO',
      },
      {
        name: 'VibeSound 360 Portable Bluetooth Speaker',
        slug: 'vibesound-360-portable-bluetooth-speaker',
        description: 'Rugged waterproof speaker with 360-degree room-filling acoustic profile, deep bass radiator, and built-in power bank for your mobile phone.',
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'VibeSound',
        price: 119.99,
        comparePrice: 149.99,
        category: catMap['audio'],
        stockCount: 30,
        rating: 4.5,
        numReviews: 24,
        isFeatured: false,
        isTrending: false,
        specifications: [
          { key: 'Battery', value: '24 Hours Playback' },
          { key: 'Waterproof', value: 'IP67 Float-Ready' },
          { key: 'Power Output', value: '45W Peak Stereo' },
        ],
        tags: ['speaker', 'bluetooth', 'waterproof', 'outdoor', 'audio'],
        sku: 'VS-360-SPK-01',
      },
      {
        name: 'StudioMaster USB Cardioid Condenser Mic',
        slug: 'studiomaster-usb-cardioid-condenser-mic',
        description: 'Professional grade 24-bit/192kHz audio recording microphone with zero-latency headphone monitoring and integrated shock mount.',
        images: [
          'https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'SoundCraft',
        price: 139.99,
        comparePrice: 169.99,
        category: catMap['audio'],
        stockCount: 18,
        rating: 4.8,
        numReviews: 31,
        isFeatured: false,
        isTrending: true,
        specifications: [
          { key: 'Polar Pattern', value: 'Cardioid' },
          { key: 'Sample Rate', value: '192kHz / 24-bit' },
          { key: 'Mount', value: 'Heavy Die-cast Desk Stand' },
        ],
        tags: ['microphone', 'podcast', 'streaming', 'audio', 'studio'],
        sku: 'SC-SM-MIC-USB',
      },

      // 9-12: Fashion & Apparel
      {
        name: 'Merino Wool Minimalist Crewneck Sweater',
        slug: 'merino-wool-minimalist-crewneck-sweater',
        description: 'Spun from 100% extra-fine Australian Merino wool. Breathable, naturally temperature-regulating, and tailored with modern raglan shoulders.',
        images: [
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'Aethelwear',
        price: 98.0,
        comparePrice: 130.0,
        category: catMap['fashion'],
        stockCount: 25,
        rating: 4.8,
        numReviews: 29,
        isFeatured: true,
        isTrending: false,
        specifications: [
          { key: 'Material', value: '100% Extra-fine Merino Wool' },
          { key: 'Fit', value: 'Modern Regular Fit' },
          { key: 'Care', value: 'Hand Wash or Dry Clean' },
        ],
        tags: ['fashion', 'sweater', 'wool', 'knitwear', 'minimal'],
        sku: 'AW-MWC-SWTR-01',
      },
      {
        name: 'Technical Waterproof Trench Coat',
        slug: 'technical-waterproof-trench-coat',
        description: 'Engineered three-layer membrane that offers total windproof protection and waterproof shielding without sacrificing urban elegance.',
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'Aethelwear',
        price: 245.0,
        comparePrice: 295.0,
        category: catMap['fashion'],
        stockCount: 14,
        rating: 4.7,
        numReviews: 18,
        isFeatured: false,
        isTrending: true,
        specifications: [
          { key: 'Waterproof Rating', value: '20,000 mm' },
          { key: 'Breathability', value: '15,000 g/m²/24h' },
          { key: 'Zippers', value: 'YKK Aquaguard' },
        ],
        tags: ['outerwear', 'jacket', 'trench', 'fashion', 'waterproof'],
        sku: 'AW-TECH-TRNCH',
      },
      {
        name: 'Heritage Raw Selvedge Denim Jeans',
        slug: 'heritage-raw-selvedge-denim-jeans',
        description: '14.5 oz Japanese red-line selvedge denim woven on vintage shuttle looms. Molds perfectly to your body shape over time with distinctive fades.',
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'KurokiDenim',
        price: 185.0,
        comparePrice: 220.0,
        category: catMap['fashion'],
        stockCount: 19,
        rating: 4.9,
        numReviews: 34,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Weight', value: '14.5 oz Indigo Selvedge' },
          { key: 'Origin', value: 'Okayama, Japan' },
          { key: 'Cut', value: 'Slim Tapered' },
        ],
        tags: ['denim', 'jeans', 'selvedge', 'fashion', 'menswear'],
        sku: 'KD-RAW-SLV-01',
      },
      {
        name: 'Everyday Organic Cotton Heavyweight Tee (3-Pack)',
        slug: 'everyday-organic-cotton-heavyweight-tee-3-pack',
        description: 'Three premium 240 GSM organic combed cotton t-shirts in classic black, heather grey, and crisp white. Retains shape after repeated washes.',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'Aethelwear',
        price: 68.0,
        comparePrice: 85.0,
        category: catMap['fashion'],
        stockCount: 50,
        rating: 4.6,
        numReviews: 61,
        isFeatured: false,
        isTrending: false,
        specifications: [
          { key: 'Fabric', value: '100% GOTS Organic Cotton' },
          { key: 'Weight', value: '240 GSM Heavyweight' },
          { key: 'Includes', value: 'Black, White, Heather Grey' },
        ],
        tags: ['tshirt', 'cotton', 'basics', 'apparel'],
        sku: 'AW-TEE-3PK-01',
      },

      // 13-16: Home & Living
      {
        name: 'Precision Barista Espresso Machine',
        slug: 'precision-barista-espresso-machine',
        description: 'Commercial 58mm stainless portafilter, PID thermal temperature stability, micro-foam steam wand, and built-in conical burr grinder.',
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1589396575653-c09c794ff6a6?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'CafféArtisan',
        price: 699.99,
        comparePrice: 799.99,
        category: catMap['home-living'],
        stockCount: 10,
        rating: 4.9,
        numReviews: 45,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Pump Pressure', value: '15 Bar Italian Pump' },
          { key: 'Grinder', value: 'Integrated Stainless Conical Burr' },
          { key: 'Water Reservoir', value: '2.5 Liters' },
        ],
        tags: ['coffee', 'espresso', 'kitchen', 'home', 'barista'],
        sku: 'CA-PBE-699-01',
      },
      {
        name: 'Ergonomic Mesh Task Executive Chair',
        slug: 'ergonomic-mesh-task-executive-chair',
        description: 'Dynamic lumbar support system, 4D adjustable armrests, breathable dual-layer mesh back, and synchro-tilt mechanism with lock.',
        images: [
          'https://images.unsplash.com/photo-1580481077195-731da89f3044?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'ErgoForm',
        price: 429.0,
        comparePrice: 529.0,
        category: catMap['home-living'],
        stockCount: 12,
        rating: 4.8,
        numReviews: 36,
        isFeatured: true,
        isTrending: false,
        specifications: [
          { key: 'Weight Capacity', value: '330 lbs' },
          { key: 'Armrests', value: '4D Multi-directional' },
          { key: 'Warranty', value: '10-Year Framework Warranty' },
        ],
        tags: ['office', 'chair', 'ergonomic', 'workspace', 'home'],
        sku: 'EF-ERGO-CHR-01',
      },
      {
        name: 'AromaPulse Smart Ultrasonic Humidifier',
        slug: 'aromapulse-smart-ultrasonic-humidifier',
        description: 'Whisper-quiet cold mist humidifier with smartphone app scheduling, integrated essential oil tray, and automatic ambient humidity sensor.',
        images: [
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'PureBreeze',
        price: 79.99,
        comparePrice: 99.99,
        category: catMap['home-living'],
        stockCount: 26,
        rating: 4.5,
        numReviews: 22,
        isFeatured: false,
        isTrending: false,
        specifications: [
          { key: 'Tank Capacity', value: '4.5 Liters' },
          { key: 'Runtime', value: 'Up to 36 Hours' },
          { key: 'Noise Level', value: '< 22 dB' },
        ],
        tags: ['humidifier', 'home', 'wellness', 'air'],
        sku: 'PB-AP-HUM-01',
      },
      {
        name: 'Artisan Cast Iron Dutch Oven 6-Quart',
        slug: 'artisan-cast-iron-dutch-oven-6-quart',
        description: 'Enameled heavy-duty cast iron for superior heat distribution and retention. Perfect for slow roasts, sourdough baking, and hearty stews.',
        images: [
          'https://images.unsplash.com/photo-1584990347449-39908126786c?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'LeCuisine',
        price: 135.0,
        comparePrice: 170.0,
        category: catMap['home-living'],
        stockCount: 16,
        rating: 4.9,
        numReviews: 50,
        isFeatured: false,
        isTrending: true,
        specifications: [
          { key: 'Capacity', value: '6 Quarts (5.7 L)' },
          { key: 'Oven Safe', value: 'Up to 500°F (260°C)' },
          { key: 'Coating', value: 'Triple-layer Vitreous Enamel' },
        ],
        tags: ['cookware', 'kitchen', 'dutchoven', 'castiron'],
        sku: 'LC-DO-6QT-RED',
      },

      // 17-20: Sports & Fitness
      {
        name: 'ApexStride Carbon Road Running Shoes',
        slug: 'apexstride-carbon-road-running-shoes',
        description: 'Full-length curved carbon fiber propulsion plate with responsive supercritical nitrogen foam midsole for explosive marathon speeds.',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'ApexAthletics',
        price: 219.99,
        comparePrice: 249.99,
        category: catMap['fitness'],
        stockCount: 20,
        rating: 4.8,
        numReviews: 41,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Weight', value: '198g (Men’s 9)' },
          { key: 'Drop', value: '8mm' },
          { key: 'Plate', value: 'Full Carbon Fiber' },
        ],
        tags: ['running', 'shoes', 'fitness', 'marathon', 'sneakers'],
        sku: 'AA-AS-RSHOE-01',
      },
      {
        name: 'PulseFlow Smart Deep-Tissue Percussion Gun',
        slug: 'pulseflow-smart-deep-tissue-percussion-gun',
        description: 'Quiet brushless motor providing up to 3200 percussions per minute with 6 interchangeable therapeutic heads and companion coaching app.',
        images: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'TheraPulse',
        price: 149.99,
        comparePrice: 199.99,
        category: catMap['fitness'],
        stockCount: 22,
        rating: 4.7,
        numReviews: 28,
        isFeatured: false,
        isTrending: true,
        specifications: [
          { key: 'Speeds', value: '5 Intensity Levels' },
          { key: 'Stall Force', value: '45 lbs' },
          { key: 'Battery', value: '6 Hours Lithium-ion' },
        ],
        tags: ['recovery', 'massage', 'fitness', 'sports'],
        sku: 'TP-PF-MGUN-01',
      },
      {
        name: 'EcoGrip Natural Rubber Pro Yoga Mat',
        slug: 'ecogrip-natural-rubber-pro-yoga-mat',
        description: '5mm dense cushioning crafted from sustainably tapped tree rubber with laser-etched alignment guides for superior stability during practice.',
        images: [
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'PranaLive',
        price: 88.0,
        comparePrice: 110.0,
        category: catMap['fitness'],
        stockCount: 30,
        rating: 4.9,
        numReviews: 39,
        isFeatured: false,
        isTrending: false,
        specifications: [
          { key: 'Thickness', value: '5mm High Density' },
          { key: 'Dimensions', value: '72" x 26"' },
          { key: 'Material', value: '100% Natural Tree Rubber' },
        ],
        tags: ['yoga', 'mat', 'fitness', 'wellness', 'exercise'],
        sku: 'PL-EGY-MAT-01',
      },
      {
        name: 'Adjustable Quick-Select Dumbbell Pair (5-52.5 lbs)',
        slug: 'adjustable-quick-select-dumbbell-pair',
        description: 'Replace 15 sets of weights with a single dial turn system. Smooth selector mechanism with durable thermoplastic coated steel plates.',
        images: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'IronForge',
        price: 369.0,
        comparePrice: 449.0,
        category: catMap['fitness'],
        stockCount: 8,
        rating: 4.8,
        numReviews: 57,
        isFeatured: true,
        isTrending: false,
        specifications: [
          { key: 'Weight Range', value: '5 to 52.5 lbs per dumbbell' },
          { key: 'Adjustments', value: '15 Weight Settings' },
          { key: 'Tray', value: 'Includes Storage Docks' },
        ],
        tags: ['dumbbells', 'weights', 'homegym', 'fitness', 'strength'],
        sku: 'IF-ADJ-DB-52',
      },

      // 21-24: Watches & Accessories
      {
        name: 'Chronos Automatic Sapphire Dive Watch',
        slug: 'chronos-automatic-sapphire-dive-watch',
        description: '300-meter water resistance, ceramic rotating bezel, scratch-resistant sapphire crystal with anti-reflective coating, and Swiss automatic movement.',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'HeliosHorology',
        price: 549.0,
        comparePrice: 650.0,
        category: catMap['accessories'],
        stockCount: 11,
        rating: 4.9,
        numReviews: 33,
        isFeatured: true,
        isTrending: true,
        specifications: [
          { key: 'Movement', value: 'Swiss 26-Jewel Automatic' },
          { key: 'Case Diameter', value: '41mm 316L Stainless Steel' },
          { key: 'Water Resistance', value: '300m / 30 ATM' },
          { key: 'Bezel', value: '120-Click Unidirectional Ceramic' },
        ],
        tags: ['watch', 'dive', 'luxury', 'horology', 'accessories'],
        sku: 'HH-CAD-WTC-01',
      },
      {
        name: 'Handcrafted Full-Grain Leather Bi-Fold Wallet',
        slug: 'handcrafted-full-grain-leather-bi-fold-wallet',
        description: 'Vegetable-tanned Italian leather with RFID protective lining, 8 card slots, dual cash compartments, and hand-stitched waxed thread edges.',
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'TuscanCraft',
        price: 65.0,
        comparePrice: 85.0,
        category: catMap['accessories'],
        stockCount: 40,
        rating: 4.7,
        numReviews: 27,
        isFeatured: false,
        isTrending: false,
        specifications: [
          { key: 'Leather', value: 'Tuscan Full-grain Vegetable Tanned' },
          { key: 'RFID Protection', value: 'Built-in Faraday Shield' },
          { key: 'Capacity', value: '8-12 Cards + Full Cash' },
        ],
        tags: ['wallet', 'leather', 'accessories', 'everydaycarry'],
        sku: 'TC-FGL-WLT-01',
      },
      {
        name: 'Aviator Titanium Polarized Sunglasses',
        slug: 'aviator-titanium-polarized-sunglasses',
        description: 'Ultra-lightweight aerospace titanium frames with scratch-resistant polarized nylon lenses delivering 100% UVA/UVB protection.',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'HeliosHorology',
        price: 165.0,
        comparePrice: 210.0,
        category: catMap['accessories'],
        stockCount: 24,
        rating: 4.8,
        numReviews: 20,
        isFeatured: false,
        isTrending: true,
        specifications: [
          { key: 'Frame', value: 'Aerospace Grade Beta Titanium' },
          { key: 'Lens', value: 'Polarized Nylon with Anti-reflective coating' },
          { key: 'Weight', value: 'Only 18 grams' },
        ],
        tags: ['sunglasses', 'titanium', 'polarized', 'eyewear'],
        sku: 'HH-AVT-SUNG-01',
      },
      {
        name: 'Commuter Ballistic Nylon Laptop Backpack 25L',
        slug: 'commuter-ballistic-nylon-laptop-backpack-25l',
        description: 'Weatherproof 1680D ballistic Cordura fabric with padded 16-inch laptop pocket, hidden passport pouch, magnetic Fidlock buckle, and luggage pass-through.',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        ],
        brand: 'Aethelwear',
        price: 145.0,
        comparePrice: 175.0,
        category: catMap['accessories'],
        stockCount: 28,
        rating: 4.9,
        numReviews: 47,
        isFeatured: true,
        isTrending: false,
        specifications: [
          { key: 'Volume', value: '25 Liters' },
          { key: 'Laptop Compartment', value: 'Fits up to 16.5-inch Laptops' },
          { key: 'Material', value: '1680D Ballistic Cordura' },
        ],
        tags: ['backpack', 'travel', 'accessories', 'commuter', 'bag'],
        sku: 'AW-BNL-BP-25L',
      },
    ];

    const createdProducts = await Product.insertMany(productsData);

    console.log('[Seed] Adding sample reviews...');
    await Review.create([
      {
        product: createdProducts[0]._id,
        user: customerUser1._id,
        rating: 5,
        title: 'Incredible performance and battery',
        comment: 'Handles 4K video rendering and heavy software development without breaking a sweat. The display is mind-blowing.',
        verifiedPurchase: true,
      },
      {
        product: createdProducts[0]._id,
        user: customerUser2._id,
        rating: 5,
        title: 'Best machine I have ever owned',
        comment: 'Worth every single penny. Build quality is unrivaled and battery easily lasts all day long.',
        verifiedPurchase: true,
      },
      {
        product: createdProducts[4]._id,
        user: customerUser1._id,
        rating: 5,
        title: 'Silence on airplanes is golden',
        comment: 'The noise cancellation completely blocks airplane rumble and office background noise. Super comfortable.',
        verifiedPurchase: true,
      },
    ]);

    console.log('[Seed] Adding sample orders...');
    await Order.create({
      user: customerUser1._id,
      orderNumber: 'ORD-20261119-1001',
      items: [
        {
          product: createdProducts[4]._id,
          name: createdProducts[4].name,
          image: createdProducts[4].images[0],
          price: createdProducts[4].price,
          quantity: 1,
        },
        {
          product: createdProducts[10]._id,
          name: createdProducts[10].name,
          image: createdProducts[10].images[0],
          price: createdProducts[10].price,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Alex Morgan',
        phone: '+1 (555) 432-8910',
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        postalCode: '97477',
        country: 'US',
      },
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      isPaid: true,
      paidAt: new Date(),
      itemsPrice: 534.99,
      taxPrice: 42.8,
      shippingPrice: 0,
      totalPrice: 577.79,
      status: 'Processing',
      statusHistory: [
        {
          status: 'Pending',
          changedAt: new Date(Date.now() - 3600000 * 2),
          note: 'Order placed by customer',
        },
        {
          status: 'Processing',
          changedAt: new Date(Date.now() - 3600000 * 1),
          note: 'Payment verified via stripe',
        },
      ],
    });

    console.log('[Seed] Database successfully seeded with 6 categories, 24 products, sample users & orders!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
