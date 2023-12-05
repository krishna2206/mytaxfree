<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // $schedule->command('inspire')->hourly();
        $schedule->call(function () {
            // Get the current date and time
            $now = Carbon::now();
    
            // Define the directory where the images are stored
            $directory = public_path('images');
    
            // Get all the files in the directory
            $files = File::files($directory);
    
            foreach ($files as $file) {
                // Get the creation time of the file
                $creationTime = Carbon::createFromTimestamp(filectime($file));
    
                // Get the difference in minutes between the current time and the creation time
                $difference = $creationTime->diffInMinutes($now);
    
                // If the difference is greater than 5 minutes, delete the file
                if ($difference > 5) {
                    File::delete($file);
                }
            }
        })->everyMinute();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
