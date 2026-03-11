<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Ambil semua tim user
        $teams = $user->allTeams()->map(function ($team) {
            return [
                'id'          => $team->id,
                'name'        => $team->name,
                'invite_code' => $team->invite_code,
                'is_owner'    => $team->owner_id === auth()->id(),
                'members'     => $team->members->map(fn($m) => [
                    'id'   => $m->id,
                    'name' => $m->name,
                ]),
            ];
        })->values();

        // Ambil assignment: milik sendiri + semua tim yang diikuti
        $teamIds = $user->allTeams()->pluck('id');

        $assignments = Assignment::where(function ($q) use ($user, $teamIds) {
            $q->where('user_id', $user->id)
              ->whereNull('team_id');
        })->orWhereIn('team_id', $teamIds)
          ->with('user:id,name')
          ->orderBy('deadline', 'asc')
          ->get()
          ->map(function ($a) {
              return array_merge($a->toArray(), [
                  'created_by' => $a->user->name ?? '-',
              ]);
          });

        return Inertia::render('Assignments/Index', [
            'assignments' => $assignments,
            'teams'       => $teams,
            'flash'       => session('success'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'    => 'required|string',
            'subject'  => 'required|string',
            'lecturer' => 'nullable|string',
            'status'   => 'required|string',
            'priority' => 'required|string',
            'type'     => 'nullable|string',
            'deadline' => 'nullable|date',
            'notes'    => 'nullable|string',
            'team_id'  => 'nullable|integer|exists:teams,id',
        ]);

        $data['user_id'] = auth()->id();
        Assignment::create($data);
        return redirect()->back();
    }

    public function update(Request $request, Assignment $assignment)
    {
        $data = $request->validate([
            'title'    => 'sometimes|string',
            'subject'  => 'sometimes|string',
            'lecturer' => 'nullable|string',
            'status'   => 'sometimes|string',
            'priority' => 'sometimes|string',
            'type'     => 'nullable|string',
            'deadline' => 'nullable|date',
            'notes'    => 'nullable|string',
            'team_id'  => 'nullable|integer|exists:teams,id',
        ]);

        $assignment->update($data);
        return redirect()->back();
    }

    public function destroy(Assignment $assignment)
    {
        $assignment->delete();
        return redirect()->back();
    }
}
