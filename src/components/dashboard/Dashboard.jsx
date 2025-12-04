// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import useCollection from "../../hooks/useCollection";
import { listenToCollectionOrdered } from "../../firebase/firestore";

export default function Dashboard({ theme, user }) {
  const { getProfileId } = useAuth();
  const profileId = getProfileId();
  const colName = `${user}_tasks`;
  const { data: tasks } = useCollection(() => listenToCollectionOrdered(profileId, colName), [profileId, user]);
  const [count, setCount] = useState({ done: 0, todo: 0 });

  useEffect(() => {
    if (!tasks) return;
    let d = 0, t = 0;
    tasks.forEach(doc => doc.completed ? d++ : t++);
    setCount({ done: d, todo: t });
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`${theme.card} p-8 ${theme.radius} border ${theme.border} md:col-span-3 shadow-sm`}>
        <h3 className="font-bold text-xl mb-2">رسالة اليوم 💡</h3>
        <p className="text-lg opacity-80">"{user==='M' ? 'أنتِ قوية وقادرة على تحقيق كل أحلامك. استمري!' : 'النجاح يصنعه الذين يؤمنون بجمال أحلامهم. انطلق!'}"</p>
      </div>
      <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border} flex justify-between items-center shadow-sm`}>
        <div><p className="opacity-60 font-bold text-sm">تم الإنجاز</p><p className="text-4xl font-bold text-green-500">{count.done}</p></div>
        <CheckCircle className="text-green-200" size={40}/>
      </div>
      <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border} flex justify-between items-center shadow-sm`}>
        <div><p className="opacity-60 font-bold text-sm">قيد الانتظار</p><p className="text-4xl font-bold text-orange-500">{count.todo}</p></div>
        <Clock className="text-orange-200" size={40}/>
      </div>
      <div className={`${theme.card} p-6 ${theme.radius} border ${theme.border} flex justify-between items-center shadow-sm`}>
        <div><p className="opacity-60 font-bold text-sm">التركيز</p><p className="text-4xl font-bold text-blue-500">2.5h</p></div>
        <TrendingUp className="text-blue-200" size={40}/>
      </div>
    </div>
  );
}