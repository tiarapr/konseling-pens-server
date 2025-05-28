

  async getRekamMedisByNrp(nrp) {
    // Panggil fungsi getByNrp untuk mengambil data mahasiswa berdasarkan nrp
    const mahasiswa = await this.getByNrp(nrp);

    if (!mahasiswa) {
      throw new NotFoundError('Mahasiswa tidak ditemukan');
    }

    // Ambil nama status mahasiswa
    const statusQuery = {
      text: `
      SELECT name FROM status WHERE id = $1
      `,
      values: [mahasiswa.status_id],
    };

    const statusResult = await this._pool.query(statusQuery);
    const statusName = statusResult.rows[0]?.name || 'Unknown';

    // Ambil janji temu berdasarkan nrp mahasiswa
    const janjiTemuQuery = {
      text: `
          SELECT jt.id AS janji_temu_id
          FROM janji_temu jt
          WHERE jt.nrp = $1
        `,
      values: [nrp],
    };

    const janjiTemuResult = await this._pool.query(janjiTemuQuery);

    if (!janjiTemuResult.rows.length) {
      throw new NotFoundError('Janji temu tidak ditemukan untuk mahasiswa ini');
    }

    // Ambil konseling yang terkait dengan janji temu
    const konselingQuery = {
      text: `
      SELECT konseling.id AS konseling_id, konseling.tanggal_konseling, 
             konseling.jam_mulai, konseling.jam_selesai, konseling.lokasi, konseling.status_id,
             konseling.konselor_profil_id
      FROM konseling
      WHERE konseling.janji_temu_id = ANY($1) AND konseling.deleted_at IS NULL
      ORDER BY konseling.tanggal_konseling DESC
    `,
      values: [janjiTemuResult.rows.map(row => row.janji_temu_id)],
    };

    const konselingResult = await this._pool.query(konselingQuery);

    // Ambil catatan dan topik untuk setiap konseling
    const rekamMedis = await Promise.all(
      konselingResult.rows.map(async (konseling) => {
        const catatanQuery = {
          text: `
          SELECT * FROM catatan_konseling 
          WHERE konseling_id = $1 AND deleted_at IS NULL
          ORDER BY created_at ASC
        `,
          values: [konseling.konseling_id],
        };

        const catatanResult = await this._pool.query(catatanQuery);
        const catatanKonseling = catatanResult.rows[0]; // Ambil catatan pertama jika ada

        // Ambil topik konseling
        const topikQuery = {
          text: `
            SELECT topik.id, topik.name 
            FROM topik
            LEFT JOIN konseling_topik ON konseling_topik.topik_id = topik.id
            WHERE konseling_topik.konseling_id = $1
            AND konseling_topik.deleted_at IS NULL 
          `,
          values: [konseling.konseling_id],
        };

        const topikResult = await this._pool.query(topikQuery);
        const topikList = topikResult.rows;

        // Ambil nama konselor
        const konselorQuery = {
          text: `
          SELECT nama_lengkap FROM konselor_profil WHERE id = $1
        `,
          values: [konseling.konselor_profil_id],
        };

        const konselorResult = await this._pool.query(konselorQuery);
        const konselorName = konselorResult.rows[0]?.nama_lengkap || 'Unknown';

        // Ambil nama status
        const statusKonselingQuery = {
          text: `
          SELECT name FROM status WHERE id = $1
        `,
          values: [konseling.status_id],
        };

        const statusKonselingResult = await this._pool.query(statusKonselingQuery);
        const statusKonselingName = statusKonselingResult.rows[0]?.name || 'Unknown';

        return {
          konseling_id: konseling.konseling_id,
          konselor: konselorName,
          tanggal_konseling: konseling.tanggal_konseling,
          jam_mulai: konseling.jam_mulai,
          jam_selesai: konseling.jam_selesai,
          lokasi: konseling.lokasi,
          status: statusKonselingName, // Nama status untuk konseling
          catatan_konseling: {
            id: catatanKonseling?.id || null,
            deskripsi_masalah: catatanKonseling?.deskripsi_masalah || null,
            usaha: catatanKonseling?.usaha || null,
            kendala: catatanKonseling?.kendala || null,
            pencapaian: catatanKonseling?.pencapaian || null,
            diagnosis: catatanKonseling?.diagnosis || null,
            intervensi: catatanKonseling?.intervensi || null,
            tindak_lanjut: catatanKonseling?.tindak_lanjut || null,
            created_at: catatanKonseling?.created_at || null,
            topik: topikList,
          },
        };
      })
    );

    // Return dengan format yang sama, mengganti status_id dengan statusName
    return {
      id: mahasiswa.id,
      nrp: mahasiswa.nrp,
      nama_lengkap: mahasiswa.nama_lengkap,
      program_studi_id: mahasiswa.program_studi_id,
      status: statusName, // Menggunakan nama status mahasiswa
      rekam_medis: rekamMedis,
    };
  }


  //handler
  

    async getRekamMedisByNrpHandler(request, h) {
        const { nrp } = request.params;
    
        try {
            const data = await this._service.getRekamMedisByNrp(nrp);
    
            return {
                status: 'success',
                data,
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return h.response({
                    status: 'fail',
                    message: error.message,
                }).code(404);
            }
    
            return this._handleServerError(h, error);
        }
    }    