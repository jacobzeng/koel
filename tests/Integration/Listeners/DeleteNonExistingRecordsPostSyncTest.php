<?php

namespace Tests\Integration\Listeners;

use App\Enums\SongStorageType;
use App\Events\MediaScanCompleted;
use App\Listeners\DeleteNonExistingRecordsPostScan;
use App\Models\Song;
use App\Values\Scanning\ScanResult;
use App\Values\Scanning\ScanResultCollection;
use Illuminate\Database\Eloquent\Collection;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DeleteNonExistingRecordsPostSyncTest extends TestCase
{
    private DeleteNonExistingRecordsPostScan $listener;

    public function setUp(): void
    {
        parent::setUp();

        $this->listener = app(DeleteNonExistingRecordsPostScan::class);
    }

    #[Test]
    public function handleDoesNotDeleteCloudEntries(): void
    {
        collect(SongStorageType::cases())
            ->filter(static fn ($type) => $type !== SongStorageType::LOCAL)
            ->each(function ($type): void {
                $song = Song::factory()->create(['storage' => $type]);
                $this->listener->handle(new MediaScanCompleted(ScanResultCollection::create()));

                $this->assertModelExists($song);
            });
    }

    #[Test]
    public function handleDoesNotDeleteEpisodes(): void
    {
        $episode = Song::factory()->asEpisode()->create();
        $this->listener->handle(new MediaScanCompleted(ScanResultCollection::create()));
        $this->assertModelExists($episode);
    }

    #[Test]
    public function handle(): void
    {
        /** @var Collection|array<array-key, Song> $songs */
        $songs = Song::factory(4)->create();

        self::assertCount(4, Song::all());

        $syncResult = ScanResultCollection::create();
        $syncResult->add(ScanResult::success($songs[0]->path));
        $syncResult->add(ScanResult::skipped($songs[3]->path));

        $this->listener->handle(new MediaScanCompleted($syncResult));

        $this->assertModelExists($songs[0]);
        $this->assertModelExists($songs[3]);
        $this->assertModelMissing($songs[1]);
        $this->assertModelMissing($songs[2]);
    }
}
