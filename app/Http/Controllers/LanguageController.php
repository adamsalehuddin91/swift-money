<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LanguageController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'language' => 'required|in:ms,en',
        ]);

        $request->user()->update(['language' => $request->language]);

        return back();
    }
}
