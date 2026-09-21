<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('inventory', \App\Services\InventoryService::class);
        $this->app->singleton('sales', \App\Services\SalesService::class);
        $this->app->singleton('report', \App\Services\ReportService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
