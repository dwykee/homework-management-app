<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string']);

        $response = Http::post(
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . env('GEMINI_API_KEY'),
            [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => 'Kamu adalah asisten akademik bernama "Bagwork AI" yang membantu mahasiswa mengerjakan tugas kuliah. Jawab dalam Bahasa Indonesia, singkat, padat, dan mudah dipahami. Pertanyaan: ' . $request->message]
                        ]
                    ]
                ]
            ]
        );

        $reply = $response->json('candidates.0.content.parts.0.text') ?? 'Maaf, tidak bisa menjawab saat ini.';
        dd($response->status(), $response->body());
        return response()->json(['reply' => $reply]);
    }
}