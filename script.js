const i18n = {
    'th': { title: "แผนที่ราคาหม่าล่าทั่ง", subtitle: "รอบ ม.ศิลปากร", price: "ราคา", date: "อัปเดต", baht: "บาท/ขีด", listTitle: "สรุปราคาทุกร้าน (เรียงจากถูกไปแพง)", soup: "ค่าน้ำซุป", sauce: "ค่าน้ำจิ้ม", soupTypes: "น้ำซุปที่มี", free: "ฟรี", bahtUnit: "บาท", hours: "เวลาเปิด-ปิด" },
    'en': { title: "Mala Tang Price Map", subtitle: "around SU", price: "Price", date: "Update", baht: "THB/100g", listTitle: "All Shops (Sorted by Price)", soup: "Soup Fee", sauce: "Sauce Fee", soupTypes: "Available Soups", free: "FREE", bahtUnit: "THB", hours: "Opening Hours" },
    'zh': { title: "麻辣烫价格地图", subtitle: "艺术大学周边", price: "价格", date: "更新", baht: "泰铢/100克", listTitle: "所有店铺 (按价格排序)", soup: "汤底费", sauce: "蘸料费", soupTypes: "可选汤底", free: "免费", bahtUnit: "泰铢", hours: "营业时间" }
};

let currentLang = 'th';
let map;
let markers = {};
let malaData = [];
let infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 13.814, lng: 100.045 },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true
    });

    infoWindow = new google.maps.InfoWindow();

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            malaData = data;
            renderMapAndList();
        })
        .catch(error => console.error("Error loading JSON:", error));
}

window.initMap = initMap;

function formatPrice(price, lang) {
    if (price === 0) {
        return `<span class="badge-free">${i18n[lang].free}</span>`;
    }
    return `${price} ${i18n[lang].bahtUnit}`;
}

function renderMapAndList() {
    Object.values(markers).forEach(marker => marker.setMap(null));
    markers = {};

    const listContainer = document.getElementById('shop-list-container');
    listContainer.innerHTML = '';

    const sortedData = [...malaData].sort((a, b) => a.price - b.price);

    sortedData.forEach((shop, index) => {
        const marker = new google.maps.Marker({
            position: { lat: shop.lat, lng: shop.lng },
            map: map,
            title: shop.name[currentLang]
        });

        markers[shop.id] = marker;

        marker.addListener("click", () => {
            focusShop(shop.id);
        });

        const item = document.createElement('div');
        item.className = 'shop-item';
        item.id = `shop-card-${shop.id}`;

        item.onclick = () => focusShop(shop.id);

        item.innerHTML = `
            <div class="shop-header">
                <div class="shop-name">${index + 1}. ${shop.name[currentLang]}</div>
                <div class="shop-price">${shop.price} ${i18n[currentLang].baht}</div>
            </div>
            <div class="shop-details" id="shop-details-${shop.id}">
                <p><strong>⏰ ${i18n[currentLang].hours}:</strong> ${shop.hours[currentLang]}</p>
                <p><strong>⭐ ${i18n[currentLang].soup}:</strong> ${formatPrice(shop.soupPrice, currentLang)}</p>
                <p><strong>⭐ ${i18n[currentLang].sauce}:</strong> ${formatPrice(shop.saucePrice, currentLang)}</p>
                <p><strong>⭐ ${i18n[currentLang].soupTypes}:</strong> ${shop.soups[currentLang]}</p>
                <p style="color: #b2bec3; font-size: 10px; margin-top: 10px;">${i18n[currentLang].date}: ${shop.date}</p>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function openInfoWindow(shop, marker) {
    const content = `
        <div class="info-window">
            <b style="font-size: 15px; color: #ff4b2b;">${shop.name[currentLang]}</b><br>
            ${i18n[currentLang].price}: <b>${shop.price}</b> ${i18n[currentLang].baht}<br>
            <span style="font-size: 11px; color: #636e72;">⏰ ${i18n[currentLang].hours}: ${shop.hours[currentLang]}</span><br>
            <span style="font-size: 11px; color: #b2bec3;">${i18n[currentLang].soup}: ${formatPrice(shop.soupPrice, currentLang)} | ${i18n[currentLang].sauce}: ${formatPrice(shop.saucePrice, currentLang)}</span>
        </div>
    `;
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
}

function focusShop(shopId) {
    document.querySelectorAll('.shop-details').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.shop-item').forEach(el => el.classList.remove('active-shop'));

    const targetDetails = document.getElementById(`shop-details-${shopId}`);
    const targetCard = document.getElementById(`shop-card-${shopId}`);

    if (targetDetails && targetCard) {
        targetDetails.style.display = 'block';
        targetCard.classList.add('active-shop');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const shop = malaData.find(s => s.id === shopId);
    const marker = markers[shopId];

    if (shop && marker) {
        map.panTo({ lat: shop.lat, lng: shop.lng });
        map.setZoom(18);
        openInfoWindow(shop, marker);
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    document.getElementById('title').innerText = i18n[lang].title;
    document.getElementById('subtitle').innerText = i18n[lang].subtitle;
    document.getElementById('list-title').innerText = i18n[lang].listTitle;

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    infoWindow.close();
    renderMapAndList();

}
