<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\PartItem;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    public function summary($startDate = null, $endDate = null)
    {
        $start = $startDate ? Carbon::parse($startDate) : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate) : Carbon::now()->endOfMonth();

        $salesTotal = Sale::whereBetween('created_at', [$start, $end])->sum('total');
        $expenseTotal = Expense::whereBetween('created_at', [$start, $end])->sum('amount');
        $profit = $salesTotal - $expenseTotal;

        $topParts = DB::table('sale_items')
            ->join('parts', 'sale_items.part_id', '=', 'parts.id')
            ->select('parts.name', DB::raw('SUM(sale_items.qty) as total_sold'))
            ->whereBetween('sale_items.created_at', [$start, $end])
            ->groupBy('parts.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $stockCount = PartItem::sum('quantity');

        return [
            'period' => [$start->toDateString(), $end->toDateString()],
            'sales_total' => $salesTotal,
            'expenses_total' => $expenseTotal,
            'profit' => $profit,
            'total_items_in_stock' => $stockCount,
            'top_selling_parts' => $topParts,
        ];
    }

    public function dailySales()
    {
        return Sale::select(DB::raw('DATE(created_at) as day'), DB::raw('SUM(total) as total'))
            ->groupBy('day')
            ->orderBy('day', 'asc')
            ->limit(30)
            ->get();
    }

    public function monthlyProfit()
    {
        $data = Sale::select(
            DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
            DB::raw('SUM(total) as total_sales')
        )
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->get();

        $expenses = Expense::select(
            DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
            DB::raw('SUM(amount) as total_expense')
        )
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->get()
        ->keyBy('month');

        return $data->map(function ($item) use ($expenses) {
            $expense = $expenses[$item->month]->total_expense ?? 0;
            return [
                'month' => $item->month,
                'sales' => $item->total_sales,
                'expenses' => $expense,
                'profit' => $item->total_sales - $expense,
            ];
        });
    }
}
