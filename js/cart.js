/* ============================================================
   cart.js  —  Shared cart engine (localStorage)
   Used by: shop.html | product-detail.html | cart-page.html
   ============================================================ */

var Cart = (function () {
    var KEY = 'stella_cart';

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; }
        catch (e) { return []; }
    }

    function save(cart) {
        localStorage.setItem(KEY, JSON.stringify(cart));
    }

    function addItem(product) {
        /* product: { productId, name, unitPrice, image } */
        var cart = load();
        var existing = cart.find(function (i) { return i.productId === product.productId; });
        if (existing) {
            existing.quantity += (product.qty || 1);   /* YES → increment */
        } else {
            cart.push({                                /* NO  → push new  */
                productId : product.productId,
                name      : product.name,
                unitPrice : product.unitPrice,
                image     : product.image,
                quantity  : product.qty || 1
            });
        }
        save(cart);
        return cart;
    }

    function increaseQty(productId) {
        var cart = load();
        var item = cart.find(function (i) { return i.productId === productId; });
        if (item) { item.quantity += 1; }
        save(cart);
        return cart;
    }

    function decreaseQty(productId) {
        var cart = load();
        var item = cart.find(function (i) { return i.productId === productId; });
        if (!item) return cart;
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart = cart.filter(function (i) { return i.productId !== productId; });
        }
        save(cart);
        return cart;
    }

    function removeItem(productId) {
        var cart = load().filter(function (i) { return i.productId !== productId; });
        save(cart);
        return cart;
    }

    function clearCart() {
        save([]);
        return [];
    }

    function calcTotals(cart) {
        var grandTotal = cart.reduce(function (s, i) { return s + i.unitPrice * i.quantity; }, 0);
        var totalItems = cart.reduce(function (s, i) { return s + i.quantity; }, 0);
        var shipping   = (grandTotal > 0 && grandTotal < 100) ? 9.99 : 0;
        return { grandTotal: grandTotal, totalItems: totalItems, shipping: shipping, finalTotal: grandTotal + shipping };
    }

    return { load: load, save: save, addItem: addItem, increaseQty: increaseQty, decreaseQty: decreaseQty, removeItem: removeItem, clearCart: clearCart, calcTotals: calcTotals };
}());
