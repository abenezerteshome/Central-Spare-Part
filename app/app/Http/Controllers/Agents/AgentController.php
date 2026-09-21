<?php

namespace App\Http\Controllers\Agents;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class AgentController extends Controller
{
    use ApiResponse;

    /**
     * List all agents
     */
    public function index(Request $request)
    {
        $agents = Agent::orderBy('name')->paginate($request->get('per_page', 20));
        return $this->success($agents);
    }

    /**
     * Store a new agent
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:agents,email',
            'address' => 'nullable|string|max:1000',
        ]);

        $agent = Agent::create($data);

        return $this->success($agent, 'Agent created', 201);
    }

    /**
     * Show a specific agent
     */
    public function show($id)
    {
        $agent = Agent::findOrFail($id);
        return $this->success($agent);
    }

    /**
     * Update an agent
     */
    public function update(Request $request, $id)
    {
        $agent = Agent::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:agents,email,' . $id,
            'address' => 'nullable|string|max:1000',
        ]);

        $agent->update($data);

        return $this->success($agent, 'Agent updated');
    }

    /**
     * Delete an agent
     */
    public function destroy($id)
    {
        $agent = Agent::findOrFail($id);
        $agent->delete();

        return $this->success(null, 'Agent deleted', 204);
    }
}
