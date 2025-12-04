// src/components/archive/ArchiveView.jsx
import React from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import useCollection from "../../hooks/useCollection";
import { listenToCollectionOrdered } from "../../firebase/firestore";

export default function ArchiveView({ theme, user }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colName = `${user}_tasks`;
  const { data: archived } = useCollection(() => listenToCollectionOrdered(profileId, colName), [profileId, user]);

  const completed = Array.isArray(archived) ? archived.filter(d => d.completed) : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {completed.map(t => (
        <div key={t.id} className="bg-gray-100 p-4 rounded-lg flex items-center gap-3 opacity-60">
          <CheckCircle className="text-green-600" size={18} />
          <span className="line-through">{t.text}</span>
        </div>
      ))}
      {completed.length === 0 && <p className="text-center col-span-full py-10 opacity-50">الأرشيف فارغ</p>}
    </div>
  );
}