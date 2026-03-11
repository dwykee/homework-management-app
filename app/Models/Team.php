<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    protected $fillable = ['owner_id', 'name', 'invite_code'];

    public static function generateInviteCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (self::where('invite_code', $code)->exists());

        return $code;
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'team_members')->withTimestamps();
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function allMembers()
    {
        // owner + members
        return $this->members->push($this->owner)->unique('id');
    }

    public function isMember(User $user): bool
    {
        return $this->members->contains($user) || $this->owner_id === $user->id;
    }
}
