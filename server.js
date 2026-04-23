import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Mock Database
const users = [];
const products = [
    { 
        id: '1', 
        name: 'Prismatic Evolution Binder Collection', 
        price: 89.99, 
        image: '/img/product/binder-collection.png', 
        category: 'Koleksiyon Setleri', 
        rarity: 'Nadir', 
        description: 'Pokémon Prismatic Evolution serisi için özel binder koleksiyonu. Premium deri kaplı, hologramlı tasarım ve 360 kartlık kapasite ile koleksiyonunuzu koruyun.',
        set: 'Prismatic Evolution',
        condition: 'Yeni (New)',
        language: 'İngilizce'
    },
    { 
        id: '2', 
        name: 'Blooming Waters Elite Trainer Box', 
        price: 49.99, 
        image: '/img/product/blooming-waters.png', 
        category: 'Elite Trainer Boxlar', 
        rarity: 'Normal', 
        description: 'Blooming Waters setinden resmi Elite Trainer Box. İçerisinde 8 booster paket, özel playmat, kart sınavı ve 45 enerji kartı yer alır.',
        set: 'Blooming Waters',
        condition: 'Mühürlü (Sealed)',
        language: 'İngilizce'
    },
    { 
        id: '3', 
        name: 'Booster Bundle Collection', 
        price: 129.99, 
        image: '/img/product/booster-bundle.png', 
        category: 'Booster Paketleri', 
        rarity: 'Nadir', 
        description: 'Karışık setlerden 24 booster paket koleksiyonu. Modern ve klassik setlerin ideal kombinasyonu ile çeşitli kartlara ulaşın.',
        set: 'Multiple Sets',
        condition: 'Mühürlü (Sealed)',
        language: 'İngilizce'
    },
    { 
        id: '4', 
        name: 'Premium Elite Trainer Box', 
        price: 59.99, 
        image: '/img/product/etbs.png', 
        category: 'Elite Trainer Boxlar', 
        rarity: 'Normal', 
        description: 'En yeni setinden baskı Elite Trainer Box. Profesyonel koruma ve depolama için tasarlanmış premium kalite kutulama.',
        set: 'Current Set',
        condition: 'Mühürlü (Sealed)',
        language: 'İngilizce'
    },
    { 
        id: '5', 
        name: 'Five Pack Tins Collection', 
        price: 99.99, 
        image: '/img/product/five-pack-tins.png', 
        category: 'Booster Paketleri', 
        rarity: 'Nadir', 
        description: 'Metal kutulara paketlenmiş 5 booster paket kombinasyonu. Koleksiyonluk kutular ve her biri 5 premium booster içerir.',
        set: 'Assorted',
        condition: 'Mühürlü (Sealed)',
        language: 'İngilizce'
    },
    { 
        id: '6', 
        name: 'Pokémon Poster Collection', 
        price: 34.99, 
        image: '/img/product/poster-collection.png', 
        category: 'Koleksiyon Setleri', 
        rarity: 'Normal', 
        description: 'Limited edition poster seti 5 adet gloss finish posterle birlikte. Klasik Pokémon sanatı ve yeni tasarımların kombinasyonu.',
        set: 'Poster Collection',
        condition: 'Yeni (New)',
        language: 'İngilizce'
    },
    { 
        id: '7', 
        name: 'Premium UPC Collection Box', 
        price: 199.99, 
        image: '/img/product/upc.png', 
        category: 'Elite Trainer Boxlar', 
        rarity: 'Efsanevi', 
        description: 'Sınırlı sayıda üretilen Ultra Premium Collection. 10 booster paket, premium mat ve eksklusif promo kartlar içerir.',
        set: 'UPC Series',
        condition: 'Mühürlü (Sealed)',
        language: 'İngilizce'
    },
    { 
        id: '8', 
        name: 'Zapdos Collection Box', 
        price: 79.99, 
        image: '/img/product/zaptos.png', 
        category: 'Koleksiyon Setleri', 
        rarity: 'Nadir', 
        description: 'Zapdos özelinde hazırlanmış koleksiyon kutusu. Hologramlı promo kartı, 4 booster paket ve eksklusif aksesuarlar içerir.',
        set: 'Zapdos Collection',
        condition: 'Mühürlü (Sealed)',
        language: 'İngilizce'
    }
];
const orders = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'tcg-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Dev mode
}));

// Routes - Auth
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Bu e-posta zaten kayıtlı.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
    users.push(newUser);
    req.session.userId = newUser.id;
    res.json({ success: true, message: 'Kayıt başarılı.' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        return res.json({ success: true, message: 'Giriş başarılı.', user: { name: user.name, email: user.email } });
    }
    res.status(401).json({ success: false, message: 'Hatalı e-posta veya şifre.' });
});

app.get('/api/me', (req, res) => {
    const user = users.find(u => u.id === req.session.userId);
    if (user) {
        res.json({ loggedIn: true, user: { name: user.name, email: user.email } });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Routes - Products
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Ürün bulunamadı' });
});

// Routes - Sales
app.post('/api/checkout', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Lütfen giriş yapın.' });
    const { cart, address, payment } = req.body;
    const order = {
        id: 'ORD-' + Date.now(),
        userId: req.session.userId,
        items: cart,
        total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        status: 'Alındı',
        date: new Date()
    };
    orders.push(order);
    res.json({ success: true, message: 'Sipariş başarıyla oluşturuldu.', orderId: order.id });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova Cards Backend running on http://localhost:${PORT}`);
});
