<?php

namespace App\Http\Controllers\Expenses;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Expense;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    use ApiResponse;

    /**
     * List all expenses (paginated)
     */
    public function index(Request $request)
    {
        $expenses = Expense::with(['store', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return $this->success($expenses);
    }

    /**
     * Store a new expense
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'store_id' => 'nullable|exists:stores,id',
            'agent_id' => 'nullable|exists:agents,id',
            'note' => 'nullable|string|max:1000',
            'date' => 'nullable|date',
        ]);

        $data['created_by'] = Auth::id();
        $data['date'] = $data['date'] ?? now();

        $expense = Expense::create($data);

        \App\Services\ActivityLogger::log('Create', 'Expenses', "Created expense: {$expense->title} ({$expense->amount} Birr)", 'expenses', $expense->id, [
            'title' => $expense->title,
            'amount' => $expense->amount,
            'category' => $expense->category,
        ]);

        return $this->success($expense, 'Expense created', 201);
    }

    /**
     * Show a specific expense
     */
    public function show($id)
    {
        $expense = Expense::with(['store', 'agent', 'createdBy'])->findOrFail($id);
        return $this->success($expense);
    }

    /**
     * Update an existing expense
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'category' => 'nullable|string|max:100',
            'store_id' => 'nullable|exists:stores,id',
            'agent_id' => 'nullable|exists:agents,id',
            'note' => 'nullable|string|max:1000',
            'date' => 'nullable|date',
        ]);

        $expense->update($data);

        \App\Services\ActivityLogger::log('Update', 'Expenses', "Updated expense: {$expense->title} ({$expense->amount} Birr)", 'expenses', $expense->id, [
            'title' => $expense->title,
            'amount' => $expense->amount,
            'category' => $expense->category,
        ]);

        return $this->success($expense, 'Expense updated');
    }

    /**
     * Delete an expense
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $title = $expense->title;
        $amount = $expense->amount;
        $expense->delete();

        \App\Services\ActivityLogger::log('Delete', 'Expenses', "Deleted expense: {$title} ({$amount} Birr)", 'expenses', $id);

        return $this->success(null, 'Expense deleted', 204);
    }
}
