'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BudgetDashboard } from '@/components/budget/BudgetDashboard';
import { CategoryBreakdown } from '@/components/budget/CategoryBreakdown';
import { ScenarioCalculator } from '@/components/budget/ScenarioCalculator';
import { PaymentSchedule } from '@/components/budget/PaymentSchedule';
import { BudgetAlerts } from '@/components/budget/BudgetAlerts';
import { TipCalculator } from '@/components/budget/TipCalculator';

export default function BudgetPage({ params }: { params: { weddingId: string } }) {
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const weddingId = params.weddingId;

  useEffect(() => {
    async function fetchBudget() {
      try {
        const res = await api.get(`/budget/${weddingId}`);
        setBudgetData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBudget();
  }, [weddingId]);

  if (loading) return <div>Loading Budget...</div>;
  if (!budgetData) return <div>Error loading budget.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Budget Management</h1>

      <BudgetAlerts alerts={budgetData.alerts} />

      <BudgetDashboard data={budgetData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CategoryBreakdown categories={budgetData.categories} />
          <ScenarioCalculator weddingId={weddingId} initialGuestCount={100} />
        </div>
        <div>
          <PaymentSchedule payments={budgetData.payments} />
          <TipCalculator />
        </div>
      </div>
    </div>
  );
}
