<?php

namespace Database\Seeders;

use App\Models\TaxReliefCategory;
use Illuminate\Database\Seeder;

// Default LHDN relief/rebate categories. CAPS ARE PLACEHOLDERS — verify against
// the official LHDN figures for the YA (rates change every Belanjawan). Editable.
class TaxReliefCategorySeeder extends Seeder
{
    public function run(): void
    {
        $ya = 2026;
        $cats = [
            ['individu',         'Individu & saudara tanggungan',                 9000,  'relief'],
            ['kwsp_insurans',    'KWSP & Insurans Nyawa',                          7000,  'relief'],
            ['gaya_hidup',       'Gaya Hidup (buku, gajet, internet, sukan)',      2500,  'relief'],
            ['gaya_hidup_sukan', 'Gaya Hidup tambahan — peralatan/aktiviti sukan', 1000,  'relief'],
            ['perubatan',        'Perubatan (penyakit serius, check-up, pergigian)', 10000, 'relief'],
            ['perubatan_ibubapa','Perubatan ibu bapa',                             8000,  'relief'],
            ['pendidikan',       'Yuran pendidikan sendiri',                       7000,  'relief'],
            ['penjagaan_anak',   'Penjagaan anak (TASKA/TADIKA)',                  3000,  'relief'],
            ['anak_bawah18',     'Pelepasan anak bawah 18 (RM2,000/anak)',        8000,  'relief'],
            ['penyusuan',        'Penyusuan / pam susu (anak ≤2thn, /2 tahun)',   1000,  'relief'],
            ['sspn',             'Simpanan pendidikan SSPN (bersih)',              8000,  'relief'],
            ['prs',              'Skim Persaraan Swasta (PRS) + Anuiti',           3000,  'relief'],
            ['insurans_edu_med', 'Insurans pendidikan & perubatan',                4000,  'relief'],
            ['oku',              'Peralatan sokongan OKU',                         6000,  'relief'],
            ['derma',            'Derma (badan diluluskan)',                       null,  'relief'],
            ['zakat',            'Zakat / Fitrah (rebat cukai)',                   null,  'rebate'],
        ];

        foreach ($cats as $i => [$code, $name, $cap, $type]) {
            TaxReliefCategory::updateOrCreate(
                ['ya' => $ya, 'code' => $code],
                [
                    'name'        => $name,
                    'cap_amount'  => $cap,
                    'type'        => $type,
                    'sort_order'  => $i,
                    'active'      => true,
                    'description' => 'Kadar anggaran YA ' . $ya . ' — sahkan dengan LHDN.',
                ]
            );
        }
    }
}
