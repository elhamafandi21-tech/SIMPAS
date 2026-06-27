<template>
  <div>
    <div class="row mb-4 g-4">
      <div class="col-12 col-lg-8">
        <div class="card p-4 border-0 shadow-sm h-100 d-flex justify-content-center">
          <h4 class="mb-2 text-heading fw-bold">Manajemen Penilaian Akademik</h4>
          <p class="text-muted mb-0">Input nilai tamrin (tugas/harian) dan ujian semester santri dengan perhitungan nilai akhir & predikat secara otomatis dan real-time.</p>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="card p-4 border-0 shadow-sm bg-success text-white h-100">
          <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
            <span>🎓</span> Aturan & Ketentuan Penilaian Detail
          </h6>
          <div class="small opacity-90">
            <!-- Persentase Formula -->
            <div class="mb-3">
              <span class="fw-bold d-block text-xs uppercase tracking-wider mb-1 text-white-50" style="font-size: 0.7rem;">Komposisi Nilai Akhir (NA):</span>
              <div class="d-flex justify-content-between mb-1 border-bottom border-white-10 pb-1">
                <span>Nilai Tamrin (Harian/Tugas)</span>
                <span class="fw-bold">40%</span>
              </div>
              <div class="d-flex justify-content-between mb-1 border-bottom border-white-10 pb-1">
                <span>Nilai Semester (Ujian Akhir)</span>
                <span class="fw-bold">60%</span>
              </div>
              <div class="bg-success-dark p-2 rounded text-xs mt-1 font-monospace" style="background-color: rgba(0,0,0,0.15);">
                Formula: NA = (Tamrin × 0.4) + (Semester × 0.6)
              </div>
            </div>

            <!-- Batas Kelulusan -->
            <div class="mb-3">
              <span class="fw-bold d-block text-xs uppercase tracking-wider mb-1 text-white-50" style="font-size: 0.7rem;">Kriteria Kelulusan:</span>
              <div class="d-flex justify-content-between align-items-center">
                <span>Standar Minimal Kelulusan</span>
                <span class="fw-bold text-success bg-white px-2 py-0.5 rounded text-xs">Nilai Akhir ≥ 65</span>
              </div>
            </div>

            <!-- Skala Predikat & Keterangan -->
            <div>
              <span class="fw-bold d-block text-xs uppercase tracking-wider mb-2 text-white-50" style="font-size: 0.7rem;">Konversi Predikat & Keterangan:</span>
              <div class="d-flex flex-column gap-1" style="font-size: 0.8rem;">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">A</span>
                  <span class="flex-grow-1 ms-2">85 - 100</span>
                  <span class="fw-semibold">Istimewa (Mumtaz)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">B</span>
                  <span class="flex-grow-1 ms-2">75 - 84</span>
                  <span class="fw-semibold">Sangat Baik (Jayyid J.)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">C</span>
                  <span class="flex-grow-1 ms-2">65 - 74</span>
                  <span class="fw-semibold">Baik (Jayyid)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-white text-success fw-bold text-center opacity-75" style="width: 24px; padding: 0.25rem 0; color: #15a662 !important;">D</span>
                  <span class="flex-grow-1 ms-2">50 - 64</span>
                  <span class="fw-semibold text-warning-light">Cukup (Maqbul)</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-danger text-white fw-bold text-center" style="width: 24px; padding: 0.25rem 0;">E</span>
                  <span class="flex-grow-1 ms-2">&lt; 50</span>
                  <span class="fw-semibold text-warning">Kurang / Rosif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Penilaian -->
    <div class="card shadow-sm border-0 mb-4 p-4">
      <div class="row g-3 align-items-end">
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Pilih Mata Pelajaran (Kitab)</label>
          <select v-model="selectedSubject" class="form-select" @change="loadGrades">
            <option value="">-- Pilih Kitab --</option>
            <option v-for="sub in subjects" :key="sub.id" :value="sub.id">
              {{ sub.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4">
          <label class="form-label small fw-semibold">Pilih Kelas</label>
          <select v-model="selectedClass" class="form-select" @change="loadGrades">
            <option value="">-- Pilih Kelas --</option>
            <option v-for="cls in classes" :key="cls.id" :value="cls.id">
              {{ cls.nama }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-4" v-if="selectedSubject && selectedClass">
          <div class="d-flex gap-2">
            <button @click="exportToExcel" class="btn btn-outline-success w-50 d-flex align-items-center justify-content-center gap-1">
              <DownloadIcon :size="14" /> Excel
            </button>
            <button @click="printPDF" class="btn btn-outline-danger w-50 d-flex align-items-center justify-content-center gap-1">
              <PrinterIcon :size="14" /> PDF / Cetak
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Grades Input Table -->
    <div v-if="selectedSubject && selectedClass" class="card shadow-sm border-0 overflow-hidden">
      <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h5 class="mb-0">Lembar Penilaian: <strong class="text-primary">{{ getSubjectName(selectedSubject) }}</strong> &mdash; <strong>{{ getClassName(selectedClass) }}</strong></h5>
        <span class="badge bg-label-primary badge-custom">{{ studentsList.length }} Santri</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0" id="grades-table-print">
          <thead>
            <tr>
              <th style="width: 60px">No</th>
              <th style="width: 100px">NIS</th>
              <th>Nama Lengkap Santri</th>
              <th style="width: 150px">Nilai Tamrin (40%)</th>
              <th style="width: 150px">Nilai Semester (60%)</th>
              <th style="width: 120px; text-align: center">Nilai Akhir</th>
              <th style="width: 100px; text-align: center">Predikat</th>
              <th style="width: 150px">Status Kelulusan</th>
              <th style="width: 150px; text-align: center">Cetak Raport</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(student, idx) in studentsList" :key="student.id">
              <tr v-if="gradesMap[student.id]">
                <td>{{ idx + 1 }}</td>
                <td class="fw-semibold text-xs">{{ student.nis }}</td>
                <td>
                  <div class="fw-bold text-heading">{{ student.nama }}</div>
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    v-model.number="gradesMap[student.id].tamrin_score" 
                    @input="recalculateGrade(student.id)"
                    class="form-control" 
                    placeholder="0 - 100"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    v-model.number="gradesMap[student.id].semester_score" 
                    @input="recalculateGrade(student.id)"
                    class="form-control" 
                    placeholder="0 - 100"
                  />
                </td>
                <td class="text-center">
                  <span class="fw-bold fs-5 text-dark">
                    {{ gradesMap[student.id].final_score }}
                  </span>
                </td>
                <td class="text-center">
                  <span :class="getPredikatClass(gradesMap[student.id].predikat)" class="badge badge-custom px-3 py-1 fw-bold fs-7">
                    {{ gradesMap[student.id].predikat }}
                  </span>
                </td>
                <td>
                  <span v-if="gradesMap[student.id].final_score >= 65" class="badge bg-success text-white">LULUS (MUMTAZ)</span>
                  <span v-else class="badge bg-danger text-white">BELUM LULUS (ROSIF)</span>
                </td>
                <td class="text-center">
                  <button @click="openRaportModal(student)" class="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center gap-1 mx-auto">
                    <FileTextIcon :size="14" /> Lihat Raport
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Action Footer -->
      <div class="card-footer bg-light border-top p-4 d-flex justify-content-end gap-2">
        <button @click="saveGrades" class="btn btn-primary d-flex align-items-center gap-2">
          <SaveIcon :size="18" /> Simpan & Sinkronisasi Real-Time
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card border-0 shadow-sm p-5 text-center text-muted">
      <div class="mb-3 text-secondary">
        <FileSpreadsheetIcon :size="48" />
      </div>
      <h5>Silakan pilih mata pelajaran (kitab) dan kelas</h5>
      <p class="mb-0 small">Formulir penilaian santri akan dimuat di sini secara otomatis.</p>
    </div>

    <!-- Modal Raport Santri -->
    <div v-if="showRaportModal" class="modal-backdrop fade show" style="z-index: 1040;"></div>
    <div v-if="showRaportModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1050; overflow-y: auto;">
      <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-success text-white p-3">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <AwardIcon :size="20" /> Raport Hasil Belajar Santri
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeRaportModal" aria-label="Close"></button>
          </div>

          <!-- Pengaturan Wali Kelas (D-print-none) -->
          <div class="bg-white p-3 border-bottom d-flex align-items-center justify-content-between gap-3 flex-wrap d-print-none" style="border-top: 1px solid #eee;">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-4">👨‍🏫</span>
              <div>
                <strong class="text-dark d-block text-xs uppercase tracking-wider mb-0.5" style="font-size: 0.75rem;">PILIH WALI KELAS (ADMIN)</strong>
                <span class="text-xs text-muted" style="font-size: 0.725rem;">Pilih atau ketik ustadz pengampu yang menandatangani raport.</span>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style="min-width: 280px; max-width: 400px;">
              <select v-model="selectedWaliKelas" class="form-select form-select-sm" style="font-size: 0.8rem;">
                <option v-for="user in ustadzList" :key="user.id" :value="user.nama">
                  {{ user.nama }}
                </option>
                <option value="custom">-- Tulis Nama Kustom --</option>
              </select>
              <input 
                v-if="selectedWaliKelas === 'custom'"
                v-model="customWaliName"
                type="text"
                class="form-control form-control-sm"
                style="font-size: 0.8rem;"
                placeholder="Nama Ustadz..."
              />
            </div>
          </div>

          <div class="modal-body p-4 bg-light" id="raport-print-section">
            <!-- Raport Paper Content -->
            <div class="card border-0 shadow-sm p-4 bg-white mx-auto print-paper" style="max-width: 800px; font-family: 'Times New Roman', serif; color: #111;">
              
              <!-- Kop Surat Madrasah -->
              <div class="text-center border-bottom border-3 border-dark pb-3 mb-4">
                <div class="d-flex align-items-center justify-content-center gap-3">
                  <!-- Emblem Hijau Islami -->
                  <div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 70px; height: 70px; border: 2px solid #0fa662; font-family: sans-serif;">
                    <span style="font-size: 1.5rem">🕌</span>
                  </div>
                  <div class="text-center">
                    <h3 class="fw-bold m-0 text-success arabic-text" style="font-size: 2.1rem; letter-spacing: 0.5px; font-family: 'Amiri', serif !important;">المدرسة الدينية "بانشاسيلا" سالاتيغا</h3>
                    <h4 class="fw-bold m-0 text-success opacity-90" style="font-size: 1.2rem; letter-spacing: 1px;">MADRASAH DINIYAH PANCASILA SALATIGA</h4>
                    <p class="m-0 text-muted" style="font-size: 0.8rem; font-family: Arial, sans-serif;">
                      Jl. Pancasila No. 04, Blotongan, Kec. Sidorejo, Kota Salatiga, Jawa Tengah 50715
                    </p>
                    <p class="m-0 fw-semibold text-xs text-muted" style="font-family: Arial, sans-serif;">
                      Email: madinpancasilasalatiga@gmail.com | Telp: 0858-6547-8901
                    </p>
                  </div>
                </div>
              </div>

              <!-- Judul Dokumen -->
              <div class="text-center mb-4">
                <h4 class="fw-bold mb-1 arabic-text" style="font-size: 1.8rem; font-family: 'Amiri', serif !important; direction: rtl;">كشف الدرجات لطلاب المدرسة الدينية</h4>
                <h5 class="fw-bold text-decoration-underline mb-1" style="font-size: 1.05rem; letter-spacing: 0.5px;">LAPORAN HASIL BELAJAR SANTRI (RAPORT)</h5>
                <p class="text-muted m-0 text-xs" style="font-family: Arial, sans-serif;">
                  الفصل الدراسي الأول &mdash; العام الدراسي {{ selectedStudentClassObj?.tahun_ajaran || '2025/2026' }} <br>
                  Semester Ganjil &mdash; Tahun Ajaran {{ selectedStudentClassObj?.tahun_ajaran || '2025/2026' }}
                </p>
              </div>

              <!-- Informasi Santri -->
              <div class="row g-2 mb-4" style="font-size: 0.85rem;">
                <div class="col-6">
                  <table class="table table-borderless table-sm m-0 text-dark">
                    <tbody>
                      <tr>
                        <td style="width: 170px" class="py-1">Nama Santri / <span class="fw-bold">اسم الطالب</span></td>
                        <td class="py-1">:</td>
                        <td class="fw-bold py-1 text-heading">{{ activeRaportStudent?.nama }}</td>
                      </tr>
                      <tr>
                        <td class="py-1">Nomor Induk / <span class="fw-bold">الرقم التسجيلي</span></td>
                        <td class="py-1">:</td>
                        <td class="py-1">{{ activeRaportStudent?.nis }}</td>
                      </tr>
                      <tr>
                        <td class="py-1">Kelas / Tingkat / <span class="fw-bold">الصف والمرحلة</span></td>
                        <td class="py-1">:</td>
                        <td class="py-1">{{ selectedStudentClassObj?.nama }} ({{ selectedStudentClassObj?.tingkat }})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-6">
                  <table class="table table-borderless table-sm m-0 text-dark">
                    <tbody>
                      <tr>
                        <td style="width: 170px" class="py-1">Tgl Lahir / <span class="fw-bold">تاريخ الميلاد</span></td>
                        <td class="py-1">:</td>
                        <td class="py-1">{{ activeRaportStudent?.tempat_lahir }}, {{ formatDate(activeRaportStudent?.tanggal_lahir) }}</td>
                      </tr>
                      <tr>
                        <td class="py-1">Alamat / <span class="fw-bold">عنوان الطالب</span></td>
                        <td class="py-1">:</td>
                        <td class="py-1 text-truncate" style="max-width: 200px;" :title="activeRaportStudent?.alamat">{{ activeRaportStudent?.alamat }}</td>
                      </tr>
                      <tr>
                        <td class="py-1">Wali Kelas / <span class="fw-bold">مربي الصف</span></td>
                        <td class="py-1">:</td>
                        <td class="py-1 fw-bold">{{ activeWaliKelasName }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Tabel Nilai Mata Pelajaran -->
              <div class="mb-4">
                <table class="table table-bordered border-dark text-dark align-middle" style="font-size: 0.8rem;">
                  <thead class="bg-light text-center fw-bold">
                    <tr>
                      <th style="width: 45px; vertical-align: middle;">الرقم<br><span style="font-size: 0.75rem;">No</span></th>
                      <th style="vertical-align: middle;">اسم الكتاب والمادة الدراسية<br><span style="font-size: 0.75rem;">Nama Kitab / Mata Pelajaran</span></th>
                      <th style="width: 120px; vertical-align: middle;">النتيجة اليومية (٤٠٪)<br><span style="font-size: 0.7rem;">Tamrin (40%)</span></th>
                      <th style="width: 120px; vertical-align: middle;">نتيجة الامتحان (٦٠٪)<br><span style="font-size: 0.7rem;">Semester (60%)</span></th>
                      <th style="width: 100px; vertical-align: middle;">النتيجة النهائية<br><span style="font-size: 0.75rem;">Nilai Akhir</span></th>
                      <th style="width: 100px; vertical-align: middle;">التقدير<br><span style="font-size: 0.75rem;">Predikat</span></th>
                      <th style="width: 160px; vertical-align: middle;">الملاحظة<br><span style="font-size: 0.75rem;">Keterangan</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(subject, idx) in allSubjectsWithGrades" :key="subject.id">
                      <td class="text-center">{{ idx + 1 }}</td>
                      <td class="fw-bold" style="font-size: 0.85rem;">{{ subject.nama }}</td>
                      <td class="text-center">{{ subject.tamrin_score !== null ? subject.tamrin_score : '-' }}</td>
                      <td class="text-center">{{ subject.semester_score !== null ? subject.semester_score : '-' }}</td>
                      <td class="text-center fw-bold" :class="{'text-danger': (subject.final_score !== null && subject.final_score < 65)}">
                        {{ subject.final_score !== null ? subject.final_score : '-' }}
                      </td>
                      <td class="text-center fw-bold text-success">{{ subject.predikat || '-' }}</td>
                      <td class="text-center" style="font-size: 0.75rem;">
                        <span v-if="subject.final_score === null">-</span>
                        <span v-else-if="subject.final_score >= 85" class="fw-bold text-success">ممتاز / Istimewa</span>
                        <span v-else-if="subject.final_score >= 75" class="text-primary fw-semibold">جيد جدا / Sangat Baik</span>
                        <span v-else-if="subject.final_score >= 65" class="text-info fw-semibold">جيد / Baik</span>
                        <span v-else-if="subject.final_score >= 50" class="text-warning fw-semibold">مقبول / Cukup</span>
                        <span v-else class="text-danger fw-bold">راسب / Belum Lulus</span>
                      </td>
                    </tr>
                    <!-- Row Rata-Rata -->
                    <tr class="fw-bold bg-light" style="font-size: 0.85rem;">
                      <td colspan="4" class="text-end">معدل الدرجات / RATA-RATA NILAI AKADEMIK :</td>
                      <td class="text-center text-success fs-5">{{ averageFinalScore.toFixed(1) }}</td>
                      <td colspan="2" class="text-center">
                        تقدير المعدل / Predikat: <span class="badge bg-success text-white ms-1" style="font-size: 0.8rem;">{{ averagePredikat }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Rekap Kehadiran -->
              <div class="row mb-4 text-dark text-start">
                <div class="col-12">
                  <div class="border border-dark p-3 h-100" style="border-radius: 4px;">
                    <h6 class="fw-bold text-decoration-underline mb-2" style="font-size: 0.85rem;">خلاصة الحضور والغياب / REKAPITULASI PRESENSI / KEHADIRAN</h6>
                    <table class="table table-sm table-borderless m-0" style="font-size: 0.85rem;">
                      <tbody>
                        <tr>
                          <td style="width: 240px">1. Sakit (S) / <span class="fw-bold">مريض</span></td>
                          <td style="width: 20px">:</td>
                          <td class="fw-bold text-end" style="width: 80px;">{{ attendanceStats.Sakit }}</td>
                          <td>يوم / hari</td>
                        </tr>
                        <tr>
                          <td>2. Izin (I) / <span class="fw-bold">استئذان</span></td>
                          <td>:</td>
                          <td class="fw-bold text-end">{{ attendanceStats.Izin }}</td>
                          <td>يوم / hari</td>
                        </tr>
                        <tr>
                          <td>3. Tanpa Keterangan (Alfa) / <span class="fw-bold">غائب</span></td>
                          <td>:</td>
                          <td class="fw-bold text-end text-danger">{{ attendanceStats.Alfa }}</td>
                          <td>يوم / hari</td>
                        </tr>
                        <tr class="border-top border-dark">
                          <td><strong>Total Absen / <span class="fw-bold">مجموع الغياب</span></strong></td>
                          <td>:</td>
                          <td class="fw-bold text-end text-danger">{{ attendanceStats.Sakit + attendanceStats.Izin + attendanceStats.Alfa }}</td>
                          <td>يوم / hari</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Tanda Tangan Section -->
              <div class="mt-5 pt-3 text-dark" style="font-size: 0.8rem;">
                <div class="row text-center">
                  <div class="col-4">
                    <p class="mb-5 fw-bold" style="font-size: 0.9rem;">ولي أمر الطالب<br><span style="font-size: 0.75rem; font-weight: normal;">Orang Tua / Wali Santri</span></p>
                    <p class="fw-bold text-decoration-underline mb-0">........................................</p>
                  </div>
                  <div class="col-4">
                    <p class="mb-5 fw-bold" style="font-size: 0.9rem;">Salatiga, {{ getCurrentFormattedDate() }}<br><span style="font-size: 0.75rem; font-weight: normal;">مربي الصف / Ustadz Wali Kelas</span></p>
                    <p class="fw-bold text-decoration-underline mb-0">{{ activeWaliKelasName }}</p>
                    <p class="text-xs text-muted m-0">ID: {{ activeWaliKelasId }}</p>
                  </div>
                  <div class="col-4">
                    <p class="mb-5 fw-bold" style="font-size: 0.9rem;">مدير المدرسة الدينية<br><span style="font-size: 0.75rem; font-weight: normal;">Kepala Madrasah Diniyah</span></p>
                    <p class="fw-bold text-decoration-underline mb-0">KH. Ahmad Fauzi, S.Pd.I</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer bg-light p-3 border-top d-flex justify-content-between">
            <span class="text-xs text-muted">Format resmi madrasah. Mudah dicetak ke printer atau simpan PDF.</span>
            <div class="d-flex gap-2">
              <button @click="closeRaportModal" class="btn btn-outline-secondary btn-sm">
                Tutup
              </button>
              <button @click="downloadStudentRaportExcel" class="btn btn-success btn-sm d-flex align-items-center gap-1 text-white">
                <FileSpreadsheetIcon :size="14" /> Unduh Excel Raport
              </button>
              <button @click="printStudentRaport" class="btn btn-primary btn-sm d-flex align-items-center gap-1">
                <PrinterIcon :size="14" /> Cetak Raport (PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { db } from '../database';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileSpreadsheet as FileSpreadsheetIcon, 
  Save as SaveIcon, 
  Download as DownloadIcon, 
  Printer as PrinterIcon,
  FileText as FileTextIcon,
  Award as AwardIcon
} from 'lucide-vue-next';

const selectedSubject = ref('');
const selectedClass = ref('');

// Grades mapping state: student_id -> { tamrin_score: number, semester_score: number, final_score: number, predikat: string }
const gradesMap = ref<Record<string, { tamrin_score: number; semester_score: number; final_score: number; predikat: 'A' | 'B' | 'C' | 'D' | 'E' }>>({});

const subjects = computed(() => db.subjects);
const classes = computed(() => db.classes);

const studentsList = computed(() => {
  if (!selectedClass.value) return [];
  return db.students.filter(s => s.kelas_id === selectedClass.value);
});

const getSubjectName = (id: string) => {
  return db.subjects.find(s => s.id === id)?.nama || 'Kitab';
};

const getClassName = (id: string) => {
  return db.classes.find(c => c.id === id)?.nama || 'Kelas';
};

const loadGrades = () => {
  if (!selectedSubject.value || !selectedClass.value) return;

  const list = studentsList.value;
  const tempMap: Record<string, { tamrin_score: number; semester_score: number; final_score: number; predikat: 'A' | 'B' | 'C' | 'D' | 'E' }> = {};

  list.forEach(student => {
    // Find existing grade in DB
    const existing = db.grades.find(g => 
      g.student_id === student.id && 
      g.subject_id === selectedSubject.value && 
      g.kelas_id === selectedClass.value
    );

    tempMap[student.id] = {
      tamrin_score: existing ? existing.tamrin_score : 0,
      semester_score: existing ? existing.semester_score : 0,
      final_score: existing ? existing.final_score : 0,
      predikat: existing ? existing.predikat : 'E'
    };
  });

  gradesMap.value = tempMap;
};

// Auto-load grades when subject or class changes
watch([selectedSubject, selectedClass], () => {
  loadGrades();
}, { immediate: true });

const recalculateGrade = (studentId: string) => {
  const score = gradesMap.value[studentId];
  if (!score) return;

  // Formula: Final score is 40% Tamrin + 60% Semester
  const final = Math.round((score.tamrin_score * 0.4) + (score.semester_score * 0.6));
  score.final_score = final;

  let pred: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
  if (final >= 85) pred = 'A';
  else if (final >= 75) pred = 'B';
  else if (final >= 65) pred = 'C';
  else if (final >= 50) pred = 'D';

  score.predikat = pred;
};

const getPredikatClass = (pred: string) => {
  if (pred === 'A') return 'badge-success';
  if (pred === 'B') return 'badge-primary';
  if (pred === 'C') return 'badge-info';
  if (pred === 'D') return 'badge-warning';
  return 'badge-danger';
};

const saveGrades = () => {
  if (!selectedSubject.value || !selectedClass.value) return;

  studentsList.value.forEach(student => {
    const mapVal = gradesMap.value[student.id];
    if (mapVal) {
      db.saveGrade({
        student_id: student.id,
        subject_id: selectedSubject.value,
        kelas_id: selectedClass.value,
        tamrin_score: mapVal.tamrin_score,
        semester_score: mapVal.semester_score,
        created_by: db.session.currentUser?.id || 'prof-1',
        date_input: new Date().toISOString().slice(0, 10)
      });
    }
  });

  Swal.fire({
    icon: 'success',
    title: 'Penilaian Disimpan',
    text: 'Nilai akhir & predikat santri berhasil diperbarui di Supabase.',
    confirmButtonColor: 'var(--primary)'
  });
};

const exportToExcel = () => {
  const data = studentsList.value.map((student, idx) => {
    const mapVal = gradesMap.value[student.id];
    return {
      No: idx + 1,
      NIS: student.nis,
      'Nama Lengkap': student.nama,
      'Nilai Tamrin (40%)': mapVal?.tamrin_score || 0,
      'Nilai Semester (60%)': mapVal?.semester_score || 0,
      'Nilai Akhir': mapVal?.final_score || 0,
      Predikat: mapVal?.predikat || 'E',
      Kelulusan: (mapVal?.final_score || 0) >= 65 ? 'LULUS' : 'BELUM LULUS'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Penilaian Santri');
  XLSX.writeFile(workbook, `Nilai_${getSubjectName(selectedSubject.value)}_${getClassName(selectedClass.value)}.xlsx`);
};

const printPDF = () => {
  const doc = new jsPDF();
  doc.setFont('Helvetica', 'bold');
  doc.text('MADRASAH DINIYAH PANCASILA SALATIGA', 14, 15);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`REKAP PENILAIAN KITAB: ${getSubjectName(selectedSubject.value).toUpperCase()}`, 14, 22);
  doc.text(`KELAS: ${getClassName(selectedClass.value).toUpperCase()} | SEMESTER GANJIL`, 14, 27);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);
  doc.line(14, 35, 196, 35);

  const tableData = studentsList.value.map((student, idx) => {
    const mapVal = gradesMap.value[student.id];
    return [
      idx + 1,
      student.nis,
      student.nama,
      mapVal?.tamrin_score || 0,
      mapVal?.semester_score || 0,
      mapVal?.final_score || 0,
      mapVal?.predikat || 'E',
      (mapVal?.final_score || 0) >= 65 ? 'LULUS' : 'BELUM LULUS'
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [['No', 'NIS', 'Nama Santri', 'Tamrin', 'Semester', 'Akhir', 'Predikat', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 166, 98] }
  });

  doc.save(`Rekap_Nilai_${getSubjectName(selectedSubject.value)}_${getClassName(selectedClass.value)}.pdf`);
};

// ======================== RAPORT SYSTEM LOGIC ========================
const showRaportModal = ref(false);
const activeRaportStudent = ref<any>(null);

const selectedWaliKelas = ref('');
const customWaliName = ref('');

const ustadzList = computed(() => {
  return db.profiles.filter(p => p.role === 'Ustadz' || p.role === 'Admin');
});

const activeWaliKelasName = computed(() => {
  if (selectedWaliKelas.value === 'custom') {
    return customWaliName.value || 'Ustadz Pengampu';
  }
  return selectedWaliKelas.value || db.session.currentUser?.nama || 'Ustadz Pengampu';
});

const activeWaliKelasId = computed(() => {
  if (selectedWaliKelas.value === 'custom') {
    return '-';
  }
  const found = db.profiles.find(p => p.nama === selectedWaliKelas.value);
  return found ? found.id : (db.session.currentUser?.id || 'UST-01');
});

const selectedStudentClassObj = computed(() => {
  if (!activeRaportStudent.value) return null;
  return db.classes.find(c => c.id === activeRaportStudent.value.kelas_id) || null;
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getCurrentFormattedDate = () => {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const allSubjectsWithGrades = computed(() => {
  if (!activeRaportStudent.value) return [];
  const student = activeRaportStudent.value;
  return db.subjects.map(subject => {
    const grade = db.grades.find(g => 
      g.student_id === student.id && 
      g.subject_id === subject.id && 
      g.kelas_id === student.kelas_id
    );
    return {
      id: subject.id,
      nama: subject.nama,
      tamrin_score: grade ? grade.tamrin_score : null,
      semester_score: grade ? grade.semester_score : null,
      final_score: grade ? grade.final_score : null,
      predikat: grade ? grade.predikat : null
    };
  });
});

const averageFinalScore = computed(() => {
  const subjects = allSubjectsWithGrades.value;
  const graded = subjects.filter(s => s.final_score !== null);
  if (graded.length === 0) return 0;
  const sum = graded.reduce((acc, s) => acc + (s.final_score || 0), 0);
  return sum / graded.length;
});

const averagePredikat = computed(() => {
  const avg = averageFinalScore.value;
  if (avg >= 85) return 'A';
  if (avg >= 75) return 'B';
  if (avg >= 65) return 'C';
  if (avg >= 50) return 'D';
  return 'E';
});

const attendanceStats = computed(() => {
  if (!activeRaportStudent.value) return { Sakit: 0, Izin: 0, Alfa: 0, Hadir: 0 };
  const studentId = activeRaportStudent.value.id;
  const records = db.attendance.filter(a => a.role === 'Santri' && a.person_id === studentId);
  
  const stats = { Sakit: 0, Izin: 0, Alfa: 0, Hadir: 0 };
  records.forEach(r => {
    if (r.status === 'Sakit') stats.Sakit++;
    else if (r.status === 'Izin') stats.Izin++;
    else if (r.status === 'Alfa') stats.Alfa++;
    else if (r.status === 'Hadir') stats.Hadir++;
  });
  return stats;
});

const nadhomanStats = computed(() => {
  if (!activeRaportStudent.value) return { totalRecords: 0, lastBait: 0, totalBaitLines: 0 };
  const studentId = activeRaportStudent.value.id;
  const records = db.nadhomanSetorans.filter(n => n.student_id === studentId);
  
  let lastBait = 0;
  let totalBaitLines = 0;
  records.forEach(r => {
    if (r.bait_akhir > lastBait) lastBait = r.bait_akhir;
    totalBaitLines += (r.bait_akhir - r.bait_awal + 1);
  });
  
  return {
    totalRecords: records.length,
    lastBait,
    totalBaitLines
  };
});

const openRaportModal = (student: any) => {
  activeRaportStudent.value = student;
  selectedWaliKelas.value = db.session.currentUser?.nama || '';
  customWaliName.value = '';
  showRaportModal.value = true;
};

const closeRaportModal = () => {
  showRaportModal.value = false;
  activeRaportStudent.value = null;
};

const printStudentRaport = () => {
  // Create a print stylesheet
  const style = document.createElement('style');
  style.id = 'print-raport-styles';
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden !important;
      }
      #raport-print-section, #raport-print-section * {
        visibility: visible !important;
      }
      #raport-print-section {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      .print-paper {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
      /* Hide non-printable elements */
      .modal-header, .modal-footer, .btn, .btn-close {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
  window.print();
  // Remove it after printing so page layout goes back to normal
  setTimeout(() => {
    const el = document.getElementById('print-raport-styles');
    if (el) el.remove();
  }, 1000);
};

const downloadStudentRaportExcel = () => {
  if (!activeRaportStudent.value) return;
  const student = activeRaportStudent.value;
  const classObj = selectedStudentClassObj.value;
  
  // Prepare clean structured data for excel
  const header = [
    ["LAPORAN HASIL BELAJAR SANTRI (RAPORT)"],
    ["MADRASAH DINIYAH PANCASILA SALATIGA"],
    [`Tahun Ajaran: ${classObj?.tahun_ajaran || '2025/2026'} | Semester: Ganjil`],
    [],
    ["DATA SANTRI:"],
    ["Nama Santri", student.nama, "", "Tempat, Tgl Lahir", `${student.tempat_lahir}, ${formatDate(student.tanggal_lahir)}`],
    ["Nomor Induk (NIS)", student.nis, "", "Alamat Santri", student.alamat],
    ["Kelas / Tingkat", classObj?.nama, "", "Wali Kelas", activeWaliKelasName.value],
    [],
    ["DAFTAR PENILAIAN AKADEMIK:"],
    ["No", "Nama Kitab / Mata Pelajaran", "Nilai Tamrin (40%)", "Nilai Semester (60%)", "Nilai Akhir", "Predikat", "Keterangan"]
  ];

  const subjectsData = allSubjectsWithGrades.value.map((s, idx) => {
    let ket = '-';
    if (s.final_score !== null) {
      if (s.final_score >= 85) ket = 'Istimewa (Mumtaz)';
      else if (s.final_score >= 75) ket = 'Sangat Baik (Jayyid Jiddan)';
      else if (s.final_score >= 65) ket = 'Baik (Jayyid)';
      else if (s.final_score >= 50) ket = 'Cukup (Maqbul)';
      else ket = 'Belum Lulus (Rosif)';
    }
    return [
      idx + 1,
      s.nama,
      s.tamrin_score !== null ? s.tamrin_score : '-',
      s.semester_score !== null ? s.semester_score : '-',
      s.final_score !== null ? s.final_score : '-',
      s.predikat || '-',
      ket
    ];
  });

  const footer = [
    [],
    ["RATA-RATA NILAI AKADEMIK", "", "", "", averageFinalScore.value.toFixed(1), averagePredikat.value, ""],
    [],
    ["REKAPITULASI PRESENSI / KEHADIRAN:"],
    ["Sakit (S)", `${attendanceStats.value.Sakit} hari`],
    ["Izin (I)", `${attendanceStats.value.Izin} hari`],
    ["Tanpa Keterangan (Alfa)", `${attendanceStats.value.Alfa} hari`],
    ["Total Tidak Hadir", `${attendanceStats.value.Sakit + attendanceStats.value.Izin + attendanceStats.value.Alfa} hari`],
  ];

  const finalRows = [...header, ...subjectsData, ...footer];

  const worksheet = XLSX.utils.aoa_to_sheet(finalRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Raport Santri');
  XLSX.writeFile(workbook, `Raport_${student.nama.replace(/\s+/g, '_')}_${classObj?.nama || 'Kelas'}.xlsx`);
};
</script>

<style scoped>
.bg-label-primary {
  background-color: var(--primary-light);
  color: var(--primary);
}
</style>
