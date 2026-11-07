//! Klien HTTP ke apiamis. Dijalankan di thread latar supaya UI tidak macet.
//!
//! Autentikasi: apiamis mengirim token hanya lewat cookie httpOnly saat login. Token itu diambil dari
//! header `Set-Cookie`, lalu dikirim ulang sebagai `Authorization: Bearer <token>`.

use serde::Deserialize;
use serde_json::json;

#[derive(Clone, Debug)]
pub struct Session {
    pub base_url: String,
    pub token: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PekerjaanRingkas {
    pub id: i64,
    #[serde(default)]
    pub nama_paket: String,
    #[serde(default)]
    pub kode_rekening: Option<String>,
}

#[derive(Debug, Deserialize)]
struct DaftarPekerjaan {
    data: Vec<PekerjaanRingkas>,
}

/// Nama cookie yang membawa token sesi (sama dengan default backend: `arumanis_session`, cadangan `arumanis_token`).
const NAMA_COOKIE_TOKEN: [&str; 2] = ["arumanis_session", "arumanis_token"];

/// Ambil nilai token dari daftar header `Set-Cookie`. Nama cookie diutamakan sesuai `NAMA_COOKIE_TOKEN`.
pub fn token_dari_set_cookie(header_set_cookie: &[String]) -> Option<String> {
    let pasangan: Vec<(String, String)> = header_set_cookie
        .iter()
        .filter_map(|c| c.split(';').next().and_then(|pair| pair.split_once('=')))
        .map(|(nama, nilai)| (nama.trim().to_string(), nilai.to_string()))
        .collect();
    NAMA_COOKIE_TOKEN.iter().find_map(|nama| {
        pasangan
            .iter()
            .find(|(n, v)| n == nama && !v.is_empty())
            .map(|(_, v)| v.clone())
    })
}

/// Login lalu ambil token dari `Set-Cookie`.
pub fn login(base_url: &str, email: &str, password: &str) -> Result<Session, String> {
    let base = base_url.trim_end_matches('/').to_string();
    let url = format!("{base}/api/auth/login");
    let resp = ureq::post(&url)
        .send_json(json!({ "email": email, "password": password }))
        .map_err(|e| format!("Login gagal: {e}"))?;

    let cookies: Vec<String> = resp.all("set-cookie").into_iter().map(str::to_string).collect();
    let token = token_dari_set_cookie(&cookies)
        .ok_or_else(|| "Login berhasil, tetapi cookie token tidak ditemukan.".to_string())?;

    Ok(Session { base_url: base, token })
}

/// Daftar pekerjaan halaman pertama.
pub fn daftar_pekerjaan(session: &Session, per_page: u32) -> Result<Vec<PekerjaanRingkas>, String> {
    let url = format!("{}/api/pekerjaan?per_page={per_page}", session.base_url);
    let resp = ureq::get(&url)
        .set("Authorization", &format!("Bearer {}", session.token))
        .call()
        .map_err(|e| match e {
            ureq::Error::Status(401, _) => "Sesi tidak valid. Login ulang.".to_string(),
            other => format!("Gagal memuat pekerjaan: {other}"),
        })?;
    let body: DaftarPekerjaan = resp.into_json().map_err(|e| format!("Respons tidak terbaca: {e}"))?;
    Ok(body.data)
}

#[cfg(test)]
mod tests {
    use super::token_dari_set_cookie;

    fn daftar(xs: &[&str]) -> Vec<String> {
        xs.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn ambil_token_dari_cookie_sesi() {
        let h = daftar(&[
            "arumanis_session=abc123; Path=/; HttpOnly; SameSite=Lax",
            "arumanis_token=abc123; Path=/; HttpOnly",
        ]);
        assert_eq!(token_dari_set_cookie(&h).as_deref(), Some("abc123"));
    }

    #[test]
    fn cadangan_ke_cookie_token_bila_sesi_tidak_ada() {
        let h = daftar(&["xsrf=zzz; Path=/", "arumanis_token=tok9; Path=/"]);
        assert_eq!(token_dari_set_cookie(&h).as_deref(), Some("tok9"));
    }

    #[test]
    fn tanpa_cookie_token_menghasilkan_none() {
        let h = daftar(&["xsrf=zzz; Path=/"]);
        assert_eq!(token_dari_set_cookie(&h), None);
        assert_eq!(token_dari_set_cookie(&[]), None);
    }

    #[test]
    fn nilai_kosong_diabaikan() {
        let h = daftar(&["arumanis_session=; Path=/", "arumanis_token=ok; Path=/"]);
        assert_eq!(token_dari_set_cookie(&h).as_deref(), Some("ok"));
    }
}
