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

        return $this->success($expense, 'Expense updated');
    }

    /**
     * Delete an expense
     */
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return $this->success(null, 'Expense deleted', 204);
    }
}
