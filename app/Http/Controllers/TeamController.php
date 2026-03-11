<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    // Buat tim baru
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:100']);

        $team = Team::create([
            'owner_id'    => auth()->id(),
            'name'        => $request->name,
            'invite_code' => Team::generateInviteCode(),
        ]);

        // Owner otomatis jadi member
        $team->members()->attach(auth()->id());

        return redirect()->back()->with('success', "Tim '{$team->name}' berhasil dibuat! Kode: {$team->invite_code}");
    }

    // Join tim pakai kode
    public function join(Request $request)
    {
        $request->validate(['invite_code' => 'required|string']);

        $team = Team::where('invite_code', strtoupper($request->invite_code))->first();

        if (!$team) {
            return redirect()->back()->withErrors(['invite_code' => 'Kode tim tidak ditemukan!']);
        }

        if ($team->isMember(auth()->user())) {
            return redirect()->back()->withErrors(['invite_code' => 'Kamu sudah bergabung di tim ini!']);
        }

        $team->members()->attach(auth()->id());

        return redirect()->back()->with('success', "Berhasil bergabung ke tim '{$team->name}'!");
    }

    // Keluar dari tim
    public function leave(Team $team)
    {
        if ($team->owner_id === auth()->id()) {
            return redirect()->back()->withErrors(['team' => 'Owner tidak bisa keluar dari tim. Hapus tim atau transfer ownership.']);
        }

        $team->members()->detach(auth()->id());
        return redirect()->back()->with('success', 'Berhasil keluar dari tim.');
    }

    // Hapus tim (owner only)
    public function destroy(Team $team)
    {
        if ($team->owner_id !== auth()->id()) {
            abort(403);
        }

        $team->delete();
        return redirect()->back()->with('success', 'Tim berhasil dihapus.');
    }
}
