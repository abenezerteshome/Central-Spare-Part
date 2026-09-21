<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    protected $report;

    public function __construct(ReportService $report)
    {
        $this->report = $report;
    }

    public function summary(Request $request)
    {
        $data = $this->report->summary($request->start_date, $request->end_date);
        return $this->success($data);
    }

    public function dailySales()
    {
        $data = $this->report->dailySales();
        return $this->success($data);
    }

    public function monthlyProfit()
    {
        $data = $this->report->monthlyProfit();
        return $this->success($data);
    }
}
