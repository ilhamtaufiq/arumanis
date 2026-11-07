//! Arumanis desktop (GPUI). Kerangka: jendela, sidebar, login, dan daftar pekerjaan dari apiamis.
//!
//! Konfigurasi lewat environment:
//! - `ARUMANIS_API_URL`  (default `http://localhost:8000`)
//! - `ARUMANIS_EMAIL`, `ARUMANIS_PASSWORD`  untuk login otomatis saat aplikasi dibuka

mod api;

use api::{PekerjaanRingkas, Session};
use gpui::{
    div, prelude::*, px, rgb, size, App, Application, Bounds, Context, SharedString, Window,
    WindowBounds, WindowOptions,
};

const JUMLAH_BARIS: u32 = 50;

struct Arumanis {
    base_url: String,
    kredensial: Option<(String, String)>,
    session: Option<Session>,
    pekerjaan: Vec<PekerjaanRingkas>,
    status: SharedString,
    sedang_memuat: bool,
}

impl Arumanis {
    fn new() -> Self {
        let base_url = std::env::var("ARUMANIS_API_URL").unwrap_or_else(|_| "http://localhost:8000".into());
        let kredensial = match (std::env::var("ARUMANIS_EMAIL"), std::env::var("ARUMANIS_PASSWORD")) {
            (Ok(e), Ok(p)) if !e.is_empty() && !p.is_empty() => Some((e, p)),
            _ => None,
        };
        let status: String = if kredensial.is_some() {
            "Belum login. Klik Masuk.".to_string()
        } else {
            "Set ARUMANIS_EMAIL dan ARUMANIS_PASSWORD, lalu jalankan ulang aplikasi.".to_string()
        };
        Self {
            base_url,
            kredensial,
            session: None,
            pekerjaan: Vec::new(),
            status: status.into(),
            sedang_memuat: false,
        }
    }

    /// Login lalu muat pekerjaan. Panggilan jaringan dijalankan di thread latar.
    fn masuk(&mut self, cx: &mut Context<Self>) {
        let Some((email, password)) = self.kredensial.clone() else {
            return;
        };
        let base = self.base_url.clone();
        self.sedang_memuat = true;
        self.status = "Masuk...".into();
        cx.notify();

        cx.spawn(async move |this, cx| {
            let hasil = cx
                .background_spawn(async move {
                    let sesi = api::login(&base, &email, &password)?;
                    let daftar = api::daftar_pekerjaan(&sesi, JUMLAH_BARIS)?;
                    Ok::<_, String>((sesi, daftar))
                })
                .await;

            this.update(cx, |app, cx| {
                app.sedang_memuat = false;
                match hasil {
                    Ok((sesi, daftar)) => {
                        app.status = format!("{} pekerjaan dimuat", daftar.len()).into();
                        app.pekerjaan = daftar;
                        app.session = Some(sesi);
                    }
                    Err(pesan) => {
                        app.session = None;
                        app.pekerjaan.clear();
                        app.status = pesan.into();
                    }
                }
                cx.notify();
            })
            .ok();
        })
        .detach();
    }

    fn sidebar(&self) -> impl IntoElement {
        div()
            .flex()
            .flex_col()
            .w(px(200.))
            .h_full()
            .bg(rgb(0x1f2937))
            .text_color(rgb(0xf9fafb))
            .p_4()
            .gap_2()
            .child(div().text_lg().font_weight(gpui::FontWeight::BOLD).child("ARUMANIS"))
            .child(div().text_sm().text_color(rgb(0x9ca3af)).child("Air Minum & Sanitasi"))
            .child(div().mt_4().px_2().py_1().rounded_md().bg(rgb(0x374151)).child("Pekerjaan"))
    }

    fn tabel(&self) -> impl IntoElement {
        let mut baris = div().flex().flex_col().gap_1();
        for p in &self.pekerjaan {
            baris = baris.child(
                div()
                    .flex()
                    .flex_row()
                    .gap_4()
                    .py_1()
                    .border_b_1()
                    .border_color(rgb(0xe5e7eb))
                    .child(div().w(px(70.)).text_sm().child(format!("#{}", p.id)))
                    .child(div().flex_1().text_sm().child(p.nama_paket.clone()))
                    .child(
                        div()
                            .w(px(180.))
                            .text_sm()
                            .text_color(rgb(0x6b7280))
                            .child(p.kode_rekening.clone().unwrap_or_else(|| "-".into())),
                    ),
            );
        }
        baris
    }
}

impl Render for Arumanis {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let tombol_masuk = div()
            .px_3()
            .py_1()
            .rounded_md()
            .bg(rgb(0x2563eb))
            .text_color(rgb(0xffffff))
            .child(if self.sedang_memuat { "Memuat..." } else { "Masuk" })
            .on_mouse_down(gpui::MouseButton::Left, cx.listener(|app, _, _, cx| {
                if !app.sedang_memuat {
                    app.masuk(cx);
                }
            }));

        div()
            .flex()
            .flex_row()
            .size_full()
            .bg(rgb(0xf9fafb))
            .child(self.sidebar())
            .child(
                div()
                    .flex()
                    .flex_col()
                    .flex_1()
                    .p_6()
                    .gap_4()
                    .child(
                        div()
                            .flex()
                            .flex_row()
                            .justify_between()
                            .items_center()
                            .child(div().text_xl().child("Daftar Pekerjaan"))
                            .child(tombol_masuk),
                    )
                    .child(div().text_sm().text_color(rgb(0x4b5563)).child(self.status.clone()))
                    .child(self.tabel()),
            )
    }
}

fn main() {
    Application::new().run(|cx: &mut App| {
        let bounds = Bounds::centered(None, size(px(1100.), px(700.)), cx);
        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(bounds)),
                ..Default::default()
            },
            |_, cx| cx.new(|_| Arumanis::new()),
        )
        .expect("jendela utama tidak bisa dibuka");
        cx.activate(true);
    });
}
