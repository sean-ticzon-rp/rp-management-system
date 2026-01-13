<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $p = Announcement::with('attachments', 'creator')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $announcements = $p->through(function ($a) {
            return [
                'id' => $a->id,
                'title' => $a->title,
                'body' => $a->body,
                'published_at' => $a->published_at,
                'created_at' => $a->created_at,
                'creator' => $a->creator ? ['id' => $a->creator->id, 'name' => $a->creator->name] : null,
                'attachments' => $a->attachments->map(function ($att) {
                    return [
                        'id' => $att->id,
                        'filename' => $att->filename,
                        'url' => Storage::url($att->path),
                        'mime' => $att->mime,
                        'size' => $att->size,
                    ];
                })->toArray(),
            ];
        });

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => array_merge($p->toArray(), ['data' => $announcements->toArray()]),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'published_at' => 'nullable|date',
            'attachments.*' => 'file|max:51200', // max 50MB per file
        ]);

        $announcement = Announcement::create(array_merge($data, [
            'created_by' => $request->user()->id,
        ]));

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('public/announcements');

                $announcement->attachments()->create([
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('announcements.index')->with('success', 'Announcement created.');
    }

    public function show(Announcement $announcement)
    {
        $announcement->load('attachments', 'creator');

        $payload = [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'published_at' => $announcement->published_at,
            'created_at' => $announcement->created_at,
            'creator' => $announcement->creator ? ['id' => $announcement->creator->id, 'name' => $announcement->creator->name] : null,
            'attachments' => $announcement->attachments->map(function ($att) {
                return [
                    'id' => $att->id,
                    'filename' => $att->filename,
                    'url' => Storage::url($att->path),
                    'mime' => $att->mime,
                    'size' => $att->size,
                ];
            })->toArray(),
        ];

        return Inertia::render('Admin/Announcements/Show', [
            'announcement' => $payload,
        ]);
    }

    public function edit(Announcement $announcement)
    {
        $announcement->load('attachments');

        $payload = [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'body' => $announcement->body,
            'published_at' => $announcement->published_at,
            'attachments' => $announcement->attachments->map(function ($att) {
                return [
                    'id' => $att->id,
                    'filename' => $att->filename,
                    'url' => Storage::url($att->path),
                    'mime' => $att->mime,
                    'size' => $att->size,
                ];
            })->toArray(),
        ];

        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => $payload,
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'published_at' => 'nullable|date',
            'attachments.*' => 'file|max:51200',
        ]);

        $announcement->update($data);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('public/announcements');

                $announcement->attachments()->create([
                    'filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('announcements.index')->with('success', 'Announcement updated.');
    }

    public function destroy(Announcement $announcement)
    {
        // delete physical files
        foreach ($announcement->attachments as $att) {
            Storage::delete($att->path);
            $att->delete();
        }

        $announcement->delete();

        return redirect()->route('announcements.index')->with('success', 'Announcement deleted.');
    }

    /**
     * Delete a single attachment from an announcement.
     */
    public function destroyAttachment(Announcement $announcement, AnnouncementAttachment $attachment)
    {
        // ensure the attachment belongs to the announcement
        if ($attachment->announcement_id !== $announcement->id) {
            abort(404);
        }

        // delete file from storage and remove DB record
        if ($attachment->path) {
            Storage::delete($attachment->path);
        }

        $attachment->delete();

        return redirect()->back()->with('success', 'Attachment removed.');
    }
}
