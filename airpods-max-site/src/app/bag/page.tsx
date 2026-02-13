"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    name: string;
    value: string;
    price: number;
    image_url: string;
    filter_style: string;
}

interface Accessory {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    is_applecare: boolean;
}

interface Coupon {
    code: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    min_order_amount: number;
}

function BagContent() {
    const searchParams = useSearchParams();
    const colorName = searchParams.get("color") || "Space Gray";

    // State for data from Supabase
    const [selectedColor, setSelectedColor] = useState<Product | null>(null);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [addedAccessories, setAddedAccessories] = useState<string[]>([]);
    const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "processing" | "success">("idle");
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
    const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [checkoutStep, setCheckoutStep] = useState<"bag" | "details">("bag");
    const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", address: "", city: "", state: "", zip: "", phone: ""
    });

    const { width, height } = useWindowSize();

    // Fetch Initial Data
    useEffect(() => {
        async function fetchData() {
            setIsLoadingData(true);
            try {
                // Fetch current color product
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('name', colorName)
                    .single();

                if (productData) {
                    setSelectedColor(productData);
                } else {
                    // Fallback if not found (or default query)
                    const { data: defaultProduct } = await supabase
                        .from('products')
                        .select('*')
                        .eq('name', 'Space Gray')
                        .single();
                    setSelectedColor(defaultProduct);
                }

                // Fetch accessories
                const { data: accessoriesData, error: accError } = await supabase
                    .from('accessories')
                    .select('*')
                    .order('price', { ascending: true }); // Example order

                if (accessoriesData) {
                    setAccessories(accessoriesData);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoadingData(false);
            }
        }

        fetchData();
    }, [colorName]);

    const toggleAccessory = (id: string) => {
        if (addedAccessories.includes(id)) {
            setAddedAccessories(prev => prev.filter(item => item !== id));
        } else {
            setAddedAccessories(prev => [...prev, id]);
        }
    };

    const accessoriesTotal = addedAccessories.reduce((total, id) => {
        const item = accessories.find(a => a.id === id);
        return total + (item ? item.price : 0);
    }, 0);

    const basePrice = selectedColor ? selectedColor.price : 549.00;
    const subtotal = (basePrice * quantity) + accessoriesTotal;
    const finalTotal = subtotal - (appliedDiscount?.amount || 0);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponMessage(null); // Reset

        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (data) {
                // Check expiry
                if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
                    setAppliedDiscount(null);
                    setCouponMessage({ type: "error", text: "This coupon has expired." });
                    return;
                }
                // Check min order amount
                if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
                    setAppliedDiscount(null);
                    setCouponMessage({ type: "error", text: `Minimum order of $${data.min_order_amount} required.` });
                    return;
                }
                // Check max uses
                if (data.max_uses && data.usage_count >= data.max_uses) {
                    setAppliedDiscount(null);
                    setCouponMessage({ type: "error", text: "This coupon has reached its usage limit." });
                    return;
                }

                let discountAmount = 0;
                if (data.discount_type === 'percent') {
                    discountAmount = subtotal * (data.discount_value / 100);
                    setCouponMessage({ type: "success", text: `${data.discount_value}% discount applied!` });
                } else {
                    discountAmount = Number(data.discount_value);
                    setCouponMessage({ type: "success", text: `$${data.discount_value} discount applied!` });
                }
                setAppliedDiscount({ code: data.code, amount: discountAmount });
            } else {
                setAppliedDiscount(null);
                setCouponMessage({ type: "error", text: "Invalid or expired coupon code." });
            }
        } catch (err) {
            setAppliedDiscount(null);
            setCouponMessage({ type: "error", text: "Error checking coupon." });
        }
    };

    const handleCheckout = () => {
        setCheckoutStep("details");
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutStatus("processing");

        const shippingName = `${formData.firstName} ${formData.lastName}`.trim();

        try {
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Create the order (order_number is auto-generated by DB trigger)
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    shipping_name: shippingName,
                    shipping_address: formData.address,
                    shipping_city: formData.city,
                    shipping_state: formData.state,
                    shipping_zip: formData.zip,
                    shipping_country: 'USA',
                    shipping_phone: formData.phone || null,
                    subtotal: subtotal,
                    discount_amount: appliedDiscount?.amount || 0,
                    shipping_cost: 0,
                    total: finalTotal,
                    coupon_code: appliedDiscount?.code || null,
                    status: 'Processing',
                    payment_method: 'card',
                    payment_status: 'paid'
                })
                .select('id, order_number')
                .single();

            if (orderError) throw orderError;

            // 2. Create order items
            const orderItems: any[] = [];

            // Add the main product
            if (selectedColor) {
                orderItems.push({
                    order_id: orderData.id,
                    item_type: 'product',
                    product_id: selectedColor.id,
                    item_name: `AirPods Max - ${selectedColor.name}`,
                    item_price: selectedColor.price,
                    quantity: quantity,
                    line_total: selectedColor.price * quantity,
                    color_name: selectedColor.name
                });
            }

            // Add accessories
            for (const accId of addedAccessories) {
                const acc = accessories.find(a => a.id === accId);
                if (acc) {
                    orderItems.push({
                        order_id: orderData.id,
                        item_type: 'accessory',
                        accessory_id: acc.id,
                        item_name: acc.name,
                        item_price: acc.price,
                        quantity: 1,
                        line_total: acc.price
                    });
                }
            }

            if (orderItems.length > 0) {
                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems);
                if (itemsError) throw itemsError;
            }

            // 3. Increment coupon usage if one was applied
            if (appliedDiscount?.code) {
                try {
                    const { data: couponData } = await supabase
                        .from('coupons')
                        .select('usage_count')
                        .eq('code', appliedDiscount.code)
                        .single();
                    if (couponData) {
                        await supabase
                            .from('coupons')
                            .update({ usage_count: (couponData.usage_count || 0) + 1 })
                            .eq('code', appliedDiscount.code);
                    }
                } catch {
                    console.warn('Could not increment coupon usage');
                }
            }

            // Store the real order number for the success modal
            setConfirmedOrderNumber(orderData.order_number);

            // Success with UX delay
            setTimeout(() => {
                setCheckoutStatus("success");
            }, 1000);

        } catch (err) {
            console.error("Order placement failed:", err);
            setCheckoutStatus("idle");
            alert("Failed to place order. Please try again.");
        }
    };

    if (isLoadingData || !selectedColor) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-white/40 text-sm">Loading your bag...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 relative">
            {checkoutStatus === "success" && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

            {/* Success Modal */}
            <AnimatePresence>
                {checkoutStatus === "success" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="text-3xl font-semibold text-white">Order Confirmed</h2>
                            <p className="text-white/60">
                                Thank you for your purchase. Your premium audio experience is on its way.
                            </p>
                            <div className="bg-white/5 rounded-xl p-4 text-sm text-white/80">
                                <p className="font-mono tracking-wider">Order {confirmedOrderNumber || 'Confirmed'}</p>
                                <p className="mt-1">Total: ${finalTotal.toFixed(2)}</p>
                            </div>
                            <Link href="/" className="block w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                                Return to Home
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Text */}
            <div className="border-b border-white/10 pb-12 mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                    {checkoutStep === "bag" ? "Review your bag." : "Checkout Details."}
                </h1>
                <p className="text-white/60 text-lg font-light">
                    {checkoutStep === "bag" ? "Free delivery and free returns." : "Enter your shipping and payment information."}
                </p>
            </div>

            {checkoutStep === "details" ? (
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handlePlaceOrder} className="space-y-8">
                        {/* Shipping Info */}
                        <div className="bg-neutral-900/30 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-xl font-semibold mb-6">Shipping Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Last Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm text-white/60">Street Address</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="123 Main St, Apt 4B"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">City</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">State</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.state}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="CA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">ZIP Code</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.zip}
                                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Info - Simulated */}
                        <div className="bg-neutral-900/30 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-xl font-semibold mb-6">Payment</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/60">Card Number</label>
                                    <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">Expiry Date</label>
                                        <input required type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60">CVC</label>
                                        <input required type="text" placeholder="123" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary in Checkout */}
                        <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8">
                            <div className="flex justify-between items-center text-lg font-medium mb-4">
                                <span>Total to Pay</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={checkoutStatus !== "idle"}
                                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(34,197,94,0.4)] relative overflow-hidden"
                            >
                                {checkoutStatus === "processing" ? (
                                    <span className="flex items-center gap-2 justify-center">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing Payment...
                                    </span>
                                ) : "Place Order"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setCheckoutStep("bag")}
                                className="w-full mt-4 text-white/40 hover:text-white text-sm transition-colors"
                            >
                                Back to Bag
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">

                        {/* Product Image */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-neutral-900/30 rounded-3xl flex items-center justify-center p-8 border border-white/5 overflow-hidden">
                            <div
                                className="absolute inset-0 bg-white/5 rounded-3xl blur-3xl opacity-20"
                                style={{ backgroundColor: selectedColor.value }}
                            />
                            <div className="relative w-full h-full">
                                <Image
                                    src={selectedColor.image_url}
                                    alt={`AirPods Max - ${selectedColor.name}`}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    style={{ filter: selectedColor.filter_style }}
                                />
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="flex justify-between items-start border-b border-white/10 pb-8">
                                <div>
                                    <h2 className="text-3xl font-semibold mb-2">AirPods Max</h2>
                                    <p className="text-white/60 text-lg">{selectedColor.name}</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span>In Stock</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-2xl font-medium">${(549.00 * quantity).toFixed(2)}</p>

                                    {/* Quantity Selector */}
                                    <div className="mt-4 relative">
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="appearance-none bg-neutral-900 border border-white/10 text-white rounded-lg pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-white/50 cursor-pointer"
                                            aria-label="Quantity"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nu => (
                                                <option key={nu} value={nu}>{nu}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/60">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Meta info */}
                            <div className="space-y-4 text-sm text-white/50 font-light">

                                {/* Coupon Section */}
                                <div className="pb-6 border-b border-white/10 mb-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCouponCode(val);
                                                if (val === "") {
                                                    setAppliedDiscount(null);
                                                    setCouponMessage(null);
                                                }
                                            }}
                                            placeholder="Add a promo code"
                                            className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white w-full focus:outline-none focus:border-blue-500 uppercase placeholder:normal-case placeholder:text-white/20"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                                            disabled={!couponCode}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponMessage && (
                                        <p className={cn("text-xs mt-2 pl-1", couponMessage.type === "success" ? "text-green-400" : "text-red-400")}>
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>

                                {/* Added Accessories List */}
                                <AnimatePresence>
                                    {addedAccessories.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-b border-white/10 pb-4 mb-4 space-y-3 overflow-hidden"
                                        >
                                            {addedAccessories.map(id => {
                                                const item = accessories.find(a => a.id === id);
                                                if (!item) return null;
                                                return (
                                                    <div key={id} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/90">{item.name}</span>
                                                            <button
                                                                onClick={() => toggleAccessory(id)}
                                                                className="text-red-400 hover:text-red-300 text-xs transition-colors px-2 py-0.5 rounded hover:bg-white/5"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        <span className="text-white/70">${item.price.toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>

                                {appliedDiscount && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount ({appliedDiscount.code})</span>
                                        <span>-${appliedDiscount.amount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-white">FREE</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xl font-medium text-white">
                                    <span>Total</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 flex flex-col md:flex-row gap-4 items-center">
                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutStatus !== "idle"}
                                    className="w-full md:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(37,99,235,0.4)] relative overflow-hidden"
                                >
                                    {checkoutStatus === "processing" ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Processing...
                                        </span>
                                    ) : "Check Out"}
                                </button>
                                <Link href="/buy" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recommended accessories section */}
                    <div className="border-t border-white/10 pt-16">
                        <h3 className="text-2xl font-semibold mb-8">You might also like</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {accessories.map((item) => {
                                const isAdded = addedAccessories.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "bg-neutral-900/20 border rounded-3xl p-6 flex flex-col h-full group transition-all duration-300",
                                            isAdded ? "border-blue-500/30 bg-blue-500/5 shadow-[0_0_30px_rgba(37,99,235,0.1)]" : "border-white/5 hover:bg-neutral-900/40"
                                        )}
                                    >
                                        <div className="h-40 w-full bg-white/5 rounded-2xl mb-6 flex items-center justify-center p-6 relative overflow-hidden">
                                            {item.is_applecare ? (
                                                <div className="flex flex-col items-center gap-2 text-white/90">
                                                    <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.05 19.32c-.5.16-1.12.3-1.63.3-1.08 0-2.31-.61-3.66-.61-1.34 0-2.45.61-3.63.61-.92 0-1.61-.16-2-.27-.37-.09-4.88-1.92-4.88-7.39 0-4.94 3.73-7.53 4.88-7.53 1.25 0 2.22.61 3.25 1.53.94-.84 2.14-1.53 3.61-1.53 2.89 0 4.88 2.06 4.88 2.06-.06.03-2.86 1.69-2.86 4.97 0 3.78 3.14 5.25 3.19 5.28-.03.08-.47 1.61-1.55 3.08-.97 1.34-1.98 2.67-3.63 2.67M12.92 3.1c.47-.56.81-1.28.81-1.97 0-.08 0-.17-.03-.25-.75.03-1.67.5-2.22 1.14-.5.53-.94 1.39-.94 2.25 0 .08.03.17.03.17.84.08 1.84-.75 2.36-1.33" />
                                                    </svg>
                                                    <span className="font-semibold tracking-tight text-lg">AppleCare+</span>
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src={item.image_url!}
                                                        alt={item.name}
                                                        fill
                                                        className="object-contain drop-shadow-xl"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-medium text-white/90 line-clamp-2 min-h-[3rem] text-sm">{item.name}</h4>
                                                <p className="text-white/60 text-sm mt-1">${item.price.toFixed(2)}</p>
                                            </div>

                                            <button
                                                onClick={() => toggleAccessory(item.id)}
                                                className={cn(
                                                    "mt-6 w-full py-2.5 rounded-full font-medium text-sm transition-all duration-300 border",
                                                    isAdded
                                                        ? "bg-transparent border-white/20 text-white/60 hover:bg-white/10 hover:text-white"
                                                        : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                                )}
                                            >
                                                {isAdded ? "Remove" : "Add"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

export default function BagPage() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-apple-blue selection:text-white pt-24">
            <NavBar />
            <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-white/30">Loading bag...</div>}>
                <BagContent />
            </Suspense>
            <Footer />
        </main>
    );
}
