import React, { useState } from 'react';
import RppModulAjar from './RppModulAjar.jsx';
import AsesmenMadrasah from './AsesmenMadrasah.jsx';
import TeacherJournal from './TeacherJournal.jsx';
import TeacherProfile from './TeacherProfile.jsx';

const GuruMenu = ({ user, onUserUpdate, onNavigate }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [activeSubMenu, setActiveSubMenu] = useState('rpp');

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow border border-emerald-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">Menu Guru</h3>
            <p className="text-sm text-gray-600 mt-1">
              Halo, <span className="font-medium">{user?.name || 'Guru'}</span>. Pilih sub menu di bawah.
            </p>
          </div>
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            Role: Guru
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSubMenu('rpp')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              activeSubMenu === 'rpp'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Modul Ajar / RPP
          </button>

          <button
            type="button"
            onClick={() => setActiveSubMenu('kokurikuler')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              activeSubMenu === 'kokurikuler'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Kokurikuler
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('nilai')}
            className="px-3 py-2 rounded-lg text-sm font-medium border transition bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
            title="Buka Input & Rekap Nilai"
          >
            Input Nilai
          </button>

          <button
            type="button"
            onClick={() => setActiveSubMenu('asesmen')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              activeSubMenu === 'asesmen'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Soal / Asesmen
          </button>

          <button
            type="button"
            onClick={() => setActiveSubMenu('jurnal')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              activeSubMenu === 'jurnal'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Jurnal Mengajar
          </button>

          <button
            type="button"
            onClick={() => setActiveSubMenu('profil')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
              activeSubMenu === 'profil'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Profil
          </button>
        </div>
      </div>

      {activeSubMenu === 'rpp' && (
        <div className="space-y-6">
          <RppModulAjar />
        </div>
      )}

      {activeSubMenu === 'kokurikuler' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
          <iframe
            src={`${baseUrl}kokurikuler/index.html`}
            title="Perencanaan Kokurikuler DL & KBC"
            className="w-full h-full border-0"
          />
        </div>
      )}

      {activeSubMenu === 'asesmen' && <AsesmenMadrasah />}

      {activeSubMenu === 'jurnal' && <TeacherJournal />}

      {activeSubMenu === 'profil' && <TeacherProfile onUserUpdate={onUserUpdate} />}
    </div>
  );
};

export default GuruMenu;
