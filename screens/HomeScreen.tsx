import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { MessageCircle, Crown, ShieldCheck, MapPin } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

export default function HomeScreen() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔐 buscar utilizador logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // 📦 buscar anúncios (SEM reload)
  useEffect(() => {
    const loadAds = async () => {
      const { data, error } = await supabase
        .from("ads")
        .select(`
          id,
          title,
          description,
          price,
          is_featured,
          created_at,
          user_id,
          profiles (
            name,
            avatar_url,
            phone
          )
        `)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) setAds(data as Ad[]);
    };

    loadAds();
  }, []);

  const handleWhatsApp = (phone: string | null) => {
    if (!phone) return;
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {ads.map((ad) => {
        const isOwner = ad.user_id === userId;

        return (
          <div
            key={ad.id}
            className={`rounded-xl border bg-white p-4 shadow-sm relative ${
              ad.is_featured ? "border-yellow-400" : ""
            }`}
          >
            {/* ⭐ Destaque */}
            {ad.is_featured && (
              <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
                <Crown size={14} /> Destaque
              </span>
            )}

            {/* 🛡️ Seu anúncio */}
            {isOwner && (
              <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-600 px-2 py-1 text-xs font-bold text-white">
                <ShieldCheck size={14} /> Seu anúncio
              </span>
            )}

            {/* 👤 Perfil */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={
                  ad.profiles?.avatar_url ??
                  "https://ui-avatars.com/api/?name=User"
                }
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">
                  {ad.profiles?.name ?? "Utilizador"}
                </p>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> Moçambique
                </span>
              </div>
            </div>

            {/* 📢 Conteúdo */}
            <h3 className="font-bold text-lg">{ad.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {ad.description}
            </p>

            <p className="mt-2 text-lg font-bold text-green-600">
              {ad.price} MZN
            </p>

            {/* 💬 WhatsApp */}
            <button
              onClick={() => handleWhatsApp(ad.profiles?.phone ?? null)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-2 text-white hover:bg-green-600"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
          </div>
        );
      })}
    </div>
  );
}
