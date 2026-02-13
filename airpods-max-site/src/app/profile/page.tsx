"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ReAuthModal from "@/components/ReAuthModal";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>({});
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    // Edit states
    const [editMode, setEditMode] = useState<"profile" | "address" | null>(null);
    const [tempProfile, setTempProfile] = useState<any>({});
    const [tempAddress, setTempAddress] = useState<any>({});
    const [isReAuthOpen, setIsReAuthOpen] = useState(false);
    const [reAuthAction, setReAuthAction] = useState<"saveProfile" | "saveAddress" | "deleteAddress" | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch Profile
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setProfile(profileData || {});
            setTempProfile(profileData || {});

            // Fetch Addresses
            const { data: addressData } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            setAddresses(addressData || []);

            setIsLoading(false);
        };
        fetchData();
    }, [router]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempProfile({ ...tempProfile, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempAddress({ ...tempAddress, [e.target.name]: e.target.value });
    };

    const requestSaveProfile = () => {
        setReAuthAction("saveProfile");
        setIsReAuthOpen(true);
    };

    const requestSaveAddress = (address: any = null) => {
        if (addresses.length >= 10 && !address?.id) {
            setError("Maximum 10 addresses allowed.");
            return;
        }
        setTempAddress(address || { is_default: false }); // validation reset
        setEditMode("address");
    };

    const confirmSaveAddress = () => {
        // Validations
        if (!tempAddress.address_line1 || !tempAddress.city || !tempAddress.zip_code) {
            setError("Please fill required address fields.");
            return;
        }
        setReAuthAction("saveAddress");
        setIsReAuthOpen(true);
    };

    const requestDeleteAddress = (addressId: string) => {
        setTempAddress({ id: addressId });
        setReAuthAction("deleteAddress");
        setIsReAuthOpen(true);
    }

    const handleReAuthSuccess = async () => {
        setIsSaving(true);
        setError("");
        try {
            if (reAuthAction === "saveProfile") {
                const { error } = await supabase.from('profiles').upsert({
                    id: user.id,
                    full_name: tempProfile.full_name,
                    updated_at: new Date().toISOString(),
                });
                if (error) throw error;
                setProfile(tempProfile);
                setEditMode(null);
                setSuccessMessage("Profile updated successfully.");
            } else if (reAuthAction === "saveAddress") {
                const newAddress = {
                    ...tempAddress,
                    user_id: user.id,
                };
                // Remove separate id if new
                if (!newAddress.id) delete newAddress.id;

                const { error } = await supabase.from('addresses').upsert(newAddress);
                if (error) throw error;

                // Refresh
                const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                setAddresses(data || []);
                setEditMode(null);
                setSuccessMessage("Address saved successfully.");

            } else if (reAuthAction === "deleteAddress") {
                const { error } = await supabase.from('addresses').delete().eq('id', tempAddress.id);
                if (error) throw error;
                // Refresh
                const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                setAddresses(data || []);
                setSuccessMessage("Address deleted.");
            }
        } catch (err: any) {
            setError(err.message || "Operation failed.");
        } finally {
            setIsSaving(false);
            setReAuthAction(null);
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                    <span className="text-neutral-500 text-sm">{user?.email}</span>
                </div>

                {/* Messages */}
                {successMessage && <div className="bg-green-500/10 text-green-400 p-4 rounded-xl border border-green-500/20">{successMessage}</div>}
                {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">{error}</div>}

                {/* Profile Details */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Profile Information</h2>
                        {!editMode && <button onClick={() => setEditMode("profile")} className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>}
                    </div>

                    {editMode === "profile" ? (
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
                            <div>
                                <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
                                <input name="full_name" value={tempProfile.full_name || ""} onChange={handleProfileChange} className="w-full bg-black border border-white/10 rounded-lg p-3 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button onClick={requestSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition-colors">Save Changes</button>
                                <button onClick={() => { setEditMode(null); setTempProfile(profile); }} className="text-neutral-400 hover:text-white px-4 py-2">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-xs text-neutral-500">Full Name</span>
                                    <span className="text-lg">{profile.full_name || "Not Set"}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-neutral-500">Email</span>
                                    <span className="text-lg">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Addresses */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Saved Addresses ({addresses.length}/10)</h2>
                        <button onClick={() => requestSaveAddress(null)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add New
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="bg-neutral-900/50 p-5 rounded-2xl border border-white/10 relative group hover:border-white/30 transition-colors">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => requestSaveAddress(addr)} className="p-2 bg-white/10 rounded-full hover:bg-blue-500/20 hover:text-blue-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                    <button onClick={() => requestDeleteAddress(addr.id)} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                                <h3 className="font-medium text-white mb-1">{addr.full_name || profile.full_name}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    {addr.address_line1}<br />
                                    {addr.address_line2 && <>{addr.address_line2}<br /></>}
                                    {addr.city}, {addr.state} {addr.zip_code}<br />
                                    {addr.country}
                                </p>
                                {addr.is_default && <span className="inline-block mt-3 text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70">Default</span>}
                            </div>
                        ))}
                    </div>

                    {/* Address Edit Modal / Form overlay */}
                    {editMode === "address" && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-6">{tempAddress.id ? "Edit Address" : "New Address"}</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-xs text-neutral-400">Recipient Name</label>
                                            <input name="full_name" value={tempAddress.full_name || ""} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" placeholder={profile.full_name} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-neutral-400">Address Line 1</label>
                                            <input name="address_line1" value={tempAddress.address_line1 || ""} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" required />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-neutral-400">Address Line 2 (Optional)</label>
                                            <input name="address_line2" value={tempAddress.address_line2 || ""} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400">City</label>
                                            <input name="city" value={tempAddress.city || ""} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" required />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400">State</label>
                                            <input name="state" value={tempAddress.state || ""} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" required />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400">Zip Code</label>
                                            <input name="zip_code" value={tempAddress.zip_code || ""} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" required />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400">Country</label>
                                            <input name="country" value={tempAddress.country || "USA"} onChange={handleAddressChange} className="w-full bg-black border border-white/10 rounded-lg p-3" required />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4 border-t border-white/10">
                                        <button onClick={confirmSaveAddress} className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold">Save Address</button>
                                        <button onClick={() => setEditMode(null)} className="px-6 py-3 text-neutral-400 hover:text-white">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <ReAuthModal
                isOpen={isReAuthOpen}
                onClose={() => setIsReAuthOpen(false)}
                email={user?.email}
                onSuccess={handleReAuthSuccess}
            />
        </div>
    );
}
